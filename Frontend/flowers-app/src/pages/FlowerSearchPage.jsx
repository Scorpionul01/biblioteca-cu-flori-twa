import React from 'react';
import { Container } from 'react-bootstrap';
import FlowersList from '../components/flowers/FlowersList';
import { useSearchParams } from 'react-router-dom';

const FlowerSearchPage = () => {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('term') || '';
  
  return (
    <Container>
      <h2 className="mb-4">Rezultate căutare: "{searchTerm}"</h2>
      <FlowersList searchTerm={searchTerm} />
    </Container>
  );
};

export default FlowerSearchPage;