import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EnhancedBouquetGenerator.css';

/**
 * 🚀 ENHANCED BOUQUET GENERATOR COMPONENT
 * Componentă React îmbunătățită cu suport pentru slider și toate filtrele
 */
const EnhancedBouquetGenerator = () => {
    // 📊 State management
    const [message, setMessage] = useState('');
    const [flowerCount, setFlowerCount] = useState(4); // Slider pentru 3-5 tipuri de flori
    const [colorFilters, setColorFilters] = useState([]);
    const [lockedFlowers, setLockedFlowers] = useState([]);
    const [language, setLanguage] = useState('ro');
    
    // 🎯 Results state
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // 📋 Available options
    const [availableFlowers, setAvailableFlowers] = useState([]);
    const [availableCategories, setAvailableCategories] = useState([]);
    const [modelStatus, setModelStatus] = useState(null);

    // 🎨 Available colors for filtering
    const availableColors = [
        'roșu', 'roz', 'alb', 'galben', 'portocaliu', 'mov', 'albastru', 
        'verde', 'crem', 'burgundy', 'peach', 'lavender'
    ];

    // 📱 API endpoints
    const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5002/api'; // ASP.NET Core
    const AI_API_BASE = 'http://localhost:5001/api'; // Python Flask

    // 🚀 Initialize component
    useEffect(() => {
        initializeComponent();
    }, []);

    const initializeComponent = async () => {
        try {
            console.log('🚀 Initializing Enhanced Bouquet Generator...');
            
            // Try to check model status (optional - Python API)
            try {
                const statusResponse = await axios.get(`${AI_API_BASE}/model-status`);
                setModelStatus(statusResponse.data);
                console.log('✅ Python AI API connected');
            } catch (aiError) {
                console.log('⚠️ Python AI API not available, using fallback');
                setModelStatus({ loaded: false, slider_support: false });
            }

            // Try to load available flowers (optional - Python API)
            try {
                const flowersResponse = await axios.get(`${AI_API_BASE}/flowers`);
                setAvailableFlowers(flowersResponse.data.flowers || []);
                console.log('✅ Flowers loaded from Python API');
            } catch (flowersError) {
                console.log('⚠️ Using fallback flowers');
                // Fallback flowers
                setAvailableFlowers([
                    { id: '1', name: 'Trandafiri roșii' },
                    { id: '2', name: 'Lalele albe' },
                    { id: '3', name: 'Garoafe roz' },
                    { id: '4', name: 'Crizanteme galbene' },
                    { id: '5', name: 'Irisi mov' },
                    { id: '6', name: 'Floarea-soarelui' },
                    { id: '7', name: 'Margarete albe' },
                    { id: '8', name: 'Frezii roșii' },
                    { id: '9', name: 'Bujori roz' },
                    { id: '10', name: 'Lisianthus alb' },
                    { id: '11', name: 'Gerbera portocalii' },
                    { id: '12', name: 'Alstroemeria mov' }
                ]);
            }

            // Try to load available categories (optional - Python API)
            try {
                const categoriesResponse = await axios.get(`${AI_API_BASE}/categories`);
                setAvailableCategories(categoriesResponse.data.categories || []);
                console.log('✅ Categories loaded from Python API');
            } catch (categoriesError) {
                console.log('⚠️ Using fallback categories');
                // Fallback categories
                setAvailableCategories([
                    'romantic', 'gratitude', 'celebration', 'apology', 
                    'sympathy', 'birthday', 'mothersday', 'friendship'
                ]);
            }

            console.log('✅ Enhanced Bouquet Generator initialized successfully');
        } catch (error) {
            console.error('❌ Initialization error:', error);
            setError('Sistem inițializat cu funcționalități limitate');
            
            // Set fallback data
            setModelStatus({ loaded: false, slider_support: false });
            setAvailableFlowers([
                { id: '1', name: 'Trandafiri roșii' },
                { id: '2', name: 'Lalele albe' },
                { id: '3', name: 'Garoafe roz' }
            ]);
            setAvailableCategories(['romantic', 'celebration', 'friendship']);
        }
    };

    // 🎛️ Handle slider change
    const handleSliderChange = (event) => {
        const value = parseInt(event.target.value);
        setFlowerCount(value);
        console.log(`🎛️ Slider changed to: ${value} tipuri de flori`);
    };

    // 🎨 Handle color filter toggle
    const toggleColorFilter = (color) => {
        setColorFilters(prev => {
            if (prev.includes(color)) {
                return prev.filter(c => c !== color);
            } else {
                return [...prev, color];
            }
        });
    };

    // 🔒 Handle flower locking
    const toggleFlowerLock = (flowerId) => {
        setLockedFlowers(prev => {
            if (prev.includes(flowerId)) {
                return prev.filter(f => f !== flowerId);
            } else {
                return [...prev, flowerId];
            }
        });
    };

    // 🚀 Generate bouquet with enhanced features
    const generateBouquet = async () => {
        if (!message.trim()) {
            setError('Te rog introdu un mesaj pentru buchet');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            console.log('🚀 Generating enhanced bouquet:');
            console.log('📝 Message:', message);
            console.log('🎛️ Flower count:', flowerCount);
            console.log('🎨 Color filters:', colorFilters);
            console.log('🔒 Locked flowers:', lockedFlowers);

            const requestData = {
                message: message,
                flowerCount: flowerCount,
                colorFilters: colorFilters,
                lockedFlowers: lockedFlowers,
                language: language
            };

            // Call enhanced ASP.NET Core endpoint
            const response = await axios.post(`${API_BASE}/EnhancedBouquet/generate`, requestData);
            
            console.log('🔍 Raw response:', response.data);
            
            // Handle different response structures
            let bouquetData = response.data;
            
            // Check if response has nested data structure (Python API format)
            if (response.data.data && response.data.success) {
                bouquetData = {
                    success: response.data.success,
                    message: response.data.data.input_message || response.data.message,
                    detectedCategory: response.data.data.category || 'unknown',
                    confidence: response.data.data.category_confidence || 0.5,
                    flowers: (response.data.data.bouquet_recommendation?.elements || []).map(elem => ({
                        flowerId: elem.flower_id?.toString() || 'unknown',
                        name: elem.name || 'Floare necunoscută',
                        count: elem.quantity || 1,
                        role: elem.role || 'unknown',
                        reason: elem.meaning || 'Semnificație frumoasă',
                        colors: elem.colors || [],
                        meaning: elem.meaning || 'Simbolizează frumusețea',
                        imageUrl: elem.images?.[0] || '/images/default-flower.jpg'
                    })),
                    explanation: {
                        intro: response.data.data.bouquet_recommendation?.personalized_message || 'Buchet personalizat pentru tine',
                        flowerExplanations: [],
                        finalMessage: 'Un buchet frumos pentru orice ocazie!',
                        confidenceNote: `Detectare cu ${(response.data.data.category_confidence * 100).toFixed(1)}% încredere`
                    },
                    bouquetInfo: {
                        totalFlowers: (response.data.data.bouquet_recommendation?.elements || []).reduce((sum, elem) => sum + (elem.quantity || 1), 0),
                        flowerTypes: (response.data.data.bouquet_recommendation?.elements || []).length,
                        respectsSlider: (response.data.data.bouquet_recommendation?.elements || []).length === flowerCount,
                        lockedFlowersCount: lockedFlowers.length,
                        colorPalette: [...new Set((response.data.data.bouquet_recommendation?.elements || []).flatMap(elem => elem.colors || []))],
                        mood: response.data.data.category || 'frumos'
                    }
                };
                console.log('📊 Processed Python API response');
            }
            // Handle direct structure (fallback format)
            else if (response.data.success) {
                bouquetData = response.data;
                console.log('📊 Using direct response structure');
            }
            // Handle error case
            else {
                setError(response.data.errorMessage || response.data.message || 'Eroare la generarea buchetului');
                return;
            }
            
            setResult(bouquetData);
            console.log('✅ Enhanced bouquet generated successfully');
            console.log('🎯 Respects slider:', bouquetData.bouquetInfo?.respectsSlider);
            console.log('🌸 Flower types:', bouquetData.bouquetInfo?.flowerTypes);
            console.log('🎛️ Expected count:', flowerCount);
        } catch (error) {
            console.error('❌ Generation error:', error);
            console.error('❌ Error response:', error.response?.data);
            setError(error.response?.data?.message || error.message || 'Eroare la comunicarea cu serverul');
        } finally {
            setLoading(false);
        }
    };

    // 🔄 Generate alternative bouquet
    const generateAlternative = async () => {
        if (!message.trim()) {
            setError('Te rog introdu un mesaj pentru buchet');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log('🔄 Generating alternative bouquet...');
            
            const requestData = {
                message: message,
                flowerCount: flowerCount,
                colorFilters: colorFilters,
                lockedFlowers: lockedFlowers,
                language: language
            };

            const response = await axios.post(`${API_BASE}/EnhancedBouquet/generate-alternative`, requestData);
            
            console.log('🔍 Alternative response:', response.data);
            
            // Process alternative response with same logic
            let bouquetData = response.data;
            
            if (response.data.data && response.data.success) {
                bouquetData = {
                    success: response.data.success,
                    message: response.data.data.input_message || response.data.message,
                    detectedCategory: response.data.data.category || 'alternativa',
                    confidence: response.data.data.category_confidence || 0.5,
                    flowers: (response.data.data.bouquet_recommendation?.elements || []).map(elem => ({
                        flowerId: elem.flower_id?.toString() || 'unknown',
                        name: elem.name || 'Floare necunoscută',
                        count: elem.quantity || 1,
                        role: elem.role || 'unknown', 
                        reason: elem.meaning || 'Semnificație frumoasă',
                        colors: elem.colors || [],
                        meaning: elem.meaning || 'Simbolizează frumusețea',
                        imageUrl: elem.images?.[0] || '/images/default-flower.jpg'
                    })),
                    explanation: {
                        intro: response.data.data.bouquet_recommendation?.personalized_message || 'Alternativă frumoasă pentru buchetul tău',
                        flowerExplanations: [],
                        finalMessage: 'O alternativă elegantă pentru mesajul tău!',
                        confidenceNote: `Alternativă generată cu ${(response.data.data.category_confidence * 100).toFixed(1)}% încredere`
                    },
                    bouquetInfo: {
                        totalFlowers: (response.data.data.bouquet_recommendation?.elements || []).reduce((sum, elem) => sum + (elem.quantity || 1), 0),
                        flowerTypes: (response.data.data.bouquet_recommendation?.elements || []).length,
                        respectsSlider: (response.data.data.bouquet_recommendation?.elements || []).length === flowerCount,
                        lockedFlowersCount: lockedFlowers.length,
                        colorPalette: [...new Set((response.data.data.bouquet_recommendation?.elements || []).flatMap(elem => elem.colors || []))],
                        mood: 'alternativ'
                    }
                };
            } else if (response.data.success) {
                bouquetData = response.data;
            } else {
                setError(response.data.errorMessage || 'Eroare la generarea alternativei');
                return;
            }
            
            setResult(bouquetData);
            console.log('✅ Alternative bouquet generated successfully');
            console.log('🎯 Alternative respects slider:', bouquetData.bouquetInfo?.respectsSlider);
            
        } catch (error) {
            console.error('❌ Alternative generation error:', error);
            setError(error.response?.data?.message || 'Eroare la generarea alternativei');
        } finally {
            setLoading(false);
        }
    };

    // 🧪 Test slider functionality
    const testSlider = async () => {
        try {
            const response = await axios.post(`${API_BASE}/EnhancedBouquet/test-slider`, {
                message: message || 'Te iubesc și vreau să te logodesc'
            });
            console.log('🧪 Slider test results:', response.data);
            alert('Verifică consola pentru rezultatele testului slider');
        } catch (error) {
            console.error('❌ Slider test error:', error);
        }
    };

    return (
        <div className="enhanced-bouquet-generator">
            {/* 🎯 Header */}
            <div className="header">
                <h2>🚀 Enhanced Bouquet Generator</h2>
                <div className="model-status">
                    {modelStatus && (
                        <span className={`status ${modelStatus.loaded ? 'online' : 'offline'}`}>
                            AI Model: {modelStatus.loaded ? '🟢 Online' : '🔴 Offline'}
                            {modelStatus.slider_support && ' 🎛️ Slider Enabled'}
                        </span>
                    )}
                </div>
            </div>

            {/* 📝 Message Input */}
            <div className="input-section">
                <label htmlFor="message">Mesajul pentru buchet:</label>
                <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Scrie mesajul tău aici... (ex: 'Te iubesc și vreau să te logodesc')"
                    rows={3}
                    className="message-input"
                />
            </div>

            {/* 🎛️ Flower Count Slider */}
            <div className="slider-section">
                <label htmlFor="flowerSlider">
                    Numărul de tipuri de flori: <strong>{flowerCount}</strong>
                </label>
                <div className="slider-container">
                    <span>3</span>
                    <input
                        type="range"
                        id="flowerSlider"
                        min="3"
                        max="5"
                        value={flowerCount}
                        onChange={handleSliderChange}
                        className="flower-slider"
                    />
                    <span>5</span>
                </div>
                <div className="slider-info">
                    Alege între 3-5 tipuri diferite de flori pentru buchetul tău
                </div>
            </div>

            {/* 🎨 Color Filters */}
            <div className="filters-section">
                <h3>🎨 Filtrare după culoare (opțional)</h3>
                <div className="color-filters">
                    {availableColors.map(color => (
                        <button
                            key={color}
                            className={`color-filter ${colorFilters.includes(color) ? 'active' : ''}`}
                            onClick={() => toggleColorFilter(color)}
                            style={{
                                backgroundColor: getColorHex(color),
                                color: isLightColor(color) ? '#333' : '#fff'
                            }}
                        >
                            {color}
                        </button>
                    ))}
                </div>
                {colorFilters.length > 0 && (
                    <div className="selected-filters">
                        Culori selectate: {colorFilters.join(', ')}
                    </div>
                )}
            </div>

            {/* 🔒 Flower Locking */}
            <div className="locking-section">
                <h3>🔒 Fixează flori specifice (opțional)</h3>
                <div className="flower-grid">
                    {availableFlowers.slice(0, 12).map(flower => (
                        <div
                            key={flower.id}
                            className={`flower-card ${lockedFlowers.includes(flower.id) ? 'locked' : ''}`}
                            onClick={() => toggleFlowerLock(flower.id)}
                        >
                            <div className="flower-icon">🌸</div>
                            <div className="flower-name">{flower.name}</div>
                            {lockedFlowers.includes(flower.id) && (
                                <div className="lock-icon">🔒</div>
                            )}
                        </div>
                    ))}
                </div>
                {lockedFlowers.length > 0 && (
                    <div className="locked-flowers-info">
                        Flori fixate: {lockedFlowers.length} / {flowerCount}
                    </div>
                )}
            </div>

            {/* ⚙️ Settings */}
            <div className="settings-section">
                <label htmlFor="language">Limba explicațiilor:</label>
                <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                >
                    <option value="ro">Română</option>
                    <option value="en">English</option>
                </select>
            </div>

            {/* 🚀 Action Buttons */}
            <div className="action-buttons">
                <button
                    onClick={generateBouquet}
                    disabled={loading || !message.trim()}
                    className="generate-button primary"
                >
                    {loading ? '🔄 Generez...' : '🚀 Generează Buchet Enhanced'}
                </button>
                
                <button
                    onClick={generateAlternative}
                    disabled={loading || !message.trim()}
                    className="generate-button alternative"
                >
                    {loading ? '🔄 Generez alternativă...' : '🔄 Generează Alternativă'}
                </button>
                
                <button
                    onClick={testSlider}
                    className="test-button secondary"
                >
                    🧪 Test Slider
                </button>
            </div>

            {/* ❌ Error Display */}
            {error && (
                <div className="error-message">
                    <strong>❌ Eroare:</strong> {error}
                </div>
            )}

            {/* 🎯 Results Display */}
            {result && (
                <div className="results-section">
                    <h3>🎯 Buchetul tău generat</h3>
                    
                    {/* 📊 Metadata */}
                    <div className="result-metadata">
                        <div className="metadata-row">
                            <span>🎯 Categorie detectată:</span>
                            <strong>{result.detectedCategory}</strong>
                            <span className="confidence">({(result.confidence * 100).toFixed(1)}%)</span>
                        </div>
                        <div className="metadata-row">
                            <span>🌸 Flori totale:</span>
                            <strong>{result.bouquetInfo?.totalFlowers} fire</strong>
                        </div>
                        <div className="metadata-row">
                            <span>🎛️ Tipuri de flori:</span>
                            <strong>{result.bouquetInfo?.flowerTypes}</strong>
                            {result.bouquetInfo?.respectsSlider && <span className="success">✅ Respectă slider</span>}
                        </div>
                        <div className="metadata-row">
                            <span>🔒 Flori fixate:</span>
                            <strong>{result.bouquetInfo?.lockedFlowersCount || 0}</strong>
                        </div>
                    </div>

                    {/* 🌸 Flower List */}
                    <div className="flowers-list">
                        <h4>🌸 Compoziția buchetului:</h4>
                        {result.flowers?.map((flower, index) => (
                            <div key={index} className={`flower-item ${flower.role}`}>
                                <div className="flower-header">
                                    <span className="role-icon">
                                        {flower.role === 'dominant' && '🌟'}
                                        {flower.role === 'accent' && '🎨'}
                                        {flower.role === 'support' && '💫'}
                                        {flower.role === 'greenery' && '🌿'}
                                        {flower.role === 'locked' && '🔒'}
                                    </span>
                                    <strong>{flower.count}x {flower.name}</strong>
                                    <span className="flower-role">({flower.role})</span>
                                </div>
                                <div className="flower-details">
                                    <div className="flower-reason">{flower.reason}</div>
                                    <div className="flower-meaning">Simbolizează: {flower.meaning}</div>
                                    {flower.colors?.length > 0 && (
                                        <div className="flower-colors">
                                            Culori: {flower.colors.join(', ')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 📝 Explanation */}
                    {result.explanation && (
                        <div className="explanation-section">
                            <h4>📝 Explicația buchetului:</h4>
                            <div className="explanation-intro">
                                {result.explanation.intro}
                            </div>
                            <ul className="explanation-list">
                                {result.explanation.flowerExplanations?.map((exp, index) => (
                                    <li key={index}>{exp}</li>
                                ))}
                            </ul>
                            <div className="explanation-conclusion">
                                {result.explanation.finalMessage}
                            </div>
                            <div className="confidence-note">
                                {result.explanation.confidenceNote}
                            </div>
                        </div>
                    )}

                    {/* 🎨 Color Palette */}
                    {result.bouquetInfo?.colorPalette?.length > 0 && (
                        <div className="color-palette">
                            <h4>🎨 Paleta de culori:</h4>
                            <div className="color-swatches">
                                {result.bouquetInfo.colorPalette.map((color, index) => (
                                    <div
                                        key={index}
                                        className="color-swatch"
                                        style={{ backgroundColor: getColorHex(color) }}
                                        title={color}
                                    />
                                ))}
                            </div>
                            <div className="mood-info">
                                Atmosferă: <strong>{result.bouquetInfo.mood}</strong>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// 🎨 Helper functions
const getColorHex = (colorName) => {
    const colorMap = {
        'roșu': '#e74c3c',
        'roz': '#e91e63',
        'alb': '#ffffff',
        'galben': '#f1c40f',
        'portocaliu': '#e67e22',
        'mov': '#9b59b6',
        'albastru': '#3498db',
        'verde': '#27ae60',
        'crem': '#f5f5dc',
        'burgundy': '#722f37',
        'peach': '#ffcba4',
        'lavender': '#b19cd9'
    };
    return colorMap[colorName] || '#cccccc';
};

const isLightColor = (colorName) => {
    const lightColors = ['alb', 'galben', 'crem', 'peach', 'lavender'];
    return lightColors.includes(colorName);
};

export default EnhancedBouquetGenerator;