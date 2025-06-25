import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const AdminPanel = () => {
  return (
    <div>
      <h2 className="mb-4">Panou de administrare</h2>
      
      <Row>
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body className="d-flex flex-column">
              <Card.Title>Administrare flori</Card.Title>
              <Card.Text>
                Adăugați, editați sau ștergeți florile din bibliotecă.
              </Card.Text>
              <div className="mt-auto">
                <Button as={Link} to="/admin/flowers" variant="primary">
                  Gestionează flori
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body className="d-flex flex-column">
              <Card.Title>Administrare semnificații</Card.Title>
              <Card.Text>
                Adăugați noi semnificații pentru flori.
              </Card.Text>
              <div className="mt-auto">
                <Button as={Link} to="/admin/meanings" variant="primary">
                  Gestionează semnificații
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body className="d-flex flex-column">
              <Card.Title>Statistici</Card.Title>
              <Card.Text>
                Vizualizați statistici și grafice despre florile din bibliotecă.
              </Card.Text>
              <div className="mt-auto">
                <Button as={Link} to="/admin/statistics" variant="primary">
                  Vezi statistici
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminPanel;