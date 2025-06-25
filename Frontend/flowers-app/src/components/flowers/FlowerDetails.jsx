import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Row, Col, Badge, Button, Alert, Spinner } from 'react-bootstrap';
import flowerService from '../../services/flowerService';
import { AuthContext } from '../../context/AuthContext';

const FlowerDetails = () => {
  const { id } = useParams();
  const [flower, setFlower] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { isAdmin } = useContext(AuthContext);
  
  // Imagine placeholder în caz că floarea nu are imagine
  const imagePlaceholder = 'https://via.placeholder.com/600x400?text=No+Image';
  
  useEffect(() => {
    const fetchFlowerDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const flowerData = await flowerService.getFlowerById(id);
        setFlower(flowerData);
      } catch (err) {
        setError('Eroare la încărcarea detaliilor florii. Vă rugăm încercați din nou.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFlowerDetails();
  }, [id]);
  
  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Se încarcă...</span>
        </Spinner>
      </div>
    );
  }
  
  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }
  
  if (!flower) {
    return <Alert variant="warning">Floarea nu a fost găsită.</Alert>;
  }
  
  return (
    <Card className="border-0 shadow-sm mb-4">
      <Row className="g-0">
        <Col md={5}>
          <img 
            src={flower.imageUrl || imagePlaceholder} 
            alt={flower.name}
            className="img-fluid rounded-start"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = imagePlaceholder;
            }}
          />
        </Col>
        <Col md={7}>
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <Card.Title className="h2 mb-1">{flower.name}</Card.Title>
                <Card.Subtitle className="mb-3 text-muted fst-italic">
                  {flower.latinName || 'Nume latin indisponibil'}
                </Card.Subtitle>
              </div>
              
              {isAdmin() && (
                <Button 
                  as={Link}
                  to={`/admin/flowers/edit/${flower.id}`}
                  variant="outline-primary"
                  size="sm"
                >
                  Editează
                </Button>
              )}
            </div>
            
            <Card.Text className="mb-4">
              {flower.description || 'Fără descriere disponibilă.'}
            </Card.Text>
            
            <h5>Culoare</h5>
            <p>
              <Badge className="badge-custom badge-color">{flower.colorName}</Badge>
            </p>
            
            <h5>Semnificații</h5>
            {flower.meanings && flower.meanings.length > 0 ? (
              <div className="mb-3">
                {flower.meanings.map(meaning => (
                  <div key={meaning.id} className="mb-2">
                    <Badge className="badge-custom badge-meaning me-2">{meaning.name}</Badge>
                    <span>{meaning.description}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>Fără semnificații disponibile.</p>
            )}
            
            <div className="mt-4">
              <Link to="/flowers" className="btn btn-outline-secondary me-2">
                Înapoi la lista de flori
              </Link>
            </div>
          </Card.Body>
        </Col>
      </Row>
    </Card>
  );
};

export default FlowerDetails;