"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

// Giả lập 2 người dùng: một người mua và một người bán
export const MOCK_USERS = {
    buyer: { id: 'user_123', name: 'Thanh' },
    seller: { id: 'seller_456', name: 'Shop ABC' },
};

interface User {
    id: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};