// app/(main)/(account)/orders/[orderId]/components/modals/Modal.tsx
import { ReactNode } from 'react';
import { FaTimes } from 'react-icons/fa';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
            onClick={onClose} // Đóng modal khi click vào nền mờ
        >
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative"
                onClick={(e) => e.stopPropagation()} // Ngăn việc click bên trong modal đóng nó lại
            >
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <FaTimes />
                    </button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
};

export default Modal;