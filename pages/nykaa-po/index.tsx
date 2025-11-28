import React from 'react';
import PlatformShipmentsPage from '../../components/PlatformShipmentsPage';

const NykaaPoShipments: React.FC = () => {
  return <PlatformShipmentsPage platform="nykaa-po" createRoute="/nykaa-po/create" />;
};

export default NykaaPoShipments;
