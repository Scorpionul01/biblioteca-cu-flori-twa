import api from './api';

const flowerService = {
  // Obținere toate florile
  getAllFlowers: async () => {
    try {
      const response = await api.get('/flowers');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Eroare la obținerea florilor';
    }
  },
  
  // Obținere floare după ID
  getFlowerById: async (id) => {
    try {
      const response = await api.get(`/flowers/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Eroare la obținerea florii';
    }
  },
  
  // Căutare flori
  searchFlowers: async (searchTerm) => {
    try {
      const response = await api.get(`/flowers/search?searchTerm=${searchTerm}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Eroare la căutarea florilor';
    }
  },
  
  // Obținere flori după culoare
  getFlowersByColor: async (colorId) => {
    try {
      const response = await api.get(`/flowers/bycolor/${colorId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Eroare la obținerea florilor după culoare';
    }
  },
  
  // Obținere flori după semnificație
  getFlowersByMeaning: async (meaningId) => {
    try {
      const response = await api.get(`/flowers/bymeaning/${meaningId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Eroare la obținerea florilor după semnificație';
    }
  },
  
  // Adăugare floare nouă (doar admin)
  createFlower: async (flowerData) => {
    try {
      const response = await api.post('/flowers', flowerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Eroare la adăugarea florii';
    }
  },
  
  // Actualizare floare (doar admin)
  updateFlower: async (flowerData) => {
    try {
      const response = await api.put('/flowers', flowerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Eroare la actualizarea florii';
    }
  },
  
  // Ștergere floare (doar admin)
  deleteFlower: async (id) => {
    try {
      const response = await api.delete(`/flowers/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Eroare la ștergerea florii';
    }
  }
};

export default flowerService;