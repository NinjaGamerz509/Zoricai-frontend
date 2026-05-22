import { create } from 'zustand';
import { Preferences } from '@capacitor/preferences';

const useStore = create((set) => ({
  token: null,
  user: null,

  loadToken: async () => {
    try {
      const { value: token } = await Preferences.get({ key: 'zoric_token' });
      const { value: user } = await Preferences.get({ key: 'zoric_user' });
      set({ token, user: user ? JSON.parse(user) : null });
    } catch {}
  },

  setToken: async (token) => {
    await Preferences.set({ key: 'zoric_token', value: token });
    set({ token });
  },

  setUser: async (user) => {
    await Preferences.set({ key: 'zoric_user', value: JSON.stringify(user) });
    set({ user });
  },

  logout: async () => {
    await Preferences.remove({ key: 'zoric_token' });
    await Preferences.remove({ key: 'zoric_user' });
    set({ token: null, user: null });
  }
}));

export default useStore;
