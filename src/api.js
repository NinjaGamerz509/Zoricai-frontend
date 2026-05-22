import axios from 'axios';

const BASE_URL = 'http://192.0.0.2:5000';

const getToken = async () => {
  try {
    const { Preferences } = await import('@capacitor/preferences');
    const { value } = await Preferences.get({ key: 'zoric_token' });
    return value;
  } catch {
    return localStorage.getItem('zoric_token');
  }
};

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 30000,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      window.location.hash = '#/login';
    }
    return Promise.reject(error);
  }
);

export { BASE_URL };
export default api;
