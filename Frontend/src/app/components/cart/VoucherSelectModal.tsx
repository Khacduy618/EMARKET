

// src/app/components/VoucherSelectModal.tsx
'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Loader2, Tag, Store, Truck, DollarSign, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { Voucher, VoucherCouponType, FetchVouchersResponse, AppliedVouchersCombined } from '@/types';
import { fetchEligiblePlatformVouchers } from '@/services/voucher';

interface VoucherSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyVouchers: (vouchers: AppliedVouchersCombined | null) => void; // Thay đổi tên hàm và kiểu dữ liệu
    initialAppliedVouchers?: AppliedVouchersCombined | null; // Thay đổi kiểu dữ liệu
    currentCartTotal?: number;
}

const VoucherSelectModal: React.FC<VoucherSelectModalProps> = ({
    isOpen,
    onClose,
    onApplyVouchers, // Đã đổi tên
    initialAppliedVouchers, // Đã đổi kiểu dữ liệu, cung cấp giá trị mặc định
    currentCartTotal = 0
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [platformVouchers, setPlatformVouchers] = useState<Voucher[]>([]);

    // NEW: State cho ID của voucher FreeShip được chọn
    const [selectedFreeShipVoucherId, setSelectedFreeShipVoucherId] = useState<number | null>(null);
    // NEW: State cho ID của voucher SaleOff được chọn
    const [selectedSaleOffVoucherId, setSelectedSaleOffVoucherId] = useState<number | null>(null);

    const [manualVoucherCode, setManualVoucherCode] = useState<string>('');

    
    const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info', duration: number = 3000) => {
        switch (type) {
            case 'success':
                toast.success(message, { autoClose: duration });
                break;
            case 'error':
                toast.error(message, { autoClose: duration });
                break;
            case 'warning':
                toast.warn(message, { autoClose: duration });
                break;
            case 'info':
                toast.info(message, { autoClose: duration });
                break;
            default:
                toast.info(message, { autoClose: duration });
        }
    }, []);

    const loadVouchers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchEligiblePlatformVouchers();
            setPlatformVouchers(data.platformVouchers || []);
        } catch (err: any) {
            console.error("Failed to fetch vouchers:", err);
            const errorMessage = err.response?.data?.message || 'Không thể tải voucher. Vui lòng thử lại.';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

     useEffect(() => {
        if (isOpen) {
            // Đồng bộ state lựa chọn với giá trị ban đầu khi mở modal
            setSelectedFreeShipVoucherId(initialAppliedVouchers?.freeShipVoucher?.VoucherID || null);
            setSelectedSaleOffVoucherId(initialAppliedVouchers?.saleOffVoucher?.VoucherID || null);
            setManualVoucherCode(''); // Luôn reset mã nhập tay khi mở modal
            loadVouchers();
        }
    }, [isOpen, initialAppliedVouchers, loadVouchers]);


    // NEW: Hàm xử lý lựa chọn voucher theo từng loại
    const handleSelectVoucherOfType = (type: VoucherCouponType, voucherId: number) => {
        setManualVoucherCode(''); // Luôn xóa input thủ công khi chọn radio button
        if (type === 'FreeShip') {
            // Nếu click vào voucher FreeShip đang được chọn, thì bỏ chọn
            setSelectedFreeShipVoucherId(prevId => (prevId === voucherId ? null : voucherId));
        } else if (type === 'SaleOff') {
            // Nếu click vào voucher SaleOff đang được chọn, thì bỏ chọn
            setSelectedSaleOffVoucherId(prevId => (prevId === voucherId ? null : voucherId));
        }
        // KHÔNG CÒN DÒNG NÀO BỎ CHỌN LOẠI KHÁC.
    };

    // const handleManualCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setManualVoucherCode(e.target.value);
    //     setSelectedFreeShipVoucherId(null); // Bỏ chọn cả hai loại nếu nhập mã thủ công
    //     setSelectedSaleOffVoucherId(null);
    // };
    const handleManualCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const code = e.target.value.toUpperCase();
        setManualVoucherCode(code);
        // Khi người dùng bắt đầu gõ, bỏ chọn các radio button để tránh nhầm lẫn
        if (code.length > 0) {
            setSelectedFreeShipVoucherId(null);
            setSelectedSaleOffVoucherId(null);
        }
    };


    // Hàm định dạng hiển thị giá trị giảm giá
    const formatDiscount = (voucher: Voucher) => {
        if (voucher.DiscountType === 'Percentage') {
            let discountString = `${voucher.DiscountValue}%`;
            if (typeof voucher.MaxValueForPercentage === 'number' && voucher.MaxValueForPercentage > 0) {
                discountString += ` (tối đa ${voucher.MaxValueForPercentage.toLocaleString('vi-VN')}₫)`;
            }
            return discountString;
        } else { // FixedAmount
            return `${voucher.DiscountValue.toLocaleString('vi-VN')}₫`;
        }
    };

    // Hàm lấy trạng thái hiển thị của voucher
    const getVoucherEligibilityText = (voucher: Voucher) => {
        const now = new Date();
        const expiresAt = new Date(voucher.EndDate);
        const startsAt = new Date(voucher.StartDate);

        if (voucher.IsActive === false) {
            return 'Không hoạt động.';
        }
        if (now < startsAt) {
            return `Chưa có hiệu lực (từ: ${startsAt.toLocaleDateString('vi-VN')}).`;
        }
        if (now > expiresAt) {
            return `Đã hết hạn vào: ${expiresAt.toLocaleDateString('vi-VN')}.`;
        }

        if (typeof voucher.UsageLimitTotal === 'number' && voucher.TimesUsed >= voucher.UsageLimitTotal) {
            return 'Đã hết lượt sử dụng (toàn bộ).';
        }
        if (typeof voucher.UsageLimitPerUser === 'number' && typeof voucher.TimesUsedByUser === 'number' && voucher.TimesUsedByUser >= voucher.UsageLimitPerUser) {
             return `Bạn đã hết lượt sử dụng (${voucher.TimesUsedByUser}/${voucher.UsageLimitPerUser} lượt).`;
        }
        if (voucher.MinOrderValue > 0 && currentCartTotal < voucher.MinOrderValue) {
            return `Chưa đủ điều kiện (Đơn tối thiểu: ${voucher.MinOrderValue.toLocaleString('vi-VN')}₫).`;
        }
        
        return 'Có thể sử dụng.';
    };

    // Hàm kiểm tra xem voucher có đủ điều kiện để chọn radio button không
    const isVoucherSelectable = (voucher: Voucher): boolean => {
        const now = new Date();
        const expiresAt = new Date(voucher.EndDate);
        const startsAt = new Date(voucher.StartDate);

        if (!voucher.IsActive) return false;
        if (now < startsAt) return false;
        if (now > expiresAt) return false;
        if (typeof voucher.UsageLimitTotal === 'number' && voucher.TimesUsed >= voucher.UsageLimitTotal) return false;
        if (typeof voucher.UsageLimitPerUser === 'number' && typeof voucher.TimesUsedByUser === 'number' && voucher.TimesUsedByUser >= voucher.UsageLimitPerUser) return false;
        if (voucher.MinOrderValue > 0 && currentCartTotal < voucher.MinOrderValue) return false;

        return true;
    };


    const handleApplyButtonClick = () => {
        // Ưu tiên xử lý mã nhập tay NẾU có
        if (manualVoucherCode.trim()) {
            applyManualCode();
            return;
        }

        // Nếu không có mã nhập tay, xử lý các lựa chọn radio
        let appliedFreeShip: Voucher | null = null;
        let appliedSaleOff: Voucher | null = null;
        let hasInvalidSelection = false;

        // Xử lý FreeShip Voucher đã chọn
        if (selectedFreeShipVoucherId) {
            const voucher = platformVouchers.find(v => v.VoucherID === selectedFreeShipVoucherId);
            if (voucher && isVoucherSelectable(voucher)) {
                appliedFreeShip = voucher;
            } else if (voucher) {
                toast.error(`Voucher FreeShip "${voucher.Code}" không đủ điều kiện.`);
                hasInvalidSelection = true;
            }
        }
        
        // Xử lý SaleOff Voucher đã chọn
        if (selectedSaleOffVoucherId) {
            const voucher = platformVouchers.find(v => v.VoucherID === selectedSaleOffVoucherId);
            if (voucher && isVoucherSelectable(voucher)) {
                appliedSaleOff = voucher;
            } else if (voucher) {
                toast.error(`Voucher Giảm giá "${voucher.Code}" không đủ điều kiện.`);
                hasInvalidSelection = true;
            }
        }

        // Nếu có lựa chọn không hợp lệ, dừng lại
        if (hasInvalidSelection) {
            return;
        }

        // Nếu mọi thứ hợp lệ, áp dụng voucher và đóng modal
        onApplyVouchers({ freeShipVoucher: appliedFreeShip, saleOffVoucher: appliedSaleOff });
        
        let message = "Đã cập nhật lựa chọn voucher.";
        if (!appliedFreeShip && !appliedSaleOff) {
            message = "Đã hủy bỏ tất cả voucher toàn sàn.";
        }
        
        toast.success(message);
        onClose();
    };
    
    const applyManualCode = () => {
        const codeToApply = manualVoucherCode.trim();
        const allVouchers = [...platformVouchers]; // Tìm trong tất cả voucher đã fetch
        const foundVoucher = allVouchers.find(v => v.Code.toUpperCase() === codeToApply);

        if (!foundVoucher) {
            toast.error(`Không tìm thấy mã voucher "${codeToApply}".`);
            return;
        }

        if (!isVoucherSelectable(foundVoucher)) {
            const reason = getVoucherEligibilityText(foundVoucher);
            toast.error(`Voucher "${codeToApply}" không đủ điều kiện: ${reason}`);
            return;
        }

        // Tìm các voucher đang được áp dụng từ state ban đầu (initialAppliedVouchers)
        const newAppliedVouchers: AppliedVouchersCombined = {
            freeShipVoucher: initialAppliedVouchers?.freeShipVoucher || null,
            saleOffVoucher: initialAppliedVouchers?.saleOffVoucher || null,
        };
        
        if (foundVoucher.VoucherType === 'FreeShip') {
            newAppliedVouchers.freeShipVoucher = foundVoucher; // Thay thế voucher FreeShip
            toast.success(`Đã áp dụng voucher FreeShip: ${foundVoucher.Code}`);
        } else if (foundVoucher.VoucherType === 'SaleOff') {
            newAppliedVouchers.saleOffVoucher = foundVoucher; // Thay thế voucher SaleOff
            toast.success(`Đã áp dụng voucher giảm giá: ${foundVoucher.Code}`);
        }

        onApplyVouchers(newAppliedVouchers);
        onClose();
    };


    if (!isOpen) return null;

    // Lọc ra các voucher để hiển thị trong modal này (chỉ platform vouchers)
    const freeShipPlatformVouchers = platformVouchers.filter(v => v.VoucherType === 'FreeShip');
    const saleOffPlatformVouchers = platformVouchers.filter(v => v.VoucherType === 'SaleOff');


    return (
        <div className="fixed inset-0 flex mt-[100px] items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg border-t shadow-lg w-full max-w-lg mx-4 relative flex flex-col max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b">
                    <h2 className="text-xl font-bold text-black">Chọn Mã Giảm Giá</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <XCircle className="h-6 w-6" />
                    </button>
                </div>

                {/* Manual Voucher Input */}
                <div className="my-4">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            placeholder="Nhập mã voucher"
                            value={manualVoucherCode}
                            onChange={handleManualCodeChange}
                            className="flex-grow p-2 border text-black rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-semibold hover:bg-gray-300 transition"
                            onClick={handleApplyButtonClick} // Chỉ cần gọi hàm này
                        >
                            Áp dụng
                        </button>
                    </div>
                </div>

                {/* Voucher List Sections */}
                <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                    ) : error ? (
                        <p className="text-red-500 text-center">{error}</p>
                    ) : (
                        <div className="space-y-6">
                            {/* FreeShip Vouchers (Platform only) */}
                            <VoucherSection
                                title="Mã Miễn Phí Vận Chuyển"
                                icon={Truck}
                                vouchers={freeShipPlatformVouchers}
                                selectedVoucherId={selectedFreeShipVoucherId} // Truyền selected ID riêng cho FreeShip
                                handleSelectVoucher={(id) => handleSelectVoucherOfType('FreeShip', id)} // Gửi loại voucher và ID
                                isVoucherSelectable={isVoucherSelectable}
                                getVoucherEligibilityText={getVoucherEligibilityText}
                                formatDiscount={formatDiscount}
                                currentCartTotal={currentCartTotal}
                                radioGroupName="free_ship_vouchers" // Tên nhóm radio riêng cho FreeShip
                            />

                            {/* SaleOff Vouchers (Platform only) */}
                            <VoucherSection
                                title="Mã Giảm Giá Toàn Sàn"
                                icon={DollarSign}
                                vouchers={saleOffPlatformVouchers}
                                selectedVoucherId={selectedSaleOffVoucherId} // Truyền selected ID riêng cho SaleOff
                                handleSelectVoucher={(id) => handleSelectVoucherOfType('SaleOff', id)} // Gửi loại voucher và ID
                                isVoucherSelectable={isVoucherSelectable}
                                getVoucherEligibilityText={getVoucherEligibilityText}
                                formatDiscount={formatDiscount}
                                currentCartTotal={currentCartTotal}
                                radioGroupName="sale_off_vouchers" // Tên nhóm radio riêng cho SaleOff
                            />

                            {/* Placeholder for Shop Vouchers (if any are available but not displayed here) */}
                            {/* {shopVouchers.length > 0 && (
                                <p className="text-gray-600 text-center text-sm py-4">
                                    Bạn có {shopVouchers.length} voucher của shop. Vui lòng sử dụng tại modal chọn voucher của shop.
                                </p>
                            )} */}
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="flex-shrink-0 flex justify-end space-x-3 pt-4 border-t mt-4">
                    <button
                        onClick={() => { onApplyVouchers(null); onClose(); showNotification("Đã hủy bỏ áp dụng voucher.", 'info'); }}
                        className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md font-semibold hover:bg-gray-300 transition-colors"
                    >
                        TRỞ LẠI
                    </button>
                    <button
                        onClick={handleApplyButtonClick}
                        className="px-6 py-3 bg-red-500 text-white rounded-md font-semibold hover:bg-red-600 transition-colors"
                    >
                        ÁP DỤNG
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VoucherSelectModal;


// Sub-component for rendering voucher sections (e.g., FreeShip, SaleOff)
interface VoucherSectionProps {
    title: string;
    icon: React.ElementType;
    vouchers: Voucher[];
    selectedVoucherId: number | null; // ID của voucher được chọn trong section này
    handleSelectVoucher: (id: number) => void; // Hàm để báo ID được chọn lên parent
    isVoucherSelectable: (voucher: Voucher) => boolean;
    getVoucherEligibilityText: (voucher: Voucher) => string;
    formatDiscount: (voucher: Voucher) => string;
    currentCartTotal: number;
    radioGroupName: string; // NEW: Tên nhóm radio cho section này
}

const VoucherSection: React.FC<VoucherSectionProps> = ({
    title,
    icon: Icon,
    vouchers,
    selectedVoucherId,
    handleSelectVoucher,
    isVoucherSelectable,
    getVoucherEligibilityText,
    formatDiscount,
    currentCartTotal,
    radioGroupName // Nhận tên nhóm radio
}) => {
    // Chỉ hiển thị phần này nếu có voucher để render
    if (vouchers.length === 0) {
        return null; // Không render gì nếu không có voucher nào phù hợp trong phần này
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="font-semibold text-lg text-gray-800 flex items-center mb-2">
                <Icon className="h-5 w-5 mr-2 text-blue-500" /> {title}
            </h3>
            <div className="space-y-3">
                {vouchers.map(voucher => {
                    const selectable = isVoucherSelectable(voucher);
                    const isSelected = selectedVoucherId === voucher.VoucherID;

                    return (
                        <div
                            key={voucher.VoucherID}
                            className={`flex items-center space-x-3 p-3 border rounded-md transition cursor-pointer
                                ${selectable ? 'hover:border-blue-500' : 'opacity-50 cursor-not-allowed'}
                                ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                            `}
                            onClick={() => selectable && handleSelectVoucher(voucher.VoucherID)}
                        >
                            <input
                                type="radio"
                                name={radioGroupName} // Sử dụng tên nhóm radio từ prop
                                id={`voucher-${voucher.VoucherID}`}
                                value={voucher.VoucherID}
                                checked={isSelected}
                                onChange={() => handleSelectVoucher(voucher.VoucherID)}
                                disabled={!selectable}
                                className="form-radio h-4 w-4 text-blue-600"
                            />
                            <label htmlFor={`voucher-${voucher.VoucherID}`} className={`flex-grow block cursor-pointer ${!selectable ? 'text-gray-500' : ''}`}>
                                <div className="flex flex-row justify-between">
                                    <div className="font-medium text-gray-800">{voucher.Code}</div>
                                    <div className={`text-xs ${selectable ? 'text-gray-500' : 'text-red-500'}`}>
                                        {getVoucherEligibilityText(voucher)}
                                    </div>
                                </div>
                                <div className="text-red-600 font-bold">{formatDiscount(voucher)}</div>
                                {voucher.MinOrderValue > 0 && (
                                    <div className="text-sm text-gray-600">Đơn tối thiểu: {voucher.MinOrderValue.toLocaleString('vi-VN')}₫</div>
                                )}
                               
                                {voucher.Scope === 'Shop' && voucher.shopName && (
                                    <div className="text-xs text-gray-700 flex items-center mt-1">
                                        <Store className="h-3 w-3 mr-1" /> Từ: {voucher.shopName}
                                    </div>
                                )}
                            </label>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};