// app/(main)/(account)/orders/[orderId]/components/modals/RequestSelectionModal.tsx
import React from 'react';
import Modal from './Modal';

interface RequestSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReturnRequest: () => void;
    onRefundRequest: () => void;
}

const RequestSelectionModal: React.FC<RequestSelectionModalProps> = ({ isOpen, onClose, onReturnRequest, onRefundRequest }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Chọn loại yêu cầu">
            <div className="flex flex-col space-y-4">
                <p className="text-gray-600">Bạn muốn tạo yêu cầu trả hàng (gửi lại sản phẩm) hay chỉ yêu cầu hoàn tiền (không gửi lại sản phẩm)?</p>
                <button
                    onClick={onReturnRequest}
                    className="w-full bg-orange-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-orange-600 transition-colors"
                >
                    Yêu Cầu Trả Hàng
                </button>
                <button
                    onClick={onRefundRequest}
                    className="w-full bg-white text-gray-700 px-6 py-3 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
                >
                    Yêu Cầu Hoàn Tiền
                </button>
            </div>
        </Modal>
    );
};

export default RequestSelectionModal;