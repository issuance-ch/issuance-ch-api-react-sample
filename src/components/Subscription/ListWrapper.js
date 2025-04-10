import React from 'react';
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Alert, Spinner, Table, ButtonGroup, Button, Tooltip } from 'reactstrap';
import statusParser from '../../helpers/statusParser'
import moment from 'moment';

function SubscriptionListWrapper(props) {
  const { subscriptions, loading } = props;
  const { SubscriptionStore } = props;
  const [tooltipOpen, setTooltipOpen] = React.useState(null);
  const toggleTooltip = (id) => {
    setTooltipOpen(prev => prev === id ? null : id);
  };
  if (loading) {
    return (
      <Spinner color="secondary" />
    );
  }

  if (!subscriptions.length) {
    return (
      <Alert color="warning">
        There is no subscriptions, yet!
      </Alert>
    );
  }

  return (
    <Table>
      <thead>
        <tr>
          <th>Project</th>
          <th>Date of subscription</th>
          <th>Status</th>
          <th className="text-right">Actions</th>
        </tr>
      </thead>

      <tbody>
        {
          subscriptions.map(subscription => {
            const editButtonId = `edit-btn-${subscription.id}`;
            return (
              <tr key={subscription.id}>
                <td>{subscription.ico_subscribed[0].ico.name}</td>
                <td>{moment(subscription.date_of_subscription).format('L')}</td>
                <td>{statusParser(subscription.status)}</td>
                <td className="text-right">
                  <ButtonGroup vertical size="sm">
                    {
                      subscription.deletable
                      &&
                      <Button
                        color="danger"
                        onClick={() => {
                          SubscriptionStore.deleteSubscription(subscription.id)
                            .then(res => {
                            })
                            .catch(err => {
                            });
                        }}
                      >
                        Delete
                      </Button>
                    }
                    {
                          subscription.editable ? (
                              <Link to={`/subscription/${subscription.id}`} className="btn btn-primary" id={editButtonId}>
                                  Edit
                              </Link>
                          ) : (
                              <>
                                  <Button disabled color="secondary" id={editButtonId}>
                                      Edit
                                  </Button>
                                  <Tooltip placement="top" isOpen={tooltipOpen === editButtonId} target={editButtonId} toggle={() => toggleTooltip(editButtonId)}>
                                      This subscription is not editable at this moment
                                  </Tooltip>
                              </>
                          )
                    }
                    {
                      subscription.status !== 'subscription_pending'
                      &&
                      <>
                        {subscription.video_conference_planning && <Link to={`/subscription/video-conference/${subscription.id}`} className="btn btn-outline-primary mr-1">Join the call</Link>}
                        {subscription.video_conference_planning && subscription.status_videoconf === "label.to_be_done" && <Link to={`/subscription/video-conference-booking/${subscription.id}`} className="btn btn-outline-primary mr-1">Reschedule the call</Link>}
                        {!subscription.video_conference_planning && subscription.status_videoconf === "label.to_be_done" && <Link to={`/subscription/video-conference-booking/${subscription.id}`} className="btn btn-outline-primary mr-1">Select a slot for the call</Link>}
                        <Link to={`/subscription/payment-status/${subscription.id}`} className="btn btn-outline-primary mr-1">Payment status</Link>
                      </>
                    }
                  </ButtonGroup>
                </td>
              </tr>
            )
          })
        }
      </tbody>
    </Table>
  );
}

export default inject('SubscriptionStore')(observer(SubscriptionListWrapper));
