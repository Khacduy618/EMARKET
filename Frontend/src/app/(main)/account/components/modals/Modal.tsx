// // src/components/ui/Modal.tsx

// import React from 'react';
// import { FaXmark } from 'react-icons/fa6';

// interface ModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     title: string;
//     children: React.ReactNode;
// }

// const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
//     if (!isOpen) {
//         return null;
//     }

//     return (
//         // Lớp phủ nền
//         <div
//             className="fixed inset-0 bg-white bg-opacity-50 z-50 flex justify-center items-center p-4"
//             onClick={onClose} // Đóng modal khi click vào nền
//         >
//             {/* Panel của modal */}
//             <div
//                 className="bg-white rounded-lg shadow-xl w-full max-w-lg relative"
//                 onClick={(e) => e.stopPropagation()} // Ngăn việc đóng modal khi click vào panel
//             >
//                 {/* Header */}
//                 <div className="flex  mt-12 justify-between items-center p-4 border-b border-gray-200">
//                     <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
//                     <button
//                         onClick={onClose}
//                         className="text-gray-400 hover:text-gray-600 transition-colors"
//                     >
//                         <FaXmark className="w-5 h-5" />
//                     </button>
//                 </div>

//                 {/* Nội dung */}
//                 <div className="p-6 h-auto">{children}</div>
//             </div>
//         </div>
//     );
// };

// export default Modal;
// src/components/ui/Modal.tsx
'use client';

import React from 'react';
import { FaXmark } from 'react-icons/fa6';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    // Thêm prop để tùy chỉnh độ rộng cho linh hoạt hơn
    maxWidth?: 'max-w-md' | 'max-w-lg' | 'max-w-xl' | 'max-w-2xl' | 'max-w-3xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
    if (!isOpen) {
        return null;
    }

    return (
        // 1. Lớp phủ nền: Đổi sang màu đen mờ để tập trung hơn vào modal
        <div
            className="fixed inset-0 top-20 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out"
            onClick={onClose}
        >
            {/* 2. Panel của modal: Sử dụng flexbox và giới hạn chiều cao tối đa */}
            <div
                className={`bg-white rounded-lg shadow-xl w-full ${maxWidth} relative flex flex-col max-h-[90vh] transition-transform duration-300 ease-in-out`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 3. Header: Không co lại, luôn cố định ở trên */}
                <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 p-1 rounded-full hover:bg-gray-200 hover:text-gray-600 transition-colors"
                        aria-label="Đóng"
                    >
                        <FaXmark className="w-5 h-5" />
                    </button>
                </div>

                {/* 4. Nội dung: Tự động co giãn và có thanh cuộn khi cần */}
                <div className="flex-grow p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;