import React from 'react';
import './ColorFilter.css';

const ColorFilter = ({ availableColors, selectedColors, onColorChange }) => {
    const handleColorToggle = (colorName) => {
        const updatedColors = selectedColors.includes(colorName)
            ? selectedColors.filter(c => c !== colorName)
            : [...selectedColors, colorName];
        
        onColorChange(updatedColors);
    };

    const clearColors = () => {
        onColorChange([]);
    };

    const getColorStyle = (colorName) => {
        const colorMap = {
            'roșu': '#FF4444',
            'red': '#FF4444',
            'roz': '#FF69B4',
            'pink': '#FF69B4',
            'alb': '#FFFFFF',
            'white': '#FFFFFF',
            'galben': '#FFD700',
            'yellow': '#FFD700',
            'albastru': '#4169E1',
            'blue': '#4169E1',
            'violet': '#8A2BE2',
            'purple': '#8A2BE2',
            'purpuriu': '#8A2BE2',
            'mov': '#8A2BE2',
            'portocaliu': '#FF8C00',
            'orange': '#FF8C00',
            'verde': '#32CD32',
            'green': '#32CD32'
        };

        return {
            backgroundColor: colorMap[colorName.toLowerCase()] || '#666',
            border: colorName.toLowerCase().includes('alb') ? '2px solid #ccc' : 'none'
        };
    };

    return (
        <div className="color-filter">
            <div className="filter-header">
                <h4>🎨 Filtru culori</h4>
                {selectedColors.length > 0 && (
                    <button onClick={clearColors} className="clear-colors-btn">
                        Șterge toate
                    </button>
                )}
            </div>
            
            <div className="color-options">
                {availableColors.map(color => (
                    <button
                        key={color.id}
                        className={`color-option ${selectedColors.includes(color.name) ? 'selected' : ''}`}
                        onClick={() => handleColorToggle(color.name)}
                        style={getColorStyle(color.name)}
                        title={`${color.name} (${color.flowerCount} flori)`}
                    >
                        <span className="color-name">{color.name}</span>
                        <span className="flower-count">{color.flowerCount}</span>
                    </button>
                ))}
            </div>
            
            {selectedColors.length > 0 && (
                <div className="selected-colors">
                    <span>Culori selectate: </span>
                    {selectedColors.map(color => (
                        <span key={color} className="selected-color-tag">
                            {color}
                            <button 
                                onClick={() => handleColorToggle(color)}
                                className="remove-color"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ColorFilter;
