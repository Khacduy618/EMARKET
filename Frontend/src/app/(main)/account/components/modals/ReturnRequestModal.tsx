'use client';


import React, { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '@/lib/config';
import Modal from './Modal'; // Component Modal chung của bạn
import { Order, OrderItem, Address } from '@/types'; // Các kiểu dữ liệu của bạn
import { getFullImageUrl } from '@/services/api'; // Hàm helper lấy URL ảnh đầy đủ
import { toast } from 'react-toastify';


// --- ĐỊNH NGHĨA CÁC KIỂU DỮ LIỆU ---


interface ReturnRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (message: string) => void;
    order: Order | null;
}


interface ReturnAddress {
    full_name: string;
    phone_number: string;
    address_line: string;
}


interface RefundAccountInfo {
    bank_name: string;
    account_number: string;
    account_holder_name: string;
}


interface Bank {
    bin: string;
    code: string;
    shortName: string;
    name: string;
    logo: string;
}


// ==================================================================
// COMPONENT CHÍNH
// ==================================================================
const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    order
}) => {
    // --- State quản lý dữ liệu form ---
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const [requestType, setRequestType] = useState<'Return' | 'Refund'>('Return');
    const [reasonDescription, setReasonDescription] = useState('');
    const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [returnAddress, setReturnAddress] = useState<ReturnAddress>({ full_name: '', phone_number: '', address_line: '' });
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [refundInfo, setRefundInfo] = useState<RefundAccountInfo>({ bank_name: '', account_number: '', account_holder_name: '' });


    // State quản lý lỗi cho từng trường
    const [errors, setErrors] = useState<{ [key: string]: string }>({});


    // Lọc các sản phẩm đủ điều kiện để yêu cầu
    const eligibleItems = order?.items.filter(item => item.ReturnStatus === null || item.ReturnStatus === 'None') || [];


    // Hàm reset toàn bộ trạng thái của form
    const resetForm = useCallback(() => {
        setSelectedItemId(null);
        setRequestType('Return');
        setReasonDescription('');
        setEvidenceFiles([]);
        setPreviewUrls([]);
        setReturnAddress({ full_name: '', phone_number: '', address_line: '' });
        setRefundInfo({ bank_name: '', account_number: '', account_holder_name: '' });
        setIsEditingAddress(false);
        setErrors({});
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, []);


    // Effect để lấy dữ liệu mặc định khi modal được mở
    useEffect(() => {
        if (isOpen && order) {
            resetForm();


            const fetchDefaultAddress = async () => {
                if (!order.ShippingAddressID) {
                    setIsEditingAddress(true);
                    return;
                }
                try {
                    console.log("Fetching default address for order:", order.ShippingAddressID);
                    const response = await axios.get<Address>(`${API_URL}/addresses-return/${order.ShippingAddressID}`, 
                        { headers: { 'Content-Type': 'application/json' },
                             withCredentials: true });
                    const addr = response.data;
                    setReturnAddress({
                        full_name: addr.FullName,
                        phone_number: addr.PhoneNumber,
                        address_line: `${addr.Street}, ${addr.Ward}, ${addr.District}, ${addr.City}`
                    });
                    setIsEditingAddress(false);
                } catch (err) {
                    console.error("Lỗi tải địa chỉ mặc định:", err);
                    setIsEditingAddress(true);
                }
            };


            const fetchBanks = async () => {
                try {
                    const response = await axios.get('https://api.vietqr.io/v2/banks');
                    if (response.data?.code === '00') setBanks(response.data.data);
                } catch (err) {
                    console.error("Lỗi tải danh sách ngân hàng:", err);
                }
            };


            fetchDefaultAddress();
            fetchBanks();
        }
    }, [isOpen, order, resetForm]);


    // Effect để tạo URL xem trước cho ảnh
    useEffect(() => {
        const newPreviewUrls = evidenceFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls(newPreviewUrls);
        return () => newPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    }, [evidenceFiles]);


    // Hàm validate tập trung, kiểm tra toàn bộ form
    const validateForm = useCallback((): boolean => {
        const newErrors: { [key: string]: string } = {};


        if (!selectedItemId) newErrors.selectedItem = 'Vui lòng chọn một sản phẩm để xử lý.';
        if (!reasonDescription.trim()) newErrors.reasonDescription = 'Vui lòng cung cấp lý do chi tiết.';
        else if (reasonDescription.trim().length < 10) newErrors.reasonDescription = 'Lý do cần chi tiết hơn (ít nhất 10 ký tự).';


        if (requestType === 'Return') {
            if (!returnAddress.full_name.trim()) newErrors.return_full_name = 'Vui lòng nhập họ và tên người gửi.';
            if (!/^(0[3|5|7|8|9])+([0-9]{8})\b/.test(returnAddress.phone_number.trim())) newErrors.return_phone_number = 'Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng 0).';
            if (!returnAddress.address_line.trim()) newErrors.return_address_line = 'Vui lòng nhập địa chỉ lấy hàng chi tiết.';
        }


        if (order?.PaymentMethod !== 'VNPay') {
            if (!refundInfo.bank_name) newErrors.refund_bank_name = 'Vui lòng chọn ngân hàng.';
            if (!/^\d+$/.test(refundInfo.account_number.trim())) newErrors.refund_account_number = 'Số tài khoản chỉ được chứa ký tự số.';
            if (!/^[A-Z\s]+$/.test(refundInfo.account_holder_name.trim())) newErrors.refund_account_holder_name = 'Tên chủ tài khoản phải viết hoa không dấu.';
        }


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [selectedItemId, reasonDescription, requestType, returnAddress, refundInfo, order?.PaymentMethod]);


    // Hàm xử lý khi gửi form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;


        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('order_item_id', selectedItemId!.toString());
        formData.append('request_type', requestType);
        formData.append('reason_description', reasonDescription);
        evidenceFiles.forEach(file => formData.append('evidence_images[]', file));


        if (requestType === 'Return') {
            formData.append('buyer_return_address[full_name]', returnAddress.full_name);
            formData.append('buyer_return_address[phone_number]', returnAddress.phone_number);
            formData.append('buyer_return_address[address_line]', returnAddress.address_line);
        }
        if (order?.PaymentMethod !== 'VNPay') {
            formData.append('refund_account_info[bank_name]', refundInfo.bank_name);
            formData.append('refund_account_info[account_number]', refundInfo.account_number);
            formData.append('refund_account_info[account_holder_name]', refundInfo.account_holder_name);
        }


        try {
            const response = await axios.post(`${API_URL}/buyer/return-requests`, formData, { withCredentials: true });
            toast.success(response.data.message || 'Yêu cầu đã được gửi thành công.');
            handleClose();
        } catch (err: any) {
            const serverErrors = err.response?.data?.errors;
            const errorMessage = serverErrors
                ? Object.values(serverErrors).flat().join(' ')
                : err.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
            setErrors({ form: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };


    // Hàm helper để xử lý input và xóa lỗi khi người dùng nhập
    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<any>>, fieldName: string, errorKey: string) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const { value } = e.target;
            if (fieldName) setter((prev: any) => ({ ...prev, [fieldName]: value }));
            else setter(value);
            if (errors[errorKey]) setErrors(prev => { const newE = { ...prev }; delete newE[errorKey]; return newE; });
        };


    const handleClose = () => {
        resetForm();
        onClose();
    };


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const MAX_SIZE_MB = 5;
            const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
            const filesArray = Array.from(e.target.files);
            const validFiles: File[] = [];
            let oversizedFiles: string[] = [];
            filesArray.forEach(file => file.size > MAX_SIZE_BYTES ? oversizedFiles.push(file.name) : validFiles.push(file));
            if (oversizedFiles.length > 0) setErrors(e => ({ ...e, files: `Các tệp sau quá lớn (tối đa ${MAX_SIZE_MB}MB): ${oversizedFiles.join(', ')}` }));
            else if (errors.files) setErrors(e => { const n = { ...e }; delete n.files; return n; });
            const combinedFiles = [...evidenceFiles, ...validFiles];
            setEvidenceFiles(combinedFiles.slice(0, 5));
        }
    };


    const handleRemoveImage = (indexToRemove: number) => {
        setEvidenceFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    };


    if (!order) return <Modal isOpen={isOpen} onClose={onClose} title="Yêu cầu Trả hàng/Hoàn tiền"><div className="p-6 text-center text-gray-500">Đang tải thông tin đơn hàng...</div></Modal>;
    if (eligibleItems.length === 0) return <Modal isOpen={isOpen} onClose={handleClose} title="Hoàn Tất"><div className="p-8 text-center"><svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><h3 className="mt-4 text-lg font-medium text-gray-900">Hoàn Tất</h3><p className="mt-2 text-sm text-gray-600">Bạn đã gửi yêu cầu cho tất cả sản phẩm trong đơn hàng này.</p><button type="button" onClick={handleClose} className="mt-6 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">Đóng</button></div></Modal>;


    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Yêu Cầu Trả Hàng/Hoàn Tiền" maxWidth="max-w-3xl">
            <form onSubmit={handleSubmit} className="space-y-6">


                {/* 1. Chọn sản phẩm */}
                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Chọn sản phẩm cần xử lý <span className="text-red-500">*</span></label>
                    <div className="space-y-3">
                        {order.items.map((item: OrderItem) => {
                            const isItemEligible = eligibleItems.some(eligible => eligible.OrderItemID === item.OrderItemID);
                            return (
                                <label key={item.OrderItemID} htmlFor={`item-${item.OrderItemID}`} className={`relative flex items-center gap-4 p-3 border rounded-lg transition-all ${isItemEligible ? 'cursor-pointer' : 'cursor-not-allowed bg-gray-50 opacity-70'} ${selectedItemId === item.OrderItemID ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50' : 'border-gray-200'} ${isItemEligible && selectedItemId !== item.OrderItemID ? 'hover:border-gray-400' : ''}`}>
                                    <input type="radio" id={`item-${item.OrderItemID}`} name="selectedItem" value={item.OrderItemID} onChange={() => { setSelectedItemId(item.OrderItemID); if (errors.selectedItem) setErrors(e => ({ ...e, selectedItem: '' })); }} checked={selectedItemId === item.OrderItemID} disabled={!isItemEligible} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                                    <img src={getFullImageUrl(item.productImageURL)} alt={item.productName} width={64} height={64} className="h-16 w-16 object-cover rounded-md" />
                                    <div className="text-sm flex-1">
                                        <p className="font-medium text-gray-900">{item.productName}</p>
                                        <p className="text-gray-500">Phân loại: {item.classification}</p>
                                    </div>
                                    {!isItemEligible && <span className="absolute top-2 right-2 text-xs font-semibold text-white bg-yellow-600 px-2 py-1 rounded-full">Đã Yêu Cầu</span>}
                                </label>
                            );
                        })}
                    </div>
                    {errors.selectedItem && <p className="text-red-500 text-xs mt-2">{errors.selectedItem}</p>}
                </div>


                {/* 2. Chọn loại yêu cầu */}
                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Loại yêu cầu <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className={`flex flex-col p-3 border rounded-lg cursor-pointer ${requestType === 'Return' ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50' : 'border-gray-200'}`}>
                            <div className="flex items-center"><input type="radio" name="request_type" value="Return" checked={requestType === 'Return'} onChange={() => setRequestType('Return')} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" /><span className="ml-3 font-medium text-gray-900">Trả hàng</span></div>
                            <p className="ml-7 text-xs text-gray-500">Gửi lại hàng cho người bán và nhận lại tiền.</p>
                        </label>
                        <label className={`flex flex-col p-3 border rounded-lg cursor-pointer ${requestType === 'Refund' ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50' : 'border-gray-200'}`}>
                            <div className="flex items-center"><input type="radio" name="request_type" value="Refund" checked={requestType === 'Refund'} onChange={() => setRequestType('Refund')} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" /><span className="ml-3 font-medium text-gray-900">Hoàn tiền</span></div>
                            <p className="ml-7 text-xs text-gray-500">Nhận lại tiền mà không cần gửi lại hàng.</p>
                        </label>
                    </div>
                </div>


                {/* 3. Form địa chỉ và thông tin hoàn tiền */}
                <div className="space-y-6">
                    {requestType === 'Return' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Địa chỉ lấy hàng trả <span className="text-red-500">*</span></label>
                            {!isEditingAddress ? (
                                <div className="p-4 border rounded-lg bg-gray-50 flex justify-between items-start">
                                    <div className="text-sm">
                                        <p className="font-semibold">{returnAddress.full_name}</p>
                                        <p className="text-gray-600">{returnAddress.phone_number}</p>
                                        <p className="text-gray-600 mt-1">{returnAddress.address_line}</p>
                                    </div>
                                    <button type="button" onClick={() => setIsEditingAddress(true)} className="flex-shrink-0 ml-4 text-sm font-medium text-indigo-600 hover:text-indigo-800">Thay đổi</button>
                                </div>
                            ) : (
                                <div className="space-y-3 p-4 border rounded-lg bg-white">
                                    <div>
                                        <label htmlFor="fullName" className="text-xs font-medium text-gray-600">Họ và tên</label>
                                        <input type="text" id="fullName" value={returnAddress.full_name} onChange={handleInputChange(setReturnAddress, 'full_name', 'return_full_name')} className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${errors.return_full_name ? 'border-red-500' : 'border-gray-300'}`} />
                                        {errors.return_full_name && <p className="text-red-500 text-xs mt-1">{errors.return_full_name}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="phoneNumber" className="text-xs font-medium text-gray-600">Số điện thoại</label>
                                        <input type="text" id="phoneNumber" value={returnAddress.phone_number} onChange={handleInputChange(setReturnAddress, 'phone_number', 'return_phone_number')} className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${errors.return_phone_number ? 'border-red-500' : 'border-gray-300'}`} />
                                        {errors.return_phone_number && <p className="text-red-500 text-xs mt-1">{errors.return_phone_number}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="addressLine" className="text-xs font-medium text-gray-600">Địa chỉ chi tiết</label>
                                        <textarea id="addressLine" rows={3} value={returnAddress.address_line} onChange={handleInputChange(setReturnAddress, 'address_line', 'return_address_line')} className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${errors.return_address_line ? 'border-red-500' : 'border-gray-300'}`}></textarea>
                                        {errors.return_address_line && <p className="text-red-500 text-xs mt-1">{errors.return_address_line}</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}


                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Thông tin nhận tiền hoàn</label>
                        {order.PaymentMethod === 'VNPay' ? (
                            <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                                <h3 className="text-sm font-semibold text-green-800">Hoàn tiền qua VNPAY</h3>
                                <p className="text-xs text-green-700 mt-1">
                                    Đơn hàng này đã được thanh toán bằng VNPAY. Tiền sẽ được hoàn tự động về tài khoản của bạn sau khi yêu cầu được duyệt.
                                </p>
                            </div>
                        ) : (
                            <div className="p-4 border border-indigo-200 bg-indigo-50 rounded-lg space-y-4">
                                <p className="text-xs text-indigo-700">Vui lòng cung cấp thông tin tài khoản để nhận tiền hoàn sau khi yêu cầu được xử lý.</p>
                                <div>
                                    <label htmlFor="bankName" className="block text-xs font-medium text-gray-600 mb-1">Tên ngân hàng <span className="text-red-500">*</span></label>
                                    <select id="bankName" value={refundInfo.bank_name} onChange={handleInputChange(setRefundInfo, 'bank_name', 'refund_bank_name')} className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${errors.refund_bank_name ? 'border-red-500' : 'border-gray-300'}`}>
                                        <option value="" disabled>-- Chọn ngân hàng --</option>
                                        {banks.map((bank) => (<option key={bank.bin} value={bank.shortName}>{bank.shortName} - {bank.name}</option>))}
                                    </select>
                                    {banks.find(b => b.shortName === refundInfo.bank_name)?.logo && (<img src={banks.find(b => b.shortName === refundInfo.bank_name)?.logo} alt={`${refundInfo.bank_name} logo`} className="mt-2 h-8 w-auto object-contain" />)}
                                    {errors.refund_bank_name && <p className="text-red-500 text-xs mt-1">{errors.refund_bank_name}</p>}
                                </div>
                                <div>
                                    <label htmlFor="accountNumber" className="block text-xs font-medium text-gray-600 mb-1">Số tài khoản <span className="text-red-500">*</span></label>
                                    <input type="text" id="accountNumber" value={refundInfo.account_number} onChange={handleInputChange(setRefundInfo, 'account_number', 'refund_account_number')} placeholder="Nhập chính xác số tài khoản" className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${errors.refund_account_number ? 'border-red-500' : 'border-gray-300'}`} />
                                    {errors.refund_account_number && <p className="text-red-500 text-xs mt-1">{errors.refund_account_number}</p>}
                                </div>
                                <div>
                                    <label htmlFor="accountHolderName" className="block text-xs font-medium text-gray-600 mb-1">Tên chủ tài khoản <span className="text-red-500">*</span></label>
                                    <input type="text" id="accountHolderName" value={refundInfo.account_holder_name} onChange={(e) => { const value = e.target.value.toUpperCase(); setRefundInfo(p => ({ ...p, account_holder_name: value })); if (errors.refund_account_holder_name) setErrors(errs => ({ ...errs, refund_account_holder_name: '' })); }} placeholder="VIẾT HOA KHÔNG DẤU, VD: NGUYEN VAN A" className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${errors.refund_account_holder_name ? 'border-red-500' : 'border-gray-300'}`} />
                                    {errors.refund_account_holder_name && <p className="text-red-500 text-xs mt-1">{errors.refund_account_holder_name}</p>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>


                {/* 4. Lý do chi tiết */}
                <div>
                    <label htmlFor="details" className="block text-sm font-semibold text-gray-800 mb-1">Lý do chi tiết <span className="text-red-500">*</span></label>
                    <textarea id="details" rows={4} value={reasonDescription} onChange={handleInputChange(setReasonDescription, '', 'reasonDescription')} placeholder="Mô tả tình trạng sản phẩm, ví dụ: Sản phẩm bị móp, không lên nguồn..." className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${errors.reasonDescription ? 'border-red-500' : 'border-gray-300'}`}></textarea>
                    {errors.reasonDescription && <p className="text-red-500 text-xs mt-1">{errors.reasonDescription}</p>}
                </div>


                {/* 5. Bằng chứng */}
                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">Bằng chứng (tối đa 5 ảnh, mỗi ảnh &lt; 5MB)</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-indigo-500" onClick={() => fileInputRef.current?.click()}>
                        <div className="space-y-1 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                            <p className="text-sm text-gray-600">Tải ảnh lên hoặc kéo thả</p>
                            <p className="text-xs text-gray-500">PNG, JPG, JPEG</p>
                        </div>
                    </div>
                    <input type="file" id="evidence" ref={fileInputRef} multiple accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} className="hidden" />
                    {previewUrls.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {previewUrls.map((url, index) => (
                                <div key={index} className="relative group">
                                    <img src={url} alt={`Preview ${index}`} className="h-24 w-full object-cover rounded-md" />
                                    <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100" aria-label="Xóa ảnh">×</button>
                                </div>
                            ))}
                        </div>
                    )}
                    {errors.files && <p className="text-red-500 text-xs mt-2">{errors.files}</p>}
                </div>


                {/* 6. Thông báo lỗi chung từ server */}
                {errors.form && <div className="p-3 bg-red-50 border border-red-200 rounded-md"><p className="text-sm text-red-700">{errors.form}</p></div>}


                {/* 7. Nút bấm */}
                <div className="pt-4 flex justify-end gap-3 border-t border-gray-200">
                    <button type="button" onClick={handleClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50" disabled={isSubmitting}>Hủy</button>
                    <button type="submit" disabled={isSubmitting || !selectedItemId} className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-semibold text-white hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed">
                        {isSubmitting && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                        {isSubmitting ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};


export default ReturnRequestModal;