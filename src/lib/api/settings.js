import api from '../axios';

export const fetchSettings = async () => {
  const { data } = await api.get('/admin/settings');
  return data.data;
};

export const updateSettings = async (settingsData) => {
  const { data } = await api.put('/admin/settings', settingsData);
  return data.data;
};
