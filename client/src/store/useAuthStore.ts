import { create } from 'zustand';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'attendee' | 'eo' | 'admin';
    points: number;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    updatePoints: (points: number) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    login: (user, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
    },
    updatePoints: (points) => {
        set((state) => {
            if (!state.user) return state;
            const newUser = { ...state.user, points };
            localStorage.setItem('user', JSON.stringify(newUser));
            return { user: newUser };
        });
    }
}));
