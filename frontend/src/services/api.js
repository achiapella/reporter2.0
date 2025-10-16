import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const sourcesAPI = {
  // Obtener todas las fuentes
  getAll: async () => {
    try {
      const response = await api.get('/sources');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener sources');
    }
  },

  // Obtener source por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/sources/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener source');
    }
  },

  // Crear nuevo source
  create: async (sourceData) => {
    try {
      const response = await api.post('/sources', sourceData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al crear source');
    }
  },

  // Actualizar source
  update: async (id, sourceData) => {
    try {
      const response = await api.put(`/sources/${id}`, sourceData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar source');
    }
  },

  // Eliminar source
  delete: async (id) => {
    try {
      const response = await api.delete(`/sources/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al eliminar source');
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw new Error('Error de conexión con el servidor');
    }
  },

  // Probar URL/endpoint
  testUrl: async (id) => {
    try {
      const response = await api.post(`/sources/${id}/test`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al probar URL');
    }
  },

  // Visualizar archivo
  viewFile: async (id) => {
    try {
      const response = await api.get(`/sources/${id}/view`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al visualizar archivo');
    }
  }
};

export const uploadAPI = {
  // Subir un archivo
  uploadSingle: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload/single', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al subir archivo');
    }
  },

  // Subir múltiples archivos
  uploadMultiple: async (files) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await api.post('/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al subir archivos');
    }
  },

  // Listar archivos subidos
  getFiles: async () => {
    try {
      const response = await api.get('/upload/files');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener archivos');
    }
  },

  // Eliminar archivo
  deleteFile: async (filename) => {
    try {
      const response = await api.delete(`/upload/files/${filename}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al eliminar archivo');
    }
  }
};

export default api;