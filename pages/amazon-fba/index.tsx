import React from 'react';
import PlatformShipmentsPage from '../../components/PlatformShipmentsPage';

const FbaShipments: React.FC = () => {
  return <PlatformShipmentsPage platform="amazon-fba" createRoute="/amazon-fba/create" />;
};

export default FbaShipments;
