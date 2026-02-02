import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { Spinner, CardGroup, Card, CardHeader, ListGroup, ListGroupItem } from 'reactstrap';
import moment from 'moment-timezone';

function VideoConferenceForm(props) {
  const { VideoConferenceStore, SubscriptionStore, subscriptionId } = props;
  const { loading, slots, preferredLanguage } = VideoConferenceStore;
  const { fillStatus } = SubscriptionStore;

  function handleLanguageSelect(e) { VideoConferenceStore.setPreferredLanguage(e.target.value) }

  useEffect(() => {
    VideoConferenceStore.loadSlots();
  }, [VideoConferenceStore]);

  if (loading || SubscriptionStore.loading) {
    return (
      <Spinner color="secondary" />
    );
  }

  return (<>
    <h2>First, choose your preferred language</h2>
    <div className="my-3">
      <div className="form-check form-check-inline">
        <input className="form-check-input" type="radio" name="preferredLanguage" id="preferredLanguage1" checked={preferredLanguage === 'ENGLISH'} onChange={handleLanguageSelect} value="ENGLISH" />
        <label className="form-check-label" htmlFor="preferredLanguage1">English</label>
      </div>
      <div className="form-check form-check-inline">
        <input className="form-check-input" type="radio" name="preferredLanguage" id="preferredLanguage2" checked={preferredLanguage === 'GERMAN'} onChange={handleLanguageSelect} value="GERMAN" />
        <label className="form-check-label" htmlFor="preferredLanguage2">German</label>
      </div>
      <div className="form-check form-check-inline">
        <input className="form-check-input" type="radio" name="preferredLanguage" id="preferredLanguage3" checked={preferredLanguage === 'FRENCH'} onChange={handleLanguageSelect} value="FRENCH" />
        <label className="form-check-label" htmlFor="preferredLanguage3">French</label>
      </div>
      <div className="form-check form-check-inline">
        <input className="form-check-input" type="radio" name="preferredLanguage" id="preferredLanguage4" checked={preferredLanguage === 'ARABIC'} onChange={handleLanguageSelect} value="ARABIC" />
        <label className="form-check-label" htmlFor="preferredLanguage4">Arabic</label>
      </div>
      <div className="form-check form-check-inline">
        <input className="form-check-input" type="radio" name="preferredLanguage" id="preferredLanguage5" checked={preferredLanguage === 'HEBREW'} onChange={handleLanguageSelect} value="HEBREW" />
        <label className="form-check-label" htmlFor="preferredLanguage5">Hebrew</label>
      </div>

    </div>
    {VideoConferenceStore.getPreferredLanguage() &&
      <><h2>Pick a slot <span className="badge badge-info">Your timezone {moment.tz.guess()}</span></h2>
        <CardGroup className="calendar">
          {
            Object.keys(slots).filter(date => {
              if (['0', '6'].includes(moment(date).format('e'))) {
                // Don't display slots over the week-end
                return false;
              }

              if (moment(date).diff(moment(new Date()), 'days') < 2) {
                // The selected slot should be at least 2 days in the future
                return false;
              }
              return true;
            }).slice(0, 6).map(date =>
              <Card className="my-2" key={date}>
                <CardHeader>
                  {moment(date).format('ddd Do MMM')}
                </CardHeader>
                <ListGroup flush>
                  {
                    slots[date].filter(slot => {
                      const time = parseInt(moment(slot.date).tz("Europe/Zurich").format('H'));
                      // Display only schedules from 8AM / 4:45PM GVA TIME
                      return time >= 8 && time <= 16
                    }).map(slot => {
                      return <ListGroupItem
                        key={slot.id} tag="button" action
                        className={`${slot.status === 'BOOKED' ? 'is-not-active' : ''} ${fillStatus.video_conference_slot_id === slot.id ? 'current' : ''}`}
                        onClick={() => {
                          VideoConferenceStore.bookSlot(slot.id, subscriptionId)
                            .then(res => {
                              SubscriptionStore.loadFillStatus(subscriptionId);
                            });
                        }}
                      >
                        <small className="d-block font-weight-bold text-uppercase" style={{ fontSize: '0.65em' }}>Swiss time</small>
                        {moment(slot.date).tz("Europe/Zurich").format('HH:mm')}
                        <small className="d-block font-weight-bold text-uppercase mt-1" style={{ fontSize: '0.65em' }}>Local time</small>
                        {moment(slot.date).tz(moment.tz.guess()).format('HH:mm')}
                      </ListGroupItem>
                    }
                    )
                  }
                </ListGroup>
              </Card>
            )
          }
        </CardGroup>
      </>}
  </>
  );
}

export default inject('VideoConferenceStore', 'SubscriptionStore')(observer(VideoConferenceForm));
