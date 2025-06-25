import React from 'react';
import './BouquetVariations.css';

const BouquetVariations = ({ variations, onSelectVariation, onLockFlower, onUnlockFlower, lockedFlowers }) => {
    const isFlowerLocked = (flowerId) => {
        return lockedFlowers.some(lf => lf.flowerId === flowerId);
    };

    if (!variations || variations.length === 0) {
        return null;
    }

    return (
        <div className="bouquet-variations">
            <h3>🎨 Variații de buchet</h3>
            <p>Iată {variations.length} variații diferite ale buchetului tău:</p>
            
            <div className="variations-grid">
                {variations.map((variation, index) => (
                    <div key={index} className="variation-card">
                        <div className="variation-header">
                            <h4>{variation.bouquetName}</h4>
                            <button 
                                onClick={() => onSelectVariation(variation)}
                                className="select-variation-btn"
                            >
                                Alege această variantă
                            </button>
                        </div>
                        
                        <p className="variation-interpretation">
                            {variation.messageInterpretation}
                        </p>
                        
                        <div className="variation-flowers">
                            {variation.flowers?.map((flower, flowerIndex) => (
                                <div key={flowerIndex} className="variation-flower">
                                    <div className="mini-flower-card">
                                        {flower.imageUrl && (
                                            <img src={flower.imageUrl} alt={flower.flowerName} />
                                        )}
                                        <div className="flower-name">{flower.flowerName}</div>
                                        
                                        <div className="flower-actions">
                                            {isFlowerLocked(flower.flowerId) ? (
                                                <button 
                                                    className="mini-unlock-btn"
                                                    onClick={() => onUnlockFlower(flower.flowerId, flower.flowerName)}
                                                    title="Deblochează"
                                                >
                                                    🔓
                                                </button>
                                            ) : (
                                                <button 
                                                    className="mini-lock-btn"
                                                    onClick={() => onLockFlower(flower.flowerId, flower.flowerName)}
                                                    title="Blochează"
                                                >
                                                    🔒
                                                </button>
                                            )}
                                        </div>
                                        
                                        {isFlowerLocked(flower.flowerId) && (
                                            <div className="locked-mini-indicator">🔒</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="variation-stats">
                            <span className="flower-count">
                                {variation.flowers?.length || 0} flori
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BouquetVariations;
