import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.response.use((response) => {
  const contentType = response.headers['content-type'] || '';
  if (contentType.includes('text/html')) {
    return Promise.reject(new Error('A API retornou HTML em vez de JSON. Verifique VITE_API_URL.'));
  }
  return response;
}, (error) => {
  if (error.response?.status === 401 && api.defaults.headers.common['Authorization']) {
    window.dispatchEvent(new CustomEvent('urbaniza:session-expired'));
  }
  return Promise.reject(error);
});

export default api;
