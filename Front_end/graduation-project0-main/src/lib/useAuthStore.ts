// ─────────────────────────────────────────────────────────────
//  useAuthStore.ts
//  Single source of truth for auth state.
//  Works alongside axiosInstance — the axios interceptor handles
//  silent token refresh for API calls; this store handles state.
// ─────────────────────────────────────────────────────────────

import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as api from "@/lib/authApi";
import type { User } from "@/lib/authApi";

// ── Token helpers (keep localStorage in ONE place) ────────────
const TOKEN_KEY = "access_token";

const saveToken  = (t: string) => localStorage.setItem(TOKEN_KEY, t);
const clearToken = ()          => localStorage.removeItem(TOKEN_KEY);

// ── State shape ───────────────────────────────────────────────
interface AuthState {
  user:        User | null;
  accessToken: string | null;
  isLoading:   boolean;
  error:       string | null;

  // Derived
  isLoggedIn: () => boolean;

  // Auth
  register:     (name: string, email: string, password: string) => Promise<void>;
  login:        (email: string, password: string) => Promise<void>;
  logout:       () => Promise<void>;
  refreshToken: () => Promise<void>;

  // Profile
  fetchProfile:       () => Promise<void>;
  updateName:         (name: string) => Promise<void>;
  changePassword:     (oldPw: string, newPw: string) => Promise<void>;
  forgotPassword:     (email: string) => Promise<void>;
  resetPassword:      (token: string, newPw: string) => Promise<void>;
  requestEmailChange: (newEmail: string) => Promise<void>;
  deleteAccount:      () => Promise<void>;

  // Internal helpers (prefix _ = not for use in UI)
  _setToken:   (token: string) => void;
  _clearAuth:  () => void;
}

// ── Store ─────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:        null,
      accessToken: null,
      isLoading:   false,
      error:       null,

      // ── Derived ────────────────────────────────────────────
      isLoggedIn: () => !!get().accessToken && !!get().user,

      // ── Internal helpers ───────────────────────────────────
      _setToken: (token) => {
        saveToken(token);                    // keep localStorage in sync
        set({ accessToken: token });
      },

      _clearAuth: () => {
        clearToken();
        set({ user: null, accessToken: null, error: null });
      },

      // ── Register ───────────────────────────────────────────
      // No token returned — user must verify email then login
      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          await api.register(name, email, password);
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "Registration failed";
          set({ error: msg });
          throw e;                           // let the form handle UI error
        } finally {
          set({ isLoading: false });
        }
      },

      // ── Login ──────────────────────────────────────────────
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.login(email, password);
          get()._setToken(res.access_token);
          await get().fetchProfile();        // load user immediately
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "Login failed";
          set({ error: msg });
          throw e;
        } finally {
          set({ isLoading: false });
        }
      },

      // ── Logout ─────────────────────────────────────────────
      // Always clears local state even if server call fails
      logout: async () => {
        set({ isLoading: true });
        try {
          const token = get().accessToken;
          if (token) await api.logout(token);
        } catch {
          // swallow — we clear anyway
        } finally {
          get()._clearAuth();
          set({ isLoading: false });
        }
      },

      // ── Refresh Token ──────────────────────────────────────
      // Called by DashboardLayout on mount + every 10 min.
      // The axios interceptor ALSO calls this on 401 — that's fine,
      // both paths write to the same localStorage key.
      refreshToken: async () => {
        try {
          const res = await api.refreshToken();
          get()._setToken(res.access_token);
        } catch (e) {
          // Refresh cookie expired → full logout
          get()._clearAuth();
          throw e;                           // let the caller redirect
        }
      },

      // ── Fetch Profile ──────────────────────────────────────
      fetchProfile: async () => {
        const token = get().accessToken;
        if (!token) return;
        try {
          const user = await api.getProfile(token);
          set({ user });
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "Failed to fetch profile";
          set({ error: msg });
          throw e;                           // so DashboardLayout can catch it
        }
      },

      // ── Update Name ────────────────────────────────────────
      updateName: async (name) => {
        const token = get().accessToken;
        if (!token) return;
        set({ isLoading: true, error: null });
        try {
          await api.updateProfileName(name, token);
          // Optimistic update — avoid an extra fetchProfile round-trip
          const prev = get().user;
          if (prev) set({ user: { ...prev, name } });
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "Failed to update name";
          set({ error: msg });
          throw e;
        } finally {
          set({ isLoading: false });
        }
      },

      // ── Change Password (inside account) ───────────────────
      // Requires the current password — see endpoint 9 in authApi
      changePassword: async (oldPw, newPw) => {
        const token = get().accessToken;
        if (!token) return;
        set({ isLoading: true, error: null });
        try {
          await api.changePasswordInside(oldPw, newPw, token);
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "Failed to change password";
          set({ error: msg });
          throw e;
        } finally {
          set({ isLoading: false });
        }
      },

      // ── Forgot Password ────────────────────────────────────
      // Sends reset link to email — no token needed
      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          await api.forgotPassword(email);
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "Failed to send reset link";
          set({ error: msg });
          throw e;
        } finally {
          set({ isLoading: false });
        }
      },

      // ── Reset Password (from email link) ───────────────────
      // Uses the ?token= from the reset email — see SetNewPasswordForm
      resetPassword: async (token, newPw) => {
        set({ isLoading: true, error: null });
        try {
          await api.resetPasswordByToken(token, newPw);
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "Failed to reset password";
          set({ error: msg });
          throw e;
        } finally {
          set({ isLoading: false });
        }
      },

      // ── Request Email Change ───────────────────────────────
      // Sends a verification link to the new email
      requestEmailChange: async (newEmail) => {
        const token = get().accessToken;
        if (!token) return;
        set({ isLoading: true, error: null });
        try {
          await api.requestEmailChange(newEmail, token);
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "Failed to request email change";
          set({ error: msg });
          throw e;
        } finally {
          set({ isLoading: false });
        }
      },

      // ── Delete Account ─────────────────────────────────────
      deleteAccount: async () => {
        const token = get().accessToken;
        if (!token) return;
        set({ isLoading: true, error: null });
        try {
          await api.deleteProfile(token);
          get()._clearAuth();
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "Failed to delete account";
          set({ error: msg });
          throw e;
        } finally {
          set({ isLoading: false });
        }
      },
    }),

    {
      name: "agentlab-auth",
      // Only persist what's needed for rehydration on next page load.
      // The axios interceptor re-reads from localStorage directly,
      // so accessToken here and in localStorage stay in sync via _setToken.
      partialize: (state) => ({
        accessToken: state.accessToken,
        user:        state.user,
      }),
    }
  )
);