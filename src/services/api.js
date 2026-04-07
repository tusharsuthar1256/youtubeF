import axios from 'axios';

const api = axios.create({
    baseURL: '/api/v1',
    withCredentials: true, // For HTTP-only cookies
});

export default api;
