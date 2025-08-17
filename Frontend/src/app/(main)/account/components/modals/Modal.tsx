// 'use client';

// import React from 'react';
// import { FaXmark } from 'react-icons/fa6';

// interface ModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     title: string;
//     children: React.ReactNode;
//     // Thêm prop để tùy chỉnh độ rộng cho linh hoạt hơn
//     maxWidth?: 'max-w-md' | 'max-w-lg' | 'max-w-xl' | 'max-w-2xl' | 'max-w-3xl';
// }

// const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
//     if (!isOpen) {
//         return null;
//     }

//     return (
//         // 1. Lớp phủ nền: Đổi sang màu đen mờ để tập trung hơn vào modal
//         <div
//             className="fixed inset-0 top-20 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out"
//             onClick={onClose}
//         >
//             {/* 2. Panel của modal: Sử dụng flexbox và giới hạn chiều cao tối đa */}
//             <div
//                 className={`bg-white rounded-lg shadow-xl w-full ${maxWidth} relative flex flex-col max-h-[90vh] transition-transform duration-300 ease-in-out`}
//                 onClick={(e) => e.stopPropagation()}
//             >
//                 {/* 3. Header: Không co lại, luôn cố định ở trên */}
//                 <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-200">
//                     <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
//                     <button
//                         onClick={onClose}
//                         className="text-gray-400 p-1 rounded-full hover:bg-gray-200 hover:text-gray-600 transition-colors"
//                         aria-label="Đóng"
//                     >
//                         <FaXmark className="w-5 h-5" />
//                     </button>
//                 </div>

//                 {/* 4. Nội dung: Tự động co giãn và có thanh cuộn khi cần */}
//                 <div className="flex-grow p-6 overflow-y-auto">
//                     {children}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Modal;
'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaXmark } from 'react-icons/fa6';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: 'max-w-md' | 'max-w-lg' | 'max-w-xl' | 'max-w-2xl' | 'max-w-3xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
    const [mounted, setMounted] = useState(false);

    // Effect này đảm bảo code chỉ chạy trên client, tránh lỗi với Next.js SSR
    useEffect(() => {
        setMounted(true);

        // Khi modal mở, không cho phép cuộn trang nền
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }

        // Dọn dẹp: Cho phép cuộn lại khi modal đóng hoặc component bị hủy
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    // JSX của modal không đổi, nhưng được gán vào một biến
    const modalContent = (
        // Lớp phủ nền: 
        // *** SỬA ĐỔI QUAN TRỌNG: Xóa 'top-20' và thêm padding 'pt-20' ***
        // Lớp phủ nền sẽ che toàn màn hình (inset-0), 
        // còn nội dung bên trong được đẩy xuống bằng padding.
        <div
            className="fixed inset-0  z-50 flex justify-center items-start pt-20 p-4 overflow-y-auto"
            onClick={onClose}
        >
            {/* Panel của modal */}
            <div
                className={`bg-white rounded-lg shadow-xl w-full ${maxWidth} relative flex flex-col max-h-[85vh] transition-transform duration-300 ease-in-out`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
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
                {/* Nội dung */}
                <div className="flex-grow p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );

    // *** LOGIC PORTAL ***
    // Chỉ thực hiện khi component đã được mount trên client
    if (mounted) {
        // Tìm đến thẻ div đặc biệt mà chúng ta sẽ tạo
        const portalRoot = document.getElementById('modal-portal-root');
        // Nếu tìm thấy, "dịch chuyển" modalContent vào đó
        if (portalRoot) {
            return createPortal(modalContent, portalRoot);
        }
    }

    // Nếu chưa mount hoặc không tìm thấy root, không render gì cả
    return null;
};

export default Modal;