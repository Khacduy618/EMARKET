// src/app/(main)/(account)/components/modals/ReturnRequestModal.tsx
'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';
import { Order } from '@/types';
import Modal from './Modal';
import { getFullImageUrl } from '@/services/api';
import Image from 'next/image';
import { API_URL } from '@/lib/config';

// Props cho component
interface ReturnRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (message: string) => void; // Callback khi gửi thành công
    order: Order;
    token: string; // Token xác thực của người dùng
}

const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    order,
    token,
}) => {
    // --- STATE MANAGEMENT ---
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const [requestType, setRequestType] = useState<'Return' | 'Refund'>('Return');
    const [reasonDescription, setReasonDescription] = useState('');
    const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- FUNCTIONS ---

    // Reset tất cả state về trạng thái ban đầu
    const resetForm = useCallback(() => {
        setSelectedItemId(null);
        setRequestType('Return');
        setReasonDescription('');
        setEvidenceFiles([]);
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        setPreviewUrls([]);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, [previewUrls]);

    const handleClose = () => {
        resetForm();
        onClose();
    };

    useEffect(() => {
        const newPreviewUrls = evidenceFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls(newPreviewUrls);
        return () => newPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    }, [evidenceFiles]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setEvidenceFiles(prevFiles => [...prevFiles, ...filesArray].slice(0, 5));
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setEvidenceFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedItemId) {
            setError('Vui lòng chọn một sản phẩm để yêu cầu.');
            return;
        }
        if (!reasonDescription.trim()) {
            setError('Vui lòng cung cấp lý do chi tiết.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const formData = new FormData();
        formData.append('order_item_id', selectedItemId.toString());
        formData.append('request_type', requestType);
        formData.append('reason_description', reasonDescription);
        evidenceFiles.forEach(file => {
            formData.append('evidence_images[]', file);
        });

        try {
            // Fetch CSRF cookie before making the POST request
            const response = await axios.post(
                `${API_URL}/buyer/return-requests`,
                formData,
                {
                    headers: {
                        'Accept': 'application/json',
                    },
                    withCredentials: true,
                }
            );
            if (response.status === 201) {
                onSuccess(response.data.message || 'Yêu cầu của bạn đã được gửi thành công!');
                handleClose();
            }
        } catch (err: any) {
            console.error('Lỗi khi gửi yêu cầu:', err);
            const errorMessage = err.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Yêu Cầu Trả Hàng/Hoàn Tiền">
            <form onSubmit={handleSubmit} className="space-y-6 mt-12">
                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Chọn sản phẩm cần xử lý <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                        {order.items.map((item) => (
                            <label
                                key={item.OrderItemID}
                                htmlFor={`item-${item.OrderItemID}`}
                                className={`flex items-center gap-4 p-3 border rounded-lg cursor-pointer transition-all ${selectedItemId === item.OrderItemID
                                    ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50'
                                    : 'border-gray-200 hover:border-gray-400'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    id={`item-${item.OrderItemID}`}
                                    name="selectedItem"
                                    value={item.OrderItemID}
                                    onChange={() => setSelectedItemId(item.OrderItemID)}
                                    checked={selectedItemId === item.OrderItemID}
                                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                />
                                <img src={getFullImageUrl(item.productImageURL)} alt={item.productName} width={64} height={64} className="h-16 w-16 object-cover rounded-md" />
                                <div className="text-sm">
                                    <p className="font-medium text-gray-900">{item.productName}</p>
                                    <p className="text-gray-500">Phân loại: {item.classification}</p>
                                    <p className="text-gray-500">Số lượng: {item.Quantity}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Các phần còn lại của form: loại yêu cầu, lý do, upload... */}
                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Loại yêu cầu <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className={`flex flex-col p-3 border rounded-lg cursor-pointer ${requestType === 'Return' ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50' : 'border-gray-200'}`}>
                            <div className="flex items-center"><input type="radio" name="request_type" value="Return" checked={requestType === 'Return'} onChange={() => setRequestType('Return')} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" /><span className="ml-3 font-medium text-gray-900">Trả hàng</span></div><p className="ml-7 text-xs text-gray-500">Gửi lại hàng cho người bán và nhận lại tiền.</p>
                        </label>
                        <label className={`flex flex-col p-3 border rounded-lg cursor-pointer ${requestType === 'Refund' ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50' : 'border-gray-200'}`}>
                            <div className="flex items-center"><input type="radio" name="request_type" value="Refund" checked={requestType === 'Refund'} onChange={() => setRequestType('Refund')} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" /><span className="ml-3 font-medium text-gray-900">Hoàn tiền</span></div><p className="ml-7 text-xs text-gray-500">Nhận lại tiền mà không cần gửi lại hàng.</p>
                        </label>
                    </div>
                </div>
                <div>
                    <label htmlFor="details" className="block text-sm font-semibold text-gray-800 mb-1">Lý do chi tiết <span className="text-red-500">*</span></label>
                    <textarea id="details" rows={4} value={reasonDescription} onChange={(e) => setReasonDescription(e.target.value)} placeholder="Mô tả tình trạng sản phẩm, ví dụ: Sản phẩm bị móp, không lên nguồn..." className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">Bằng chứng (tối đa 5 ảnh)</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-indigo-500" onClick={() => fileInputRef.current?.click()}>
                        <div className="space-y-1 text-center"><svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg><div className="flex text-sm text-gray-600"><p className="pl-1">Tải ảnh lên hoặc kéo thả</p></div><p className="text-xs text-gray-500">PNG, JPG, JPEG</p></div>
                    </div>
                    <input type="file" id="evidence" ref={fileInputRef} multiple accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} className="hidden" />
                    {previewUrls.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {previewUrls.map((url, index) => (
                                <div key={url} className="relative group"><img src={url} alt={`Preview ${index}`} className="h-24 w-full object-cover rounded-md" /><button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Xóa ảnh">×</button></div>
                            ))}
                        </div>
                    )}
                </div>
                {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md"><p className="text-sm text-red-700">{error}</p></div>}
                <div className="pt-4 flex justify-end gap-3 border-t border-gray-200">
                    <button type="button" onClick={handleClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50" disabled={isSubmitting}>Hủy</button>
                    <button type="submit" disabled={isSubmitting || !selectedItemId} className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-semibold text-white hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        {isSubmitting && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                        {isSubmitting ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ReturnRequestModal;