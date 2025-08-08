// hooks/useAuth.ts
'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types'; // Đảm bảo type User của bạn đúng
import { getMe } from '@/services/auth';
 // Import hàm getMe từ service của bạn

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
}

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isError: false,
  });

  useEffect(() => {
    // Biến để tránh cập nhật state nếu component đã unmount
    let isMounted = true; 

    const fetchUser = async () => {
      try {
        const userData = await getMe();
        if (isMounted) {
          setAuthState({ user: userData, isLoading: false, isError: false });
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        if (isMounted) {
          setAuthState({ user: null, isLoading: false, isError: true });
        }
      }
    };

    fetchUser();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy một lần khi component mount

  return authState;
}