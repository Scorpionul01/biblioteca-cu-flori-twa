import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const FlowerCard = ({ flower }) => {
  // Imagine placeholder în caz că floarea nu are imagine
  const imagePlaceholder = 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80';
  
  return (
    <Card className="card-custom">
      <div className="position-relative overflow-hidden">
        <Card.Img 
          variant="top" 
          src={flower.imageUrl || imagePlaceholder} 
          alt={flower.name}
          style={{ height: '220px', objectFit: 'cover' }}
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = imagePlaceholder;
          }}
          className="card-img-transition"
        />
        <div className="position-absolute bottom-0 end-0 p-2">
          <Badge className={`badge-custom badge-color badge-${flower.colorName?.toLowerCase()}`}>{flower.colorName}</Badge>
        </div>
      </div>
      <Card.Body>
        <Card.Title className="mb-2">{flower.name}</Card.Title>
        <Card.Subtitle className="mb-3 fst-italic text-muted">{flower.latinName}</Card.Subtitle>
        
        <div className="mb-3">
          {flower.meanings && flower.meanings.map(meaning => (
            <Badge key={meaning.id} className={`badge-custom badge-meaning badge-${meaning.name?.toLowerCase()} me-1 mb-1`}>{meaning.name}</Badge>
          ))}
        </div>
        
        <Card.Text className="text-muted">
          {flower.description && flower.description.length > 100
            ? `${flower.description.substring(0, 100)}...`
            : flower.description || 'Fără descriere disponibilă.'}
        </Card.Text>
        
        <Link to={`/flowers/${flower.id}`} className="stretched-link"></Link>
        
        <div className="d-flex justify-content-end mt-2 position-relative" style={{ zIndex: 10 }}>
          <Link to={`/flowers/${flower.id}`} className="text-decoration-none text-primary">
            <small>Vezi detalii <i className="fas fa-angle-right"></i></small>
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default FlowerCard;