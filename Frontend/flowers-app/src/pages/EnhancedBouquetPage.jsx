import React from 'react';
import { Container } from 'react-bootstrap';
import EnhancedAIBouquetGenerator from '../components/ai/EnhancedAIBouquetGenerator';
import '../styles/enhanced-bouquet-page.css';

const EnhancedBouquetPage = () => {
  return (
    <Container fluid className="px-0">
      <div className="enhanced-bouquet-page">
        <div className="page-header text-center mb-4">
          <Container>
            <div className="header-content">
              <span className="badge bg-primary mb-2">BETA</span>
              <h1 className="display-4 mb-3">AI Bouquet Generator - Versiunea îmbunătățită</h1>
              <p className="lead text-muted mb-4">
                Experimentează noua versiune cu funcții avansate de diversificare și lock pentru flori
              </p>
              <div className="feature-badges">
                <span className="badge bg-light text-dark me-2">🎯 Diversificare inteligentă</span>
                <span className="badge bg-light text-dark me-2">🔒 Lock flori favorite</span>
                <span className="badge bg-light text-dark me-2">🎨 Filtrare pe culori</span>
                <span className="badge bg-light text-dark">✨ Variații multiple</span>
              </div>
            </div>
          </Container>
        </div>
        
        <EnhancedAIBouquetGenerator />
        
        <Container className="mt-5">
          <div className="help-section">
            <div className="row">
              <div className="col-md-6">
                <div className="help-card">
                  <h4>🔒 Funcția de Lock</h4>
                  <p>
                    Blochează florile care îți plac pentru a le păstra în buchetele viitoare. 
                    Acestea vor fi incluse automat în fiecare nou buchet generat.
                  </p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="help-card">
                  <h4>🎨 Filtru Culori</h4>
                  <p>
                    Selectează culorile preferate pentru a genera buchete care se potrivesc 
                    cu ocazia sau preferințele tale.
                  </p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="help-card">
                  <h4>🎯 Diversificare</h4>
                  <p>
                    Sistemul învață din generările anterioare și îți oferă buchete variate, 
                    evitând repetarea acelorași combinații.
                  </p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="help-card">
                  <h4>✨ Variații Multiple</h4>
                  <p>
                    Generează mai multe versiuni ale aceluiași buchet pentru a avea 
                    opțiuni diverse din care să alegi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </Container>
  );
};

export default EnhancedBouquetPage;
