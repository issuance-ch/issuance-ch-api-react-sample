import React from 'react';
import CollapsibleCard from '../CollapsibleCard';
import ExtraDocumentForm from '../ExtraDocumentForm';

function Step2ExtraDocument(props) {
  const groupName = 'extra_documents';
  const { IcoDocumentStore, fillStatus, ...otherProps } = props;
  const { documents } = fillStatus.groups[groupName];

  return (
    Object.keys(documents).map(documentId => {
      const componentId = groupName + '_' + documentId;
      const document = documents[documentId];

      return (
        <CollapsibleCard
          key={componentId}
          active={true}
          name={componentId}
          fields={{ document }} considerAsForm
          header={document.description + ' (Extra document)'}
          {...otherProps}
        >
          <ExtraDocumentForm
            groupName={groupName}
            subscriptionId={fillStatus.subscription_id}
            documentId={documentId}
            extraDocument={document}
          />
        </CollapsibleCard>
      );
    })
  );
}

export default Step2ExtraDocument;
