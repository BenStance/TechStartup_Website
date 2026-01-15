import { create } from 'zustand';

const useUserStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  
  // Set user
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  // Clear user
  clearUser: () => set({ user: null, isAuthenticated: false }),
  
  // Update user
  updateUser: (userData) => set((state) => ({
    user: { ...state.user, ...userData }
  })),
  
  // Check if user has a specific role
  hasRole: (role) => {
    const { user } = get();
    return user && user.role === role;
  },
  
  // Check if user has any of the specified roles
  hasAnyRole: (roles) => {
    const { user } = get();
    return user && roles.includes(user.role);
  }
}));

export default useUserStore;