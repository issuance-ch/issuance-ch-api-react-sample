import { makeObservable, observable, action, computed } from "mobx";
import { VideoConference } from "../helpers/agent";

class VideoConferenceStore {
  constructor() {
    makeObservable(this, {
      loadingCount: observable,
      slotRegistry: observable,
      preferredLanguage: observable,
      loading: computed,
      slots: computed,
      loadSlots: action,
      bookSlot: action,
    });
  }

  loadingCount = 0;
  slotRegistry = [];
  preferredLanguage = null;

  get loading() {
    return this.loadingCount > 0;
  }

  getPreferredLanguage() {
    return this.preferredLanguage;
  }

  setPreferredLanguage(preferredLanguage) {
    this.preferredLanguage = preferredLanguage;
    return this;
  }

  get slots() {
    const slots = {};

    this.slotRegistry.forEach((slot) => {
      const date = slot.date.split("T")[0];

      if (!(date in slots)) {
        slots[date] = [];
      }

      slots[date].push(slot);
    });

    return slots;
  }

  loadSlots() {
    this.loadingCount++;

    this.slotRegistry = [];

    return VideoConference.list()
      .then(
        action((slots) => {
          this.slotRegistry = slots;
        })
      )
      .finally(
        action(() => {
          this.loadingCount--;
        })
      );
  }

  bookSlot(slotId, subscriptionId) {
    this.loadingCount++;

    return VideoConference.book(slotId, subscriptionId, this.preferredLanguage)
      .then(
        action((res) => {
          console.info("bookSlot", res);
        })
      )
      .finally(
        action(() => {
          this.loadingCount--;
        })
      );
  }
}

const VideoConferenceStoreInstance = new VideoConferenceStore();
export default VideoConferenceStoreInstance;