import axios from 'axios';
import { Preferences } from '@capacitor/preferences';

const BASE_URL = 'http://192.0.0.2:5000';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 30000,
});

api.interceptors.request.use(async (config) => {
  try {
    const { value: token } = await Preferences.get({ key: 'zoric_token' });
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await Preferences.remove({ key: 'zoric_token' });
      await Preferences.remove({ key: 'zoric_user' });
      window.location.hash = '#/login';
    }
    return Promise.reject(error);
  }
);

export { BASE_URL };
export default api;
