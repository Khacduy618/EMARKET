'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ReturnRequest } from '@/types/return-request';

interface ActionCardProps {
    request: ReturnRequest;

}

export default function ActionCard({ request }: ActionCardProps) {
    const [sellerNote, setSellerNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleRespond = async (action: 'approve' | 'reject') => {
        if (action === 'reject' && !sellerNote.trim()) {
            setError('Vui lòng nhập lý do từ chối.');
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            await axios.put(
                `http://localhost:8001/api/seller/return-requests/${request.ReturnRequestID}/respond`,
                { action, seller_note: sellerNote },
                { withCredentials: true }
            );
            alert(`Yêu cầu đã được ${action === 'approve' ? 'phê duyệt' : 'từ chối'} thành công!`);
            router.refresh();
        } catch (err: any) {
            setError(err.response?.data?.message || "Đã có lỗi xảy ra.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (request.Status !== 'PendingSellerApproval') {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái yêu cầu</h3>
                <p className="text-sm text-gray-600">Trạng thái: <strong>{request.Status}</strong></p>
                {request.SellerNote && (
                    <div className="mt-4">
                        <p className="text-sm text-gray-500">Ghi chú của bạn:</p>
                        <p className="text-sm p-3 bg-gray-50 rounded-md mt-1">{request.SellerNote}</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Phản hồi yêu cầu</h3>
            <div className="space-y-4">
                <div>
                    <label htmlFor="seller_note" className="block text-sm font-medium text-gray-700">Ghi chú (bắt buộc nếu từ chối)</label>
                    <textarea id="seller_note" rows={4} value={sellerNote} onChange={(e) => setSellerNote(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Nhập lý do hoặc thông tin thêm..." />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex gap-4 pt-2">
                    <button onClick={() => handleRespond('reject')} disabled={isSubmitting}
                        className="flex-1 justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50">
                        Từ chối
                    </button>
                    <button onClick={() => handleRespond('approve')} disabled={isSubmitting}
                        className="flex-1 justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50">
                        {isSubmitting ? 'Đang xử lý...' : 'Phê duyệt'}
                    </button>
                </div>
            </div>
        </div>
    );
}