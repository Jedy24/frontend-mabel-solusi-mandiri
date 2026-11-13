import { api } from './axios';

export async function getSalespeople(signal) {
    const response = await api.get('/sales', { signal });
    return response.data.data;
}
