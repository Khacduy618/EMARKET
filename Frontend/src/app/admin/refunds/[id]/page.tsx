"use client"; // Bắt buộc vì có sử dụng hooks

import { useRouter, useParams } from 'next/navigation'; // Sửa lại import cho App Router
import axios, { AxiosError } from 'axios';
import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import React from 'react';
import { WEB_URL } from '@/lib/config';

//=========== TYPE DEFINITIONS (trong cùng file) ===========
interface RefundRequestDetail {
    ReturnRequestID: number;
    RequestCode: string;
    Status: string;
    ReasonDescription: string;
    RefundAmount: string;
    RefundBankName: string;
    RefundAccountNumber: string;
    RefundAccountHolderName: string;
    ResolvedAt?: string;
    AdminNote?: string;
    user: {
        FullName: string;
        Phone?: string;
    };
    shop: {
        ShopName: string;
        ShopPhone?: string;
    };
    // Thêm các trường khác từ API response nếu bạn cần hiển thị
}
//=========================================================

//=========== HELPER FUNCTIONS (trong cùng file) ===========
const formatCurrency = (amount: string | number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount));
};
const formatDateTime = (dateTimeString?: string): string => {
    if (!dateTimeString) return 'Chưa có';
    return new Date(dateTimeString).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
};
//=========================================================

//=========== MAIN PAGE COMPONENT ===========
const AdminRefundDetailPage: NextPage = () => {
    // Sử dụng hooks mới từ 'next/navigation'
    const router = useRouter();
    const params = useParams();
    const id = params.id as string; // Lấy id từ params và ép kiểu

    // States để quản lý dữ liệu, tải và lỗi
    const [requestData, setRequestData] = useState<RefundRequestDetail | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // States cho form xác nhận
    const [note, setNote] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string>('');

    // Fetch dữ liệu chi tiết khi component mount hoặc `id` thay đổi
    useEffect(() => {
        // Chỉ chạy khi `id` đã có giá trị
        if (!id) return;

        const fetchRequestDetail = async () => {
            setIsLoading(true);
            setFetchError(null);
            try {
                // Tạo instance axios với cấu hình cho Sanctum SPA
                const apiClient = axios.create({
                    baseURL: `${WEB_URL}`,
                    withCredentials: true,
                });

                // Lấy CSRF token trước
                await apiClient.get('/sanctum/csrf-cookie');

                // Gọi API để lấy chi tiết yêu cầu
                const response = await apiClient.get<RefundRequestDetail>(`/api/admin/return-requests/${id}`);

                setRequestData(response.data);
            } catch (err) {
                const error = err as AxiosError<{ message: string }>;
                setFetchError(error.response?.data?.message || 'Không thể tải chi tiết yêu cầu.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRequestDetail();
    }, [id]);

    // Hàm xử lý khi Admin nhấn nút xác nhận đã chuyển khoản
    const handleConfirmTransfer = async () => {
        if (!note.trim()) {
            alert('Ghi chú của Admin là bắt buộc.');
            return;
        }
        if (!confirm('Hành động này không thể hoàn tác! Bạn có chắc chắn đã chuyển khoản thành công?')) {
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');
        try {
            // Tái sử dụng instance axios đã cấu hình
            const apiClient = axios.create({
                baseURL: `${WEB_URL}`,
                withCredentials: true,
            });
            await apiClient.get('/sanctum/csrf-cookie');

            // Gửi yêu cầu xác nhận
            const response = await apiClient.post<{ data: RefundRequestDetail }>(
                `/api/admin/return-requests/${id}/confirm-bank-transfer`,
                { admin_note: note }
            );

            alert('Xác nhận hoàn tiền thành công!');
            setRequestData(response.data.data); // Cập nhật giao diện với dữ liệu mới nhất
            setNote(''); // Xóa nội dung ghi chú sau khi thành công

        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            setSubmitError(error.response?.data?.message || 'Có lỗi xảy ra khi xác nhận.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Render trạng thái tải
    if (isLoading) {
        return <div className="p-8 text-center text-lg">Đang tải chi tiết yêu cầu...</div>;
    }

    // Render trạng thái lỗi
    if (fetchError) {
        return <div className="p-8 text-center text-lg text-red-600">Lỗi: {fetchError}</div>;
    }

    // Render khi không có dữ liệu
    if (!requestData) {
        return <div className="p-8 text-center text-lg text-gray-600">Không tìm thấy thông tin yêu cầu.</div>;
    }

    const isAwaitingAdminAction = requestData.Status === 'Approved_WaitForAdmin';

    // Render giao diện chính
    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8">
                <button onClick={() => router.back()} className="mb-6 text-indigo-600 hover:text-indigo-800 font-semibold">
                    &larr; Quay lại danh sách
                </button>

                <div className="border-b pb-4 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Chi tiết yêu cầu: {requestData.RequestCode}</h1>
                    <p className="mt-1 text-gray-500">Trạng thái hiện tại:
                        <span className="font-bold text-blue-700 ml-2">{requestData.Status}</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div>
                        <h3 className="font-semibold text-gray-700">Người mua</h3>
                        <p className="text-gray-900">{requestData.user.FullName}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-700">Cửa hàng</h3>
                        <p className="text-gray-900">{requestData.shop.ShopName}</p>
                    </div>
                    <div className="md:col-span-2">
                        <h3 className="font-semibold text-gray-700">Lý do yêu cầu</h3>
                        <p className="mt-1 p-3 bg-gray-50 rounded-md border">{requestData.ReasonDescription}</p>
                    </div>
                </div>

                {isAwaitingAdminAction ? (
                    <div className="mt-8 p-6 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Hành động: Hoàn tiền (COD)</h2>
                        <div className="p-4 bg-white rounded-lg shadow-inner">
                            <p className="text-sm text-gray-600 mb-3">Vui lòng chuyển khoản chính xác thông tin dưới đây:</p>
                            <ul className="space-y-2">
                                <li><strong>Ngân hàng:</strong> <span className="font-mono">{requestData.RefundBankName}</span></li>
                                <li><strong>Số tài khoản:</strong> <span className="font-mono">{requestData.RefundAccountNumber}</span></li>
                                <li><strong>Chủ tài khoản:</strong> <span className="font-mono">{requestData.RefundAccountHolderName}</span></li>
                                <li className="text-2xl font-bold text-red-600 pt-2 border-t mt-3">
                                    Số tiền hoàn: {formatCurrency(requestData.RefundAmount)}
                                </li>
                            </ul>
                        </div>
                        <div className="mt-6">
                            <label htmlFor="admin_note" className="block text-sm font-medium text-gray-700">Ghi chú của Admin (bắt buộc)</label>
                            <textarea
                                id="admin_note" rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                value={note} onChange={(e) => setNote(e.target.value)}
                                placeholder="VD: Đã chuyển khoản từ VCB ngày 23/05. Mã GD: FT24143XYZ..."
                            />
                        </div>
                        <button
                            onClick={handleConfirmTransfer}
                            disabled={isSubmitting || !note}
                            className="mt-4 w-full inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {isSubmitting ? 'Đang xác nhận...' : 'Tôi đã chuyển khoản & Hoàn tất yêu cầu'}
                        </button>
                        {submitError && <p className="text-red-500 mt-2 text-center">{submitError}</p>}
                    </div>
                ) : (
                    <div className="mt-8 p-6 bg-green-50 border border-green-300 rounded-lg text-center">
                        <h2 className="text-xl font-bold text-green-800">✅ Yêu cầu đã được xử lý</h2>
                        <p className="mt-2"><strong>Trạng thái cuối cùng:</strong> {requestData.Status}</p>
                        <p className="mt-1"><strong>Ghi chú của Admin:</strong> {requestData.AdminNote || 'Không có'}</p>
                        <p className="mt-1"><strong>Thời gian xử lý:</strong> {formatDateTime(requestData.ResolvedAt)}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminRefundDetailPage;