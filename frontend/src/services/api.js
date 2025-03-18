import axios from 'axios';

// Configurar la URL base según el entorno
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // Aumentar el timeout a 60 segundos porque la descarga puede llevar tiempo
});

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('Error en la solicitud API:', error);
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error('Respuesta de error del servidor:', error.response.data);
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      console.error('No se recibió respuesta del servidor');
    }
    return Promise.reject(error);
  }
);

// Servicio para procesar una URL de SoundCloud
export const downloadTrack = async (url) => {
  try {
    console.log('Enviando solicitud para procesar:', url);
    const response = await apiClient.post('/download', { url });
    console.log('Respuesta recibida de /download:', response);
    
    if (response.data.error) {
      console.error('Error en la respuesta del servidor:', response.data.message);
      throw new Error(response.data.message || 'Error en la respuesta del servidor');
    }
    
    return response;
  } catch (error) {
    console.error('Error en downloadTrack:', error);
    throw error;
  }
};

export default apiClient; 