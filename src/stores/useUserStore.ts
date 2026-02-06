import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Avatares disponíveis (usando profile pictures do projeto)
export const AVATAR_OPTIONS = [
    '/src/assets/profile/ball.webp',
    '/src/assets/profile/beach.webp',
    '/src/assets/profile/chess.webp',
    '/src/assets/profile/dog.webp',
    '/src/assets/profile/duck.webp',
    '/src/assets/profile/red flower.webp',
];

export interface UserProfile {
    id: string;
    name: string;
    avatarUrl: string;
    createdAt: number;
}

interface UserState {
    // Estado
    profiles: UserProfile[];
    currentUserId: string | null;

    // Actions
    createProfile: (name: string, avatarUrl: string) => UserProfile;
    deleteProfile: (id: string) => void;
    login: (id: string) => void;
    logout: () => void;
    getCurrentUser: () => UserProfile | null;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            profiles: [],
            currentUserId: null,

            createProfile: (name, avatarUrl) => {
                const newProfile: UserProfile = {
                    id: crypto.randomUUID(),
                    name,
                    avatarUrl,
                    createdAt: Date.now(),
                };

                set(state => ({
                    profiles: [...state.profiles, newProfile],
                }));

                return newProfile;
            },

            deleteProfile: (id) => {
                set(state => ({
                    profiles: state.profiles.filter(p => p.id !== id),
                    // Se deletar o usuário atual, faz logout
                    currentUserId: state.currentUserId === id ? null : state.currentUserId,
                }));

                // Limpa dados do usuário do localStorage
                localStorage.removeItem(`xp_user_${id}_fs`);
                localStorage.removeItem(`xp_user_${id}_desktop`);
                localStorage.removeItem(`xp_user_${id}_games`);
            },

            login: (id) => {
                const profile = get().profiles.find(p => p.id === id);
                if (profile) {
                    set({ currentUserId: id });
                }
            },

            logout: () => {
                set({ currentUserId: null });
            },

            getCurrentUser: () => {
                const { profiles, currentUserId } = get();
                return profiles.find(p => p.id === currentUserId) || null;
            },
        }),
        {
            name: 'xp_profiles', // Chave no localStorage
            partialize: (state) => ({
                profiles: state.profiles,
                // currentUserId não é persistido, então refresh = logout
            }),
        }
    )
);
