import { create } from 'zustand';

interface SystemState {
    // Mobile detection
    isMobile: boolean;
    isSmallScreen: boolean;

    // Actions
    setMobile: (isMobile: boolean) => void;
    setSmallScreen: (isSmallScreen: boolean) => void;
    initializeMobileDetection: () => () => void; // Returns cleanup function
}

// Initial detection (runs once when store is created)
const getInitialMobileState = () => {
    if (typeof window === 'undefined') return { isMobile: false, isSmallScreen: false };
    return {
        isMobile: window.matchMedia('(pointer: coarse)').matches,
        isSmallScreen: window.matchMedia('(max-width: 768px)').matches,
    };
};

export const useSystemStore = create<SystemState>((set) => ({
    // Initial state
    ...getInitialMobileState(),

    // Actions
    setMobile: (isMobile) => set({ isMobile }),
    setSmallScreen: (isSmallScreen) => set({ isSmallScreen }),

    /**
     * Initialize media query listeners for mobile detection.
     * Call this once at app startup (e.g., in App.tsx useEffect).
     * Returns a cleanup function to remove listeners.
     */
    initializeMobileDetection: () => {
        const mobileQuery = window.matchMedia('(pointer: coarse)');
        const screenQuery = window.matchMedia('(max-width: 768px)');

        // Set initial values
        set({
            isMobile: mobileQuery.matches,
            isSmallScreen: screenQuery.matches,
        });

        const handleMobileChange = (e: MediaQueryListEvent) => {
            set({ isMobile: e.matches });
        };

        const handleScreenChange = (e: MediaQueryListEvent) => {
            set({ isSmallScreen: e.matches });
        };

        mobileQuery.addEventListener('change', handleMobileChange);
        screenQuery.addEventListener('change', handleScreenChange);

        // Return cleanup function
        return () => {
            mobileQuery.removeEventListener('change', handleMobileChange);
            screenQuery.removeEventListener('change', handleScreenChange);
        };
    },
}));
