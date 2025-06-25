import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Carousel, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import SearchBar from '../components/common/SearchBar';
import SimpleFlowerWordCloud from '../components/WordCloud/SimpleFlowerWordCloud';
import flowerService from '../services/flowerService';

const HomePage = () => {
  const [featuredFlowers, setFeaturedFlowers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchFeaturedFlowers = async () => {
      try {
        const flowers = await flowerService.getAllFlowers();
        
        // Alegere aleatoare a 5 flori pentru carousel
        const shuffled = [...flowers].sort(() => 0.5 - Math.random());
        setFeaturedFlowers(shuffled.slice(0, 5));
      } catch (error) {
        console.error('Eroare la încărcarea florilor pentru carousel:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedFlowers();
  }, []);
  
  return (
    <Container>
      <section className="mb-5">
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Biblioteca de Flori</h1>
            <p className="hero-subtitle">
              Descoperă frumusețea și semnificația florilor - o colecție completă pentru iubitorii de flori
            </p>
            <SearchBar />
          </div>
        </div>
        
        {!loading && featuredFlowers.length > 0 && (
          <Carousel className="carousel-custom mb-5">
            {featuredFlowers.map(flower => (
              <Carousel.Item key={flower.id}>
                <img
                  className="d-block w-100"
                  src={flower.imageUrl || 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'}
                  alt={flower.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80';
                  }}
                />
                <Carousel.Caption>
                  <h3>{flower.name}</h3>
                  <p>{flower.latinName}</p>
                  <Link to={`/flowers/${flower.id}`} className="btn btn-custom-primary">
                    <i className="fas fa-eye me-1"></i> Vezi detalii
                  </Link>
                </Carousel.Caption>
              </Carousel.Item>
            ))}
          </Carousel>
        )}
      </section>
      
      <section className="mb-5">
        <Row>
          <Col md={4} className="mb-4">
            <Card className="card-custom feature-card">
              <Card.Body className="d-flex flex-column">
                <div className="feature-icon"><i className="fas fa-spa"></i></div>
                <Card.Title className="feature-title">Descoperă florile</Card.Title>
                <Card.Text>
                  Explorează vasta noastră colecție de flori. Află despre culorile, semnificațiile și simbolismul acestora.
                </Card.Text>
                <div className="mt-auto">
                  <Button as={Link} to="/flowers" variant="primary" className="btn-custom-primary hover-grow">
                    <i className="fas fa-arrow-right me-2"></i>Vezi toate florile
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4} className="mb-4">
            <Card className="card-custom feature-card">
              <Card.Body className="d-flex flex-column">
                <div className="feature-icon"><i className="fas fa-filter"></i></div>
                <Card.Title className="feature-title">Filtrează după semnificație</Card.Title>
                <Card.Text>
                  Caută flori după semnificație - dragoste, prietenie, fericire, noroc și multe altele.
                </Card.Text>
                <div className="mt-auto">
                  <Button as={Link} to="/flowers" variant="primary" className="btn-custom-primary hover-grow">
                    <i className="fas fa-search me-2"></i>Explorează semnificații
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4} className="mb-4">
            <Card className="card-custom feature-card">
              <Card.Body className="d-flex flex-column">
                <div className="feature-icon"><i className="fas fa-leaf"></i></div>
                <Card.Title className="feature-title">Compune buchete</Card.Title>
                <Card.Text>
                  Creează propriul tău buchet cu semnificație personalizată. Combină florile pentru a transmite mesajul dorit.
                </Card.Text>
                <div className="mt-auto">
                  <Button as={Link} to="/bouquet" variant="primary" className="btn-custom-primary hover-grow">
                    <i className="fas fa-magic me-2"></i>Compune buchet
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>
      
      <section>
        <div className="floral-divider mb-4">
          <i className="fas fa-spa floral-icon"></i>
          <i className="fas fa-leaf floral-icon"></i>
          <i className="fas fa-seedling floral-icon"></i>
        </div>
        
        {/* Word Cloud pentru flori populare */}
        <SimpleFlowerWordCloud />
      </section>
    </Container>
  );
};

export default HomePage;