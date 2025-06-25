import React, { useState, useEffect } from 'react';
import { aiBouquetService } from '../../services/aiBouquetService';
import BouquetVisualization from './BouquetVisualization';
import './AIBouquetGenerator.css';

const AIBouquetGenerator = () => {
    const [message, setMessage] = useState('');
    const [generatedBouquet, setGeneratedBouquet] = useState(null);
    const [textAnalysis, setTextAnalysis] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const [aiStatus, setAiStatus] = useState(null);
    const [popularCombinations, setPopularCombinations] = useState([]);
    const [includeVisual, setIncludeVisual] = useState(false);

    useEffect(() => {
        checkAIStatus();
        loadPopularCombinations();
    }, []);

    const checkAIStatus = async () => {
        try {
            const response = await aiBouquetService.getAIStatus();
            setAiStatus(response.data);
        } catch (error) {
            console.error('Error checking AI status:', error);
            setAiStatus({ ai_service_status: 'error', model_loaded: false });
        }
    };

    const loadPopularCombinations = async () => {
        try {
            const response = await aiBouquetService.getPopularCombinations();
            setPopularCombinations(response.data);
        } catch (error) {
            console.error('Error loading popular combinations:', error);
        }
    };

    const handleAnalyzeText = async () => {
        if (!message.trim()) {
            setError('Te rog introdu un mesaj pentru analiză!');
            return;
        }

        setIsAnalyzing(true);
        setError('');

        try {
            const response = await aiBouquetService.analyzeText(message);
            setTextAnalysis(response.data);
        } catch (error) {
            setError('Eroare la analizarea textului: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleGenerateBouquet = async () => {
        if (!message.trim()) {
            setError('Te rog introdu un mesaj pentru buchet!');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await aiBouquetService.generateBouquet(message, includeVisual);
            setGeneratedBouquet(response.data);
            
            // Dacă nu am făcut deja analiza textului, o facem acum
            if (!textAnalysis) {
                const analysisResponse = await aiBouquetService.analyzeText(message);
                setTextAnalysis(analysisResponse.data);
            }
        } catch (error) {
            setError('Eroare la generarea buchetului: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleUseSuggestion = (suggestion) => {
        setMessage(suggestion.message);
        setError('');
        setTextAnalysis(null);
        setGeneratedBouquet(null);
    };

    const renderAIStatus = () => {
        if (!aiStatus) return null;

        const statusClass = aiStatus.ai_service_status === 'healthy' ? 'status-healthy' : 'status-error';
        
        return (
            <div className="ai-status-card">
                <h3 className="status-title">
                    <span className="icon">🤖</span>
                    Status AI System
                </h3>
                <div className="status-content">
                    <div className={`status-badge ${statusClass}`}>
                        {aiStatus.ai_service_status === 'healthy' ? '✅ Operațional' : '❌ Indisponibil'}
                    </div>
                    <div className={`status-badge ${aiStatus.model_loaded ? 'status-healthy' : 'status-error'}`}>
                        Model: {aiStatus.model_loaded ? 'Încărcat' : 'Nu este încărcat'}
                    </div>
                    {aiStatus.data && (
                        <div className="status-details">
                            <span>{aiStatus.data.training_examples?.toLocaleString()} exemple antrenare</span>
                            <span>{aiStatus.data.available_flowers?.length} flori disponibile</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderTextAnalysis = () => {
        if (!textAnalysis) return null;

        return (
            <div className="text-analysis-card">
                <h3 className="analysis-title">
                    <span className="icon">✨</span>
                    Analiza AI a textului tău
                </h3>
                <div className="analysis-grid">
                    <div className="analysis-item">
                        <h4>Categorie Detectată</h4>
                        <div className="category-badge">
                            {textAnalysis.detected_category}
                        </div>
                        <p className="confidence">
                            Confidence: {(textAnalysis.category_confidence * 100).toFixed(1)}%
                        </p>
                    </div>
                    
                    <div className="analysis-item">
                        <h4>Scor Sentiment</h4>
                        <div className="sentiment-display">
                            <span className={`sentiment-icon ${textAnalysis.sentiment_score > 0.7 ? 'positive' : textAnalysis.sentiment_score > 0.4 ? 'neutral' : 'empathetic'}`}>
                                ❤️
                            </span>
                            <span className="sentiment-score">
                                {(textAnalysis.sentiment_score * 100).toFixed(0)}%
                            </span>
                        </div>
                        <p className="sentiment-label">
                            {textAnalysis.sentiment_score > 0.7 ? 'Foarte pozitiv' : 
                             textAnalysis.sentiment_score > 0.4 ? 'Neutru' : 'Empatic'}
                        </p>
                    </div>
                    
                    <div className="analysis-item">
                        <h4>Culori Sugerate</h4>
                        <div className="color-tags">
                            {textAnalysis.suggested_colors?.slice(0, 3).map((color, index) => (
                                <span key={index} className="color-tag">
                                    {color}
                                </span>
                            ))}
                        </div>
                    </div>
                    
                    <div className="analysis-item">
                        <h4>Flori Recomandate</h4>
                        <div className="flower-tags">
                            {textAnalysis.suggested_flowers?.slice(0, 2).map((flower, index) => (
                                <span key={index} className="flower-tag">
                                    {flower}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                
                {textAnalysis.text_features && (
                    <div className="features-section">
                        <h4>Features Text Detectate</h4>
                        <div className="feature-tags">
                            {textAnalysis.text_features.top_features?.slice(0, 5).map(([feature, score], index) => (
                                <span key={index} className="feature-tag">
                                    {feature}
                                </span>
                            ))}
                        </div>
                        <p className="features-info">
                            {textAnalysis.text_features.non_zero_features} features din {textAnalysis.text_features.total_features} utilizate
                        </p>
                    </div>
                )}
            </div>
        );
    };

    const renderBouquetRecommendation = () => {
        if (!generatedBouquet?.bouquet_recommendation) return null;

        const recommendation = generatedBouquet.bouquet_recommendation;

        return (
            <div className="bouquet-recommendation-card">
                <h3 className="recommendation-title">
                    <span className="icon">🎨</span>
                    Buchetul tău personalizat
                </h3>
                
                {/* Mesajul personalizat */}
                <div className="personalized-message">
                    <p>"{recommendation.personalized_message}"</p>
                </div>

                {/* Informații generale */}
                <div className="bouquet-stats">
                    <div className="stat-item">
                        <div className="stat-value">{recommendation.total_stems}</div>
                        <div className="stat-label">Fire total</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">{recommendation.estimated_price} RON</div>
                        <div className="stat-label">Preț estimativ</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">{recommendation.elements?.length}</div>
                        <div className="stat-label">Tipuri flori</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">{recommendation.delivery_estimate}</div>
                        <div className="stat-label">Livrare</div>
                    </div>
                </div>

                {/* Elementele buchetului */}
                <div className="bouquet-elements">
                    <h4>Elementele buchetului:</h4>
                    {recommendation.elements?.map((element, index) => (
                        <div key={index} className="bouquet-element">
                            <div className="element-info">
                                <div className="element-name">{element.name}</div>
                                <div className="element-latin">{element.latin_name}</div>
                                {element.meaning && (
                                    <div className="element-meaning">"{element.meaning}"</div>
                                )}
                            </div>
                            <div className="element-details">
                                <div className="element-colors">
                                    {element.colors?.map((color, colorIndex) => (
                                        <span key={colorIndex} className="color-badge">
                                            {color}
                                        </span>
                                    ))}
                                </div>
                                <div className="element-quantity">{element.quantity} buc</div>
                                <div className="element-role">{element.role}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Instrucțiuni de îngrijire */}
                {recommendation.care_instructions && (
                    <div className="care-instructions">
                        <h4>
                            <span className="icon">👁️</span>
                            Instrucțiuni de îngrijire:
                        </h4>
                        <ul>
                            {recommendation.care_instructions.map((instruction, index) => (
                                <li key={index}>{instruction}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Vizualizare buchet */}
                {generatedBouquet.visual_generated && generatedBouquet.visual_path && (
                    <div className="bouquet-visual">
                        <BouquetVisualization imagePath={generatedBouquet.visual_path} />
                    </div>
                )}
            </div>
        );
    };

    const renderPopularCombinations = () => {
        if (popularCombinations.length === 0) return null;

        return (
            <div className="popular-combinations-card">
                <h3>Sugestii populare</h3>
                <div className="combinations-grid">
                    {popularCombinations.map((suggestion, index) => (
                        <div 
                            key={index} 
                            className="combination-card"
                            onClick={() => handleUseSuggestion(suggestion)}
                        >
                            <div className="combination-occasion">{suggestion.occasion}</div>
                            <div className="combination-message">"{suggestion.message}"</div>
                            <div className="combination-flowers">
                                {suggestion.flowers?.slice(0, 3).map((flower, flowerIndex) => (
                                    <span key={flowerIndex} className="flower-badge">
                                        {flower}
                                    </span>
                                ))}
                            </div>
                            {suggestion.description && (
                                <div className="combination-description">{suggestion.description}</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="ai-bouquet-generator">
            <div className="generator-header">
                <h1>AI Bouquet Generator</h1>
                <p>
                    Spune-ne ce simți și îți creăm buchetul perfect cu ajutorul inteligenței artificiale
                </p>
            </div>

            {renderAIStatus()}

            {/* Input principal */}
            <div className="input-card">
                <h3>Descrie mesajul tău</h3>
                <textarea
                    placeholder="Exemplu: Te iubesc din toată inima și vreau să fii soția mea!"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="message-input"
                />
                
                <div className="input-options">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={includeVisual}
                            onChange={(e) => setIncludeVisual(e.target.checked)}
                        />
                        Generează și vizualizarea buchetului
                    </label>
                </div>

                <div className="action-buttons">
                    <button 
                        onClick={handleAnalyzeText}
                        className="analyze-button"
                        disabled={isAnalyzing || !message.trim() || aiStatus?.ai_service_status !== 'healthy'}
                    >
                        {isAnalyzing ? (
                            <>⏳ Analizez...</>
                        ) : (
                            <>✨ Analizează Text</>
                        )}
                    </button>
                    
                    <button 
                        onClick={handleGenerateBouquet}
                        className="generate-button"
                        disabled={isLoading || !message.trim() || aiStatus?.ai_service_status !== 'healthy'}
                    >
                        {isLoading ? (
                            <>⏳ Generez...</>
                        ) : (
                            <>🪄 Generează Buchet</>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
            </div>

            {renderTextAnalysis()}
            {renderBouquetRecommendation()}
            {renderPopularCombinations()}
        </div>
    );
};

export default AIBouquetGenerator;
