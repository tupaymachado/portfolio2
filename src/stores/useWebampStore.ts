import { create } from 'zustand';

interface WebampState {
    currentTrack: string | null;
    setCurrentTrack: (trackName: string | null) => void;
}

export const useWebampStore = create<WebampState>((set) => ({
    currentTrack: null,
    setCurrentTrack: (trackName) => set({ currentTrack: trackName }),
}));
