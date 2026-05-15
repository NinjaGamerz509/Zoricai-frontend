import { create } from 'zustand';

const useStore = create((set) => ({
  // Auth
  user: null,
  token: localStorage.getItem('zoric_token') || null,
  setUser: (user) => set({ user }),
  setToken: (token) => { localStorage.setItem('zoric_token', token); set({ token }); },
  logout: () => { localStorage.removeItem('zoric_token'); set({ user: null, token: null }); },

  // Orb state
  orbState: 'idle', // idle | listening | thinking | speaking
  setOrbState: (orbState) => set({ orbState }),

  // Agents
  agents: [],
  agentsActive: false,
  setAgents: (agents, agentsActive) => set({ agents, agentsActive }),

  // Spotify
  currentTrack: null,
  setCurrentTrack: (currentTrack) => set({ currentTrack }),

  // Theme
  theme: 'neon-cyan',
  setTheme: (theme) => set({ theme }),

  // Sidebar
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));

export default useStore;
