'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, ChevronDown } from 'lucide-react';

interface UserDropdownProps {
  handleLogout: () => Promise<void>;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{ username?: string; avatar?: string } | null>(null);

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const userData = JSON.parse(userString);
        setUser({
          username: userData.Username, // Assuming username or userName field
          avatar: userData.avatar || '/images/user-default.png', // Assuming avatar or avatarUrl field
        });
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        setUser(null);
      }
    }
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block  text-left">
        <li
            className="flex items-center w-full justify-center user-dropdown-button"
            id="menu-button"
            aria-expanded="false"
            aria-haspopup="true"
        >
            {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-6 h-6 rounded-full" />
            ) : (
                <User size={24} />
            )}
            <a href="" className="flex items-center">{user?.username || 'User Name'}</a>
            <ChevronDown className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
        </li>

        <div className="absolute right-0 top-0 z-10 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-gray-900/5 focus:outline-none user-dropdown-menu" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabIndex={-1}>
            <div className="py-1" role="none">
                <Link href="/profile" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem" tabIndex={-1} id="menu-item-0">
                    Tài khoản của tôi
                </Link>
                <Link href="/purchase" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem" tabIndex={-1} id="menu-item-1">
                    Đơn mua
                </Link>
                <button
                    onClick={handleLogout}
                    className="text-gray-700 block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                    role="menuitem"
                    tabIndex={-1}
                    id="menu-item-2"
                >
                    Đăng xuất
                </button>
            </div>
        </div>
    </div>
  );
};

export default UserDropdown;
