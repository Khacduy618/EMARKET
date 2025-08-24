"use client"; // Bắt buộc vì có sử dụng hooks


import { useRouter, useParams } from 'next/navigation'; // Sửa lại import cho App Router
import axios, { AxiosError } from 'axios';
import { useState, useEffect, ChangeEvent } from 'react'; // Thêm ChangeEvent
import type { NextPage } from 'next';
import React from 'react';
import { WEB_URL } from '@/lib/config';
import { toast } from 'react-toastify';
import { getStorageImageUrl } from '@/services/api';


//=========== TYPE DEFINITIONS ===========
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
    RefundTransactionProof?: string; // Thêm trường mới để hiển thị bằng chứng
    user: {
        FullName: string;
        Phone?: string;
    };
    shop: {
        ShopName: string;
        ShopPhone?: string;
    };
}
//=========================================================


//=========== HELPER FUNCTIONS ===========
const formatCurrency = (amount: string | number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount));
};
const formatDateTime = (dateTimeString?: string): string => {
    if (!dateTimeString) return 'Chưa có';
    return new Date(dateTimeString).toLocaleString('vi-VN');
};
//=========================================================


//=========== MAIN PAGE COMPONENT ===========
const AdminRefundDetailPage: NextPage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;


    const [requestData, setRequestData] = useState<RefundRequestDetail | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [fetchError, setFetchError] = useState<string | null>(null);


    // States cho form xác nhận
    const [note, setNote] = useState<string>('');
    const [proofFile, setProofFile] = useState<File | null>(null); // << THAY ĐỔI 1: State cho file
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string>('');


    useEffect(() => {
        if (!id) return;


        const fetchRequestDetail = async () => {
            setIsLoading(true);
            setFetchError(null);
            try {
                const apiClient = axios.create({ baseURL: `${WEB_URL}`, withCredentials: true });
                await apiClient.get('/sanctum/csrf-cookie');
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


    // << THAY ĐỔI 2: Cập nhật hàm xử lý upload file
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setProofFile(e.target.files[0]);
        }
    };


    // << THAY ĐỔI 3: Cập nhật hàm submit để gửi FormData
    const handleConfirmTransfer = async () => {
        if (!note.trim()) {
            toast.error("❌ Ghi chú của Admin là bắt buộc.");
            return;
        }


        // Nếu ok thì show success




        setIsSubmitting(true);
        setSubmitError('');


        // Sử dụng FormData để gửi file và text
        const formData = new FormData();
        formData.append('admin_note', note);
        if (proofFile) {
            formData.append('refund_proof', proofFile);
        }


        try {
            const apiClient = axios.create({
                baseURL: `${WEB_URL}`,
                withCredentials: true,
                headers: {
                    // Trình duyệt sẽ tự set 'Content-Type': 'multipart/form-data'
                    'Accept': 'application/json',
                }
            });
            await apiClient.get('/sanctum/csrf-cookie');


            const response = await apiClient.post<{ data: RefundRequestDetail }>(
                `/api/admin/return-requests/${id}/confirm-bank-transfer`,
                formData // Gửi formData thay vì object JSON
            );
            toast.success('Xác nhận hoàn tiền thành công!');
            setRequestData(response.data.data);
            setNote('');
            setProofFile(null); // Reset cả file input


        } catch (err) {
            const error = err as AxiosError<{ message: string, errors?: Record<string, string[]> }>;
            let errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xác nhận.';
           
            // Xử lý lỗi validation chi tiết hơn
            if (error.response?.data?.errors) {
                const validationErrors = Object.values(error.response.data.errors).flat().join('\n');
                errorMessage += `\n${validationErrors}`;
            }
            setSubmitError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };


    // ... các phần render loading, error, no data giữ nguyên


    if (isLoading) return <div className="p-8 text-center text-lg">Đang tải chi tiết yêu cầu...</div>;
    if (fetchError) return <div className="p-8 text-center text-lg text-red-600">Lỗi: {fetchError}</div>;
    if (!requestData) return <div className="p-8 text-center text-lg text-gray-600">Không tìm thấy thông tin yêu cầu.</div>;


    const isAwaitingAdminAction = requestData.Status === 'Approved_WaitForAdmin';


    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8">
                {/* ... Header và các thông tin chi tiết giữ nguyên */}
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
                            {/* ... Thông tin chuyển khoản giữ nguyên ... */}
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


                        {/* << THAY ĐỔI 4: Thêm input upload file >> */}
                        <div className="mt-6">
                            <label htmlFor="refund_proof" className="block text-sm font-medium text-gray-700">
                                Bằng chứng chuyển khoản (tùy chọn)
                            </label>
                            <input
                                type="file"
                                id="refund_proof"
                                onChange={handleFileChange}
                                accept="image/jpeg, image/png, image/jpg"
                                className="mt-1 block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-indigo-50 file:text-indigo-700
                                hover:file:bg-indigo-100"
                            />
                        </div>


                        <button
                            onClick={handleConfirmTransfer}
                            disabled={isSubmitting || !note}
                            className="mt-4 w-full inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {isSubmitting ? 'Đang xác nhận...' : 'Tôi đã chuyển khoản & Hoàn tất yêu cầu'}
                        </button>
                        {submitError && <p className="text-red-500 mt-2 text-center whitespace-pre-line">{submitError}</p>}
                    </div>
                ) : (
                    <div className="mt-8 p-6 bg-green-50 border border-green-300 rounded-lg text-center">
                        <h2 className="text-xl font-bold text-green-800">✅ Yêu cầu đã được xử lý</h2>
                        <p className="mt-2"><strong>Trạng thái cuối cùng:</strong> {requestData.Status}</p>
                        <p className="mt-1"><strong>Ghi chú của Admin:</strong> {requestData.AdminNote || 'Không có'}</p>
                        <p className="mt-1"><strong>Thời gian xử lý:</strong> {formatDateTime(requestData.ResolvedAt)}</p>


                        {/* << THAY ĐỔI 5: Hiển thị bằng chứng đã upload >> */}
                        {requestData.RefundTransactionProof && (
                            <div className="mt-4">
                                <p className="font-semibold text-gray-700">Bằng chứng chuyển khoản:</p>
                                <a href={getStorageImageUrl(requestData.RefundTransactionProof)} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={getStorageImageUrl(requestData.RefundTransactionProof)}
                                        alt="Bằng chứng chuyển khoản"
                                        className="mt-2 max-w-xs mx-auto rounded-lg border shadow-sm"
                                    />
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};


export default AdminRefundDetailPage;

