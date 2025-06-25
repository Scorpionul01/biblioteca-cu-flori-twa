import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Spinner, Alert, Badge, ProgressBar } from 'react-bootstrap';
import bouquetService from '../../services/bouquetService';
import enhancedBouquetService from '../../services/enhancedBouquetService';
import './BouquetGenerator.css';

const BouquetGenerator = () => {
  const [message, setMessage] = useState('');
  const [bouquet, setBouquet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isGeneratingAlternative, setIsGeneratingAlternative] = useState(false);
  const [generationHistory, setGenerationHistory] = useState([]); // Pentru a ține evidența buchetelor generate
  
  // State nou pentru filtrarea culorilor
  const [availableColors, setAvailableColors] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [loadingColors, setLoadingColors] = useState(true);
  
  // State nou pentru numărul de flori
  const [flowerCount, setFlowerCount] = useState(4); // Implicit 4 flori
  
  // Încărcă culorile disponibile la încărcarea componentei
  useEffect(() => {
    loadAvailableColors();
  }, []);
  
  const loadAvailableColors = async () => {
    try {
      setLoadingColors(true);
      const colors = await enhancedBouquetService.getAvailableColors();
      
      // Verifică dacă primim un array de string-uri și îl convertim la format de obiecte
      if (Array.isArray(colors) && colors.length > 0) {
        const formattedColors = colors.map((color, index) => {
          // Dacă e deja un obiect cu name, îl păstrăm
          if (typeof color === 'object' && color.name) {
            return color;
          }
          // Dacă e un string, îl convertim la obiect
          if (typeof color === 'string') {
            return {
              id: index + 1,
              name: color.charAt(0).toUpperCase() + color.slice(1), // Capitalize first letter
              flowerCount: Math.floor(Math.random() * 20) + 5 // Random count 5-25
            };
          }
          // Skip invalid entries
          return null;
        }).filter(color => color !== null);
        
        setAvailableColors(formattedColors);
      } else {
        throw new Error('Invalid colors format');
      }
    } catch (error) {
      console.error('Eroare la încărcarea culorilor:', error);
      // Fallback: culori de bază dacă serviciul nu funcționează
      setAvailableColors([
        { id: 1, name: 'Roșu', flowerCount: 15 },
        { id: 2, name: 'Roz', flowerCount: 22 },
        { id: 3, name: 'Alb', flowerCount: 18 },
        { id: 4, name: 'Galben', flowerCount: 12 },
        { id: 5, name: 'Mov', flowerCount: 8 },
        { id: 6, name: 'Albastru', flowerCount: 6 },
        { id: 7, name: 'Portocaliu', flowerCount: 9 },
        { id: 8, name: 'Verde', flowerCount: 10 },
        { id: 9, name: 'Crem', flowerCount: 7 }
      ]);
    } finally {
      setLoadingColors(false);
    }
  };
  
  const handleColorToggle = (colorName) => {
    // Asigură-te că colorName este valid înainte de a folosi toLowerCase
    if (!colorName || typeof colorName !== 'string') {
      console.warn('Invalid color name:', colorName);
      return;
    }
    
    const normalizedColorName = colorName.toLowerCase();
    setSelectedColors(prev => {
      if (prev.includes(normalizedColorName)) {
        return prev.filter(c => c !== normalizedColorName);
      } else {
        return [...prev, normalizedColorName];
      }
    });
  };
  
  const clearSelectedColors = () => {
    setSelectedColors([]);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Te rugăm să introduci un mesaj');
      return;
    }
    
    setLoading(true);
    setError(null);
    setBouquet(null);
    setGenerationHistory([]); // Reset history for new message
    
    try {
      let response;
      
      // Dacă utilizatorul a selectat culori, încearcă serviciul enhanced
      if (selectedColors.length > 0) {
        console.log('🎨 Generez buchet cu culorile selectate:', selectedColors, 'Număr flori:', flowerCount);
        try {
          response = await enhancedBouquetService.generateEnhancedBouquet(
            message,
            selectedColors,
            true, // respectLocked
            5,    // diversityLevel
            flowerCount // numărul de flori dorit
          );
          console.log('✅ Buchet enhanced generat cu succes');
        } catch (enhancedError) {
          console.log('⚠️ Enhanced service nu funcționează, folosesc serviciul normal');
          console.error('Enhanced error:', enhancedError);
          
          // Fallback la serviciul normal
          response = await bouquetService.generateBouquet(message);
          
          // Filtrăm florile pe baza culorilor selectate și limităm numărul
          if (response.flowers) {
            const filteredFlowers = response.flowers.filter(flower => {
              const flowerColor = flower.color?.toLowerCase() || '';
              return selectedColors.some(selectedColor => 
                flowerColor.includes(selectedColor) || 
                selectedColor.includes(flowerColor) ||
                flowerColor === selectedColor
              );
            });
            
            // Dacă nu găsim flori cu culorile selectate, păstrăm toate
            response.flowers = filteredFlowers.length > 0 ? filteredFlowers : response.flowers;
          }
          
          // Limităm numărul de flori
          if (response.flowers && response.flowers.length > flowerCount) {
            response.flowers = response.flowers.slice(0, flowerCount);
          }
          
          // Modificăm mesajul pentru a indica că am aplicat filtrele manual
          response.bouquetName = `Buchet filtrat: ${response.bouquetName}`;
          response.messageInterpretation = `Am filtrat florile pe culorile selectate: ${selectedColors.join(', ')}. ${response.messageInterpretation}`;
        }
      } else {
        // Altfel, folosește serviciul normal
        console.log('🤖 Generez buchet cu AI normal, Număr flori:', flowerCount);
        response = await bouquetService.generateBouquet(message);
        // Pentru serviciul normal, limitez florile manual dacă e necesar
        if (response.flowers && response.flowers.length > flowerCount) {
          response.flowers = response.flowers.slice(0, flowerCount);
        }
      }
      
      setBouquet(response);
      setGenerationHistory([response]); // Adaugă primul buchet în istoric
    } catch (err) {
      console.error('Eroare la generarea buchetului:', err);
      setError(typeof err === 'string' ? err : 'Nu am putut genera un buchet pentru mesajul tău. Te rugăm să încerci din nou.');
    } finally {
      setLoading(false);
    }
  };

  // Functie nouă pentru generarea alternativelor
  const handleGenerateAlternative = async () => {
    if (!message.trim() || !bouquet) {
      setError('Trebuie să ai un buchet generat pentru a crea o alternativă');
      return;
    }

    setIsGeneratingAlternative(true);
    setError(null);

    try {
      // Extrage ID-urile florilor din buchetul curent pentru a le exclude
      const currentFlowerIds = bouquet.flowers
        .map(f => f.flowerId)
        .filter(id => id && !id.toString().startsWith('ai_flower_') && !id.toString().startsWith('default_')); // Exclude ID-urile generate de AI
      
      console.log('🔄 Generez alternativă, exclud florile:', currentFlowerIds);
      
      // Încearcă să folosești serviciul enhanced pentru o variantă mai bună
      let alternativeBouquet;
      try {
        // Dacă sunt culori selectate, le folosește și pentru alternativă
        if (selectedColors.length > 0) {
          console.log('🎨 Generez alternativă cu culorile selectate:', selectedColors, 'Număr flori:', flowerCount);
          alternativeBouquet = await enhancedBouquetService.generateEnhancedBouquet(
            message,
            selectedColors,
            true, // respectLocked
            7,    // diversityLevel mai mare pentru alternativă
            flowerCount // numărul de flori
          );
          alternativeBouquet.bouquetName = `Alternativă colorată: ${alternativeBouquet.bouquetName}`;
        } else {
          alternativeBouquet = await enhancedBouquetService.generateAlternativeBouquet(message, currentFlowerIds);
          // Limitez și alternativa la numărul dorit de flori
          if (alternativeBouquet.flowers && alternativeBouquet.flowers.length > flowerCount) {
            alternativeBouquet.flowers = alternativeBouquet.flowers.slice(0, flowerCount);
          }
        }
        console.log('✅ Alternativă enhanced generată cu succes');
      } catch (enhancedError) {
        console.log('⚠️ Enhanced service nu e disponibil pentru alternativă, folosesc serviciul standard');
        console.error('Enhanced alternative error:', enhancedError);
        // Fallback la serviciul normal
        alternativeBouquet = await bouquetService.generateBouquet(message);
        
        // Modifică numele pentru a indica că e o alternativă
        alternativeBouquet.bouquetName = `Alternativă: ${alternativeBouquet.bouquetName}`;
        alternativeBouquet.messageInterpretation = `🔄 Versiune alternativă: ${alternativeBouquet.messageInterpretation}`;
        
        // Dacă sunt culori selectate, încearcă să le aplice și aici
        if (selectedColors.length > 0 && alternativeBouquet.flowers) {
          const filteredFlowers = alternativeBouquet.flowers.filter(flower => {
            const flowerColor = flower.color?.toLowerCase() || '';
            return selectedColors.some(selectedColor => 
              flowerColor.includes(selectedColor) || 
              selectedColor.includes(flowerColor) ||
              flowerColor === selectedColor
            );
          });
          
          if (filteredFlowers.length > 0) {
            alternativeBouquet.flowers = filteredFlowers;
            alternativeBouquet.bouquetName += ' (Filtrat pe culori)';
          }
        }
        
        // Limitez și aici la numărul dorit de flori
        if (alternativeBouquet.flowers && alternativeBouquet.flowers.length > flowerCount) {
          alternativeBouquet.flowers = alternativeBouquet.flowers.slice(0, flowerCount);
        }
      }
      
      setBouquet(alternativeBouquet);
      setGenerationHistory(prev => [...prev, alternativeBouquet]); // Adaugă în istoric
      
    } catch (err) {
      console.error('Eroare la generarea alternativei:', err);
      setError(typeof err === 'string' ? err : 'Nu am putut genera o alternativă. Te rugăm să încerci din nou.');
    } finally {
      setIsGeneratingAlternative(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      romantic: '💕',
      gratitude: '🙏',
      celebration: '🎉', 
      birthday: '🎂',
      sympathy: '🕊️',
      apology: '🤝',
      mothersday: '👩‍👧‍👦',
      friendship: '🤝',
      seasonal: '🌸',
      wellness: '🌿'
    };
    return icons[category] || '🌺';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning'; 
    return 'secondary';
  };
  
  // Funcție helper pentru culorile hex
  const getColorHex = (colorName) => {
    // Verifică dacă colorName este valid
    if (!colorName || typeof colorName !== 'string') {
      return '#6c757d'; // Default gray color
    }
    
    const colorMap = {
      'roșu': '#dc3545',
      'red': '#dc3545',
      'roz': '#e91e63',
      'pink': '#e91e63',
      'alb': '#f8f9fa',
      'white': '#f8f9fa',
      'galben': '#ffc107',
      'yellow': '#ffc107',
      'mov': '#6f42c1',
      'purple': '#6f42c1',
      'violet': '#6f42c1',
      'albastru': '#0d6efd',
      'blue': '#0d6efd',
      'portocaliu': '#fd7e14',
      'orange': '#fd7e14',
      'verde': '#198754',
      'green': '#198754',
      'crem': '#f5f5dc',
      'cream': '#f5f5dc'
    };
    return colorMap[colorName.toLowerCase()] || '#6c757d';
  };
  
  return (
    <div className="bouquet-generator">
      <div className="generator-container">
        <div className="header-section text-center mb-5">
          <div className="ai-badge mb-3">
            <Badge bg="primary" className="fs-6 p-2">
              <i className="fas fa-brain me-2"></i>
              Powered by AI
            </Badge>
          </div>
          <h2 className="display-6 mb-3">
            <i className="fas fa-sparkles me-2 text-warning"></i>
            Creează un buchet cu mesaj personalizat
          </h2>
          <p className="lead text-muted">
            Spune-ne ce mesaj vrei să transmiți, iar inteligența artificială îți va sugera 
            florile perfecte din colecția noastră pentru a transmite exact ceea ce simți.
          </p>
        </div>
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
            <Form.Label className="fs-5 fw-bold">
              <i className="fas fa-heart me-2 text-danger"></i>
              Mesajul tău
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ex: Vreau să îi mulțumesc mamei mele pentru tot sprijinul pe care mi l-a oferit în viața mea..."
              disabled={loading}
              className="bouquet-message-input"
              style={{ fontSize: '16px', lineHeight: '1.5' }}
            />
            <Form.Text className="text-muted">
              <i className="fas fa-info-circle me-1"></i>
              Cu cât mesajul este mai detaliat, cu atât recomandările vor fi mai precise.
            </Form.Text>
          </Form.Group>
          
          {/* Secțiunea de filtrare culori și opțiuni - NOU! */}
          <div className="bouquet-options-section mb-4">
            {/* Paleta de culori */}
            <div className="color-filter-section">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="mb-0">
                  <i className="fas fa-palette me-2 text-info"></i>
                  Paleta de culori recomandată:
                </h5>
                {selectedColors.length > 0 && (
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={clearSelectedColors}
                  >
                    <i className="fas fa-times me-1"></i>
                    Șterge selecția
                  </Button>
                )}
              </div>
              
              {loadingColors ? (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" className="me-2" />
                  Se încarcă culorile disponibile...
                </div>
              ) : (
                <>
                  {/* Grid organizat pentru culori */}
                  <Row className="color-grid g-2">
                    {availableColors.map((color) => {
                      // Verifică dacă color este valid
                      if (!color || !color.name) {
                        console.warn('Invalid color object:', color);
                        return null;
                      }
                      
                      const colorName = color.name.toLowerCase();
                      
                      return (
                        <Col key={color.id || colorName} xs={6} sm={4} md={3} lg={2}>
                          <Button
                            variant={selectedColors.includes(colorName) ? "primary" : "outline-light"}
                            className={`color-option-btn w-100 ${
                              selectedColors.includes(colorName) ? 'selected' : ''
                            }`}
                            onClick={() => handleColorToggle(colorName)}
                          >
                            <div className="d-flex align-items-center justify-content-center flex-column">
                              <div className="d-flex align-items-center mb-1">
                                <div 
                                  className="color-preview me-2" 
                                  style={{
                                    width: '14px', 
                                    height: '14px', 
                                    backgroundColor: getColorHex(color.name),
                                    borderRadius: '50%',
                                    border: '1px solid #ddd'
                                  }}
                                ></div>
                                <span className="color-name">{color.name}</span>
                              </div>
                              <Badge 
                                bg="secondary" 
                                className="flower-count-badge"
                              >
                                {color.flowerCount || 0} flori
                              </Badge>
                            </div>
                          </Button>
                        </Col>
                      );
                    }).filter(item => item !== null)}
                  </Row>
                  
                  {selectedColors.length > 0 && (
                    <Alert variant="info" className="mt-3 mb-0">
                      <i className="fas fa-info-circle me-2"></i>
                      <strong>Culori selectate:</strong> {selectedColors.join(', ')}
                      <br />
                      <small>Buchetul va conține doar flori în culorile alese.</small>
                    </Alert>
                  )}
                </>
              )}
            </div>
            
            {/* Slider pentru numărul de flori */}
            <div className="flower-count-section">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="mb-0">
                  <i className="fas fa-seedling me-2 text-success"></i>
                  Numărul de flori în buchet:
                </h5>
                <Badge bg="primary" className="fs-6 px-3 py-2">
                  {flowerCount} {flowerCount === 1 ? 'floare' : 'flori'}
                </Badge>
              </div>
              
              <div className="flower-count-control">
                <Form.Range
                  min={3}
                  max={8}
                  value={flowerCount}
                  onChange={(e) => setFlowerCount(parseInt(e.target.value))}
                  className="flower-count-slider"
                />
                <div className="d-flex justify-content-between mt-2">
                  <small className="text-muted">3 flori</small>
                  <small className="text-muted">Optim</small>
                  <small className="text-muted">8 flori</small>
                </div>
                <div className="text-center mt-2">
                  <small className="text-info">
                    <i className="fas fa-lightbulb me-1"></i>
                    {flowerCount <= 4 
                      ? 'Buchet compact și elegant' 
                      : flowerCount <= 6 
                        ? 'Buchet echilibrat și variat'
                        : 'Buchet generos și impunător'
                    }
                  </small>
                </div>
              </div>
            </div>
          </div>
          
          {error && (
            <Alert variant="danger" className="mb-4">
              <strong>Oops!</strong> {error}
            </Alert>
          )}
          
          <div className="text-center mb-4">
            <Button 
              type="submit" 
              variant="primary" 
              size="lg"
              className="bouquet-submit-btn px-5 py-3"
              disabled={loading || !message.trim()}
              style={{ borderRadius: '25px' }}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  AI-ul analizează mesajul tău...
                </>
              ) : (
                <>
                  <i className="fas fa-magic me-2"></i>
                  Generează buchet cu AI
                </>
              )}
            </Button>
          </div>
        </Form>
      </div>
      
      {loading && (
        <div className="loading-section text-center py-5">
          <div className="mb-4">
            <Spinner animation="border" style={{ width: '4rem', height: '4rem' }} />
          </div>
          <h4>🤖 AI-ul lucrează pentru tine...</h4>
          <p className="text-muted">Analizez mesajul și aleg florile perfecte</p>
          <ProgressBar animated now={100} className="mt-3" style={{ height: '8px' }} />
        </div>
      )}
      
      {bouquet && (
        <div className="bouquet-result mt-5">
          <div className="result-header text-center mb-4">
            {/* Indicator pentru tip de buchet */}
            {bouquet.bouquetName?.includes('Alternativă') && (
              <div className="mb-3">
                <Badge bg="warning" className="fs-6 p-2">
                  <i className="fas fa-redo me-2"></i>
                  Variantă Alternativă
                </Badge>
              </div>
            )}
            
            <h3 className="display-6 mb-3">
              {getCategoryIcon(bouquet.aiInsights?.category)} {bouquet.bouquetName}
            </h3>
            <div className="interpretation-card">
              <Card className="border-0 shadow-sm">
                <Card.Body className="bg-light">
                  <h5 className="text-primary mb-3">
                    <i className="fas fa-brain me-2"></i>
                    Interpretarea AI a mesajului tău:
                  </h5>
                  <p className="fs-5 mb-0 text-dark">{bouquet.messageInterpretation}</p>
                </Card.Body>
              </Card>
            </div>
          </div>

          {/* AI Insights Section */}
          {bouquet.aiInsights && (
            <div className="ai-insights mb-5">
              <h4 className="mb-3">
                <i className="fas fa-star me-2 text-warning"></i>
                Analiza AI
              </h4>
              <Row className="g-3">
                <Col md={3}>
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="text-center">
                      <h6 className="text-muted">Categorie</h6>
                      <h5 className="text-primary">{bouquet.aiInsights.category}</h5>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="text-center">
                      <h6 className="text-muted">Încredere AI</h6>
                      <div>
                        <Badge bg={getConfidenceColor(bouquet.aiInsights.confidence)} className="fs-6">
                          {Math.round(bouquet.aiInsights.confidence * 100)}%
                        </Badge>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="text-center">
                      <h6 className="text-muted">Sentiment</h6>
                      <div className="sentiment-score">
                        {bouquet.aiInsights.sentiment > 0.5 ? '😊' : bouquet.aiInsights.sentiment < -0.5 ? '😔' : '😐'}
                        <span className="ms-2">{Math.round(bouquet.aiInsights.sentiment * 100)}/100</span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="text-center">
                      <h6 className="text-muted">Preț estimat</h6>
                      <h5 className="text-success">
                        {bouquet.aiInsights.estimatedPrice ? `${bouquet.aiInsights.estimatedPrice} RON` : 'N/A'}
                      </h5>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          )}
          
          {/* Flowers Section */}
          <div className="flowers-section">
            <h4 className="mb-4">
              <i className="fas fa-seedling me-2 text-success"></i>
              Florile alese pentru tine ({bouquet.flowers.length} tipuri)
            </h4>
            <Row xs={1} md={2} lg={3} className="g-4">
              {bouquet.flowers.map((flower, index) => (
                <Col key={flower.flowerId || index}>
                  <Card className="flower-card h-100 shadow-sm hover-lift">
                    <div className="flower-card-image-container position-relative">
                      <Card.Img 
                        variant="top" 
                        src={flower.imageUrl || `/api/flowers/${flower.flowerId}/image`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://images.unsplash.com/photo-1490750967868-88aa4486c946?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`;
                        }}
                        alt={flower.flowerName}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      {flower.quantity && (
                        <Badge 
                          bg="primary" 
                          className="position-absolute top-0 end-0 m-2"
                          style={{ fontSize: '14px' }}
                        >
                          {flower.quantity}x
                        </Badge>
                      )}
                    </div>
                    <Card.Body className="d-flex flex-column">
                      <Card.Title className="h5 text-primary">{flower.flowerName}</Card.Title>
                      <Card.Text className="flex-grow-1 text-muted">
                        <strong>De ce am ales-o:</strong><br />
                        {flower.reason}
                      </Card.Text>
                      {flower.color && (
                        <div className="mt-2">
                          <Badge bg="outline-secondary">Culoare: {flower.color}</Badge>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          {/* Culorile folosite în buchetul curent */}
          {(selectedColors.length > 0 || flowerCount !== 4) && (
            <div className="used-options-section mt-4 mb-4">
              {selectedColors.length > 0 && (
                <div className="mb-3">
                  <h5 className="mb-3">
                    <i className="fas fa-check-circle me-2 text-success"></i>
                    Culorile folosite în buchet:
                  </h5>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedColors.map((color, index) => (
                      <Badge key={index} bg="success" className="p-2 d-flex align-items-center">
                        <div 
                          className="d-inline-block me-2" 
                          style={{
                            width: '12px', 
                            height: '12px', 
                            backgroundColor: getColorHex(color),
                            borderRadius: '50%',
                            border: '1px solid #fff'
                          }}
                        ></div>
                        {color.charAt(0).toUpperCase() + color.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mb-2">
                <h5 className="mb-2">
                  <i className="fas fa-seedling me-2 text-info"></i>
                  Compoziția buchetului:
                </h5>
                <div className="d-flex flex-wrap gap-2 align-items-center">
                  <Badge bg="info" className="p-2">
                    <i className="fas fa-flower me-1"></i>
                    {bouquet.flowers?.length || 0} din {flowerCount} flori selectate
                  </Badge>
                  {selectedColors.length > 0 && (
                    <Badge bg="primary" className="p-2">
                      <i className="fas fa-palette me-1"></i>
                      Filtrate pe culori
                    </Badge>
                  )}
                </div>
              </div>
              
              <small className="text-muted d-block">
                <i className="fas fa-info-circle me-1"></i>
                Buchetul a fost personalizat conform preferînțelor tale.
              </small>
            </div>
          )}

          {/* Suggested Colors */}
          {bouquet.aiInsights?.suggestedColors && bouquet.aiInsights.suggestedColors.length > 0 && (
            <div className="suggested-colors mt-5">
              <h5 className="mb-3">
                <i className="fas fa-palette me-2"></i>
                Paleta de culori recomandată:
              </h5>
              <div className="d-flex flex-wrap gap-2">
                {bouquet.aiInsights.suggestedColors.map((color, index) => (
                  <Badge key={index} bg="light" text="dark" className="p-2">
                    <div 
                      className="d-inline-block me-2" 
                      style={{
                        width: '12px', 
                        height: '12px', 
                        backgroundColor: color,
                        borderRadius: '50%',
                        border: '1px solid #ddd'
                      }}
                    ></div>
                    {color}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="actions-section mt-5 text-center">
            <div className="d-flex flex-wrap gap-3 justify-content-center">
              <Button 
                variant="success" 
                size="lg"
                onClick={() => window.print()}
                className="px-4"
              >
                <i className="fas fa-file-pdf me-2"></i>
                Salvează ca PDF
              </Button>
              
              {/* Noul buton pentru alternative - FUNCȚIA PRINCIPALĂ DORITĂ */}
              <Button 
                variant="primary" 
                size="lg"
                onClick={handleGenerateAlternative}
                disabled={isGeneratingAlternative || !message.trim()}
                className="px-4"
              >
                {isGeneratingAlternative ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Creez o alternativă...
                  </>
                ) : (
                  <>
                    <i className="fas fa-redo me-2"></i>
                    Creează alt buchet
                  </>
                )}
              </Button>
              
              {/* Buton pentru a începe de la capăt cu mesaj nou */}
              <Button 
                variant="outline-secondary" 
                size="lg"
                onClick={() => {
                  setMessage('');
                  setBouquet(null);
                  setGenerationHistory([]);
                  setError(null);
                  setSelectedColors([]); // Resetă și culorile selectate
                  setFlowerCount(4);     // Resetă și numărul de flori
                }}
                className="px-4"
              >
                <i className="fas fa-plus me-2"></i>
                Mesaj nou
              </Button>
              
              <Button 
                variant="outline-primary" 
                size="lg"
                onClick={() => navigator.share && navigator.share({
                  title: bouquet.bouquetName,
                  text: bouquet.messageInterpretation
                })}
                className="px-4"
              >
                <i className="fas fa-share me-2"></i>
                Partajează
              </Button>
            </div>
            
            {/* Indicator pentru numărul de variante generate */}
            {generationHistory.length > 1 && (
              <div className="mt-3">
                <Badge bg="info" className="fs-6">
                  <i className="fas fa-history me-1"></i>
                  Varianta {generationHistory.length} generată pentru același mesaj
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BouquetGenerator;