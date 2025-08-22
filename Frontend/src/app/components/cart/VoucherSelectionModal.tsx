import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, X, Ticket, AlertTriangle, Info } from 'lucide-react';
import { Voucher } from '@/types'; // Đảm bảo đường dẫn này đúng
import { fetchUserShopVouchers } from '@/services/voucher'; // Đảm bảo đường dẫn này đúng
import { toast } from 'react-toastify';

// --- Props Interface ---
interface VoucherSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    shopId: number | null;
    selectedItemsSubtotal: number; // Tổng tiền các sản phẩm đã được chọn cho shop này
//   currentAppliedVoucherCode?: string | null; // Mã voucher hiện tại đang được áp dụng (nếu có)
//   onApplyVoucher: (voucherCode: string | null) => void; // Callback để áp dụng voucher
    currentAppliedVoucher?: Voucher | null; // Sửa từ currentAppliedVoucherCode
    onApplyVoucher: (voucher: Voucher | null) => void;
}

// --- Helper Functions ---
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// --- Sub-component cho từng Voucher Item ---
interface VoucherItemProps {
    voucher: Voucher; // Thêm reason để hiển thị lý do không hợp lệ
    isEligible: boolean;
    isSelected: boolean;
    onSelect: (voucherCode: string | null) => void; 
    reason?: string
}

const VoucherItem: React.FC<VoucherItemProps> = ({ voucher, isEligible, isSelected, onSelect, reason }) => {
    const handleItemClick = () => {
        if (isEligible) {
            // **LOGIC MỚI:** Nếu đang được chọn, gọi onSelect(null) để bỏ chọn.
            // Nếu không, gọi onSelect(voucher.Code) để chọn.
            onSelect(isSelected ? null : voucher.Code);
        }
    };
    // Tạo text mô tả giảm giá
    const discountText = voucher.DiscountType === 'Percentage'
        ? `Giảm ${voucher.DiscountValue}%` + (voucher.MaxValueForPercentage ? `, tối đa ${formatPrice(voucher.MaxValueForPercentage)}` : '')
        : `Giảm ${formatPrice(voucher.DiscountValue)}`;
    
    // Tạo text mô tả loại voucher
    const voucherTypeText = voucher.VoucherType === 'FreeShip' ? 'Miễn phí vận chuyển' : 'Giảm giá';

    return (
        <div className={`flex items-start gap-3 p-3 border-l-4 mb-3 bg-white rounded-r-md transition-opacity ${isEligible ? 'border-blue-500' : 'border-red-400 opacity-60'}`} onClick={handleItemClick}>
            <div className={`w-1/4 flex-shrink-0 text-center font-bold p-4 rounded-md flex flex-col justify-center items-center ${isEligible ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                <Ticket size={24}/>
                <span className='mt-1 text-xs'>{voucherTypeText}</span>
            </div>
            <div className="flex-grow">
                <p className="font-bold text-gray-800">{discountText}</p>
                <p className="text-sm text-gray-600">Đơn tối thiểu {formatPrice(voucher.MinOrderValue)}</p>
                <p className="text-xs text-gray-400 mt-1">HSD: {new Date(voucher.EndDate).toLocaleDateString('vi-VN')}</p>
                 {!isEligible && reason && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-red-600 font-medium">
                        <AlertTriangle size={14} />
                        <span>{reason}</span>
                    </div>
                )}
            </div>
            {isEligible && (
                <div className="flex items-center justify-center h-full pl-2">
                    <input
                        type="radio"
                        name="shop-voucher"
                        checked={isSelected}
                        onChange={handleItemClick}
                        className="w-5 h-5 cursor-pointer accent-blue-600"
                    />
                </div>
            )}
        </div>
    );
}


// --- Main Modal Component ---
const VoucherSelectionModal: React.FC<VoucherSelectionModalProps> = ({
    isOpen,
    onClose,
    shopId,
    selectedItemsSubtotal,
    // currentAppliedVoucherCode,
    currentAppliedVoucher,
    onApplyVoucher,
}) => {
    // --- State Management ---
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedVoucherCode, setSelectedVoucherCode] = useState<string | null>(null);
    const [codeInput, setCodeInput] = useState('');

    // --- Data Fetching Effect ---
    useEffect(() => {
        // Chỉ fetch khi modal được mở và có shopId
        if (isOpen && shopId) {
            setLoading(true);
            setError(null);
            setVouchers([]);
            setCodeInput('');
            setSelectedVoucherCode(currentAppliedVoucher?.Code || null); // Khôi phục lựa chọn cũ khi mở lại modal

            fetchUserShopVouchers(shopId)
                .then(response => {
                    setVouchers(response.vouchers);
                })
                .catch(err => {
                    setError('Không thể tải danh sách voucher. Vui lòng thử lại.');
                    console.error("Fetch voucher error:", err);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [isOpen, shopId, currentAppliedVoucher]);

    const checkVoucherEligibility = (
        voucher: Voucher,
        currentSubtotal: number
    ): { isEligible: boolean; reason: string } => {
        // Điều kiện 1: Tổng lượt sử dụng
        if (voucher.UsageLimitTotal !== null && voucher.TimesUsed >= voucher.UsageLimitTotal) {
            return { isEligible: false, reason: 'Voucher đã hết lượt sử dụng.' };
        }
        // Điều kiện 2: Lượt sử dụng của người dùng
        if (voucher.UsageLimitPerUser !== null && (voucher.TimesUsedByUser ?? 0) >= voucher.UsageLimitPerUser) {
            return { isEligible: false, reason: 'Bạn đã hết lượt sử dụng voucher này.' };
        }
        // Điều kiện 3: Giá trị đơn hàng tối thiểu
        if (currentSubtotal < voucher.MinOrderValue) {
            return { isEligible: false, reason: `Cần mua thêm ${formatPrice(voucher.MinOrderValue - currentSubtotal)} để sử dụng.` };
        }

        // Nếu qua hết các điều kiện
        return { isEligible: true, reason: '' };
    };

    
    // --- Core Logic: Phân loại voucher ---
     const { eligibleVouchers, ineligibleVouchers } = useMemo(() => {
        const eligible: Voucher[] = [];
        const ineligible: (Voucher & { reason: string })[] = [];

        vouchers.forEach(voucher => {
            const { isEligible, reason } = checkVoucherEligibility(voucher, selectedItemsSubtotal);
            if (isEligible) {
                eligible.push(voucher);
            } else {
                ineligible.push({ ...voucher, reason });
            }
        });

        return { eligibleVouchers: eligible, ineligibleVouchers: ineligible };
    }, [vouchers, selectedItemsSubtotal]);

     const applyVoucherFromCodeInput = () => {
        const trimmedCode = codeInput.trim();
        if (!trimmedCode) {
            toast.warn('Vui lòng nhập một mã voucher.');
            return;
        }

        const foundVoucher = vouchers.find(v => v.Code.toUpperCase() === trimmedCode.toUpperCase());

        if (foundVoucher) {
            const { isEligible, reason } = checkVoucherEligibility(foundVoucher, selectedItemsSubtotal);
            if (isEligible) {
                setSelectedVoucherCode(foundVoucher.Code);
                toast.success(`Đã chọn voucher: ${foundVoucher.Code}`);
            } else {
                toast.error(`Voucher không hợp lệ. Lý do: ${reason || 'Không rõ'}`);
            }
        } else {
            toast.error('Không tìm thấy mã voucher này.');
        }
    };

    // --- Event Handlers ---
    const handleApply = () => {
        // onApplyVoucher(selectedVoucherCode);
        // onClose();
         if (selectedVoucherCode) {
            // Tìm toàn bộ đối tượng voucher từ danh sách
            const voucherToApply = vouchers.find(v => v.Code === selectedVoucherCode);
            onApplyVoucher(voucherToApply || null);
        } else {
            onApplyVoucher(null); // Gửi null nếu không có voucher nào được chọn
        }
        onClose();
    };

    const handleCodeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCodeInput(e.target.value.toUpperCase());
    };

    const handleCodeInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const foundVoucher = vouchers.find(v => v.Code.toUpperCase() === codeInput);

            if (foundVoucher) {
                // Sử dụng hàm helper để kiểm tra trực tiếp
                const { isEligible, reason } = checkVoucherEligibility(foundVoucher, selectedItemsSubtotal);
                
                if (isEligible) {
                    setSelectedVoucherCode(foundVoucher.Code);
                } else {
                    alert(`Voucher không hợp lệ. Lý do: ${reason || 'Không rõ'}`);
                }
            } else {
                alert('Không tìm thấy mã voucher này.');
            }
        }
    };
    
     const handleApplyCodeClick = () => {
        applyVoucherFromCodeInput(); // Gọi hàm chung
    };
    
    
    // --- Render Logic ---
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex mt-[100px] items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg border-t shadow-lg w-full max-w-lg mx-4 relative flex flex-col max-h-[80vh] overflow-hidden">
                {/* Modal Header */}
                <div className="p-4 border-b flex justify-between items-center sticky top-0 z-10">
                    <h2 className="text-lg font-semibold text-gray-800">Chọn Voucher của Shop</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800">
                        <X size={22} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-4 flex-grow overflow-y-auto ">
                    {/* Input mã voucher */}
                        
                         <div className="flex items-center space-x-2 py-4 border-b">
                            <input
                                id="voucher-code-input"
                                type="text"
                                value={codeInput}
                                onChange={handleCodeInputChange}
                                onKeyDown={handleCodeInputKeyDown}
                                placeholder="Nhập mã tại đây"
                                className="flex-grow p-2 border text-black rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                                onClick={handleApplyCodeClick} // Gắn handler mới
                                disabled={!codeInput} // Vô hiệu hóa nếu không có text
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-semibold hover:bg-gray-300 transition"
                            >
                                Áp dụng
                            </button>
                        </div>
                    
                    {/* Loading State */}
                    {loading && (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="animate-spin text-blue-600" size={32} />
                        </div>
                    )}

                    {/* Error State */}
                    {error && <div className="text-red-500 text-center p-4 bg-red-50 rounded-md">{error}</div>}
                    
                    {/* Content */}
                    {!loading && !error && (
                        <>
                            {/* <div className="p-3 mb-4 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800 flex items-center gap-2">
                                <Info size={18}/>
                                <span>Tổng tiền các mục đã chọn: <span className='font-bold'>{formatPrice(selectedItemsSubtotal)}</span></span>
                            </div> */}

                            {/* <h3 className="font-semibold mb-2 text-gray-800">Có thể dùng ({eligibleVouchers.length})</h3> */}
                            {eligibleVouchers.length > 0 ? (
                                eligibleVouchers.map(voucher => (
                                    <VoucherItem
                                        key={voucher.VoucherID}
                                        voucher={voucher}
                                        isEligible={true}
                                        isSelected={selectedVoucherCode === voucher.Code}
                                        onSelect={setSelectedVoucherCode} 
                                    />
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 mb-4 pl-1"></p>
                            )}

                            {ineligibleVouchers.length > 0 && (
                                <>
                                    <h3 className="font-semibold mb-2 mt-6 text-gray-800">Chưa đủ điều kiện ({ineligibleVouchers.length})</h3>
                                    {ineligibleVouchers.map(voucher => (
                                        <VoucherItem
                                            key={voucher.VoucherID}
                                            voucher={voucher}
                                            isEligible={false}
                                            reason={voucher.reason}
                                            isSelected={false}
                                            onSelect={() => {}} // Disabled
                                        />
                                    ))}
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t bg-white flex justify-end gap-3 sticky bottom-0 z-10">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition-colors">
                        Trở Lại
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VoucherSelectionModal;