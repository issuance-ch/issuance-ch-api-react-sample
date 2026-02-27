import React from 'react';
import { Badge } from 'reactstrap';
import CollapsibleCard from '../CollapsibleCard';
import VideoConferenceForm from '../VideoConferenceForm';

function Step6VideoConference(props) {
  const groupName = 'video_conference';
  const { fillStatus, subscription, ico, ...otherProps } = props;
  const conferenceStatus = fillStatus.video_conference_status;

  if (conferenceStatus === 'not_required') {
    return null;
  }

  return (
    <CollapsibleCard
      active={true}
      name={groupName}
      notification={!fillStatus.video_conference_slot_id ? <>Book a <Badge color="info">slot</Badge></> : null}
      header="Video conference booking"
      {...otherProps}
    >
      <VideoConferenceForm
        subscriptionId={fillStatus.subscription_id}
      />

    </CollapsibleCard>
  );
}

export default Step6VideoConference;
