// /components/HoverButton.tsx
import React from 'react';

interface HoverButtonProps {
    children: React.ReactNode;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void; // Cần event để preventDefault
    className?: string;
}

const HoverButton: React.FC<HoverButtonProps> = ({ children, onClick, className }) => {
    return (
        <button
            onClick={onClick}
            className={`
        absolute bottom-4 left-1/2 -translate-x-1/2
        opacity-0 translate-y-2
        group-hover:opacity-100 group-hover:translate-y-0
        transition-all duration-300 ease-in-out
        bg-orange-500 text-white px-4 py-2 w-11/12 rounded-sm text-sm font-semibold
        hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500
        z-20 // Đảm bảo button nổi lên trên các thành phần khác
        ${className}
      `}
        >
            {children}
        </button>
    );
};

export default HoverButton;