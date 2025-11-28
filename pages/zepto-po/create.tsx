import React from 'react';
import CreateShipmentPage from '../../components/CreateShipmentPage';

const CreateZeptoPoShipment: React.FC = () => {
  return <CreateShipmentPage platform="zepto-po" listRoute="/zepto-po" />;
};

export default CreateZeptoPoShipment;
