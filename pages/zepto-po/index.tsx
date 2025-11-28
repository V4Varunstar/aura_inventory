import React from 'react';
import PlatformShipmentsPage from '../../components/PlatformShipmentsPage';

const ZeptoPoShipments: React.FC = () => {
  return <PlatformShipmentsPage platform="zepto-po" createRoute="/zepto-po/create" />;
};

export default ZeptoPoShipments;
