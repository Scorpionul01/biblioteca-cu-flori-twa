import React, { useState, useEffect } from 'react';
import enhancedBouquetService from '../../services/enhancedBouquetService';
import colorService from '../../services/colorService';
import BouquetVisualization from './BouquetVisualization';
import ColorFilter from './ColorFilter';
import LockedFlowersPanel from './LockedFlowersPanel';
import BouquetVariations from './BouquetVariations';
import './EnhancedAIBouquetGenerator.css';

const EnhancedAIBouquetGenerator = () => {
    const [message, setMessage] = useState('');
    const [generatedBouquet, setGeneratedBouquet] = useState(null);
    const [bouquetVariations, setBouquetVariations] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);
    const [availableColors, setAvailableColors] = useState([]);
    const [lockedFlowers, setLockedFlowers] = useState([]);
    const [diversityLevel, setDiversityLevel] = useState(5);
    const [respectLocked, setRespectLocked] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showVariations, setShowVariations] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            await Promise.all([
                loadAvailableColors(),
                loadLockedFlowers()
            ]);
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    };

    const loadAvailableColors = async () => {
        try {
            const colors = await enhancedBouquetService.getAvailableColors();
            setAvailableColors(colors || []);
        } catch (error) {
            console.error('Error loading colors:', error);
        }
    };

    const loadLockedFlowers = async () => {
        try {
            const flowers = await enhancedBouquetService.getLockedFlowers();
            setLockedFlowers(flowers || []);
        } catch (error) {
            console.error('Error loading locked flowers:', error);
        }
    };

    const handleGenerateEnhancedBouquet = async () => {
        if (!message.trim()) {
            setError('Te rog introdu un mesaj pentru buchet!');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const bouquet = await enhancedBouquetService.generateEnhancedBouquet(
                message,
                selectedColors,
                respectLocked,
                diversityLevel
            );

            setGeneratedBouquet(bouquet);
            setBouquetVariations([]);
            setShowVariations(false);
            
            showSuccessNotification('Buchet generat cu succes!');
        } catch (error) {
            setError('Eroare la generarea buchetului: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateVariations = async () => {
        if (!message.trim()) {
            setError('Te rog introdu un mesaj pentru variații!');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const variations = await enhancedBouquetService.generateMultipleVariations(message, 3);

            setBouquetVariations(variations || []);
            setShowVariations(true);
            
            showSuccessNotification(`${variations?.length || 0} variații generate!`);
        } catch (error) {
            setError('Eroare la generarea variațiilor: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateAlternative = async () => {
        if (!generatedBouquet || !message.trim()) {
            setError('Te rog generează mai întâi un buchet!');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const excludeIds = generatedBouquet.flowers?.map(f => f.flowerId) || [];
            
            const bouquet = await enhancedBouquetService.generateAlternativeBouquet(
                message,
                excludeIds.slice(0, 2)
            );

            setGeneratedBouquet(bouquet);
            showSuccessNotification('Alternativă generată cu succes!');
        } catch (error) {
            setError('Eroare la generarea alternativei: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLockFlower = async (flowerId, flowerName) => {
        try {
            await enhancedBouquetService.lockFlower(flowerId);

            await loadLockedFlowers();
            setError('');
            showSuccessNotification(`${flowerName} a fost blocată!`);
        } catch (error) {
            setError('Eroare la blocarea florii: ' + error.message);
        }
    };

    const handleUnlockFlower = async (flowerId, flowerName) => {
        try {
            await enhancedBouquetService.unlockFlower(flowerId);
            
            await loadLockedFlowers();
            setError('');
            showSuccessNotification(`${flowerName} a fost deblocată!`);
        } catch (error) {
            setError('Eroare la deblocarea florii: ' + error.message);
        }
    };

    const handleClearAllLocked = async () => {
        if (window.confirm('Ești sigur că vrei să deblochezi toate florile?')) {
            try {
                await enhancedBouquetService.clearAllLockedFlowers();
                await loadLockedFlowers();
                
                showSuccessNotification('Toate florile au fost deblocate!');
            } catch (error) {
                setError('Eroare la deblocarea florilor: ' + error.message);
            }
        }
    };

    const showSuccessNotification = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const renderBouquetRecommendation = () => {
        if (!generatedBouquet) return null;

        const isFlowerLocked = (flowerId) => {
            return lockedFlowers.some(lf => lf.flowerId === flowerId);
        };

        return (
            <div className="enhanced-bouquet-recommendation">
                <div className="bouquet-header">
                    <h3>🎨 {generatedBouquet.bouquetName}</h3>
                    <p className="interpretation">{generatedBouquet.messageInterpretation}</p>
                </div>

                <div className="bouquet-flowers">
                    {generatedBouquet.flowers?.map((flower, index) => (
                        <div key={index} className="enhanced-flower-card">
                            <div className="flower-image">
                                {flower.imageUrl && (
                                    <img src={flower.imageUrl} alt={flower.flowerName} />
                                )}
                                <div className="flower-overlay">
                                    {isFlowerLocked(flower.flowerId) ? (
                                        <button 
                                            className="unlock-btn"
                                            onClick={() => handleUnlockFlower(flower.flowerId, flower.flowerName)}
                                            title="Deblochează floarea"
                                        >
                                            🔓
                                        </button>
                                    ) : (
                                        <button 
                                            className="lock-btn"
                                            onClick={() => handleLockFlower(flower.flowerId, flower.flowerName)}
                                            title="Blochează floarea pentru buchetele viitoare"
                                        >
                                            🔒
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flower-info">
                                <h4>{flower.flowerName}</h4>
                                <p className="flower-reason">{flower.reason}</p>
                                
                                {isFlowerLocked(flower.flowerId) && (
                                    <div className="locked-indicator">
                                        <span className="locked-badge">🔒 Blocată</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bouquet-actions">
                    <button 
                        onClick={handleGenerateAlternative}
                        className="alternative-btn"
                        disabled={isLoading}
                    >
                        🔄 Generează alternativă
                    </button>
                    
                    <button 
                        onClick={handleGenerateVariations}
                        className="variations-btn"
                        disabled={isLoading}
                    >
                        🎨 Vezi mai multe variații
                    </button>
                </div>
            </div>
        );
    };

    const renderAdvancedControls = () => (
        <div className="advanced-controls">
            <h4>🎛️ Controale avansate</h4>
            
            <div className="control-group">
                <label>
                    <input
                        type="checkbox"
                        checked={respectLocked}
                        onChange={(e) => setRespectLocked(e.target.checked)}
                    />
                    Respectă florile blocate
                </label>
            </div>

            <div className="control-group">
                <label>
                    Nivel de diversitate: {diversityLevel}/10
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={diversityLevel}
                        onChange={(e) => setDiversityLevel(parseInt(e.target.value))}
                        className="diversity-slider"
                    />
                </label>
                <small>
                    {diversityLevel <= 3 && "Flori similare cu generările anterioare"}
                    {diversityLevel > 3 && diversityLevel <= 7 && "Diversitate moderată"}
                    {diversityLevel > 7 && "Diversitate maximă - flori complet diferite"}
                </small>
            </div>
        </div>
    );

    return (
        <div className="enhanced-ai-bouquet-generator">
            <div className="generator-header">
                <h1>🤖 AI Bouquet Generator - Versiunea îmbunătățită</h1>
                <p>
                    Generează buchete personalizate cu diversificare inteligentă și funcția de lock pentru flori
                </p>
            </div>

            <div className="generator-layout">
                <div className="main-panel">
                    <div className="input-section">
                        <h3>💬 Mesajul tău</h3>
                        <textarea
                            placeholder="Exemplu: Te iubesc din toată inima și vreau să fii soția mea!"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="enhanced-message-input"
                            rows={4}
                        />
                        
                        <ColorFilter
                            availableColors={availableColors}
                            selectedColors={selectedColors}
                            onColorChange={setSelectedColors}
                        />
                        
                        {renderAdvancedControls()}

                        <div className="main-action-buttons">
                            <button 
                                onClick={handleGenerateEnhancedBouquet}
                                className="generate-enhanced-btn"
                                disabled={isLoading || !message.trim()}
                            >
                                {isLoading ? (
                                    <>⏳ Generez buchet...</>
                                ) : (
                                    <>🎨 Generează buchet îmbunătățit</>
                                )}
                            </button>
                        </div>

                        {error && (
                            <div className="error-message">
                                ❌ {error}
                            </div>
                        )}
                        
                        {successMessage && (
                            <div className="success-message">
                                ✅ {successMessage}
                            </div>
                        )}
                    </div>

                    {renderBouquetRecommendation()}
                    
                    {showVariations && (
                        <BouquetVariations 
                            variations={bouquetVariations}
                            onSelectVariation={setGeneratedBouquet}
                            onLockFlower={handleLockFlower}
                            onUnlockFlower={handleUnlockFlower}
                            lockedFlowers={lockedFlowers}
                        />
                    )}
                </div>

                <div className="side-panel">
                    <LockedFlowersPanel
                        lockedFlowers={lockedFlowers}
                        onUnlockFlower={handleUnlockFlower}
                        onClearAll={handleClearAllLocked}
                        onRefresh={loadLockedFlowers}
                    />
                </div>
            </div>
        </div>
    );
};

export default EnhancedAIBouquetGenerator;
