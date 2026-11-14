import { api } from './axios';

export async function listAdmin(resource, signal, params) {
    const response = await api.get('/admin/' + resource, { signal, params });
    return response.data.data;
}

export async function saveAdmin(resource, id, data) {
    const base = '/admin/' + resource;
    const response = id
        ? await api.patch(base + '/' + encodeURIComponent(id), data)
        : await api.post(base, data);
    return response.data.data;
}

export async function archiveAdmin(resource, id) {
    const response = await api.delete('/admin/' + resource + '/' + encodeURIComponent(id));
    return response.data.data;
}