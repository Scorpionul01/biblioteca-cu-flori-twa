import api from './api';

const colorService = {
  // Obținere toate culorile
  getAllColors: async () => {
    try {
      const response = await api.get('/colors');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Eroare la obținerea culorilor';
    }
  },
  
  // Obținere culoare după ID
  getColorById: async (id) => {
    try {
      const response = await api.get(`/colors/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Eroare la obținerea culorii';
    }
  },
  
  // Obținere distribuție flori pe culori (pentru grafic)
  getColorDistribution: async () => {
    try {
      const response = await api.get('/colors/distribution');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Eroare la obținerea distribuției culorilor';
    }
  }
};

export default colorService;