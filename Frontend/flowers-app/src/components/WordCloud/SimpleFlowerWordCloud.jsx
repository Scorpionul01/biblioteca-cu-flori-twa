import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import flowerPopularityService from '../../services/flowerPopularityService';
import './WordCloud.css';

const SimpleFlowerWordCloud = () => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [positions, setPositions] = useState([]);
  const cloudRef = useRef(null);
  const navigate = useNavigate();
  
  // Add window resize listener to recalculate positions when window size changes
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchWordCloudData = async () => {
      try {
        setLoading(true);
        const data = await flowerPopularityService.getFlowerWordCloud(30);
        // Sortarea în ordine descrescătoare după popularitate (weight)
        const sortedWords = [...data.items].sort((a, b) => b.weight - a.weight);
        setWords(sortedWords);
        setError(null);
      } catch (err) {
        console.error('Eroare la încărcarea datelor pentru word cloud:', err);
        setError('Nu s-au putut încărca datele pentru word cloud');
      } finally {
        setLoading(false);
      }
    };

    fetchWordCloudData();
  }, []);

  // Recalculate positions when window size changes or words load
  useEffect(() => {
    if (words.length === 0 || !cloudRef.current) return;

    // Get container dimensions
    const containerWidth = cloudRef.current.offsetWidth;
    const containerHeight = cloudRef.current.offsetHeight;
    
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    
    // Function to generate font size based on popularity
    const getFontSize = (weight) => Math.min(weight * 4 + 14, 45); // Reduced maximum font size
    
    // Function to check if elements overlap
    const checkOverlap = (newPos, positions, fontSize, text) => {
      // Estimate text dimensions
      const newWidth = text.length * fontSize * 0.6;
      const newHeight = fontSize * 1.2;
      
      // Add padding for min distance between elements
      const padding = 15;
      
      const newRect = {
        left: newPos.left - (newWidth / 2 + padding), 
        top: newPos.top - (newHeight / 2 + padding / 2),
        right: newPos.left + (newWidth / 2 + padding),
        bottom: newPos.top + (newHeight / 2 + padding / 2)
      };
      
      // Check container boundaries - ensure text stays within bounds with margin
      const margin = 20; // Margin from container edges
      if (newRect.left < margin || 
          newRect.right > containerWidth - margin || 
          newRect.top < margin || 
          newRect.bottom > containerHeight - margin) {
        return true; // Out of bounds
      }
      
      // Check overlap with each existing element
      for (const pos of positions) {
        const existingRect = {
          left: pos.left - (pos.width / 2 + padding),
          top: pos.top - (pos.height / 2 + padding / 2),
          right: pos.left + (pos.width / 2 + padding),
          bottom: pos.top + (pos.height / 2 + padding / 2)
        };
        
        // Check if rectangles overlap
        if (!(newRect.right < existingRect.left || 
              newRect.left > existingRect.right || 
              newRect.bottom < existingRect.top || 
              newRect.top > existingRect.bottom)) {
          return true; // Overlap detected
        }
      }
      
      return false; // No overlap
    };
    
    // Calculate positions for all words
    const newPositions = [];
    
    words.forEach((word, index) => {
      const fontSize = getFontSize(word.weight);
      
      // First word (most popular) is always in center
      if (index === 0) {
        const width = word.name.length * fontSize * 0.6;
        const height = fontSize * 1.2;
        
        newPositions.push({
          left: centerX,
          top: centerY,
          rotation: 0,
          fontSize: fontSize,
          color: '#E83A3A', // Red for most popular element
          width: width,
          height: height,
          isCenter: true
        });
        return;
      }
      
      // Find position for other words
      let found = false;
      let attempts = 0;
      const maxAttempts = 2000; // Increased max attempts
      
      // Initial distance from center varies with weight
      // More popular items will be closer to center
      let radiusStart = 120 - word.weight * 8;
      if (radiusStart < 70) radiusStart = 70; // Min radius to avoid overlap with center
      
      let spiralStep = 8;
      let angle = Math.random() * Math.PI * 2; // Start from random angle
      let radius = radiusStart;
      
      while (!found && attempts < maxAttempts) {
        // Calculate position on spiral
        const left = centerX + Math.cos(angle) * radius;
        const top = centerY + Math.sin(angle) * radius;
        
        // Calculate rotation (limited for readability)
        const rotation = Math.min(Math.max(Math.random() * 20 - 10, -15), 15);
        
        const position = { left, top, rotation };
        
        // Check if position is valid
        if (!checkOverlap(position, newPositions, fontSize, word.name)) {
          const width = word.name.length * fontSize * 0.6;
          const height = fontSize * 1.2;
          
          newPositions.push({
            left: left,
            top: top,
            rotation: rotation,
            fontSize: fontSize,
            color: getColorByPopularity(word.weight, index),
            width: width,
            height: height
          });
          
          found = true;
        } else {
          // No suitable position, continue spiral
          angle += 0.1 + (0.1 * attempts / maxAttempts); // Increment angle, progressively larger
          radius += spiralStep / 10; // Increase radius more slowly as attempts increase
          attempts++;
        }
      }
      
      // If no position found (rare), place somewhere random but safe
      if (!found) {
        const width = word.name.length * fontSize * 0.6;
        const height = fontSize * 1.2;
        const margin = 40; // Safe margin from edges
        
        // Place it somewhere with safe margins
        newPositions.push({
          left: margin + Math.random() * (containerWidth - 2 * margin),
          top: margin + Math.random() * (containerHeight - 2 * margin),
          rotation: Math.random() * 20 - 10,
          fontSize: fontSize * 0.8, // Make it smaller since it's a fallback position
          color: getColorByPopularity(word.weight, index),
          width: width,
          height: height
        });
      }
    });
    
    setPositions(newPositions);
  }, [words, windowSize]); // Recalculate when window size changes too

  // Function to generate color based on popularity
  const getColorByPopularity = (weight, index) => {
    // Varied color palette for flowers
    const colors = [
      '#FF9AA2', // light pink
      '#FFB7B2', // peach
      '#FF6B6B', // coral
      '#E83A3A', // bright red
      '#F66D44', // orange
      '#FEAE5A', // saffron
      '#FFDAC1', // pale peach
      '#FFC154', // mustard yellow
      '#FFD700', // golden yellow
      '#E2F0CB', // pale green
      '#B5EAD7', // mint
      '#86D2B7', // jade green
      '#39A275', // emerald green
      '#C7CEEA', // baby blue
      '#98B4D4', // pale blue
      '#6A7FDB', // periwinkle
      '#5E60CE', // indigo
      '#D4BBEB', // lavender
      '#957FEF', // light purple
      '#7F7CAF', // dark purple
    ];
    
    // Use both weight and index to vary colors
    if (index === 0) {
      return '#E83A3A'; // Most popular is bright red
    }
    
    const colorIndex = (index * 3 + Math.floor(weight)) % colors.length;
    return colors[colorIndex];
  };

  if (loading) {
    return <div className="word-cloud-loading">Se încarcă...</div>;
  }

  if (error) {
    return <div className="word-cloud-error">{error}</div>;
  }

  return (
    <div className="word-cloud-container">
      <h2 className="word-cloud-title">✨ Grădina Populară a Florilor ✨</h2>
      <p className="word-cloud-subtitle">Descoperă care sunt florile preferate de comunitatea noastră</p>
      <div className="simple-word-cloud" ref={cloudRef}>
        {words.length > 0 && positions.length > 0 ? (
          words.map((word, index) => {
            // Find corresponding position
            const position = positions[index];
            if (!position) return null;
            
            return (
              <span
                key={word.id}
                className={`cloud-word ${position.isCenter ? 'cloud-word-center' : ''}`}
                style={{
                  position: 'absolute',
                  left: `${position.left}px`,
                  top: `${position.top}px`,
                  transform: `translate(-50%, -50%) rotate(${position.rotation}deg)`,
                  fontSize: `${position.fontSize}px`,
                  color: position.color,
                  cursor: 'pointer',
                  zIndex: index === 0 ? 100 : 10, // More popular flowers on top
                  transformStyle: 'preserve-3d'
                }}
                onClick={() => navigate(`/flowers/${word.id}`)}
              >
                {word.name}
              </span>
            );
          })
        ) : (
          <p>Nu există date suficiente pentru a genera word cloud-ul</p>
        )}
      </div>
    </div>
  );
};

export default SimpleFlowerWordCloud;