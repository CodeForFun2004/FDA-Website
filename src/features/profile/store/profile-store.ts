// src/features/profile/store/profile-store.ts
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
    getUserProfileApi,
    updateUserProfileApi,
    changePasswordApi,
    type ApiProfile,
    type ChangePasswordRequest,
} from "../api/user-profile";

type ProfileStatus = "idle" | "loading" | "success" | "error";

type ProfileState = {
    // State
    status: ProfileStatus;
    profile: ApiProfile | null;
    error: string | null;

    // Actions
    fetchProfile: () => Promise<void>;
    updateProfile: (formData: FormData) => Promise<boolean>;
    changePassword: (payload: ChangePasswordRequest) => Promise<boolean>;
    clearProfile: () => void;
    clearError: () => void;

    // Selectors
    isProfileLoaded: () => boolean;
    getFullName: () => string;
    getAvatarUrl: () => string | null;
};

export const useProfileStore = create<ProfileState>()(
    persist(
        (set, get) => ({
            status: "idle",
            profile: null,
            error: null,

            /**
             * Fetch user profile from API
             */
            fetchProfile: async () => {
                set({ status: "loading", error: null });

                try {
                    const res = await getUserProfileApi();

                    if (!res.success) {
                        set({
                            status: "error",
                            error: res.message || "Failed to fetch profile",
                        });
                        return;
                    }

                    set({
                        status: "success",
                        profile: res.profile,
                        error: null,
                    });
                } catch (e: any) {
                    set({
                        status: "error",
                        profile: null,
                        error: e?.message ?? "Failed to fetch profile",
                    });
                    throw e;
                }
            },

            /**
             * Update user profile
             * @returns true nếu thành công
             */
            updateProfile: async (formData: FormData) => {
                set({ status: "loading", error: null });

                try {
                    const res = await updateUserProfileApi(formData);

                    if (!res.success) {
                        set({
                            status: "error",
                            error: res.message || "Failed to update profile",
                        });
                        return false;
                    }

                    set({
                        status: "success",
                        profile: res.profile,
                        error: null,
                    });
                    return true;
                } catch (e: any) {
                    set({
                        status: "error",
                        error: e?.message ?? "Failed to update profile",
                    });
                    return false;
                }
            },

            /**
             * Change password
             * @returns true nếu thành công
             */
            changePassword: async (payload: ChangePasswordRequest) => {
                set({ status: "loading", error: null });

                try {
                    const res = await changePasswordApi(payload);

                    if (!res.success) {
                        set({
                            status: "error",
                            error: res.message || "Failed to change password",
                        });
                        return false;
                    }

                    set({
                        status: "success",
                        error: null,
                    });
                    return true;
                } catch (e: any) {
                    set({
                        status: "error",
                        error: e?.message ?? "Failed to change password",
                    });
                    return false;
                }
            },

            /**
             * Clear profile data (e.g., on logout)
             */
            clearProfile: () => {
                set({
                    status: "idle",
                    profile: null,
                    error: null,
                });
            },

            clearError: () => set({ error: null }),

            // Selectors
            isProfileLoaded: () => get().profile !== null,
            getFullName: () => get().profile?.fullName ?? "User",
            getAvatarUrl: () => get().profile?.avatarUrl ?? null,
        }),
        {
            name: "fda_profile",
            storage: createJSONStorage(() => localStorage),
            partialize: (s) => ({
                profile: s.profile,
            }),
        }
    )
);
