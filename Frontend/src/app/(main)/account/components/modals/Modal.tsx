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
//             className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out"
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

import React from 'react';
import { FaXmark } from 'react-icons/fa6';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: 'max-w-md' | 'max-w-lg' | 'max-w-xl' | 'max-w-2xl' | 'max-w-3xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 bg-white bg-opacity-50 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out"
            onClick={onClose}
        >
            <div
                className={`bg-white rounded-xl shadow-lg w-full ${maxWidth} relative flex flex-col max-h-[90vh] transition-all duration-300 ease-in-out`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header với màu nền trắng và border tinh tế */}
                <div className="flex-shrink-0 flex justify-between items-center p-5 border-b border-gray-100 bg-white rounded-t-xl">
                    <h3 className="text-xl font-medium text-gray-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-50"
                        aria-label="Đóng"
                    >
                        <FaXmark className="w-6 h-6" />
                    </button>
                </div>

                {/* Nội dung với padding rộng rãi và scroll mượt mà */}
                <div className="flex-grow p-6 overflow-y-auto bg-white rounded-b-xl">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;