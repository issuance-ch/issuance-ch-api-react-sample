import React from 'react';
import { Row, Col, Collapse, Card, CardHeader, Button, Badge } from 'reactstrap';
import { ChevronDown, ChevronUp } from 'react-feather';

function CollapsibleCard(props) {
  const { name, header, fields, notification, considerAsForm, children, stepOpen, setStepOpen, shown, setShown, active } = props;
  const isOpen = stepOpen === name;
  const errors = countErrors();
  const toBeFilled = countToBeFilled();

  function countErrors() {
    if (!fields) {
      return 0;
    }

    return Object.keys(fields)
      .reduce((sum, fieldName) => {
        if (fields[fieldName].hidden) {
          return sum;
        }

        return sum + (fields[fieldName].status === 'REFUSED');
      }, 0);
  }

  function countToBeFilled() {
    if (!fields) {
      return 0;
    }

    return Object.keys(fields)
      .reduce((sum, fieldName) => {
        if (fields[fieldName].hidden) {
          return sum;
        }
        return sum + (fields[fieldName].required && (fields[fieldName].status === 'EMPTY' || fields[fieldName].status === null));
      }, 0);
  }

  return (
    <Card className={`mb-2 ${active ? 'is-active' : 'is-not-active'}`}>
      <CardHeader
        className="pointer"
        onClick={() => {
          setShown(null);
          setStepOpen(isOpen ? null : name);
        }}
      >
        <Row className="justify-content-md-between align-items-md-center">
          <Col xs="12" md={{ size: 'auto' }}>
            <span className="mr-2 mr-md-3">
              {isOpen ? <ChevronUp /> : <ChevronDown />}
            </span>
            {header}
          </Col>
          <Col xs="12" md={{ size: 'auto' }}>
            <Row noGutters>
              {
                errors > 0 &&
                <Col xs="12" md={{ size: 'auto' }} className="ml-0 ml-md-2">
                  <Button className="w-100 mt-2 mt-md-0" color="danger" size="sm" outline disabled>
                    {
                      (
                        considerAsForm &&
                        <><Badge color="danger">Form</Badge> has errors</>
                      )
                      ||
                      <><Badge color="danger">{errors}</Badge> error{errors > 1 ? 's' : ''} to be fixed</>
                    }
                  </Button>
                </Col>
              }
              {
                toBeFilled > 0 &&
                <Col xs="12" md={{ size: 'auto' }} className="ml-0 ml-md-2">
                  <Button className="w-100 mt-2 mt-md-0" color="info" size="sm" outline disabled>
                    {
                      (
                        considerAsForm &&
                        <><Badge color="info">Form</Badge> should be filled</>
                      )
                      ||
                      <><Badge color="info">{toBeFilled}</Badge> field{toBeFilled > 1 ? 's' : ''} to be filled</>
                    }
                  </Button>
                </Col>
              }
              {
                notification &&
                <Col xs="12" md={{ size: 'auto' }} className="ml-0 ml-md-2">
                  <Button className="w-100 mt-2 mt-md-0" color="info" size="sm" outline disabled>
                    {notification}
                  </Button>
                </Col>
              }
            </Row>
          </Col>
        </Row>
      </CardHeader>
      <Collapse className="card-body" isOpen={isOpen} onEntered={() => { setShown(name) }}>
        {
          isOpen && shown === name &&
          children
        }
      </Collapse>
    </Card>
  );
}

export default CollapsibleCard;
