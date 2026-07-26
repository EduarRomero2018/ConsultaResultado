import axios from 'axios';

const api = axios.create({
    // '??' (no '||'): un VITE_API_URL vacío es intencional en producción (rutas relativas
    // vía el proxy reverso de Nginx), y no debe caer al fallback de desarrollo.
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5050',
});

// Interceptor para agregar token si existe
api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

export default api;
