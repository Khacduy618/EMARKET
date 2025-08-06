// app/(main)/(account)/orders/[orderId]/components/modals/ReturnRequestFormModal.tsx
import React, { useState } from 'react';
import { Order, OrderItem } from '@/types';
import { getFullImageUrl } from '@/services/api';
import Modal from './Modal';

interface ReturnRequestFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order;
}

const ReturnRequestFormModal: React.FC<ReturnRequestFormModalProps> = ({ isOpen, onClose, order }) => {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');
    const [evidenceFiles, setEvidenceFiles] = useState<FileList | null>(null);
    // src/utils/format.ts
    const formatVND = (price: number): string => {
        if (typeof price !== 'number') return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };
    // Ghép tất cả sản phẩm từ các shop order lại thành một mảng
    const allItems: OrderItem[] = order.shopOrders.flatMap(shop => shop.items);

    const handleItemToggle = (itemId: string) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedItems.length === 0) {
            alert('Vui lòng chọn ít nhất một sản phẩm để trả hàng.');
            return;
        }
        if (!reason) {
            alert('Vui lòng chọn lý do trả hàng.');
            return;
        }

        // Xử lý logic gửi form tại đây (ví dụ: dùng FormData để gửi cả file)
        console.log({
            type: 'Return Request',
            orderCode: order.OrderCode,
            selectedItemIds: selectedItems,
            reason,
            details,
            files: evidenceFiles,
        });
        alert('Yêu cầu trả hàng của bạn đã được gửi đi!');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Yêu cầu Trả Hàng cho đơn ${order.OrderCode}`}>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Chọn sản phẩm trả hàng</label>
                    <div className="space-y-3 p-3 bg-gray-50 rounded-md border">
                        {allItems.map(item => (
                            <div key={item.OrderItemID} className="flex items-center p-2 rounded-md hover:bg-gray-100">
                                <input
                                    type="checkbox"
                                    id={`item-${item.OrderItemID}`}
                                    checked={selectedItems.includes(item.OrderItemID.toString())}
                                    onChange={() => handleItemToggle(item.OrderItemID.toString())}
                                    className="h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 mr-4"
                                />
                                <img src={getFullImageUrl(item.productImageURL)} alt={item.productName} className="w-12 h-12 object-cover rounded-md" />
                                <div className="ml-3 flex-grow">
                                    <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                                    <p className="text-xs text-gray-500">Phân loại: {item.classification}</p>
                                </div>
                                <div className="text-sm text-gray-800">{formatVND(item.PriceAtPurchase)}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Lý do trả hàng</label>
                    <select id="reason" value={reason} onChange={(e) => setReason(e.target.value)} required className="w-full border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500">
                        <option value="">-- Chọn lý do --</option>
                        <option value="wrong_item">Nhận sai sản phẩm</option>
                        <option value="damaged">Sản phẩm bị hư hỏng</option>
                        <option value="defective">Sản phẩm bị lỗi</option>
                        <option value="not_as_described">Sản phẩm không giống mô tả</option>
                        <option value="changed_mind">Thay đổi ý định (chỉ áp dụng với một số shop)</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                    <textarea id="details" rows={3} value={details} onChange={(e) => setDetails(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500" placeholder="Vui lòng mô tả rõ hơn về vấn đề bạn gặp phải..." />
                </div>

                <div>
                    <label htmlFor="evidence" className="block text-sm font-medium text-gray-700 mb-1">Thêm bằng chứng (hình ảnh/video)</label>
                    <input type="file" id="evidence" multiple onChange={(e) => setEvidenceFiles(e.target.files)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-5 py-2 rounded-md hover:bg-gray-300 font-semibold">Hủy</button>
                    <button type="submit" className="bg-orange-500 text-white px-5 py-2 rounded-md hover:bg-orange-600 font-semibold">Gửi yêu cầu</button>
                </div>
            </form>
        </Modal>
    );
};

export default ReturnRequestFormModal;