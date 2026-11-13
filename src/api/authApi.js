import { api } from './axios';

export async function login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data.data;
}

export async function getCurrentUser(signal) {
    const response = await api.get('/auth/me', { signal });
    return response.data.data;
}
