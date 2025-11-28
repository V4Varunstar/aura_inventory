import React from 'react';
import PlatformShipmentsPage from '../../components/PlatformShipmentsPage';

const FlipkartFbfShipments: React.FC = () => {
  return <PlatformShipmentsPage platform="flipkart-fbf" createRoute="/flipkart-fbf/create" />;
};

export default FlipkartFbfShipments;
