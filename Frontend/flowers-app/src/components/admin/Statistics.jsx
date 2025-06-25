import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js';
import colorService from '../../services/colorService';
import meaningService from '../../services/meaningService';
import flowerService from '../../services/flowerService';

// Înregistrare componente Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Statistics = () => {
  const [colorData, setColorData] = useState(null);
  const [meaningData, setMeaningData] = useState(null);
  const [flowerCount, setFlowerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obținere distribuție flori pe culori
        const colorDistribution = await colorService.getColorDistribution();
        
        // Obținere distribuție flori pe semnificații
        const meaningDistribution = await meaningService.getMeaningDistribution();
        
        // Obținere număr total de flori
        const flowers = await flowerService.getAllFlowers();
        
        // Pregătire date pentru grafice
        prepareChartData(colorDistribution, meaningDistribution, flowers.length);
      } catch (err) {
        setError('Eroare la încărcarea datelor pentru statistici.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const prepareChartData = (colorDistribution, meaningDistribution, totalFlowers) => {
    // Culori pentru grafice
    const backgroundColors = [
      'rgba(255, 99, 132, 0.7)',
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(153, 102, 255, 0.7)',
      'rgba(255, 159, 64, 0.7)',
      'rgba(199, 199, 199, 0.7)',
      'rgba(83, 102, 255, 0.7)',
      'rgba(40, 159, 64, 0.7)',
      'rgba(210, 199, 199, 0.7)'
    ];
    
    // Pregătire date pentru graficul cu culorile
    const colorLabels = Object.keys(colorDistribution);
    const colorCounts = Object.values(colorDistribution);
    
    setColorData({
      labels: colorLabels,
      datasets: [
        {
          label: 'Flori pe culori',
          data: colorCounts,
          backgroundColor: backgroundColors,
          borderWidth: 1
        }
      ]
    });
    
    // Pregătire date pentru graficul cu semnificațiile
    // Limitare la top 7 semnificații și grupare restul ca "Altele"
    const sortedMeanings = Object.entries(meaningDistribution)
      .sort((a, b) => b[1] - a[1]);
    
    let meaningLabels, meaningCounts;
    
    if (sortedMeanings.length > 7) {
      const top7 = sortedMeanings.slice(0, 7);
      const others = sortedMeanings.slice(7);
      
      const othersSum = others.reduce((sum, item) => sum + item[1], 0);
      
      meaningLabels = [...top7.map(item => item[0]), 'Altele'];
      meaningCounts = [...top7.map(item => item[1]), othersSum];
    } else {
      meaningLabels = sortedMeanings.map(item => item[0]);
      meaningCounts = sortedMeanings.map(item => item[1]);
    }
    
    setMeaningData({
      labels: meaningLabels,
      datasets: [
        {
          label: 'Flori pe semnificații',
          data: meaningCounts,
          backgroundColor: backgroundColors,
          borderWidth: 1
        }
      ]
    });
    
    setFlowerCount(totalFlowers);
  };
  
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
  
  return (
    <div>
      <h2 className="mb-4">Statistici flori</h2>
      
      <Row className="mb-4">
        <Col lg={4} md={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <h4 className="text-center mb-3">Număr total de flori</h4>
              <div className="display-1 text-primary">{flowerCount}</div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={8} md={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <h4 className="text-center mb-3">Distribuția florilor pe culori</h4>
              {colorData && (
                <div style={{ maxHeight: '350px' }}>
                  <Bar 
                    data={colorData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        },
                        title: {
                          display: false
                        }
                      }
                    }}
                  />
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col lg={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <h4 className="text-center mb-3">Distribuția florilor pe semnificații</h4>
              {meaningData && (
                <div style={{ maxHeight: '350px' }}>
                  <Pie 
                    data={meaningData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false
                    }}
                  />
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <h4 className="text-center mb-3">Proporția florilor pe culori</h4>
              {colorData && (
                <div style={{ maxHeight: '350px' }}>
                  <Doughnut 
                    data={colorData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false
                    }}
                  />
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Statistics;