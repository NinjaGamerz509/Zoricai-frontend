import { create } from 'zustand';

const getStorage = async (key) => {
  try {
    const { Preferences } = await import('@capacitor/preferences');
    const { value } = await Preferences.get({ key });
    return value;
  } catch {
    return localStorage.getItem(key);
  }
};

const setStorage = async (key, value) => {
  try {
    const { Preferences } = await import('@capacitor/preferences');
    await Preferences.set({ key, value });
  } catch {
    localStorage.setItem(key, value);
  }
};

const removeStorage = async (key) => {
  try {
    const { Preferences } = await import('@capacitor/preferences');
    await Preferences.remove({ key });
  } catch {
    localStorage.removeItem(key);
  }
};

const useStore = create((set) => ({
  token: null,
  user: null,

  loadToken: async () => {
    const token = await getStorage('zoric_token');
    const userStr = await getStorage('zoric_user');
    set({ token, user: userStr ? JSON.parse(userStr) : null });
  },

  setToken: async (token) => {
    await setStorage('zoric_token', token);
    set({ token });
  },

  setUser: async (user) => {
    await setStorage('zoric_user', JSON.stringify(user));
    set({ user });
  },

  logout: async () => {
    await removeStorage('zoric_token');
    await removeStorage('zoric_user');
    set({ token: null, user: null });
  }
}));

export default useStore;
