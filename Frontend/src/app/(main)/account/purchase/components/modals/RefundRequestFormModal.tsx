// app/(main)/(account)/orders/[orderId]/components/modals/RefundRequestFormModal.tsx
import React, { useState } from 'react';
import Modal from './Modal';

interface RefundRequestFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderCode: string;
}

const RefundRequestFormModal: React.FC<RefundRequestFormModalProps> = ({ isOpen, onClose, orderCode }) => {
    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Xử lý logic gửi form tại đây
        console.log({
            type: 'Refund Request',
            orderCode,
            reason,
            details
        });
        alert('Yêu cầu hoàn tiền của bạn đã được gửi đi!');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Yêu cầu Hoàn tiền cho đơn ${orderCode}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="reason-refund" className="block text-sm font-medium text-gray-700 mb-1">Lý do hoàn tiền</label>
                    <select
                        id="reason-refund"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        required
                    >
                        <option value="">-- Chọn lý do --</option>
                        <option value="not_received">Chưa nhận được hàng</option>
                        <option value="partial_delivery">Giao thiếu hàng</option>
                        <option value="other">Lý do khác</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="details-refund" className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                    <textarea
                        id="details-refund"
                        rows={4}
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        placeholder="Vui lòng cung cấp bằng chứng (nếu có) và mô tả chi tiết..."
                    />
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Hủy</button>
                    <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600">Gửi yêu cầu</button>
                </div>
            </form>
        </Modal>
    );
};

export default RefundRequestFormModal;