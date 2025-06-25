import React from 'react';
import { Container } from 'react-bootstrap';
import BouquetGenerator from '../components/bouquet/BouquetGenerator';

const BouquetPage = () => {
  return (
    <Container>
      <h2 className="text-center mb-4 feature-title">Compune un Buchet</h2>
      <BouquetGenerator />
    </Container>
  );
};

export default BouquetPage;