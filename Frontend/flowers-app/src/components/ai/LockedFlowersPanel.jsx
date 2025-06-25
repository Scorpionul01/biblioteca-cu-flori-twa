import React from 'react';
import './LockedFlowersPanel.css';

const LockedFlowersPanel = ({ lockedFlowers, onUnlockFlower, onClearAll, onRefresh }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ro-RO', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="locked-flowers-panel">
            <div className="panel-header">
                <h3>🔒 Flori blocate</h3>
                <div className="panel-actions">
                    <button onClick={onRefresh} className="refresh-btn" title="Reîmprospătează">
                        🔄
                    </button>
                    {lockedFlowers.length > 0 && (
                        <button onClick={onClearAll} className="clear-all-btn" title="Deblochează toate">
                            🗑️
                        </button>
                    )}
                </div>
            </div>

            <div className="locked-flowers-content">
                {lockedFlowers.length === 0 ? (
                    <div className="no-locked-flowers">
                        <p>🌸 Nu ai flori blocate</p>
                        <small>Blochează flori din buchetele generate pentru a le păstra în buchetele viitoare</small>
                    </div>
                ) : (
                    <div className="locked-flowers-list">
                        {lockedFlowers.map(flower => (
                            <div key={flower.id} className="locked-flower-item">
                                <div className="flower-thumbnail">
                                    {flower.flowerImage ? (
                                        <img src={flower.flowerImage} alt={flower.flowerName} />
                                    ) : (
                                        <div className="no-image">🌺</div>
                                    )}
                                </div>
                                
                                <div className="flower-details">
                                    <h4>{flower.flowerName}</h4>
                                    {flower.preferredColor && (
                                        <p className="preferred-color">
                                            Culoare: {flower.preferredColor}
                                        </p>
                                    )}
                                    {flower.preferredQuantity && (
                                        <p className="preferred-quantity">
                                            Cantitate: {flower.preferredQuantity}
                                        </p>
                                    )}
                                    <small className="locked-date">
                                        Blocată: {formatDate(flower.lockedAt)}
                                    </small>
                                </div>
                                
                                <button 
                                    onClick={() => onUnlockFlower(flower.flowerId, flower.flowerName)}
                                    className="unlock-flower-btn"
                                    title="Deblochează floarea"
                                >
                                    🔓
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="panel-info">
                <small>
                    💡 Florile blocate vor fi incluse automat în toate buchetele viitoare
                </small>
            </div>
        </div>
    );
};

export default LockedFlowersPanel;
