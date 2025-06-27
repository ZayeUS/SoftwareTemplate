import { create } from 'zustand';
import { auth } from '../../firebase';
import { getData } from '../utils/BackendRequestHelper';

// Safe localStorage with error handling
const storage = {
  get: (key) => {
    try { return localStorage.getItem(key); } 
    catch { return null; }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, value); return true; } 
    catch { return false; }
  },
  remove: (key) => {
    try { localStorage.removeItem(key); return true; } 
    catch { return false; }
  }
};

export const useUserStore = create((set, get) => ({
  // State
  firebaseId: null,
  // roleId: null, // REMOVED
  userId: null,
  isLoggedIn: false,
  profile: null,
  loading: false,
  authLoading: false,
  authHydrated: false,
  userSubscriptionStatus: null,
  
  isDarkMode: (() => {
    const savedTheme = storage.get("theme");
    if (savedTheme) return savedTheme === "dark";
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
  })(),

  // Actions
  setLoading: (loading) => set({ loading }),
  setProfile: (profile) => set({ profile }),
  setUserSubscriptionStatus: (status) => set({ userSubscriptionStatus: status }),
  markFreeTierSelected: () => set({ userSubscriptionStatus: 'free' }), 

  toggleTheme: () => {
    set(state => {
      const newIsDarkMode = !state.isDarkMode;
      storage.set('theme', newIsDarkMode ? 'dark' : 'light');
      return { isDarkMode: newIsDarkMode };
    });
  },

  setUser: (firebaseId, userId) => { // MODIFIED: roleId removed
    set({
      firebaseId,
      userId,
      isLoggedIn: true,
    });
  },

  clearUser: () => {
    set({
      firebaseId: null,
      // roleId: null, // REMOVED
      userId: null,
      isLoggedIn: false,
      profile: null,
      userSubscriptionStatus: null,
      loading: false,
      authLoading: false,
      authHydrated: true,
    });
  },

  listenAuthState: () => {
    set({ authHydrated: false, authLoading: true, isLoggedIn: false });
    return auth.onAuthStateChanged(async (user) => {
      if (user) {
        let userData;
        try {
          userData = await getData(`/users/${user.uid}`);
          if (!userData?.user_id) { // MODIFIED: Simplified check
            get().clearUser();
            return;
          }
        } catch (error) {
          get().clearUser();
          return;
        }

        get().setUser(user.uid, userData.user_id); // MODIFIED: roleId removed
        
        const profileData = await getData(`/profile`).catch(() => null);
        set({ profile: profileData });

        const paymentData = await getData(`/stripe/payment-status`).catch(() => ({ status: 'unsubscribed' }));
        get().setUserSubscriptionStatus(paymentData?.status || 'unsubscribed');
      } else {
        get().clearUser();
      }
      set({ authLoading: false, authHydrated: true });
    });
  }
}));