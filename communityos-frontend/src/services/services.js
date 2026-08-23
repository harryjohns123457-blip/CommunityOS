import api from './api.js';

export async function getServices(providerId = null) {
  const response = await api.get('/services', {
    params: { providerId },
  });
  return response.data.data;
}

export async function getService(serviceId) {
  const response = await api.get(`/services/${serviceId}`);
  return response.data.data;
}
