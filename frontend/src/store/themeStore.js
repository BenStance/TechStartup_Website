import { create } from 'zustand';

const useThemeStore = create((set, get) => ({
  darkMode: false,
  
  // Toggle dark mode
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  
  // Set dark mode
  setDarkMode: (darkMode) => set({ darkMode }),
  
  // Get current theme
  getTheme: () => {
    const { darkMode } = get();
    return darkMode ? 'dark' : 'light';
  }
}));

export default useThemeStore;