import { api } from './axios';

export async function getActivities(filters, signal) {
    const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
    const response = await api.get('/activities', { params, signal });
    return response.data.data;
}

export async function createActivity(activity) {
    const response = await api.post('/activities', activity);
    return response.data.data;
}

export async function updateActivityStatus(id, status) {
    const response = await api.patch('/activities/' + encodeURIComponent(id), { status });
    return response.data.data;
}
