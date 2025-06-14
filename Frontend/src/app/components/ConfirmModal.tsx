// // src/app/components/ConfirmModal.tsx
// import React from 'react';

// interface ConfirmModalProps {
//   isOpen: boolean;
//   message: string;
//   onConfirm: () => void;
//   onCancel: () => void;
// }

// const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, message, onConfirm, onCancel }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 flex items-center justify-center z-50">
//       <div className="bg-white  rounded-lg shadow-xl max-w-sm w-full">
//         <div className="shadow-inner rounded-lg p-6 w-full">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">Xác nhận</h3>
//             <p className="text-gray-600 mb-6">{message}</p>
//             <div className="flex justify-end space-x-3">
//             <button
//                 onClick={onCancel}
//                 className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
//             >
//                 Hủy
//             </button>
//             <button
//                 onClick={onConfirm}
//                 className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
//             >
//                 Đồng ý
//             </button>
//             </div>
//         </div>
        
//       </div>
//     </div>
//   );
// };

// export default ConfirmModal;
// src/app/components/ConfirmModal.tsx
import React, { useEffect, useRef } from 'react'; // Import useRef

interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, message, onConfirm, onCancel }) => {
  const confirmButtonRef = useRef<HTMLButtonElement>(null); // Tạo ref cho nút Đồng ý

  // useEffect để quản lý sự kiện keydown
  useEffect(() => {
    if (!isOpen) return; // Chỉ lắng nghe khi modal mở

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault(); // Ngăn chặn hành vi mặc định của Enter (ví dụ: submit form nếu có)
        onConfirm(); // Kích hoạt hành động xác nhận
      } else if (event.key === 'Escape') {
        event.preventDefault(); // Ngăn chặn hành vi mặc định của Escape
        onCancel(); // Kích hoạt hành động hủy
      }
    };

    // Thêm event listener khi modal mở
    window.addEventListener('keydown', handleKeyDown);

    // Tập trung vào nút "Đồng ý" khi modal mở để cải thiện trải nghiệm người dùng
    // Điều này cũng giúp Enter kích hoạt nút đó dễ dàng hơn
    if (confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }

    // Dọn dẹp event listener khi modal đóng hoặc component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onConfirm, onCancel]); // Re-run effect khi modal mở/đóng hoặc hàm callback thay đổi

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Xác nhận</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Hủy
          </button>
          <button
            ref={confirmButtonRef} // Gán ref vào nút Đồng ý
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;