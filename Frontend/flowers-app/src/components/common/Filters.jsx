import React, { useState, useEffect } from 'react';
import { Form, Card } from 'react-bootstrap';
import colorService from '../../services/colorService';
import meaningService from '../../services/meaningService';

const Filters = ({ onFilterChange }) => {
  const [colors, setColors] = useState([]);
  const [meanings, setMeanings] = useState([]);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedMeaning, setSelectedMeaning] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setLoading(true);
        const [colorsData, meaningsData] = await Promise.all([
          colorService.getAllColors(),
          meaningService.getAllMeanings()
        ]);
        
        setColors(colorsData);
        setMeanings(meaningsData);
      } catch (err) {
        setError('Eroare la încărcarea filtrelor');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFilters();
  }, []);
  
  const handleColorChange = (e) => {
    const colorId = e.target.value;
    setSelectedColor(colorId);
    onFilterChange({
      colorId: colorId || null,
      meaningId: selectedMeaning || null
    });
  };
  
  const handleMeaningChange = (e) => {
    const meaningId = e.target.value;
    setSelectedMeaning(meaningId);
    onFilterChange({
      colorId: selectedColor || null,
      meaningId: meaningId || null
    });
  };
  
  if (loading) {
    return <div>Se încarcă filtrele...</div>;
  }
  
  if (error) {
    return <div className="text-danger">{error}</div>;
  }
  
  return (
    <Card className="filters-card">
      <Card.Body>
        <Card.Title className="filter-title"><i className="fas fa-filter"></i>Filtrează florile</Card.Title>
        <div className="floral-divider"></div>
        
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="form-label-custom">
              <i className="fas fa-palette me-2"></i>Filtrează după culoare
            </Form.Label>
            <Form.Select 
              value={selectedColor} 
              onChange={handleColorChange}
              className="form-control-custom"
            >
              <option value="">Toate culorile</option>
              {colors.map(color => (
                <option key={color.id} value={color.id}>
                  {color.name} ({color.flowerCount} flori)
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label className="form-label-custom">
              <i className="fas fa-heart me-2"></i>Filtrează după semnificație
            </Form.Label>
            <Form.Select 
              value={selectedMeaning} 
              onChange={handleMeaningChange}
              className="form-control-custom"
            >
              <option value="">Toate semnificațiile</option>
              {meanings.map(meaning => (
                <option key={meaning.id} value={meaning.id}>
                  {meaning.name} ({meaning.flowerCount} flori)
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default Filters;