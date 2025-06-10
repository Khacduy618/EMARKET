'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/login'; // Assuming api utility is in this path

export default function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check if authToken exists in localStorage
        const authToken = localStorage.getItem('authToken');
        setIsLoggedIn(!!authToken); // Set isLoggedIn based on token presence
    }, []); // Empty dependency array means this effect runs once on mount

    const handleLogout = async () => {
        try {
            // Call the backend logout endpoint
            await api.post('/logout', {}); // Assuming logout is a POST request to /api/logout

            // Remove the token from localStorage
            localStorage.removeItem('authToken');

            // Update state and redirect to login page
            setIsLoggedIn(false);
            router.push('/login');
        } catch (error) {
            console.error("Logout failed:", error);
            // Even if API call fails, attempt to remove token and redirect
            localStorage.removeItem('authToken');
            setIsLoggedIn(false);
            router.push('/login');
        }
    };

    return (
        <div className="bg-[#2a83e9] text-white text-sm flex justify-between items-center px-4 py-1">
            <p>Summer Sale For All Swim Suits And Free Express Delivery - OFF 50% <span className="font-bold underline cursor-pointer">ShopNow</span></p>
            <div className="flex items-center">
                {isLoggedIn && (
                    <button onClick={handleLogout} className="ml-4 px-2 py-1 border border-white rounded hover:bg-white hover:text-[#2a83e9] transition-colors duration-200">
                        Logout
                    </button>
                )}
                <span className="ml-4">English <span>▼</span></span>
                
            </div>
        </div>
    )
}
