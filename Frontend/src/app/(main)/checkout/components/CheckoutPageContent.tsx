// app/(main)/checkout/components/CheckoutPageContent.tsx
'use client';

import React, { useState, useEffect } from 'react';
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


const calculateDiscountForVoucher = (voucher: Voucher, subtotal: number): number => {
    if (!voucher || subtotal < voucher.MinOrderValue) {
        return 0;
    }
    let discount = 0;
    if (voucher.DiscountType === 'FixedAmount') {
        discount = voucher.DiscountValue;
    } else if (voucher.DiscountType === 'Percentage') {
        discount = subtotal * (voucher.DiscountValue / 100);
        if (voucher.MaxValueForPercentage != null && discount > voucher.MaxValueForPercentage) {
            discount = voucher.MaxValueForPercentage;
        }
    }
    return Math.round(discount);
};
const calculateFinalItemPrice = (price: number, originalPrice: number | null, discount: number | undefined): number => {
    // Giá gốc để tính chiết khấu là CompareAtPrice nếu có, ngược lại là Price
    const basePrice = originalPrice ?? price;
    // Giảm giá từ bảng product (nếu có)
    const finalPrice = Math.floor(basePrice * (1 - (discount ?? 0) / 100));
    return finalPrice;
};


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
               

                
                // Chuyển đổi dữ liệu từ API về định dạng CheckoutData để hiển thị lại
                // (Phần này cần bạn tự viết logic chuyển đổi, dưới đây là ví dụ)
                const reconstructedCheckoutData: CheckoutData = {
                    orderId: orderDetails.OrderID,
                    address: orderDetails.address,
                    shopOrders: orderDetails.shopOrders,
                    
                    // Thêm giá trị mặc định cho trường bị thiếu
                    appliedPlatformVouchers: orderDetails.appliedPlatformVouchers,


                    summary: {
                        totalProductsPrice: orderDetails.SubtotalAmount,
                        totalShippingFee: orderDetails.ShippingFee,
                         totalShopVoucherDiscount: orderDetails.summary.totalShopVoucherDiscount,
                         totalFreeship: orderDetails.summary.totalFreeship, 
                        
                        totalPlatformVoucherDiscount: orderDetails.summary.totalPlatformVoucherDiscount,
                        totalDiscount: orderDetails.DiscountAmount,
                        finalTotal: orderDetails.TotalAmount,
                        totalSaleoff: orderDetails.summary.totalPlatformVoucherDiscount,
                        address: orderDetails.address
                    },
                    paymentMethod: {
                        method: orderDetails.PaymentMethod === 'Paypal' ? 'Paypal' : ( orderDetails.PaymentMethod === 'VNPay' ? 'VNPay' : 'Thanh toán khi nhận hàng'),
                        type: orderDetails.PaymentMethod,
                        canChange: true,
                    },
                };
                console.log("[useEffect] Reconstructed checkoutData from API:", reconstructedCheckoutData);
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
                setError('Không tìm thấy dữ liệu thanh toán. Vui lòng quay lại giỏ hàng.');
                setLoading(false);
                return;
            }
            
            try {
                const storedData: StoredCheckoutData = JSON.parse(storedDataString);
                const addressData = await fetchUserAddresses();
                const defaultAddress = addressData.default_address;
                setAllUserAddresses(addressData.addresses || []); 
                
                // Chuyển đổi dữ liệu
                const groupedItems: Record<number, CartItem[]> = storedData.selectedItems.reduce((acc, item) => {
                    if (!acc[item.ShopID]) acc[item.ShopID] = [];
                    acc[item.ShopID].push(item);
                    return acc;
                }, {} as Record<number, CartItem[]>);
                
                // === BẮT ĐẦU TÍNH TOÁN LẠI TỪ ĐẦU ===
                let calculatedTotalProductsPrice = 0;
                
                const shopOrders: CheckoutShopOrder[] = [];

                for (const shopIdStr in groupedItems) {
                    const shopId = parseInt(shopIdStr);
                    const itemsInShop = groupedItems[shopId];
                    const firstItem = itemsInShop[0];

                    let shopSubtotal = 0; // Subtotal của riêng shop này

                    const checkoutItems: CheckoutProductItem[] = itemsInShop.map(cartItem => {
                        // Tính giá cuối cùng của sản phẩm (sau khi trừ % discount của sản phẩm)
                        const finalPrice = calculateFinalItemPrice(
                            cartItem.productVariant.Price, 
                            cartItem.productVariant.CompareAtPrice, 
                            cartItem.productVariant.product?.Discount
                        );
                        
                        const itemSubtotal = finalPrice * cartItem.Quantity;
                        shopSubtotal += itemSubtotal;

                        return {
                            variantId: cartItem.VariantID,
                            productId: cartItem.productVariant.product.ProductID,
                            shopId: cartItem.ShopID,
                            name: cartItem.productVariant.product.Name,
                            imageUrl: cartItem.productVariant.ImageURL,
                            classification: cartItem.productVariant.attributeValues.map(v => v.Value).join(', '),
                            price: finalPrice, // <<-- LƯU Ý: price giờ là giá đã giảm của sản phẩm
                            originalPrice: cartItem.productVariant.CompareAtPrice ?? (cartItem.productVariant.product?.Discount > 0 ? cartItem.productVariant.Price : null),
                            quantity: cartItem.Quantity,
                            subtotal: itemSubtotal,
                            hasInsurance: false,
                            product: cartItem.productVariant.product
                        };
                    });
                    
                    calculatedTotalProductsPrice += shopSubtotal;
                    
                    const shippingFeePerShop = 30000; // Phí ship tạm thời

                    shopOrders.push({
                        shopId,
                        shopName: firstItem.shop.ShopName,
                        shopLevel: firstItem.shop.Level,
                        items: checkoutItems,
                        shippingMethod: 'Nhanh',
                        shippingFee: shippingFeePerShop,
                        deliveryEstimate: '2-3 ngày',
                        appliedVoucher: storedData.appliedShopVouchers[shopId] || null,
                        messageToSeller: '',
                    });
                }

                // TÍNH TOÁN LẠI TOÀN BỘ SUMMARY
                const totalShippingFee = shopOrders.reduce((sum, so) => sum + so.shippingFee, 0);
                
                const totalShopVoucherDiscount = shopOrders.reduce((sum, so) => {
                    if (!so.appliedVoucher) return sum;
                    const shopSubtotal = so.items.reduce((s, item) => s + item.subtotal, 0);
                    return sum + calculateDiscountForVoucher(so.appliedVoucher, shopSubtotal);
                }, 0);
                
                // Lấy giá trị voucher platform từ dữ liệu đã lưu
                const totalFreeshipDiscount = storedData.summary.totalFreeship ?? 0;
                const totalSaleoffDiscount = storedData.summary.totalSaleoff ?? 0;
                const totalPlatformVoucherDiscount = totalFreeshipDiscount + totalSaleoffDiscount;

                const totalDiscount = totalShopVoucherDiscount + totalPlatformVoucherDiscount;
                const finalTotal = calculatedTotalProductsPrice + totalShippingFee - totalDiscount;
                
                const finalCheckoutData: CheckoutData = {
                    orderId: storedData.orderId, 
                    address: defaultAddress,
                    shopOrders,
                    appliedPlatformVouchers: storedData.appliedPlatformVouchers,
                    summary: {
                        totalProductsPrice: calculatedTotalProductsPrice, // Dùng giá đã tính toán lại
                        totalShippingFee: totalShippingFee,
                        totalShopVoucherDiscount: totalShopVoucherDiscount,
                        totalPlatformVoucherDiscount: totalPlatformVoucherDiscount, // Gộp cả hai
                        totalFreeship: totalFreeshipDiscount,
                        totalSaleoff: totalSaleoffDiscount,
                        totalDiscount: totalDiscount,
                        finalTotal: finalTotal, // Dùng giá đã tính toán lại
                        address: defaultAddress
                    },
                    paymentMethod: { method: 'Thanh toán khi nhận hàng', type: 'COD', canChange: true },
                };
                
                setCheckoutData(finalCheckoutData);


            } catch (e) {
                console.error("Failed to process checkout data:", e);
                setError('Dữ liệu thanh toán không hợp lệ.');
            } finally {
                setLoading(false);
            }
        };

        buildCheckoutData();
        }
        setLoading(false);
    };

    loadData();

    }, [searchParams]);


    const handleVnPayPayment = async () => {
        console.log(`[handleVnPayPayment] Initiated for orderId: ${orderId}`);
        if (!orderId) {
            toast.error("Không tìm thấy đơn hàng để thanh toán.");
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
  const handleSelectShopVoucher = (shopId: number) => alert(`Chọn voucher của shop ${shopId} đang được phát triển!`);
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
  const handleSelectPlatformVoucher = () => alert('Chọn Shopee Voucher đang được phát triển!');

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
        console.log("[handlePlaceOrder] Initiated. Current checkoutData:", checkoutData);
        if (!checkoutData || !checkoutData.address) {
            toast.error("Vui lòng chọn địa chỉ giao hàng.");
            return;
        }
         // TÍNH TOÁN LẠI CÁC GIÁ TRỊ TRƯỚC KHI GỬI
        const itemsPayload = checkoutData.shopOrders.flatMap(shopOrder =>
            shopOrder.items.map(item => {
                // Tính toán giá cuối cùng và thành tiền cho từng sản phẩm
                const finalPrice = calculateFinalItemPrice(item.price, item.originalPrice, item.product?.Discount);
                return {
                    variantId: item.variantId,
                    quantity: item.quantity,
                    // GỬI ĐI GIÁ ĐÃ GIẢM
                    priceAtPurchase: finalPrice,
                    // GỬI ĐI THÀNH TIỀN DỰA TRÊN GIÁ ĐÃ GIẢM
                    subtotal: finalPrice * item.quantity,
                };
            })
        );
        
        // CHUẨN BỊ THÔNG TIN VOUCHER
        const shopVouchersApplied = checkoutData.shopOrders
            .filter(so => so.appliedVoucher)
            .map(so => ({
                shopId: so.shopId,
                code: so.appliedVoucher!.Code,
                discount: calculateDiscountForVoucher(
                    so.appliedVoucher!,
                    so.items.reduce((sum, item) => sum + calculateFinalItemPrice(item.price, item.originalPrice, item.product?.Discount) * item.quantity, 0)
                ),
            }));

        const platformVoucherCodes: { saleOff?: string, freeShip?: string } = {};
        const platformDiscountAmounts: { saleOff?: number, freeShip?: number } = {};

        if (checkoutData.appliedPlatformVouchers.saleOffVoucher && checkoutData.summary.totalSaleoff > 0) {
            platformVoucherCodes.saleOff = checkoutData.appliedPlatformVouchers.saleOffVoucher.Code;
            platformDiscountAmounts.saleOff = checkoutData.summary.totalSaleoff;
        }
        if (checkoutData.appliedPlatformVouchers.freeShipVoucher && checkoutData.summary.totalFreeship > 0) {
            platformVoucherCodes.freeShip = checkoutData.appliedPlatformVouchers.freeShipVoucher.Code;
            platformDiscountAmounts.freeShip = checkoutData.summary.totalFreeship;
        }
        // Tạo payload để gửi lên API /api/orders/place
        const payload = {
            shippingAddressId: checkoutData.address.AddressID,
            shippingFullName: checkoutData.address.FullName,
            shippingPhoneNumber: checkoutData.address.PhoneNumber,
            notes: checkoutData.shopOrders.map(so => so.messageToSeller).filter(m => m).join('; '),
            totalAmount: checkoutData.summary.finalTotal,
            subtotalAmount: checkoutData.summary.totalProductsPrice,
            shippingFee: checkoutData.summary.totalShippingFee,
            discountAmount: checkoutData.summary.totalDiscount,
            paymentMethod: checkoutData.paymentMethod.type,
            items: itemsPayload,

            platformVoucherData: {
                codes: platformVoucherCodes,
                discounts: platformDiscountAmounts
            },
            totalShopVoucherDiscount: checkoutData.summary.totalShopVoucherDiscount, // Tổng giảm giá từ voucher shop
            shopVouchersApplied: shopVouchersApplied
        };
        
        try {
            // Gọi API để tạo đơn hàng nháp
             console.log("[handlePlaceOrder] Sending payload to /api/orders/place:", payload);
            const response = await fetch(`${API_URL}/orders/place`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include', // Quan trọng để gửi cookie
                    body: JSON.stringify(payload),
                });

            const result = await response.json();

            if (!response.ok) {
                 if (result.errors) {
                    // Lỗi validation, có thể hiển thị lỗi đầu tiên
                    const firstErrorKey = Object.keys(result.errors)[0];
                    const firstErrorMessage = result.errors[firstErrorKey][0];
                    throw new Error(`Lỗi dữ liệu: ${firstErrorMessage}`);
                }
                throw new Error(result.message || 'Không thể đặt hàng.');
            }

            toast.success("Đã tạo đơn hàng nháp thành công!");

            // Xóa dữ liệu cũ trong localStorage và chuyển hướng với orderId
            localStorage.removeItem('checkoutData');
            router.push(`/checkout?orderId=${result.orderId}`); // Tải lại trang với orderId trên URL

        } catch (error: any) {
            console.error("[handlePlaceOrder] FAILED:", error);
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

        const paymentMethod = checkoutData?.paymentMethod.type.toUpperCase() || 'COD';
        let payload: any = { paymentMethod };
        if (paymentMethod === 'PAYPAL' && paypalDetails) {
            payload.paymentDetails = {
                transactionId: paypalDetails.id,
                status: paypalDetails.status,
            };
        }

        try {
            const response = await fetch(`${API_URL}api/orders/${orderId}/complete`,{
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

return (
        <div className="bg-gray-100 min-h-screen pb-40">
            {orderId && orderCode && (
                    <div className="p-4 bg-blue-100 border border-blue-300 text-blue-800 rounded-md text-center my-4">
                        Bạn đang hoàn tất thanh toán cho đơn hàng: <span className="font-bold">{orderCode}</span>
                    </div>
                )}
            <div className="container mx-auto max-w-6xl px-4">
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