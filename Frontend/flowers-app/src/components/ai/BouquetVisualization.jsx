import React, { useState, useEffect } from 'react';
import './BouquetVisualization.css';

const BouquetVisualization = ({ imagePath, bouquetData }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleImageLoad = () => {
        setImageLoaded(true);
        setImageError(false);
    };

    const handleImageError = () => {
        setImageError(true);
        setImageLoaded(false);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const renderPlaceholder = () => {
        if (!bouquetData?.elements) {
            return (
                <div className="bouquet-placeholder">
                    <div className="placeholder-icon">🌸</div>
                    <p>Vizualizarea buchetului va fi generată după predicția AI</p>
                </div>
            );
        }

        // Creează o reprezentare simplificată
        return (
            <div className="bouquet-simple-view">
                <h4>Reprezentare simplificată:</h4>
                <div className="simple-bouquet">
                    {bouquetData.elements.map((element, index) => (
                        <div key={index} className={`simple-element ${element.role}`}>
                            <div className="element-circle" style={{
                                backgroundColor: getColorForElement(element),
                                transform: `translate(${getRandomPosition()}px, ${getRandomPosition()}px)`
                            }}>
                                <span className="element-emoji">
                                    {getEmojiForElement(element)}
                                </span>
                            </div>
                            <div className="element-label">
                                {element.name}
                                <br />
                                <small>{element.quantity} buc</small>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const getColorForElement = (element) => {
        if (element.type === 'foliage') return '#4ade80'; // green
        
        const colorMap = {
            'red': '#ef4444',
            'pink': '#ec4899',
            'white': '#f8fafc',
            'yellow': '#eab308',
            'orange': '#f97316',
            'purple': '#a855f7',
            'blue': '#3b82f6',
            'green': '#22c55e'
        };

        const firstColor = element.colors?.[0];
        return colorMap[firstColor] || '#9ca3af';
    };

    const getEmojiForElement = (element) => {
        if (element.type === 'foliage') return '🌿';
        if (element.type === 'texture') return '✨';
        
        // Map pentru flori
        const flowerEmojis = {
            'Rose': '🌹',
            'Tulip': '🌷',
            'Sunflower': '🌻',
            'Lily': '🌺',
            'Orchid': '🌸',
            'Carnation': '🌼',
            'Daisy': '🌼',
            'Baby\'s Breath': '💮'
        };

        return flowerEmojis[element.name] || '🌸';
    };

    const getRandomPosition = () => {
        return Math.random() * 20 - 10; // -10 to 10
    };

    if (!imagePath && !bouquetData) {
        return renderPlaceholder();
    }

    return (
        <div className="bouquet-visualization">
            <div className="visualization-header">
                <h4>🎨 Vizualizarea buchetului</h4>
                {imagePath && (
                    <button 
                        className="fullscreen-button"
                        onClick={toggleFullscreen}
                        title="Vezi în mărime completă"
                    >
                        {isFullscreen ? '🗗' : '🔍'}
                    </button>
                )}
            </div>

            {imagePath ? (
                <div className={`image-container ${isFullscreen ? 'fullscreen' : ''}`}>
                    {isFullscreen && (
                        <div className="fullscreen-overlay" onClick={toggleFullscreen}>
                            <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
                                <button className="close-fullscreen" onClick={toggleFullscreen}>
                                    ✕
                                </button>
                                <img
                                    src={imagePath}
                                    alt="Buchet generat de AI"
                                    className="fullscreen-image"
                                />
                            </div>
                        </div>
                    )}
                    
                    <div className="image-wrapper">
                        {!imageLoaded && !imageError && (
                            <div className="image-loading">
                                <div className="loading-spinner"></div>
                                <p>Se încarcă imaginea...</p>
                            </div>
                        )}
                        
                        {imageError && (
                            <div className="image-error">
                                <div className="error-icon">❌</div>
                                <p>Nu s-a putut încărca imaginea</p>
                                <small>Path: {imagePath}</small>
                                {renderPlaceholder()}
                            </div>
                        )}
                        
                        <img
                            src={imagePath}
                            alt="Buchet generat de AI"
                            className={`bouquet-image ${imageLoaded ? 'loaded' : 'hidden'}`}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                        />
                        
                        {imageLoaded && (
                            <div className="image-overlay">
                                <div className="image-info">
                                    <span className="ai-badge">✨ Generat de AI</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                renderPlaceholder()
            )}

            <div className="visualization-actions">
                <button className="action-button" onClick={() => window.print()}>
                    🖨️ Printează
                </button>
                <button 
                    className="action-button"
                    onClick={() => {
                        // Funcționalitate de salvare
                        if (imagePath) {
                            const link = document.createElement('a');
                            link.href = imagePath;
                            link.download = 'buchet-ai-generat.png';
                            link.click();
                        }
                    }}
                >
                    💾 Salvează
                </button>
                <button className="action-button">
                    📤 Partajează
                </button>
            </div>
        </div>
    );
};

export default BouquetVisualization;
