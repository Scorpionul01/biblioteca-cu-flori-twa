import React, { useState } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/flowers/search?term=${encodeURIComponent(searchTerm.trim())}`);
    }
  };
  
  return (
    <Form onSubmit={handleSearch} className="search-bar">
      <InputGroup className="search-input-group">
        <div className="search-icon">
          <i className="fas fa-spa"></i>
        </div>
        <Form.Control
          type="text"
          placeholder="Caută flori după nume, semnificație..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Caută flori"
          className="form-control-custom"
        />
        <Button 
          variant="primary" 
          type="submit" 
          className="btn-custom-primary search-button" 
          style={{ borderRadius: '30px' }}
        >
          <i className="fas fa-spa me-1"></i> Caută
        </Button>
      </InputGroup>
    </Form>
  );
};

export default SearchBar;