// app/(main)/checkout/components/CheckoutPageContent.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaCommentDots } from 'react-icons/fa6';
import { FaQuestionCircle } from 'react-icons/fa'; // FaQuestionCircle cho "Được đồng kiểm"

import CheckoutAddressSection from './CheckoutAddressSection';
import CheckoutProductSection from './CheckoutProductSection';
import CheckoutShopVoucherSection from './CheckoutShopVoucherSection';
import CheckoutPlatformVoucherSection from './CheckoutPlatformVoucherSection';
import CheckoutPaymentSection from './CheckoutPaymentSection';
import CheckoutSummary from './CheckoutSummary';
import { fetchUserAddresses } from '@/services/user';

import AddressSelectionModal from './AddressSelectionModal';
import UpdateAddressModal from './UpdateAddressModal'; // Import modal mới

// import { CheckoutData, Address, CheckoutShopOrder, CheckoutProductItem, CheckoutVoucher, CheckoutSummaryDetails, ShopLevel, OrderStatus, PaymentMethodType, OrderItem } from '@/types';
import {
  CartItem, AppliedVouchersCombined, AppliedShopVouchers, Address, CheckoutData,
  CheckoutShopOrder, CheckoutProductItem, Voucher,
  OrderStatus,
  CheckoutSummaryDetails,
  PaymentMethodType,
  StoredCheckoutData,
  PAYPAL_CLIENT_ID
} from '@/types';
import { CheckCheck, Loader2 } from 'lucide-react';
import { fetchProductById } from '@/services/product';
import { toast } from 'react-toastify';
import { OrderResponseBody } from '@paypal/paypal-js';
import { getAuthToken } from '@/services/api';
import PaymentMethodSelectionModal from './PaymentMethodSelectionModal';
import { API_URL } from '@/lib/config';
import { calculateFinalItemPrice,calculateDiscountForVoucher, recalculateSummary } from '@/utils/calculation';

import VoucherSelectionModal from '@/app/components/cart/VoucherSelectionModal';
import VoucherSelectModal from '@/app/components/cart/VoucherSelectModal';
import { useCheckoutData } from '@/hooks/useCheckoutData';
import CountdownTimer from '@/app/components/CountdownTimer';

    

const CheckoutPageContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    // const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
    const [orderId, setOrderId] = useState<number | null>(null);
    const [orderCode, setOrderCode] = useState<string | null>(null);
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState<string | null>(null);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    // const [allUserAddresses, setAllUserAddresses] = useState<Address[]>([]);
    const [isUpdateAddressModalOpen, setIsUpdateAddressModalOpen] = useState(false);
    const [addressToUpdateId, setAddressToUpdateId] = useState<number | null>(null);
    const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const [isPlatformVoucherModalOpen, setIsPlatformVoucherModalOpen] = useState(false);
    const [isShopVoucherModalOpen, setIsShopVoucherModalOpen] = useState(false);
    const [selectedShopIdForVoucher, setSelectedShopIdForVoucher] = useState<number | null>(null);

    const [expiresAt, setExpiresAt] = useState<string | null>(null); // State mới để lưu thời gian hết hạn
    const [isOrderExpired, setIsOrderExpired] = useState(false); // State mới

    const { checkoutData, loading, error, allUserAddresses, updateCheckoutData, setAllUserAddresses } = useCheckoutData();
    console.log("--- COMPONENT RE-RENDERED ---");
    console.log("Current Order ID State:", orderId);
    console.log("Current Payment Method State:", checkoutData?.paymentMethod);
    console.log("Current Checkout Data State:", checkoutData);



 useEffect(() => {
        const orderIdFromUrl = searchParams.get('orderId');
        if (orderIdFromUrl && !checkoutData?.orderId) { // Chỉ fetch nếu chưa có dữ liệu cho orderId này
            const id = Number(orderIdFromUrl);
            setOrderId(id);
            const fetchDraftOrder = async () => {
                try {
                    const response = await fetch(`${API_URL}/orders/${id}?context=checkout`, { credentials: 'include' });
                    if (!response.ok) throw new Error("Không tìm thấy đơn hàng nháp.");
                    const orderDetails = await response.json();
                    
                    const reconstructedData: CheckoutData = {
                        orderId: orderDetails.OrderID,
                        orderCode: orderDetails.OrderCode,
                        address: orderDetails.address,
                        expiresAt: orderDetails.expiresAt,
                        shopOrders: orderDetails.shopOrders,
                        appliedPlatformVouchers: orderDetails.appliedPlatformVouchers,
                        summary: { ...orderDetails.summary, address: orderDetails.address },
                        paymentMethod: {
                            method: orderDetails.PaymentMethod === 'Paypal' ? 'PayPal' : (orderDetails.PaymentMethod === 'VNPay' ? 'Cổng thanh toán VNPay' : 'Thanh toán khi nhận hàng'),
                            type: orderDetails.PaymentMethod,
                            canChange: true,
                        },
                    };
                    setOrderCode(orderDetails.OrderCode);
                    setExpiresAt(orderDetails.expiresAt);
                    updateCheckoutData(reconstructedData);
                } catch (e) {
                    console.error("Failed to fetch pending order:", e);
                    
                    // setError('Không thể tải thông tin đơn hàng.'); // Lỗi đã được quản lý trong hook
                }
            };
            fetchDraftOrder();
        } else if (checkoutData?.orderId && checkoutData.expiresAt) {
            // Nếu dữ liệu đã có trong hook, đồng bộ state
            setOrderId(checkoutData.orderId);
            setOrderCode(checkoutData.orderCode || null); // Giả sử orderCode có trong checkoutData
            setExpiresAt(checkoutData.expiresAt);
        }
    }, [searchParams, updateCheckoutData, checkoutData?.orderId]);
    

    useEffect(() => {
        // Chỉ chạy khi isOrderExpired là true
        if (isOrderExpired) {
            // Hiển thị toast và chỉ một lần duy nhất
            toast.error("Đơn hàng của bạn đã hết hạn. Vui lòng đặt lại từ giỏ hàng.", {
                toastId: 'order-expired-toast', // Thêm toastId để ngăn trùng lặp
            });
            // Xóa dữ liệu checkout khỏi localStorage
            localStorage.removeItem('checkoutData');
        }
    }, [isOrderExpired]); 

    
    const handleOrderExpired = useCallback(() => {
        setIsOrderExpired(true);
    }, []);
    
    const handleSelectPlatformVoucher = () => {
        setIsPlatformVoucherModalOpen(true);
    };

    // Mở modal voucher của shop
    const handleSelectShopVoucher = (shopId: number) => {
        setSelectedShopIdForVoucher(shopId);
        setIsShopVoucherModalOpen(true);
    };

    // Callback khi áp dụng voucher toàn sàn
    // const handleApplyPlatformVouchers = useCallback((vouchers: AppliedVouchersCombined | null) => {
    //     setCheckoutData(prevData => {
    //         if (!prevData) return null;
            
    //         // Cập nhật voucher đã áp dụng
    //         const newAppliedVouchers = vouchers || { freeShipVoucher: null, saleOffVoucher: null };
            
    //         // Tính toán lại toàn bộ summary với voucher mới
    //         const newSummary = recalculateSummary(prevData.shopOrders, newAppliedVouchers);

    //         return {
    //             ...prevData,
    //             appliedPlatformVouchers: newAppliedVouchers,
    //             summary: { ...newSummary, address: prevData.address },
    //         };
    //     });
    //     setIsPlatformVoucherModalOpen(false);
    // }, []);
const handleApplyPlatformVouchers = useCallback((vouchers: AppliedVouchersCombined | null) => {
        if (!checkoutData) return;
        const newAppliedVouchers = vouchers || { freeShipVoucher: null, saleOffVoucher: null };
        const newSummary = recalculateSummary(checkoutData.shopOrders, newAppliedVouchers);
        const newState: CheckoutData = {
            ...checkoutData,
            appliedPlatformVouchers: newAppliedVouchers,
            summary: { ...newSummary, address: checkoutData.address },
        };
        updateCheckoutData(newState);
        setIsPlatformVoucherModalOpen(false);
    }, [checkoutData, updateCheckoutData]);

    const handleApplyShopVoucher = useCallback((voucher: Voucher | null) => {
        if (selectedShopIdForVoucher === null || !checkoutData) return;
        const updatedShopOrders = checkoutData.shopOrders.map(so =>
            so.shopId === selectedShopIdForVoucher ? { ...so, appliedVoucher: voucher } : so
        );
        const newSummary = recalculateSummary(updatedShopOrders, checkoutData.appliedPlatformVouchers);
        const newState: CheckoutData = {
            ...checkoutData,
            shopOrders: updatedShopOrders,
            summary: { ...newSummary, address: checkoutData.address },
        };
        updateCheckoutData(newState);
        setIsShopVoucherModalOpen(false);
    }, [checkoutData, selectedShopIdForVoucher, updateCheckoutData]);



    const updateNotesBeforePayment = async (): Promise<boolean> => {
        if (!orderId || !checkoutData) {
            console.error("updateNotesBeforePayment: Missing orderId or checkoutData.");
            return false;
        }

        const shopNotes = checkoutData.shopOrders.reduce((acc, so) => {
            if (so.messageToSeller && so.messageToSeller.trim() !== '') {
                acc[so.shopId] = so.messageToSeller.trim();
            }
            return acc;
        }, {} as Record<number, string>);

        // Nếu không có lời nhắn nào, coi như thành công và không cần gọi API.
        if (Object.keys(shopNotes).length === 0) {
            return true;
        }

        try {
            const response = await fetch(`${API_URL}/orders/${orderId}/update-draft`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ shopNotes }),
            });

            if (!response.ok) {
                toast.error("Không thể cập nhật ghi chú cho đơn hàng.");
                return false;
            }
            
            console.log("Notes updated successfully before payment redirection.");
            return true;

        } catch (error) {
            toast.error("Lỗi kết nối khi cập nhật ghi chú.");
            console.error("updateNotesBeforePayment failed:", error);
            return false;
        }
    };

    
    const handleVnPayPayment = async () => {
        console.log(`[handleVnPayPayment] Initiated for orderId: ${orderId}`);
        if (!orderId) {
            toast.error("Không tìm thấy đơn hàng để thanh toán.");
            return;
        }
        // **BƯỚC 1: CẬP NHẬT LỜI NHẮN**
       const notesUpdatedSuccessfully = await updateNotesBeforePayment();

        // Nếu cập nhật lời nhắn thất bại, dừng quá trình thanh toán
        if (!notesUpdatedSuccessfully) {
            return;
        }
        try {
            
             console.log(`[handleVnPayPayment] Calling API /api/vnpay/create-payment/${orderId}`);
            const response = await fetch(`${API_URL}/vnpay/create-payment/${orderId}`, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    credentials: 'include', // Quan trọng để gửi cookie
                });
            console.log("VNPay create payment response status:", response.status);
            const data = await response.json();
             console.log("Data received from /api/vnpay/create-payment:", data);
            if (data.payment_url) {
                console.log("Redirecting to VNPay URL:", data.payment_url); 
                // Điều hướng người dùng đến cổng thanh toán VNPay
                window.location.href = data.payment_url;
            } else {
                const errorMessage = data.message || "Không thể lấy URL thanh toán từ server.";
                console.error("Failed to get VNPay URL:", errorMessage, data);
                throw new Error("Không thể tạo yêu cầu thanh toán VNPay.");
            }
        } catch (error: any) {
            
             console.error(`[handleVnPayPayment] FAILED for orderId: ${orderId}`, error);
            toast.error(error.message);
        }
    };

    const handleConfirmNewAddress = (selectedAddress: Address) => {
        if (!checkoutData) return;
        const newState = {
            ...checkoutData,
            address: selectedAddress,
            summary: { ...checkoutData.summary, address: selectedAddress },
        };
        updateCheckoutData(newState);
        setIsAddressModalOpen(false);
    };
    
    

    // --- CẬP NHẬT HÀM NÀY ĐỂ MỞ MODAL Ở CHẾ ĐỘ SỬA ---
    const handleOpenUpdateAddressModal = (addressId: number) => {
        setEditingAddressId(addressId);
        setIsAddressModalOpen(false);
        setIsUpdateAddressModalOpen(true);
    };

    // --- HÀM MỚI ĐỂ MỞ MODAL Ở CHẾ ĐỘ TẠO ---
    const handleOpenCreateAddressModal = () => {
        setEditingAddressId(null); // Đặt ID là null để kích hoạt chế độ tạo mới
        setIsAddressModalOpen(false);
        setIsUpdateAddressModalOpen(true);
    }

    // Hàm được gọi sau khi thêm/sửa thành công
    const handleAddressSuccess = () => {
        // Tải lại danh sách địa chỉ và mở lại modal chọn
        fetchUserAddresses().then(data => {
            setAllUserAddresses(data.addresses || []);
            setIsAddressModalOpen(true); 
        });
    };

    // Hàm được gọi sau khi cập nhật thành công
    // const handleAddressUpdated = () => {
    //     // Tải lại toàn bộ danh sách địa chỉ để có dữ liệu mới nhất
    //     fetchUserAddresses().then(data => {
    //         setAllUserAddresses(data.addresses || []);
    //         // Mở lại modal chọn địa chỉ để người dùng có thể thấy sự thay đổi
    //         setIsAddressModalOpen(true); 
    //     });
    // };
    const handleAddressUpdated = async () => {
        try {
            // 1. Đóng modal cập nhật ngay lập tức để người dùng thấy phản hồi
            setIsUpdateAddressModalOpen(false);

            // 2. Fetch lại dữ liệu địa chỉ mới
            const data = await fetchUserAddresses();
            setAllUserAddresses(data.addresses || []);

            // 3. Mở lại modal chọn địa chỉ
            // Đặt một khoảng delay nhỏ để tránh cảm giác giật cục
            setTimeout(() => {
                setIsAddressModalOpen(true); 
            }, 100); // 100ms delay

        } catch (error) {
            toast.error("Không thể tải lại danh sách địa chỉ.");
        }
    };


    if (loading) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="w-10 h-10 animate-spin text-orange-500" /></div>;
    if (error) return <div className="text-center py-20 text-red-500">{error} <Link href="/cart" className="text-blue-500 hover:underline ml-2">Quay lại giỏ hàng</Link></div>;
    if (!checkoutData) return <div className="text-center py-20">Không có dữ liệu để hiển thị.</div>;

   const handleMessageChange = (shopId: number, message: string) => {
        // **SỬA Ở ĐÂY:** Dùng `updateCheckoutData` thay vì `setCheckoutData`
        updateCheckoutData(prev => {
            if (!prev) return null;
            const updatedShopOrders = prev.shopOrders.map(so =>
                so.shopId === shopId ? { ...so, messageToSeller: message } : so
            );
            return { ...prev, shopOrders: updatedShopOrders };
        });
    };

  const handleShippingMethodChange = (shopId: number) => alert(`Thay đổi phương thức vận chuyển cho shop ${shopId} đang được phát triển!`);

const handlePaymentMethodChange = () => {
            setIsPaymentModalOpen(true);
    };

    // HÀM MỚI: Xử lý khi người dùng xác nhận lựa chọn trong Modal
    const handleConfirmPaymentMethod = async (selectedType: PaymentMethodType) => {
        if (!checkoutData) return;
        
        const originalType = checkoutData.paymentMethod.type;
        
        // Nếu người dùng không thay đổi gì, chỉ cần đóng modal
        if (originalType === selectedType) {
            setIsPaymentModalOpen(false);
            return;
        }

        // Đóng modal ngay lập tức để người dùng thấy phản hồi
        setIsPaymentModalOpen(false);

        // **Logic mới: Nếu đã có orderId, gọi API để cập nhật**
        if (orderId) {
            const toastId = toast.loading("Đang cập nhật phương thức thanh toán...");
            try {
                const response = await fetch(`${API_URL}/orders/${orderId}/payment-method`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ paymentMethod: selectedType }),
                });
                
                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.message || "Không thể cập nhật phương thức thanh toán.");
                }
                
                // Cập nhật state ở client sau khi API thành công
                updateLocalPaymentMethod(selectedType);
                toast.update(toastId, { render: "Đã cập nhật thành công!", type: "success", isLoading: false, autoClose: 3000 });

            } catch (error: any) {
                toast.update(toastId, { render: error.message, type: "error", isLoading: false, autoClose: 5000 });
            }
        } else {
            // **Logic cũ: Nếu chưa có orderId (chưa nhấn "Tiến hành thanh toán"), chỉ cập nhật state ở client**
            updateLocalPaymentMethod(selectedType);
        }
    };
    // Hàm helper để cập nhật state local, tránh lặp code
    const updateLocalPaymentMethod = (selectedType: PaymentMethodType) => {
        let methodName = '';
        switch (selectedType) {
            case 'Paypal': methodName = 'PayPal'; break;
            case 'VNPay': methodName = 'Cổng thanh toán VNPay'; break;
            case 'COD': default: methodName = 'Thanh toán khi nhận hàng'; break;
        }

        updateCheckoutData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                paymentMethod: {
                    ...prev.paymentMethod,
                    type: selectedType,
                    method: methodName,
                },
            };
        });
    };
    // HÀM HỦY ĐƠN HÀNG NHÁP (quan trọng)
    const handleCancelAndChange = async () => {
        if (!orderId) return;
        
        const isConfirmed = window.confirm("Việc này sẽ hủy đơn hàng nháp hiện tại để bạn có thể tạo lại với phương thức thanh toán mới. Bạn có chắc chắn không?");
        if (!isConfirmed) return;

        try {
             const authToken = getAuthToken(); // Lấy token xác thực
            if (!authToken) {
                toast.error("Vui lòng đăng nhập để thực hiện thao tác này.");
                return;
            }
            
            toast.info("Đang hủy đơn hàng nháp...");

            const response = await fetch(`${API_URL}/orders/${orderId}/cancel-draft`, {
                    method: 'DELETE',
                    headers: { 'Accept': 'application/json' },
                    credentials: 'include', // Quan trọng để gửi cookie
                });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể hủy đơn hàng nháp.");
            }


            toast.info("Đơn hàng nháp đã được hủy. Vui lòng bắt đầu lại từ giỏ hàng.");
            router.push('/cart'); 

        } catch (error: any) {
            toast.error(error.message);
        }
    };
    

   
    const handlePlaceOrder = async () => {
        console.log("[handlePlaceOrder] Initiated with ID-based logic.");
        if (!checkoutData || !checkoutData.address) {
            toast.error("Vui lòng chọn địa chỉ giao hàng.");
            return;
        }
        
        const itemsPayload = checkoutData.shopOrders.flatMap(so =>
            so.items.map(item => ({ variantId: item.variantId, quantity: item.quantity }))
        );
        
        const shopVoucherCodes = checkoutData.shopOrders.map(so => so.appliedVoucher?.Code).filter(Boolean) as string[];

        const platformVoucherCodes: string[] = [];
        if (checkoutData.appliedPlatformVouchers.saleOffVoucher) {
            platformVoucherCodes.push(checkoutData.appliedPlatformVouchers.saleOffVoucher.Code);
        }
        if (checkoutData.appliedPlatformVouchers.freeShipVoucher) {
            platformVoucherCodes.push(checkoutData.appliedPlatformVouchers.freeShipVoucher.Code);
        }
        // Tạo đối tượng shopNotes từ state
        const shopNotes = checkoutData.shopOrders.reduce((acc, so) => {
           if (so.messageToSeller && so.messageToSeller.trim() !== '') {
                acc[so.shopId] = so.messageToSeller.trim();
            }
            return acc;
        }, {} as Record<number, string>);
            
        // 4. Tạo payload cuối cùng, chỉ chứa các ID và thông tin cần thiết
        const payload = {
            shippingAddressId: checkoutData.address.AddressID,
            shopNotes: shopNotes, // Gửi đối tượng notes
            paymentMethod: checkoutData.paymentMethod.type,
            items: itemsPayload,
            shopVoucherCodes: shopVoucherCodes,
            platformVoucherCodes: platformVoucherCodes,
            shippingFee: checkoutData.summary.totalShippingFee, 
        };
        
        try {
            toast.info("Đang xử lý đơn hàng của bạn...");
            const response = await fetch(`${API_URL}/orders/place`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Không thể đặt hàng.');
            toast.success("Đã tạo đơn hàng thành công!");
            localStorage.removeItem('checkoutData');
            if (checkoutData.paymentMethod.type === 'COD') {
                // Nếu là COD, đơn hàng đã được xử lý, chuyển thẳng đến trang lịch sử
                router.push('/account/purchase?status=Pending');
            } else {
                // Nếu là VNPay/PayPal, chuyển đến trang checkout để tiếp tục thanh toán
                router.push(`/checkout?orderId=${result.orderId}`);
            }

        } catch (error: any) {
            toast.error(error.message);
        }
    };
    // HÀM 2: Khi nhấn nút thanh toán cuối cùng (COD hoặc PayPal)
    const handleCompleteOrder = async (paypalDetails?: OrderResponseBody) => {
        console.log(`[handleCompleteOrder] Initiated for orderId: ${orderId}`);
        if (!orderId) {
            toast.error("Không tìm thấy mã đơn hàng.");
            return;
        }
        const notesUpdatedSuccessfully = await updateNotesBeforePayment();

        // Nếu cập nhật lời nhắn thất bại, dừng quá trình thanh toán
        if (!notesUpdatedSuccessfully) {
            return;
        }

        const paymentMethod = checkoutData?.paymentMethod.type
        
        let payload: any = { paymentMethod };
        if (paymentMethod === 'Paypal' && paypalDetails) {
            payload.paymentDetails = {
                transactionId: paypalDetails.id,
                status: paypalDetails.status,
            };
        }

        try {
            const response = await fetch(`${API_URL}/orders/${orderId}/complete`,{
                    method: 'PUT',
                    headers: { 'Accept': 'application/json' ,
                         'Content-Type': 'application/json'
                    },
                    credentials: 'include', // Quan trọng để gửi cookie
                    body: JSON.stringify(payload),
                });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Hoàn tất đơn hàng thất bại.");
            
            toast.success(`Đơn hàng ${result.orderCode} đã được xác nhận!`);
            localStorage.removeItem('checkoutData');
            router.push('/account/purchase?status=Pending');

        } catch (error: any) {
            console.error(`[handleCompleteOrder] FAILED for orderId: ${orderId}`, error);
            toast.error(error.message);
        }
    };
    const handlePaymentSuccess = async (paypalDetails: OrderResponseBody) => {
        if (!checkoutData || !checkoutData.orderId) {
            toast.error("Không tìm thấy đơn hàng để cập nhật. Vui lòng thử lại.");
            return;
        }
        
        // Gọi API để cập nhật trạng thái đơn hàng đã có
        try {
            // Bạn sẽ cần tạo một API route mới để cập nhật, ví dụ: /api/orders/{orderId}/update-payment
            const response = await fetch(`${API_URL}/orders/${checkoutData.orderId}/update-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Quan trọng để gửi cookie
                body: JSON.stringify({
                    paymentMethod: 'PAYPAL',
                    paymentDetails: {
                        transactionId: paypalDetails.id,
                        status: paypalDetails.status,
                    }
                }),
            });
            

            if (!response.ok) throw new Error("Cập nhật thanh toán thất bại.");

            localStorage.removeItem('checkoutData');
            toast.success("Thanh toán thành công!");
            router.push(`/purchase?status=Pending`);

        } catch (error: any) {
            toast.error(error.message);
        }
    }
if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20 text-red-500">
                {error}
                <Link href="/cart" className="text-blue-500 hover:underline ml-2">
                    Quay lại giỏ hàng
                </Link>
            </div>
        );
    }

    // Đây là "rào chắn" quan trọng nhất để sửa lỗi `map`
    if (!checkoutData) {
        return (
            <div className="text-center py-20">
                Không có dữ liệu thanh toán để hiển thị.
            </div>
        );
    }

     const subtotalForSelectedShop = selectedShopIdForVoucher 
        ? checkoutData.shopOrders
            .find(so => so.shopId === selectedShopIdForVoucher)
            ?.items.reduce((sum, item) => sum + item.subtotal, 0) || 0
        : 0;


return (
        <div className="bg-gray-100 min-h-screen pb-40">
            {orderId && orderCode && (
                    <div className="p-4 bg-blue-100 border border-blue-300 text-blue-800 rounded-md text-center my-4">
                        Bạn đang hoàn tất thanh toán cho đơn hàng: <span className="font-bold">{orderCode}</span>
                    </div>
                )}
            <div className="container mx-auto max-w-6xl px-4">
                {expiresAt && !isOrderExpired && <CountdownTimer expiryTimestamp={expiresAt} onExpire={handleOrderExpired} />}

                {isOrderExpired ? (
                    <div className="text-center bg-white p-10 rounded-lg shadow-md mt-4">
                        <h2 className="text-2xl font-bold text-red-600 mb-4">Phiên thanh toán đã hết hạn</h2>
                        <p className="text-gray-700 mb-6">Đơn hàng của bạn đã được tự động hủy để giải phóng sản phẩm. Vui lòng quay lại giỏ hàng để bắt đầu lại.</p>
                        <Link href="/cart">
                             <button className="px-6 py-3 bg-orange-500 text-white font-bold rounded-md hover:bg-orange-600 transition-colors">
                                Quay lại giỏ hàng
                            </button>
                        </Link>
                    </div>
                ) : (
                   <>
                    <VoucherSelectModal
                    isOpen={isPlatformVoucherModalOpen}
                    onClose={() => setIsPlatformVoucherModalOpen(false)}
                    onApplyVouchers={handleApplyPlatformVouchers}
                    initialAppliedVouchers={checkoutData.appliedPlatformVouchers}
                    currentCartTotal={checkoutData.summary.totalProductsPrice}
                />
                
                <VoucherSelectionModal
                    isOpen={isShopVoucherModalOpen}
                    onClose={() => setIsShopVoucherModalOpen(false)}
                    shopId={selectedShopIdForVoucher}
                    selectedItemsSubtotal={subtotalForSelectedShop}
                    currentAppliedVoucher={
                        selectedShopIdForVoucher 
                        ? checkoutData.shopOrders.find(so => so.shopId === selectedShopIdForVoucher)?.appliedVoucher || null 
                        : null
                    }
                    onApplyVoucher={handleApplyShopVoucher}
                />
                
                <UpdateAddressModal
                    isOpen={isUpdateAddressModalOpen}
                    onClose={() => {
                        setIsUpdateAddressModalOpen(false);
                        setIsAddressModalOpen(true);
                    }}
                    addressId={editingAddressId} // Truyền ID hoặc null
                    onSuccess={handleAddressSuccess} // Callback khi thành công
                    shouldBeDefaultOnCreate={allUserAddresses.length === 0}
                />
                <PaymentMethodSelectionModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    currentMethod={checkoutData.paymentMethod.type}
                    onConfirm={handleConfirmPaymentMethod} 
                />
                 <AddressSelectionModal
                    isOpen={isAddressModalOpen}
                    onClose={() => setIsAddressModalOpen(false)}
                    addresses={allUserAddresses}
                    currentSelectedAddressId={checkoutData.address?.AddressID || null}
                    onConfirm={handleConfirmNewAddress}
                    onAddNewAddress={handleOpenCreateAddressModal} // Gắn hàm mở modal tạo mới
                    onUpdateAddress={handleOpenUpdateAddressModal} // Gắn hàm mở modal cập nhật
                />
                <CheckoutAddressSection
                    address={checkoutData.address}
                    onAddressChange={() => setIsAddressModalOpen(true)}
                />
                {checkoutData.shopOrders.map(shopOrder => (
                    <div key={shopOrder.shopId} className="mt-4 bg-white rounded-sm shadow-sm border border-gray-200">
                        <CheckoutProductSection shopOrder={shopOrder} />
                        <CheckoutShopVoucherSection
                            shopOrder={shopOrder}
                            onMessageChange={handleMessageChange}
                            onSelectShopVoucher={handleSelectShopVoucher}
                            onShippingMethodChange={handleShippingMethodChange}
                        />
                    </div>
                ))}

                


                <CheckoutPlatformVoucherSection
                    totalFreeship= {checkoutData.summary.totalFreeship}
                    totalSaleoff= {checkoutData.summary.totalSaleoff}
                    platformVouchers={checkoutData.appliedPlatformVouchers}
                    onSelectPlatformVoucher={handleSelectPlatformVoucher}
                />
                <CheckoutPaymentSection
                    paymentMethod={checkoutData.paymentMethod}
                    onPaymentMethodChange={handlePaymentMethodChange}
                    isPaid = {false}
                    paidAt = ''
                    // onCancelAndChange={handleCancelAndChange}
                    // payPalClientID={PAYPAL_CLIENT_ID}
                    // summary={checkoutData.summary} 
                />
                <CheckoutSummary summary={checkoutData.summary} 
                    paymentMethod={checkoutData.paymentMethod}
                    payPalClientID={PAYPAL_CLIENT_ID}
                    orderId={orderId} // Truyền orderId xuống
                    onPlaceOrder={handlePlaceOrder} // Gắn với nút "Tiến hành thanh toán"
                    onCompleteOrder={handleCompleteOrder}// Dành cho PayPal
                    onVnPayPayment={handleVnPayPayment} 
                    isProcessing={isOrderExpired}
                />
                   </>
                )}

            </div>
        </div>
    );
};

export default CheckoutPageContent;