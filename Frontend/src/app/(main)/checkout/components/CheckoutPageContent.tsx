// app/(main)/checkout/components/CheckoutPageContent.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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


const CheckoutPageContent = () => {
   const router = useRouter();
    const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [allUserAddresses, setAllUserAddresses] = useState<Address[]>([]);
    const [isUpdateAddressModalOpen, setIsUpdateAddressModalOpen] = useState(false);
    const [addressToUpdateId, setAddressToUpdateId] = useState<number | null>(null);
    const [editingAddressId, setEditingAddressId] = useState<number | null>(null);

  useEffect(() => {
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
                
                let totalProductsPrice = 0;
                let totalShippingFee = 0;
                let totalShopVoucherDiscount = 0;
                
                const shopOrders: CheckoutShopOrder[] = [];

                for (const shopIdStr in groupedItems) {
                    const shopId = parseInt(shopIdStr);
                    const itemsInShop = groupedItems[shopId];
                    const firstItem = itemsInShop[0];

                    const checkoutItems: CheckoutProductItem[] = itemsInShop.map(cartItem => {
                        const price = cartItem.productVariant.Price;
                        return {
                            variantId: cartItem.VariantID,
                            productId: cartItem.productVariant.product.ProductID,
                            shopId: cartItem.ShopID, // Thêm vào
                            name: cartItem.productVariant.product.Name,
                            imageUrl: cartItem.productVariant.ImageURL,
                            classification: cartItem.productVariant.attributeValues.map(v => v.Value).join(', '),
                            price: price,
                            originalPrice: cartItem.productVariant.CompareAtPrice,
                            quantity: cartItem.Quantity,
                            subtotal: price * cartItem.Quantity,
                            hasInsurance: false,
                            product: cartItem.productVariant.product
                        };
                    });
                    
                    const shopSubtotal = checkoutItems.reduce((sum, item) => sum + item.subtotal, 0);
                    const appliedVoucher = storedData.appliedShopVouchers[shopId];
                    
                    totalProductsPrice += shopSubtotal;
                    totalShopVoucherDiscount += appliedVoucher ? calculateDiscountForVoucher(appliedVoucher, shopSubtotal) : 0;
                    
                    const currentShopShippingFee = 30000; // Phí ship tạm thời
                    totalShippingFee += currentShopShippingFee;

                    shopOrders.push({
                        shopId,
                        shopName: firstItem.shop.ShopName,
                        shopLevel: firstItem.shop.Level,
                        items: checkoutItems,
                        shippingMethod: 'Nhanh',
                        shippingFee: currentShopShippingFee,
                        deliveryEstimate: '2-3 ngày',
                        appliedVoucher: appliedVoucher || null,
                        messageToSeller: '',
                    });
                }
                const shippingFeePerShop = 30000; // Phí ship tạm thời cho mỗi shop
                const totalCalculatedShippingFee = shopOrders.length * shippingFeePerShop;

                const summaryFromCart = storedData.summary;

               const finalCheckoutData: CheckoutData = {
                    address: defaultAddress,
                    shopOrders: shopOrders.map(so => ({ ...so, shippingFee: shippingFeePerShop })), // Cập nhật phí ship cho từng đơn
                    appliedPlatformVouchers: storedData.appliedPlatformVouchers,
                    summary: {
                        totalProductsPrice: summaryFromCart.totalSubtotal,
                        totalShippingFee: totalCalculatedShippingFee, // Sử dụng phí ship vừa tính
                        totalShopVoucherDiscount: summaryFromCart.totalShopVoucherDiscount,
                        totalPlatformVoucherDiscount: summaryFromCart.totalPlatformVoucherDiscount,
                        totalFreeship: summaryFromCart.totalFreeship,
                        totalSaleoff: summaryFromCart.totalSaleoff,
                        totalDiscount: summaryFromCart.totalDiscount,
                        finalTotal: summaryFromCart.finalTotal + totalCalculatedShippingFee, // Cập nhật lại tổng cuối cùng với phí ship
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
    }, []);
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
    setCheckoutData(prev => {
      if (!prev) return null;
      const newType: PaymentMethodType = prev.paymentMethod.type === 'COD' ? 'Paypal' : 'COD';
      const newMethod = newType === 'COD' ? 'Thanh toán khi nhận hàng' : 'Paypal';
      return {
        ...prev,
        paymentMethod: { ...prev.paymentMethod, type: newType, method: newMethod },
      };
    });
  };

//   const handlePlaceOrder = () => {
//     if (!checkoutData) return;

//     console.log('Placing order with:', checkoutData);

//     let redirectStatus: OrderStatus;
//     const paymentType = checkoutData.paymentMethod.type;

//     if (paymentType === 'COD') {
//       redirectStatus = 'Pending';
//     } else if (paymentType === 'Paypal' || paymentType === 'Stripe') {
//       redirectStatus = 'Shipped';
//     } else {
//       redirectStatus = 'Pending';
//     }

//     alert(`Đặt hàng thành công! Trạng thái đơn hàng: ${redirectStatus}. Chuyển hướng tới Đơn Mua.`);
//     router.push(`/purchase?status=${redirectStatus}`);
//   };
const handlePlaceOrder = (paypalDetails?: OrderResponseBody) => {
    if (!checkoutData) return;

    console.log('Placing order with:', checkoutData);
    if(paypalDetails) {
      console.log('PayPal Details:', paypalDetails);
      // Here you would send the paypalDetails.id (the transaction ID)
      // to your backend to verify and save the order.
    }

    let redirectStatus: OrderStatus = 'Pending';
    const paymentType = checkoutData.paymentMethod.type;

    if (paymentType === 'COD') {
      redirectStatus = 'Pending';
    } else if (paymentType === 'Paypal') {
      // If a successful PayPal transaction happened, the order is paid
      redirectStatus = 'Processing'; // or 'Shipped' depending on your flow
    }

    toast.success(`Đặt hàng thành công! Trạng thái đơn hàng: ${redirectStatus}.`);
    // Uncomment the redirect when you're ready
    // router.push(`/purchase?status=${redirectStatus}`);
  };
return (
        <div className="bg-gray-100 min-h-screen pb-40">
            
            <div className="container mx-auto max-w-6xl px-4">
                <UpdateAddressModal
                isOpen={isUpdateAddressModalOpen}
                onClose={() => {
                    setIsUpdateAddressModalOpen(false);
                    setIsAddressModalOpen(true);
                }}
                addressId={editingAddressId} // Truyền ID hoặc null
                onSuccess={handleAddressSuccess} // Callback khi thành công
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
                    payPalClientID={PAYPAL_CLIENT_ID}
                    summary={checkoutData.summary} 
                />
                <CheckoutSummary summary={checkoutData.summary} onPlaceOrder={handlePlaceOrder} />
            </div>
        </div>
    );
};

export default CheckoutPageContent;