import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { Spinner } from 'reactstrap';
import { XCircle as IconXCircle } from 'react-feather';

function IcoLogo(props) {
  const { IcoStore, icoId } = props;
  const logo = IcoStore.getLogo(icoId);

  useEffect(() => {
    IcoStore.loadLogo(icoId, { acceptCached: true });
  }, [IcoStore, icoId]);

  if (logo === undefined) {
    return (
      <Spinner color="secondary " />
    );
  }

  if (logo === null) {
    return (
      <span className="text-muted">
        <IconXCircle className="ico-logo" />
      </span>
    );
  }
  
  return <img src={logo} className="ico-logo" alt="logo" />
}

export default inject('IcoStore')(observer(IcoLogo));
