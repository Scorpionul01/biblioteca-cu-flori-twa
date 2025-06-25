import React, { useState, useEffect } from 'react';
import Cloud from 'react-d3-cloud';
import { useNavigate } from 'react-router-dom';
import flowerPopularityService from '../../services/flowerPopularityService';
import './WordCloud.css';

const FlowerWordCloud = () => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWordCloudData = async () => {
      try {
        setLoading(true);
        const data = await flowerPopularityService.getFlowerWordCloud(30);
        
        // Transformare date în formatul așteptat de react-d3-cloud
        const wordCloudData = data.items.map(item => ({
          text: item.name,
          value: item.weight * 10, // Scala mai mare pentru o mai bună vizualizare
          id: item.id
        }));
        
        setWords(wordCloudData);
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

  // Configurare pentru word cloud
  const fontSizeMapper = word => Math.log2(word.value) * 5 + 16;
  const rotate = word => word.value % 90;

  // Handler pentru click pe cuvinte
  const handleWordClick = word => {
    const clickedFlower = words.find(w => w.text === word.text);
    if (clickedFlower) {
      navigate(`/flowers/${clickedFlower.id}`);
    }
  };

  if (loading) {
    return <div className="word-cloud-loading">Se încarcă...</div>;
  }

  if (error) {
    return <div className="word-cloud-error">{error}</div>;
  }

  return (
    <div className="word-cloud-container">
      <h2>Cele mai populare flori</h2>
      <div className="word-cloud">
        {words.length > 0 ? (
          <Cloud
            data={words}
            fontSizeMapper={fontSizeMapper}
            rotate={rotate}
            onWordClick={handleWordClick}
            padding={5}
            font="Arial"
            fillStyle={(d, i) => {
              // Palette pentru culori
              const colors = [
                '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', 
                '#9467bd', '#8c564b', '#e377c2', '#7f7f7f'
              ];
              return colors[i % colors.length];
            }}
          />
        ) : (
          <p>Nu există date suficiente pentru a genera word cloud-ul</p>
        )}
      </div>
    </div>
  );
};

export default FlowerWordCloud;