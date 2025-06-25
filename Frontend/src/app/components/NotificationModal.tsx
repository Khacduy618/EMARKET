// src/app/components/NotificationModal.tsx
import React from 'react';

// Định nghĩa lại interface Notification cho component này nếu muốn,
// hoặc sử dụng interface từ CartPage.tsx
interface NotificationProps {
  isOpen: boolean;
  message: string;
  type: 'success' | 'error' | 'warning';
  onClose: () => void; // Thêm prop này để có thể đóng thủ công
}

const NotificationModal: React.FC<NotificationProps> = ({ isOpen, message, type, onClose }) => {
  if (!isOpen) return null;

  let bgColor = '';
  let textColor = '';
  let borderColor = '';
  let icon = null; // Để lưu icon SVG

  switch (type) {
    case 'success':
      bgColor = 'bg-green-100';
      textColor = 'text-green-700';
      borderColor = 'border-green-400';
      icon = <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      break;
    case 'error':
      bgColor = 'bg-red-100';
      textColor = 'text-red-700';
      borderColor = 'border-red-400';
      icon = <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2A9 9 0 111 10a9 9 0 0118 0z" /></svg>;
      break;
    case 'warning':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-700';
      borderColor = 'border-yellow-400';
      icon = <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
      break;
  }

  // Định vị ở góc trên bên phải, kiểu toast/snackbar
  return (
    <div className={`fixed top-4 right-4 z-50 p-4 border rounded-md shadow-lg ${bgColor} ${textColor} ${borderColor} transition-all duration-300 ease-in-out transform ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {icon}
          <span className="font-semibold">{message}</span>
        </div>
        {/* Nút đóng thủ công */}
        <button
          onClick={onClose}
          className="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NotificationModal;