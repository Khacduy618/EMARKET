// src/hooks/useCheckoutData.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  StoredCheckoutData, 
  CheckoutData, 
  Address, 
  CartItem, 
  CheckoutShopOrder, 
  AppliedVouchersCombined, 
  Voucher 
} from '@/types';
import { recalculateSummary, calculateFinalItemPrice } from '@/utils/calculation';
import { fetchUserAddresses } from '@/services/user';
import { toast } from 'react-toastify';

export const useCheckoutData = () => {
 const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
   const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allUserAddresses, setAllUserAddresses] = useState<Address[]>([]);

  // Hàm này sẽ là nguồn duy nhất để cập nhật state VÀ localStorage
  const updateCheckoutData = useCallback((updater: React.SetStateAction<CheckoutData | null>) => {
    // updater có thể là một giá trị mới, hoặc một hàm (prev => newState)
    const newData = typeof updater === 'function' ? (updater as (prevState: CheckoutData | null) => CheckoutData | null)(checkoutData) : updater;
    
    
    setCheckoutData(newData);
    
    // Chỉ cập nhật localStorage nếu không phải là đơn hàng nháp (chưa có orderId)
    // để tránh ghi đè dữ liệu không cần thiết
    if (newData && !newData.orderId) {
      // Logic để tạo StoredCheckoutData từ CheckoutData
      const shopVouchers = newData.shopOrders.reduce((acc, so) => {
        if (so.appliedVoucher) {
          acc[so.shopId] = so.appliedVoucher;
        }
        return acc;
      }, {} as { [key: number]: Voucher });

      // Cần một cách đáng tin cậy để lấy lại cấu trúc CartItem từ CheckoutProductItem
      // Dưới đây là một cách tiếp cận, giả định `item.product` chứa đủ thông tin
      const selectedItemsToStore: CartItem[] = newData.shopOrders.flatMap(so =>
        so.items.map(item => ({
          CartItemID: item.variantId, // Dùng tạm, vì không có CartItemID thật
          VariantID: item.variantId,
          ShopID: item.shopId,
          Quantity: item.quantity,
          productVariant: { // Cần xây dựng lại cấu trúc này
            ...item.product, // Giả sử item.product là một đối tượng Product đầy đủ
            VariantID: item.variantId,
            Price: item.price, // Dùng giá đã tính toán
            CompareAtPrice: item.originalPrice,
            ImageURL: item.imageUrl,
            attributeValues: [], // Thông tin này có thể bị mất nếu không được lưu trữ đúng cách
            product: item.product,
          },
          shop: {
            ShopID: so.shopId,
            ShopName: so.shopName,
            Level: so.shopLevel,
          }
        } as unknown as CartItem)) // Ép kiểu vì cấu trúc không hoàn toàn khớp
      );

      const dataToStore: StoredCheckoutData = {
        selectedItems: selectedItemsToStore,
        appliedShopVouchers: shopVouchers,
        appliedPlatformVouchers: newData.appliedPlatformVouchers,
        summary: newData.summary,
        orderId: newData.orderId,
      };
      
      localStorage.setItem('checkoutData', JSON.stringify(dataToStore));
      console.log("LocalStorage UPDATED:", dataToStore);
    }
  }, [checkoutData]);
  
  // Hàm khởi tạo dữ liệu ban đầu
  useEffect(() => {
    const initializeData = async () => {
      // Chỉ chạy logic này khi không có orderId trên URL
      const orderIdFromUrl = new URLSearchParams(window.location.search).get('orderId');
      if (orderIdFromUrl) {
        setLoading(false); // Sẽ được xử lý bởi useEffect khác trong component
        return;
      }

      setLoading(true);
      setError(null);
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

        // *** LOGIC XÂY DỰNG LẠI shopOrders TỪ LOCALSTORAGE ***
        const shopOrders: CheckoutShopOrder[] = [];
        const groupedItems = storedData.selectedItems.reduce((acc, item) => {
          (acc[item.ShopID] = acc[item.ShopID] || []).push(item);
          return acc;
        }, {} as Record<number, CartItem[]>);

        for (const shopIdStr in groupedItems) {
            const shopId = parseInt(shopIdStr);
            const itemsInShop = groupedItems[shopId];
            const firstItem = itemsInShop[0];

            const checkoutItems = itemsInShop.map(cartItem => {
                const finalPrice = calculateFinalItemPrice(
                    cartItem.productVariant.Price,
                    cartItem.productVariant.CompareAtPrice,
                    cartItem.productVariant.product?.Discount
                );
                return {
                    variantId: cartItem.VariantID,
                    productId: cartItem.productVariant.product.ProductID,
                    shopId: cartItem.ShopID,
                    hasInsurance: false,
                    name: cartItem.productVariant.product.Name,
                    imageUrl: cartItem.productVariant.ImageURL,
                    classification: cartItem.productVariant.attributeValues.map(v => v.Value).join(', '),
                    price: finalPrice,
                    originalPrice: cartItem.productVariant.CompareAtPrice ?? (cartItem.productVariant.product?.Discount > 0 ? cartItem.productVariant.Price : null),
                    quantity: cartItem.Quantity,
                    subtotal: finalPrice * cartItem.Quantity,
                    product: cartItem.productVariant.product
                };
            });
            
            shopOrders.push({
                shopId,
                shopName: firstItem.shop.ShopName,
                shopLevel: firstItem.shop.Level,
                items: checkoutItems,
                shippingMethod: 'Nhanh',
                shippingFee: 30000, // Thay thế bằng logic tính phí ship thực tế
                deliveryEstimate: '2-3 ngày',
                appliedVoucher: storedData.appliedShopVouchers[shopId] || null,
                messageToSeller: '',
            });
        }
        
        const summary = recalculateSummary(shopOrders, storedData.appliedPlatformVouchers);

        const initialData: CheckoutData = {
          orderId: storedData.orderId, // sẽ là null
          address: defaultAddress,
          shopOrders,
          appliedPlatformVouchers: storedData.appliedPlatformVouchers,
          summary: { ...summary, address: defaultAddress },
          paymentMethod: { method: 'Thanh toán khi nhận hàng', type: 'COD', canChange: true },
        };
        
        // Dùng setCheckoutData trực tiếp, không cần update localStorage vì dữ liệu đã có sẵn
        setCheckoutData(initialData);

      } catch (e) {
        setError('Dữ liệu thanh toán không hợp lệ.');
        console.error("Error building checkout data from localStorage:", e);
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
    
    // Clean up localStorage on component unmount to prevent stale data
    return () => {
        const orderIdFromUrl = new URLSearchParams(window.location.search).get('orderId');
        if (!orderIdFromUrl) { // Chỉ xóa nếu không phải là đang trong luồng thanh toán order nháp
            // localStorage.removeItem('checkoutData');
        }
    };

  }, []); // Dependency rỗng để chỉ chạy 1 lần khi component mount

  return { checkoutData, loading, error, allUserAddresses, updateCheckoutData, setAllUserAddresses };
};