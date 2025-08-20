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

// HÀM HELPER 1: TÍNH GIÁ CUỐI CÙNG CỦA SẢN PHẨM (SAU KHI TRỪ DISCOUNT GỐC)
// const calculateFinalItemPrice = (price: number, originalPrice: number | null, discount: number | undefined): number => {
//     const basePrice = originalPrice ?? price;
//     return Math.floor(basePrice * (1 - (discount ?? 0) / 100));
// };

// HÀM HELPER 2: TÍNH GIẢM GIÁ TỪ MỘT VOUCHER CỤ THỂ
// const calculateDiscountForVoucher = (voucher: Voucher, subtotal: number): number => {
//     if (!voucher || subtotal < voucher.MinOrderValue) return 0;
//     let discount = 0;
//     if (voucher.DiscountType === 'FixedAmount') {
//         discount = voucher.DiscountValue;
//     } else if (voucher.DiscountType === 'Percentage') {
//         discount = subtotal * (voucher.DiscountValue / 100);
//         if (voucher.MaxValueForPercentage != null && discount > voucher.MaxValueForPercentage) {
//             discount = voucher.MaxValueForPercentage;
//         }
//     }
//     return Math.round(discount);
// };

// HÀM HELPER 3 (QUAN TRỌNG): TÍNH TOÁN LẠI TOÀN BỘ SUMMARY
// Đây là "nguồn chân lý duy nhất" cho việc tính toán
// const recalculateSummary = (shopOrders: CheckoutShopOrder[], platformVouchers: AppliedVouchersCombined): CheckoutSummaryDetails => {
//     const totalProductsPrice = shopOrders.reduce((sum, so) => sum + so.items.reduce((itemSum, item) => itemSum + item.subtotal, 0), 0);
//     const totalShippingFee = shopOrders.reduce((sum, so) => sum + so.shippingFee, 0);

//     const totalShopVoucherDiscount = shopOrders.reduce((sum, so) => {
//         if (!so.appliedVoucher) return sum;
//         const shopSubtotal = so.items.reduce((s, item) => s + item.subtotal, 0);
//         return sum + calculateDiscountForVoucher(so.appliedVoucher, shopSubtotal);
//     }, 0);

//     let totalSaleoff = 0;
//     if (platformVouchers.saleOffVoucher) {
//         totalSaleoff = calculateDiscountForVoucher(platformVouchers.saleOffVoucher, totalProductsPrice);
//     }
    
//     let totalFreeship = 0;
//     if (platformVouchers.freeShipVoucher) {
//         const freeshipDiscount = calculateDiscountForVoucher(platformVouchers.freeShipVoucher, totalShippingFee);
//         totalFreeship = Math.min(freeshipDiscount, totalShippingFee);
//     }
    
//     const totalPlatformVoucherDiscount = totalSaleoff + totalFreeship;
//     const totalDiscount = totalShopVoucherDiscount + totalPlatformVoucherDiscount;
//     const finalTotal = totalProductsPrice + totalShippingFee - totalDiscount;

//     return {
//         totalProductsPrice, totalShippingFee, totalShopVoucherDiscount,
//         totalPlatformVoucherDiscount, totalFreeship, totalSaleoff,
//         totalDiscount, finalTotal, address: null
//     };
// };

const CheckoutPageContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
    const [orderId, setOrderId] = useState<number | null>(null);
    const [orderCode, setOrderCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [allUserAddresses, setAllUserAddresses] = useState<Address[]>([]);
    const [isUpdateAddressModalOpen, setIsUpdateAddressModalOpen] = useState(false);
    const [addressToUpdateId, setAddressToUpdateId] = useState<number | null>(null);
    const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const [isPlatformVoucherModalOpen, setIsPlatformVoucherModalOpen] = useState(false);
    const [isShopVoucherModalOpen, setIsShopVoucherModalOpen] = useState(false);
    const [selectedShopIdForVoucher, setSelectedShopIdForVoucher] = useState<number | null>(null);



    console.log("--- COMPONENT RE-RENDERED ---");
    console.log("Current Order ID State:", orderId);
    console.log("Current Payment Method State:", checkoutData?.paymentMethod);

useEffect(() => {
    const orderIdFromUrl = searchParams.get('orderId');
    setOrderId(orderIdFromUrl ? Number(orderIdFromUrl) : null);

    const loadData = async () => {
        setLoading(true);
        setError(null);
    console.log(`[useEffect] Found orderId in URL: ${orderIdFromUrl}. Fetching order details...`);
        if (orderIdFromUrl) {
            // === TRƯỜNG HỢP 2: ĐÃ CÓ ĐƠN HÀNG NHÁP ===
            try {
                console.log(`api: /api/orders/${orderIdFromUrl}?context=checkout`);
                // Bạn cần tạo một API endpoint mới để lấy chi tiết đơn hàng
                const response = await fetch(`${API_URL}/orders/${orderIdFromUrl}?context=checkout`, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                    credentials: 'include', // Quan trọng để gửi cookie
                });
                console.log(`api: /api/orders/${orderIdFromUrl}?context=checkout`);
                if (!response.ok) throw new Error("Không tìm thấy thông tin đơn hàng.");
                
                const orderDetails = await response.json();
               
                // const summary = recalculateSummary(orderDetails.shopOrders, orderDetails.appliedPlatformVouchers);
                
                // Chuyển đổi dữ liệu từ API về định dạng CheckoutData để hiển thị lại
                // (Phần này cần bạn tự viết logic chuyển đổi, dưới đây là ví dụ)
               const reconstructedCheckoutData: CheckoutData = {
                        orderId: orderDetails.OrderID,
                        address: orderDetails.address,
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
                    setCheckoutData(reconstructedCheckoutData);

            } catch (e: any) {
                console.error("Failed to fetch pending order:", e);
                setError('Không thể tải thông tin đơn hàng. Vui lòng thử lại.');
            }

        } else {
           console.log("[useEffect] No orderId in URL. Building data from localStorage...");
            const buildCheckoutData = async () => {
                    const storedDataString = localStorage.getItem('checkoutData');
                    if (!storedDataString) {
                        setError('Không tìm thấy dữ liệu thanh toán.'); return;
                    }
                    try {
                        const storedData: StoredCheckoutData = JSON.parse(storedDataString);
                        const addressData = await fetchUserAddresses();
                        const defaultAddress = addressData.default_address;
                        setAllUserAddresses(addressData.addresses || []);

                        const groupedItems = storedData.selectedItems.reduce((acc, item) => {
                            (acc[item.ShopID] = acc[item.ShopID] || []).push(item);
                            return acc;
                        }, {} as Record<number, CartItem[]>);

                        let calculatedTotalProductsPrice = 0;
                        const shopOrders: CheckoutShopOrder[] = [];

                        for (const shopIdStr in groupedItems) {
                            const shopId = parseInt(shopIdStr);
                            const itemsInShop = groupedItems[shopId];
                            const firstItem = itemsInShop[0];

                            let shopSubtotal = 0;
                            const checkoutItems: CheckoutProductItem[] = itemsInShop.map(cartItem => {
                                const finalPrice = calculateFinalItemPrice(
                                    cartItem.productVariant.Price, 
                                    cartItem.productVariant.CompareAtPrice, 
                                    cartItem.productVariant.product?.Discount
                                );
                                const itemSubtotal = finalPrice * cartItem.Quantity;
                                shopSubtotal += itemSubtotal;
                                return {
                                    variantId: cartItem.VariantID, productId: cartItem.productVariant.product.ProductID,
                                    shopId: cartItem.ShopID, name: cartItem.productVariant.product.Name,
                                    imageUrl: cartItem.productVariant.ImageURL, classification: cartItem.productVariant.attributeValues.map(v => v.Value).join(', '),
                                    price: finalPrice, originalPrice: cartItem.productVariant.CompareAtPrice ?? (cartItem.productVariant.product?.Discount > 0 ? cartItem.productVariant.Price : null),
                                    quantity: cartItem.Quantity, subtotal: itemSubtotal,
                                    hasInsurance: false, product: cartItem.productVariant.product
                                };
                            });
                            
                            calculatedTotalProductsPrice += shopSubtotal;
                            shopOrders.push({
                                shopId, shopName: firstItem.shop.ShopName, shopLevel: firstItem.shop.Level,
                                items: checkoutItems, shippingMethod: 'Nhanh', shippingFee: 30000, 
                                deliveryEstimate: '2-3 ngày', appliedVoucher: storedData.appliedShopVouchers[shopId] || null,
                                messageToSeller: '', // Khởi tạo message rỗng
                            });
                        }

                        const totalShippingFee = shopOrders.reduce((sum, so) => sum + so.shippingFee, 0);
                        const totalShopVoucherDiscount = shopOrders.reduce((sum, so) => {
                            if (!so.appliedVoucher) return sum;
                            const shopSubtotal = so.items.reduce((s, item) => s + item.subtotal, 0);
                            return sum + calculateDiscountForVoucher(so.appliedVoucher, shopSubtotal);
                        }, 0);
                        
                        const totalFreeshipDiscount = storedData.summary.totalFreeship ?? 0;
                        const totalSaleoffDiscount = storedData.summary.totalSaleoff ?? 0;
                        const totalPlatformVoucherDiscount = totalFreeshipDiscount + totalSaleoffDiscount;
                        const totalDiscount = totalShopVoucherDiscount + totalPlatformVoucherDiscount;
                        const finalTotal = calculatedTotalProductsPrice + totalShippingFee - totalDiscount;
                        //  const summary = recalculateSummary(shopOrders, storedData.appliedPlatformVouchers);
                        setCheckoutData({
                            orderId: storedData.orderId, address: defaultAddress, shopOrders,
                            appliedPlatformVouchers: storedData.appliedPlatformVouchers,
                            summary: {
                                totalProductsPrice: calculatedTotalProductsPrice, totalShippingFee, totalShopVoucherDiscount,
                                totalPlatformVoucherDiscount, totalFreeship: totalFreeshipDiscount, totalSaleoff: totalSaleoffDiscount,
                                totalDiscount, finalTotal,
                                // ...summary,
                                 address: defaultAddress
                            },
                            paymentMethod: { method: 'Thanh toán khi nhận hàng', type: 'COD', canChange: true },
                        });
                    } catch (e) { setError('Dữ liệu thanh toán không hợp lệ.'); }
                };
                buildCheckoutData();
        }
        setLoading(false);
    };

    loadData();

    }, [searchParams]);
    
    const handleSelectPlatformVoucher = () => {
        setIsPlatformVoucherModalOpen(true);
    };

    // Mở modal voucher của shop
    const handleSelectShopVoucher = (shopId: number) => {
        setSelectedShopIdForVoucher(shopId);
        setIsShopVoucherModalOpen(true);
    };

    // Callback khi áp dụng voucher toàn sàn
    const handleApplyPlatformVouchers = useCallback((vouchers: AppliedVouchersCombined | null) => {
        setCheckoutData(prevData => {
            if (!prevData) return null;
            
            // Cập nhật voucher đã áp dụng
            const newAppliedVouchers = vouchers || { freeShipVoucher: null, saleOffVoucher: null };
            
            // Tính toán lại toàn bộ summary với voucher mới
            const newSummary = recalculateSummary(prevData.shopOrders, newAppliedVouchers);

            return {
                ...prevData,
                appliedPlatformVouchers: newAppliedVouchers,
                summary: { ...newSummary, address: prevData.address },
            };
        });
        setIsPlatformVoucherModalOpen(false);
    }, []);

    // Callback khi áp dụng voucher của shop
    const handleApplyShopVoucher = useCallback((voucher: Voucher | null) => {
        if (selectedShopIdForVoucher === null) return;
        
        setCheckoutData(prevData => {
            if (!prevData) return null;

            // Cập nhật voucher cho shop cụ thể
            const updatedShopOrders = prevData.shopOrders.map(so => {
                if (so.shopId === selectedShopIdForVoucher) {
                    return { ...so, appliedVoucher: voucher };
                }
                return so;
            });

            // Tính toán lại toàn bộ summary với shop order đã được cập nhật
            const newSummary = recalculateSummary(updatedShopOrders, prevData.appliedPlatformVouchers);

            return {
                ...prevData,
                shopOrders: updatedShopOrders,
                summary: { ...newSummary, address: prevData.address },
            };
        });
        setIsShopVoucherModalOpen(false);
    }, [selectedShopIdForVoucher]);


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

        // Cập nhật lại state checkoutData với địa chỉ mới được chọn
        setCheckoutData({
            ...checkoutData,
            address: selectedAddress,
        });
        
        // Đóng modal
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

  const handleAddressChange = () => alert('Thay đổi địa chỉ đang được phát triển!');
  const handleMessageChange = (shopId: number, message: string) => {
        setCheckoutData(prev => {
            if (!prev) return null;
            const updatedShopOrders = prev.shopOrders.map(so =>
                so.shopId === shopId ? { ...so, messageToSeller: message } : so
            );
            return { ...prev, shopOrders: updatedShopOrders };
        });
    };
  const handleShippingMethodChange = (shopId: number) => alert(`Thay đổi phương thức vận chuyển cho shop ${shopId} đang được phát triển!`);

const handlePaymentMethodChange = () => {
        // Nếu đã có đơn hàng nháp, dùng luồng hủy
        if (orderId) {
             handleCancelAndChange();
        } else {
            // Nếu chưa có, chỉ mở modal để chọn
            setIsPaymentModalOpen(true);
        }
    };

    // HÀM MỚI: Xử lý khi người dùng xác nhận lựa chọn trong Modal
    const handleConfirmPaymentMethod = (selectedType: PaymentMethodType) => {
         console.log("handleConfirmPaymentMethod] User confirmed new method: ",selectedType);
        let methodName = '';
        switch (selectedType) {
            case 'Paypal':
                methodName = 'PayPal';
                break;
            case 'VNPay':
                methodName = 'Cổng thanh toán VNPay';
                break;
            case 'COD':
            default:
                methodName = 'Thanh toán khi nhận hàng';
                break;
        }

        setCheckoutData(prev => {
            if (!prev) return null;
            console.log("Updating payment method to:", selectedType); // <--- THÊM DÒNG NÀY ĐỂ DEBUG
            
            const newState = {
                ...prev,
                paymentMethod: {
                    ...prev.paymentMethod,
                    type: selectedType,
                    method: methodName,
                },
            };
             console.log("[handleConfirmPaymentMethod] Updating state to:", newState.paymentMethod);
            return newState;
        });
        
        setIsPaymentModalOpen(false); // Đóng modal sau khi xác nhận
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
                router.push('/account/purchase?status=Processing');
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

        const paymentMethod = checkoutData?.paymentMethod.type.toUpperCase() || 'COD';
        
        let payload: any = { paymentMethod };
        if (paymentMethod === 'PAYPAL' && paypalDetails) {
            payload.paymentDetails = {
                transactionId: paypalDetails.id,
                status: paypalDetails.status,
            };
        }

        try {
            const response = await fetch(`${API_URL}/orders/${orderId}/complete`,{
                    method: 'PUT',
                    headers: { 'Accept': 'application/json' },
                    credentials: 'include', // Quan trọng để gửi cookie
                    body: JSON.stringify(payload),
                });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Hoàn tất đơn hàng thất bại.");
            
            toast.success(`Đơn hàng ${result.orderCode} đã được xác nhận!`);
            localStorage.removeItem('checkoutData');
            router.push('/account/purchase?status=Processing');

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
            router.push(`/purchase?status=Processing`);

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
                />
            </div>
        </div>
    );
};

export default CheckoutPageContent;