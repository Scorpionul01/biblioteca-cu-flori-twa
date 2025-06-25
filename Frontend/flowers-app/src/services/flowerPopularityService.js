import api from './api';

const flowerPopularityService = {
  // Înregistrare click pentru o floare
  incrementClickCount: async (flowerId) => {
    try {
      const response = await api.post(`/flowerPopularity/click/${flowerId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Eroare la înregistrarea click-ului';
    }
  },
  
  // Obținere cele mai populare flori
  getMostPopularFlowers: async (count = 10) => {
    try {
      const response = await api.get(`/flowerPopularity/popular?count=${count}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Eroare la obținerea florilor populare';
    }
  },
  
  // Obținere date pentru word cloud
  getFlowerWordCloud: async (count = 20) => {
    try {
      const response = await api.get(`/flowerPopularity/wordcloud?count=${count}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Eroare la obținerea datelor pentru word cloud';
    }
  }
};

export default flowerPopularityService;