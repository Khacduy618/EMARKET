// 'use client';

// import React, { useState, useRef, useCallback, useEffect } from 'react';
// import axios from 'axios';
// import Modal from './Modal';
// import { Order, OrderItem } from '@/types'; // Giả sử import từ file types global
// import { getFullImageUrl } from '@/services/api';

// // Props cho component
// interface ReturnRequestModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     onSuccess: (message: string) => void;
//     order: Order | null;
//     token: string;
// }

// const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({
//     isOpen,
//     onClose,
//     onSuccess,
//     order,
//     token,
// }) => {
//     // --- STATE MANAGEMENT ---
//     const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
//     const [requestType, setRequestType] = useState<'Return' | 'Refund'>('Return');
//     const [reasonDescription, setReasonDescription] = useState('');
//     const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
//     const [previewUrls, setPreviewUrls] = useState<string[]>([]);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const fileInputRef = useRef<HTMLInputElement>(null);

//     // --- LOGIC ---
//     // Chỉ lọc các sản phẩm đã có yêu cầu, không kiểm tra điều kiện thời gian ở đây nữa
//     const eligibleItems = order?.items.filter(
//         (item) => item.ReturnStatus === null || item.ReturnStatus === 'None'
//     ) || [];

//     // --- CÁC HÀM XỬ LÝ ---
//     const resetForm = useCallback(() => {
//         setSelectedItemId(null);
//         setRequestType('Return');
//         setReasonDescription('');
//         setEvidenceFiles([]);
//         setPreviewUrls([]);
//         setError(null);
//         if (fileInputRef.current) {
//             fileInputRef.current.value = "";
//         }
//     }, []);

//     useEffect(() => {
//         if (isOpen) {
//             resetForm();
//         }
//     }, [isOpen, order, resetForm]);

//     const handleClose = () => {
//         resetForm();
//         onClose();
//     };

//     useEffect(() => {
//         const newPreviewUrls = evidenceFiles.map(file => URL.createObjectURL(file));
//         setPreviewUrls(newPreviewUrls);
//         return () => newPreviewUrls.forEach(url => URL.revokeObjectURL(url));
//     }, [evidenceFiles]);

//     const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         if (e.target.files) {
//             const filesArray = Array.from(e.target.files);
//             setEvidenceFiles(prevFiles => [...prevFiles, ...filesArray].slice(0, 5));
//         }
//     };

//     const handleRemoveImage = (indexToRemove: number) => {
//         setEvidenceFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
//         if (fileInputRef.current) {
//             fileInputRef.current.value = "";
//         }
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!selectedItemId) {
//             setError('Vui lòng chọn một sản phẩm để yêu cầu.');
//             return;
//         }
//         if (!reasonDescription.trim()) {
//             setError('Vui lòng cung cấp lý do chi tiết.');
//             return;
//         }
//         setIsSubmitting(true);
//         setError(null);
//         const formData = new FormData();
//         formData.append('order_item_id', selectedItemId.toString());
//         formData.append('request_type', requestType);
//         formData.append('reason_description', reasonDescription);
//         evidenceFiles.forEach(file => {
//             formData.append('evidence_images[]', file);
//         });
//         try {
//             const response = await axios.post('http://localhost:8001/api/buyer/return-requests', formData, {
//                 headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
//                 withCredentials: true,
//             });
//             if (response.status === 201) {
//                 onSuccess(response.data.message || 'Yêu cầu của bạn đã được gửi thành công!');
//                 handleClose();
//             }
//         } catch (err: any) {
//             console.error('Lỗi khi gửi yêu cầu:', err);
//             const errorMessage = err.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
//             setError(errorMessage);
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     // --- PHẦN RENDER GIAO DIỆN ---
//     const renderContent = () => {
//         if (!order) {
//             return <div className="p-6 text-center text-gray-500">Đang tải thông tin đơn hàng...</div>;
//         }

//         if (eligibleItems.length === 0) {
//             return (
//                 <div className="p-8 text-center">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                         <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                     <h3 className="mt-4 text-lg font-medium text-gray-900">Hoàn Tất</h3>
//                     <p className="mt-2 text-sm text-gray-600">
//                         Bạn đã gửi yêu cầu cho tất cả sản phẩm trong đơn hàng này.
//                     </p>
//                     <button type="button" onClick={handleClose} className="mt-6 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
//                         Đóng
//                     </button>
//                 </div>
//             );
//         }

//         return (
//             <form onSubmit={handleSubmit} className="space-y-6 mt-12">
//                 <div>
//                     <label className="block text-sm font-semibold text-gray-800 mb-2">
//                         Chọn sản phẩm cần xử lý <span className="text-red-500">*</span>
//                     </label>
//                     <div className="space-y-3">
//                         {order.items.map((item) => {
//                             const isItemEligible = eligibleItems.some(eligible => eligible.OrderItemID === item.OrderItemID);
//                             return (
//                                 <label
//                                     key={item.OrderItemID}
//                                     htmlFor={`item-${item.OrderItemID}`}
//                                     className={`relative flex items-center gap-4 p-3 border rounded-lg transition-all ${isItemEligible ? 'cursor-pointer' : 'cursor-not-allowed bg-gray-50 opacity-70'} ${selectedItemId === item.OrderItemID ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50' : 'border-gray-200'} ${isItemEligible && selectedItemId !== item.OrderItemID ? 'hover:border-gray-400' : ''}`}
//                                 >
//                                     <input
//                                         type="radio" id={`item-${item.OrderItemID}`} name="selectedItem"
//                                         value={item.OrderItemID}
//                                         onChange={() => setSelectedItemId(item.OrderItemID)}
//                                         checked={selectedItemId === item.OrderItemID}
//                                         disabled={!isItemEligible}
//                                         className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 disabled:bg-gray-200"
//                                     />
//                                     <img src={getFullImageUrl(item.productImageURL)} alt={item.productName} width={64} height={64} className="h-16 w-16 object-cover rounded-md" />
//                                     <div className="text-sm flex-1">
//                                         <p className="font-medium text-gray-900">{item.productName}</p>
//                                         <p className="text-gray-500">Phân loại: {item.classification}</p>
//                                         <p className="text-gray-500">Số lượng: {item.Quantity}</p>
//                                     </div>
//                                     {!isItemEligible && (
//                                         <span className="text-xs font-semibold text-white bg-yellow-600 px-2 py-1 rounded-full">
//                                             Đã Yêu Cầu
//                                         </span>
//                                     )}
//                                 </label>
//                             );
//                         })}
//                     </div>
//                 </div>

//                 <div>
//                     <label className="block text-sm font-semibold text-gray-800 mb-2">Loại yêu cầu <span className="text-red-500">*</span></label>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                         <label className={`flex flex-col p-3 border rounded-lg cursor-pointer ${requestType === 'Return' ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50' : 'border-gray-200'}`}>
//                             <div className="flex items-center">
//                                 <input type="radio" name="request_type" value="Return" checked={requestType === 'Return'} onChange={() => setRequestType('Return')} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
//                                 <span className="ml-3 font-medium text-gray-900">Trả hàng</span>
//                             </div>
//                             <p className="ml-7 text-xs text-gray-500">Gửi lại hàng cho người bán và nhận lại tiền.</p>
//                         </label>
//                         <label className={`flex flex-col p-3 border rounded-lg cursor-pointer ${requestType === 'Refund' ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50' : 'border-gray-200'}`}>
//                             <div className="flex items-center">
//                                 <input type="radio" name="request_type" value="Refund" checked={requestType === 'Refund'} onChange={() => setRequestType('Refund')} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
//                                 <span className="ml-3 font-medium text-gray-900">Hoàn tiền</span>
//                             </div>
//                             <p className="ml-7 text-xs text-gray-500">Nhận lại tiền mà không cần gửi lại hàng.</p>
//                         </label>
//                     </div>
//                 </div>
//                 <div>
//                     <label htmlFor="details" className="block text-sm font-semibold text-gray-800 mb-1">Lý do chi tiết <span className="text-red-500">*</span></label>
//                     <textarea id="details" rows={4} value={reasonDescription} onChange={(e) => setReasonDescription(e.target.value)} placeholder="Mô tả tình trạng sản phẩm, ví dụ: Sản phẩm bị móp, không lên nguồn..." className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></textarea>
//                 </div>
//                 <div>
//                     <label className="block text-sm font-semibold text-gray-800 mb-1">Bằng chứng (tối đa 5 ảnh)</label>
//                     <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-indigo-500" onClick={() => fileInputRef.current?.click()}>
//                         <div className="space-y-1 text-center">
//                             <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
//                                 <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
//                             </svg>
//                             <div className="flex text-sm text-gray-600">
//                                 <p className="pl-1">Tải ảnh lên hoặc kéo thả</p>
//                             </div>
//                             <p className="text-xs text-gray-500">PNG, JPG, JPEG</p>
//                         </div>
//                     </div>
//                     <input type="file" id="evidence" ref={fileInputRef} multiple accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} className="hidden" />
//                     {previewUrls.length > 0 && (
//                         <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
//                             {previewUrls.map((url, index) => (
//                                 <div key={url} className="relative group">
//                                     <img src={url} alt={`Preview ${index}`} className="h-24 w-full object-cover rounded-md" />
//                                     <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Xóa ảnh">×</button>
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </div>

//                 {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md"><p className="text-sm text-red-700">{error}</p></div>}

//                 <div className="pt-4 flex justify-end gap-3 border-t border-gray-200">
//                     <button type="button" onClick={handleClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50" disabled={isSubmitting}>Hủy</button>
//                     <button type="submit" disabled={isSubmitting || !selectedItemId} className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-semibold text-white hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed">
//                         {isSubmitting && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
//                         {isSubmitting ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
//                     </button>
//                 </div>
//             </form>
//         );
//     };

//     return (
//         <Modal isOpen={isOpen} onClose={handleClose} title="Yêu Cầu Trả Hàng/Hoàn Tiền">
//             {renderContent()}
//         </Modal>
//     );
// };

// export default ReturnRequestModal;
// src/app/(main)/(account)/components/modals/ReturnRequestModal.tsx
'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal';
import { Order, OrderItem, Address } from '@/types'; // Giả sử bạn đã định nghĩa Address trong file types
import { getFullImageUrl } from '@/services/api';

// Props cho component
interface ReturnRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (message: string) => void;
    order: Order | null;
    token: string;
}

// Định nghĩa kiểu cho đối tượng địa chỉ trả hàng mà component sẽ quản lý
interface ReturnAddress {
    full_name: string;
    phone_number: string;
    address_line: string;
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

    // Sửa lỗi TypeScript bằng cách khởi tạo giá trị mặc định
    const [returnAddress, setReturnAddress] = useState<ReturnAddress>({
        full_name: '',
        phone_number: '',
        address_line: '',
    });
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [addressError, setAddressError] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- LOGIC ---
    const eligibleItems = order?.items.filter(
        (item) => item.ReturnStatus === null || item.ReturnStatus === 'None'
    ) || [];

    // --- CÁC HÀM XỬ LÝ ---
    const resetForm = useCallback(() => {
        setSelectedItemId(null);
        setRequestType('Return');
        setReasonDescription('');
        setEvidenceFiles([]);
        setPreviewUrls([]);
        setReturnAddress({ full_name: '', phone_number: '', address_line: '' });
        setIsEditingAddress(false);
        setAddressError(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, []);
    useEffect(() => {
        if (isOpen && order) {
            resetForm();

            const fetchDefaultAddress = async () => {
                // Chỉ chạy khi token đã được truyền vào từ OrderCard
                if (!token) {
                    console.error("ReturnRequestModal: Chưa nhận được token từ component cha.");
                    setIsEditingAddress(true); // Cho phép nhập tay nếu không có token
                    return;
                }

                if (!order.ShippingAddressID) {
                    setIsEditingAddress(true);
                    return;
                }

                console.log("ReturnRequestModal: Đang sử dụng token để fetch địa chỉ:", token);

                try {
                    const response = await fetch(`http://localhost:8001/api/addresses/${order.ShippingAddressID}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`, // Dùng token từ props
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                    });

                    if (!response.ok) {
                        throw new Error(`Request failed with status code ${response.status}`);
                    }

                    const fetchedAddress: Address = await response.json();
                    setReturnAddress({
                        full_name: fetchedAddress.FullName,
                        phone_number: fetchedAddress.PhoneNumber,
                        address_line: `${fetchedAddress.Street}, ${fetchedAddress.Ward}, ${fetchedAddress.District}, ${fetchedAddress.City}`
                    });
                    setIsEditingAddress(false);

                } catch (err) {
                    console.error("Không thể tải địa chỉ mặc định (dùng fetch):", err);
                    setIsEditingAddress(true);
                }
            };

            fetchDefaultAddress();
        }
    }, [isOpen, order, token, resetForm]);
    const handleClose = () => {
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
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Trong file ReturnRequestModal.tsx

    const validateAddress = (): boolean => {
        // 1. Lấy và làm sạch dữ liệu đầu vào
        const fullName = returnAddress.full_name?.trim();
        const phoneNumber = returnAddress.phone_number?.trim();
        const addressLine = returnAddress.address_line?.trim();

        // --- VALIDATION HỌ VÀ TÊN ---
        if (!fullName) {
            setAddressError('Vui lòng nhập họ và tên người gửi.');
            return false;
        }
        // Regex /\d/ kiểm tra xem có bất kỳ chữ số nào trong chuỗi không
        if (/\d/.test(fullName)) {
            setAddressError('Họ và tên không được chứa chữ số.');
            return false;
        }

        // --- VALIDATION SỐ ĐIỆN THOẠI ---
        if (!phoneNumber) {
            setAddressError('Vui lòng nhập số điện thoại.');
            return false;
        }
        if (!/^\d+$/.test(phoneNumber)) {
            setAddressError('Số điện thoại chỉ được chứa các chữ số.');
            return false;
        }
        if (phoneNumber.length !== 10) {
            setAddressError('Số điện thoại phải có đúng 10 chữ số.');
            return false;
        }
        if (!phoneNumber.startsWith('0')) {
            setAddressError('Số điện thoại phải bắt đầu bằng số 0.');
            return false;
        }

        // --- VALIDATION ĐỊA CHỈ CHI TIẾT ---
        if (!addressLine) {
            setAddressError('Vui lòng nhập địa chỉ chi tiết.');
            return false;
        }

        // Nếu tất cả đều hợp lệ
        setAddressError(null); // Xóa thông báo lỗi
        return true; // Validation thành công
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setError(null);
        if (!selectedItemId) { setError('Vui lòng chọn một sản phẩm để yêu cầu.'); return; }
        if (!validateAddress()) { return; }
        if (!reasonDescription.trim()) { setError('Vui lòng cung cấp lý do chi tiết.'); return; }

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('order_item_id', selectedItemId.toString());
        formData.append('request_type', requestType);
        formData.append('reason_description', reasonDescription);

        formData.append('buyer_return_address[full_name]', returnAddress.full_name);
        formData.append('buyer_return_address[phone_number]', returnAddress.phone_number);
        formData.append('buyer_return_address[address_line]', returnAddress.address_line);

        evidenceFiles.forEach(file => {
            formData.append('evidence_images[]', file);
        });

        try {
            const response = await axios.post('http://localhost:8001/api/buyer/return-requests', formData, {
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
                withCredentials: true,
            });
            if (response.status === 201) {
                onSuccess(response.data.message || 'Yêu cầu của bạn đã được gửi thành công!');
                handleClose();
            }
        } catch (err: any) {
            console.error('Lỗi khi gửi yêu cầu:', err);
            const errorMessage = err.response?.data?.message || err.response?.data?.errors || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
            setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- PHẦN RENDER GIAO DIỆN ---
    const renderContent = () => {
        if (!order) {
            return <div className="p-6 text-center text-gray-500">Đang tải thông tin đơn hàng...</div>;
        }

        if (eligibleItems.length === 0) {
            return (
                <div className="p-8 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Hoàn Tất</h3>
                    <p className="mt-2 text-sm text-gray-600">
                        Bạn đã gửi yêu cầu cho tất cả sản phẩm trong đơn hàng này.
                    </p>
                    <button type="button" onClick={handleClose} className="mt-6 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
                        Đóng
                    </button>
                </div>
            );
        }

        return (
            <form onSubmit={handleSubmit} className="space-y-6 mt-12">
                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Chọn sản phẩm cần xử lý <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-3">
                        {order.items.map((item) => {
                            const isItemEligible = eligibleItems.some(eligible => eligible.OrderItemID === item.OrderItemID);
                            return (
                                <label
                                    key={item.OrderItemID}
                                    htmlFor={`item-${item.OrderItemID}`}
                                    className={`relative flex items-center gap-4 p-3 border rounded-lg transition-all ${isItemEligible ? 'cursor-pointer' : 'cursor-not-allowed bg-gray-50 opacity-70'} ${selectedItemId === item.OrderItemID ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50' : 'border-gray-200'} ${isItemEligible && selectedItemId !== item.OrderItemID ? 'hover:border-gray-400' : ''}`}
                                >
                                    <input
                                        type="radio" id={`item-${item.OrderItemID}`} name="selectedItem"
                                        value={item.OrderItemID}
                                        onChange={() => setSelectedItemId(item.OrderItemID)}
                                        checked={selectedItemId === item.OrderItemID}
                                        disabled={!isItemEligible}
                                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 disabled:bg-gray-200"
                                    />
                                    <img src={getFullImageUrl(item.productImageURL)} alt={item.productName} width={64} height={64} className="h-16 w-16 object-cover rounded-md" />
                                    <div className="text-sm flex-1">
                                        <p className="font-medium text-gray-900">{item.productName}</p>
                                        <p className="text-gray-500">Phân loại: {item.classification}</p>
                                        <p className="text-gray-500">Số lượng: {item.Quantity}</p>
                                    </div>
                                    {!isItemEligible && (
                                        <span className="text-xs font-semibold text-white bg-yellow-600 px-2 py-1 rounded-full">
                                            Đã Yêu Cầu
                                        </span>
                                    )}
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Địa chỉ lấy hàng trả <span className="text-red-500">*</span>
                    </label>
                    {!isEditingAddress ? (
                        <div className="p-4 border rounded-lg bg-gray-50 flex justify-between items-start">
                            <div className="text-sm">
                                <p className="font-semibold">{returnAddress.full_name}</p>
                                <p className="text-gray-600">{returnAddress.phone_number}</p>
                                <p className="text-gray-600 mt-1">{returnAddress.address_line}</p>
                            </div>
                            <button type="button" onClick={() => setIsEditingAddress(true)} className="flex-shrink-0 ml-4 text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                Thay đổi
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3 p-4 border rounded-lg">
                            <div>
                                <label htmlFor="fullName" className="text-xs font-medium text-gray-600">Họ và tên</label>
                                <input type="text" id="fullName" value={returnAddress.full_name}
                                    onChange={(e) => setReturnAddress(prev => ({ ...prev, full_name: e.target.value }))}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                            </div>
                            <div>
                                <label htmlFor="phoneNumber" className="text-xs font-medium text-gray-600">Số điện thoại</label>
                                <input type="text" id="phoneNumber" value={returnAddress.phone_number}
                                    onChange={(e) => setReturnAddress(prev => ({ ...prev, phone_number: e.target.value }))}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                            </div>
                            <div>
                                <label htmlFor="addressLine" className="text-xs font-medium text-gray-600">Địa chỉ chi tiết (Số nhà, Đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố)</label>
                                <textarea id="addressLine" rows={3} value={returnAddress.address_line}
                                    onChange={(e) => setReturnAddress(prev => ({ ...prev, address_line: e.target.value }))}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                            </div>
                            <div className="text-right">
                                <button type="button" onClick={() => { if (validateAddress()) setIsEditingAddress(false); }} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                    Xác nhận địa chỉ
                                </button>
                            </div>
                        </div>
                    )}
                    {addressError && <p className="text-xs text-red-600 mt-1">{addressError}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Loại yêu cầu <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className={`flex flex-col p-3 border rounded-lg cursor-pointer ${requestType === 'Return' ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50' : 'border-gray-200'}`}>
                            <div className="flex items-center">
                                <input type="radio" name="request_type" value="Return" checked={requestType === 'Return'} onChange={() => setRequestType('Return')} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                                <span className="ml-3 font-medium text-gray-900">Trả hàng</span>
                            </div>
                            <p className="ml-7 text-xs text-gray-500">Gửi lại hàng cho người bán và nhận lại tiền.</p>
                        </label>
                        <label className={`flex flex-col p-3 border rounded-lg cursor-pointer ${requestType === 'Refund' ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50' : 'border-gray-200'}`}>
                            <div className="flex items-center">
                                <input type="radio" name="request_type" value="Refund" checked={requestType === 'Refund'} onChange={() => setRequestType('Refund')} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                                <span className="ml-3 font-medium text-gray-900">Hoàn tiền</span>
                            </div>
                            <p className="ml-7 text-xs text-gray-500">Nhận lại tiền mà không cần gửi lại hàng.</p>
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
                        <div className="space-y-1 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                            </svg>
                            <div className="flex text-sm text-gray-600">
                                <p className="pl-1">Tải ảnh lên hoặc kéo thả</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, JPEG</p>
                        </div>
                    </div>
                    <input type="file" id="evidence" ref={fileInputRef} multiple accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} className="hidden" />
                    {previewUrls.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {previewUrls.map((url, index) => (
                                <div key={url} className="relative group">
                                    <img src={url} alt={`Preview ${index}`} className="h-24 w-full object-cover rounded-md" />
                                    <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Xóa ảnh">×</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {(error || addressError) && <div className="p-3 bg-red-50 border border-red-200 rounded-md"><p className="text-sm text-red-700">{error || addressError}</p></div>}

                <div className="pt-4 flex justify-end gap-3 border-t border-gray-200">
                    <button type="button" onClick={handleClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50" disabled={isSubmitting}>Hủy</button>
                    <button type="submit" disabled={isSubmitting || !selectedItemId} className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-semibold text-white hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed">
                        {isSubmitting && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                        {isSubmitting ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
                    </button>
                </div>
            </form>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Yêu Cầu Trả Hàng/Hoàn Tiền">
            {renderContent()}
        </Modal>
    );
};

export default ReturnRequestModal;