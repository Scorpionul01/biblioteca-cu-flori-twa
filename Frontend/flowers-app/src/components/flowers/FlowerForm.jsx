import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import flowerService from '../../services/flowerService';
import colorService from '../../services/colorService';
import meaningService from '../../services/meaningService';

const FlowerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [colors, setColors] = useState([]);
  const [meanings, setMeanings] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    latinName: '',
    description: '',
    imageUrl: '',
    colorId: '',
    meaningIds: []
  });
  
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        const [colorsData, meaningsData] = await Promise.all([
          colorService.getAllColors(),
          meaningService.getAllMeanings()
        ]);
        
        setColors(colorsData);
        setMeanings(meaningsData);
      } catch (err) {
        setError('Eroare la încărcarea opțiunilor. Vă rugăm reîncărcați pagina.');
        console.error(err);
      } finally {
        setLoadingOptions(false);
      }
    };
    
    fetchOptions();
  }, []);
  
  useEffect(() => {
    const fetchFlowerData = async () => {
      if (isEditMode) {
        try {
          setLoading(true);
          
          const flower = await flowerService.getFlowerById(id);
          
          setFormData({
            id: flower.id,
            name: flower.name,
            latinName: flower.latinName || '',
            description: flower.description || '',
            imageUrl: flower.imageUrl || '',
            colorId: flower.colorId.toString(),
            meaningIds: flower.meanings.map(m => m.id)
          });
        } catch (err) {
          setError('Eroare la încărcarea datelor florii. Vă rugăm încercați din nou.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchFlowerData();
  }, [id, isEditMode]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handleMeaningChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setFormData(prevData => ({
      ...prevData,
      meaningIds: selectedOptions
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const flowerData = {
        ...formData,
        colorId: parseInt(formData.colorId)
      };
      
      if (isEditMode) {
        await flowerService.updateFlower(flowerData);
        setSuccess('Floarea a fost actualizată cu succes!');
      } else {
        await flowerService.createFlower(flowerData);
        setSuccess('Floarea a fost adăugată cu succes!');
        
        // Resetare formular pentru adăugare nouă
        if (!isEditMode) {
          setFormData({
            id: null,
            name: '',
            latinName: '',
            description: '',
            imageUrl: '',
            colorId: '',
            meaningIds: []
          });
          setValidated(false);
        }
      }
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="shadow-sm">
      <Card.Body>
        <h2 className="mb-4">{isEditMode ? 'Editare floare' : 'Adăugare floare nouă'}</h2>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="formName">
                <Form.Label>Nume *</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  placeholder="Introduceți numele florii"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Numele florii este obligatoriu.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3" controlId="formLatinName">
                <Form.Label>Nume latin</Form.Label>
                <Form.Control
                  type="text"
                  name="latinName"
                  placeholder="Introduceți numele latin"
                  value={formData.latinName}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3" controlId="formDescription">
            <Form.Label>Descriere</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              placeholder="Introduceți descrierea florii"
              value={formData.description}
              onChange={handleInputChange}
            />
          </Form.Group>
          
          <Form.Group className="mb-3" controlId="formImageUrl">
            <Form.Label>URL imagine</Form.Label>
            <Form.Control
              type="text"
              name="imageUrl"
              placeholder="Introduceți URL-ul imaginii"
              value={formData.imageUrl}
              onChange={handleInputChange}
            />
          </Form.Group>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="formColor">
                <Form.Label>Culoare *</Form.Label>
                <Form.Select
                  name="colorId"
                  value={formData.colorId}
                  onChange={handleInputChange}
                  required
                  disabled={loadingOptions}
                >
                  <option value="">Selectați culoarea</option>
                  {colors.map(color => (
                    <option key={color.id} value={color.id}>
                      {color.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Selectarea culorii este obligatorie.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3" controlId="formMeanings">
                <Form.Label>Semnificații</Form.Label>
                <Form.Select
                  multiple
                  name="meaningIds"
                  value={formData.meaningIds}
                  onChange={handleMeaningChange}
                  disabled={loadingOptions}
                  style={{ height: '100px' }}
                >
                  {meanings.map(meaning => (
                    <option key={meaning.id} value={meaning.id}>
                      {meaning.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  Țineți apăsat CTRL pentru a selecta mai multe opțiuni.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <div className="d-flex justify-content-between mt-4">
            <Button 
              variant="outline-secondary" 
              onClick={() => navigate('/admin/flowers')}
            >
              Anulare
            </Button>
            
            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading || loadingOptions}
            >
              {loading ? 'Se procesează...' : isEditMode ? 'Salvează modificările' : 'Adaugă floarea'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default FlowerForm;