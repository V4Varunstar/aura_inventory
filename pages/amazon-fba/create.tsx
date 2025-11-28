import React from 'react';
import CreateShipmentPage from '../../components/CreateShipmentPage';

const CreateAmazonFbaShipment: React.FC = () => {
  return <CreateShipmentPage platform="amazon-fba" listRoute="/amazon-fba" />;
};

export default CreateAmazonFbaShipment;
