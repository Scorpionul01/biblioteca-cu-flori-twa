import React from 'react';
import { Container } from 'react-bootstrap';
import FlowersList from '../components/flowers/FlowersList';

const FlowersPage = () => {
  return (
    <Container>
      <h2 className="text-center mb-4 feature-title">Toate florile</h2>
      <FlowersList />
    </Container>
  );
};

export default FlowersPage;