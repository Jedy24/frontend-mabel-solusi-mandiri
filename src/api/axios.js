import axios from 'axios';

export const tokenKey = 'visit-flow-token';
export const expiredSessionEvent = 'visit-flow-session-expired';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    timeout: 12000
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem(tokenKey);
    if (token && config.url !== '/auth/login') {
        config.headers.Authorization = 'Bearer ' + token;
    }
    return config;
});

api.interceptors.response.use(undefined, (error) => {
    const token = localStorage.getItem(tokenKey);
    if (
        error.response?.status === 401 &&
        token &&
        error.config?.headers?.Authorization === 'Bearer ' + token
    ) {
        localStorage.removeItem(tokenKey);
        window.dispatchEvent(new Event(expiredSessionEvent));
    }
    return Promise.reject(error);
});

export function requestError(error, fallback) {
    return error.response?.data?.message || fallback;
}
