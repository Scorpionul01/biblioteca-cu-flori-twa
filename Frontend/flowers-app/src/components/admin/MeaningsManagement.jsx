import React, { useState, useEffect } from 'react';
import { Table, Button, Alert, Spinner, Form, Card, Row, Col } from 'react-bootstrap';
import meaningService from '../../services/meaningService';

const MeaningsManagement = () => {
  const [meanings, setMeanings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    fetchMeanings();
  }, []);
  
  const fetchMeanings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const meaningsData = await meaningService.getAllMeanings();
      setMeanings(meaningsData);
    } catch (err) {
      setError('Eroare la încărcarea semnificațiilor. Vă rugăm încercați din nou.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setFormError('Numele semnificației este obligatoriu.');
      return;
    }
    
    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);
    
    try {
      await meaningService.createMeaning(formData);
      
      // Resetare formular
      setFormData({
        name: '',
        description: ''
      });
      
      // Actualizare listă
      fetchMeanings();
      
      setFormSuccess('Semnificația a fost adăugată cu succes!');
    } catch (err) {
      setFormError(err.toString());
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading && meanings.length === 0) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Se încarcă...</span>
        </Spinner>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="mb-4">Administrare semnificații</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row>
        <Col lg={4} className="mb-4">
          <Card>
            <Card.Body>
              <h4 className="mb-3">Adaugă semnificație nouă</h4>
              
              {formError && <Alert variant="danger">{formError}</Alert>}
              {formSuccess && <Alert variant="success">{formSuccess}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formName">
                  <Form.Label>Nume semnificație *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Introduceți numele semnificației"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="formDescription">
                  <Form.Label>Descriere</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    placeholder="Introduceți descrierea semnificației"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100"
                  disabled={submitting}
                >
                  {submitting ? 'Se adaugă...' : 'Adaugă semnificație'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={8}>
          {meanings.length === 0 ? (
            <Alert variant="info">
              Nu există semnificații definite. Adăugați prima semnificație folosind formularul alăturat.
            </Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nume</th>
                  <th>Descriere</th>
                  <th>Flori asociate</th>
                </tr>
              </thead>
              <tbody>
                {meanings.map(meaning => (
                  <tr key={meaning.id}>
                    <td>{meaning.id}</td>
                    <td>{meaning.name}</td>
                    <td>{meaning.description || <em>Fără descriere</em>}</td>
                    <td>{meaning.flowerCount}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default MeaningsManagement;