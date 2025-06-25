import api from './api';

const meaningService = {
  // Obținere toate semnificațiile
  getAllMeanings: async () => {
    try {
      const response = await api.get('/meanings');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Eroare la obținerea semnificațiilor';
    }
  },
  
  // Obținere semnificație după ID
  getMeaningById: async (id) => {
    try {
      const response = await api.get(`/meanings/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Eroare la obținerea semnificației';
    }
  },
  
  // Adăugare semnificație nouă (doar admin)
  createMeaning: async (meaningData) => {
    try {
      const response = await api.post('/meanings', meaningData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Eroare la adăugarea semnificației';
    }
  },
  
  // Obținere distribuție flori pe semnificații (pentru grafic)
  getMeaningDistribution: async () => {
    try {
      const response = await api.get('/meanings/distribution');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Eroare la obținerea distribuției semnificațiilor';
    }
  }
};

export default meaningService;