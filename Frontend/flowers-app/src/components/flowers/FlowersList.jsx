import React, { useState, useEffect } from 'react';
import { Row, Col, Alert, Spinner } from 'react-bootstrap';
import FlowerCard from './FlowerCard';
import SearchBar from '../common/SearchBar';
import Filters from '../common/Filters';
import flowerService from '../../services/flowerService';

const FlowersList = ({ searchTerm = '', colorId = null, meaningId = null }) => {
  const [flowers, setFlowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    colorId: colorId,
    meaningId: meaningId
  });

  useEffect(() => {
    const fetchFlowers = async () => {
      try {
        setLoading(true);
        setError(null);
        let response;

        if (searchTerm) {
          response = await flowerService.searchFlowers(searchTerm);
        } else if (filters.colorId) {
          response = await flowerService.getFlowersByColor(filters.colorId);
        } else if (filters.meaningId) {
          response = await flowerService.getFlowersByMeaning(filters.meaningId);
        } else {
          response = await flowerService.getAllFlowers();
        }

        setFlowers(response.sort((a, b) => a.name.localeCompare(b.name, 'ro')));
      } catch (err) {
        setError('Eroare la încărcarea florilor. Vă rugăm încercați din nou.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlowers();
  }, [searchTerm, filters.colorId, filters.meaningId]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div>
      <SearchBar />
      
      <Row>
        <Col md={3}>
          <Filters onFilterChange={handleFilterChange} />
        </Col>
        
        <Col md={9}>
          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Se încarcă...</span>
              </Spinner>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : flowers.length === 0 ? (
            <Alert variant="info">
              Nu am găsit flori care să corespundă criteriilor de căutare.
            </Alert>
          ) : (
            <Row xs={1} md={2} lg={3} className="g-4">
              {flowers.map(flower => (
                <Col key={flower.id}>
                  <FlowerCard flower={flower} />
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default FlowersList;