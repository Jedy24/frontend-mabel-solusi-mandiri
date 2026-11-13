import { api } from './axios';

export async function getEntities(segment, search, signal) {
    const params = { segment, search: search || undefined };
    const response = await api.get('/entities', { params, signal });
    return response.data.data;
}
