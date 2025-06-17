// app/(main)/checkout/components/CheckoutPageContent.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image'; // Giữ lại Image cho các ảnh sản phẩm
import Link from 'next/link';
import { FaCircleQuestion, FaCommentDots } from 'react-icons/fa6'; // Chỉ giữ icon chat cuối trang

// Import các component con
import CheckoutAddressSection from './CheckoutAddressSection';
import CheckoutProductSection from './CheckoutProductSection'; // Component sản phẩm
import CheckoutShopVoucherSection from './CheckoutShopVoucherSection'; // Component voucher/tin nhắn shop
import CheckoutPlatformVoucherSection from './CheckoutPlatformVoucherSection'; // Component voucher toàn sàn
import CheckoutPaymentSection from './CheckoutPaymentSection';
import CheckoutSummary from './CheckoutSummary';

// Lấy tất cả types từ '@/types' để đảm bảo đồng bộ
import { CheckoutData, Address, CheckoutShopOrder, CheckoutProductItem, CheckoutVoucher, CheckoutSummaryDetails, ShopLevel } from '@/types';


// Helper functions (tái sử dụng từ OrderCard)
const formatVND = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// --- MOCK DATA CHO ProductVariants VÀ ProductImages ---
interface MockVariant {
  VariantID: number;
  ProductID: number;
  ImageURL: string | null;
  Price: number;
  CompareAtPrice: number | null;
  SKU: string | null;
  StockQuantity: number;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

interface MockProductImage {
  ImageID: number;
  ProductID: number;
  ImageURL: string;
  IsPrimary: boolean;
}

const mockProductVariants: MockVariant[] = [
  { VariantID: 1, ProductID: 1, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', Price: 28990000, CompareAtPrice: 30500000, SKU: 'XPROMAX-BLK-256', StockQuantity: 50, IsActive: true, CreatedAt: '', UpdatedAt: '' },
  { VariantID: 2, ProductID: 1, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', Price: 32990000, CompareAtPrice: 34500000, SKU: 'XPROMAX-BLU-512', StockQuantity: 30, IsActive: true, CreatedAt: '', UpdatedAt: '' },
  { VariantID: 3, ProductID: 2, ImageURL: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/a/samsung-galaxy-buds-3-6_2.png', Price: 2490000, CompareAtPrice: 2790000, SKU: 'ZBUDS3-WHT', StockQuantity: 100, IsActive: true, CreatedAt: '', UpdatedAt: '' },
  { VariantID: 4, ProductID: 2, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', Price: 2490000, CompareAtPrice: 2790000, SKU: 'ZBUDS3-BLK', StockQuantity: 80, IsActive: true, CreatedAt: '', UpdatedAt: '' },
  { VariantID: 5, ProductID: 3, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', Price: 350000, CompareAtPrice: null, SKU: 'TSHIRT-COT-BLK-M', StockQuantity: 150, IsActive: true, CreatedAt: '', UpdatedAt: '' },
  { VariantID: 6, ProductID: 3, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', Price: 350000, CompareAtPrice: null, SKU: 'TSHIRT-COT-WHT-L', StockQuantity: 120, IsActive: true, CreatedAt: '', UpdatedAt: '' },
  { VariantID: 7, ProductID: 4, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', Price: 25990000, CompareAtPrice: 27990000, SKU: 'ULTRA-Y-SLV-16-512', StockQuantity: 25, IsActive: true, CreatedAt: '', UpdatedAt: '' },
  { VariantID: 8, ProductID: 5, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', Price: 8990000, CompareAtPrice: 9990000, SKU: 'GAMMA-G7-BLK-8-128', StockQuantity: 70, IsActive: true, CreatedAt: '', UpdatedAt: '' },
  { VariantID: 9, ProductID: 5, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', Price: 10490000, CompareAtPrice: 11500000, SKU: 'GAMMA-G7-BLU-12-256', StockQuantity: 40, IsActive: true, CreatedAt: '', UpdatedAt: '' },
  { VariantID: 10, ProductID: 6, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', Price: 38500000, CompareAtPrice: 42000000, SKU: 'TITANX-I7-4060-16-1T', StockQuantity: 20, IsActive: true, CreatedAt: '', UpdatedAt: '' },
  { VariantID: 11, ProductID: 6, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', Price: 48990000, CompareAtPrice: 53000000, SKU: 'TITANX-I9-4070-32-2T', StockQuantity: 10, IsActive: true, CreatedAt: '', UpdatedAt: '' },
  { VariantID: 12, ProductID: 7, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', Price: 650000, CompareAtPrice: null, SKU: 'JEANS-REG-BLU-30', StockQuantity: 90, IsActive: true, CreatedAt: '', UpdatedAt: '' },
  { VariantID: 63, ProductID: 55, ImageURL: null, Price: 1000000, CompareAtPrice: null, SKU: 'UNKNOWN-VARIANT', StockQuantity: 10, IsActive: true, CreatedAt: '', UpdatedAt: '' },
];

const mockProductImages: MockProductImage[] = [
  { ImageID: 1, ProductID: 1, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', IsPrimary: true },
  { ImageID: 2, ProductID: 2, ImageURL: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/a/samsung-galaxy-buds-3-6_2.png', IsPrimary: true },
  { ImageID: 3, ProductID: 3, ImageURL: 'https://picsum.photos/id/3/200/200', IsPrimary: true },
  { ImageID: 4, ProductID: 4, ImageURL: 'https://picsum.photos/id/4/200/200', IsPrimary: true },
  { ImageID: 5, ProductID: 5, ImageURL: 'https://picsum.photos/id/5/200/200', IsPrimary: true },
  { ImageID: 6, ProductID: 6, ImageURL: 'https://picsum.photos/id/6/200/200', IsPrimary: true },
  { ImageID: 7, ProductID: 7, ImageURL: 'https://picsum.photos/id/7/200/200', IsPrimary: true },
  { ImageID: 55, ProductID: 55, ImageURL: 'https://cdn.tgdd.vn/Products/Images/54/327554/tai-nghe-bluetooth-true-wireless-samsung-galaxy-buds-3-pro-r630n-xam-1-750x500.jpg', IsPrimary: true },
  { ImageID: 1001, ProductID: 1001, ImageURL: 'https://picsum.photos/id/1001/200/200', IsPrimary: true },
  { ImageID: 2001, ProductID: 2001, ImageURL: 'https://picsum.photos/id/2001/200/200', IsPrimary: true },
  { ImageID: 2002, ProductID: 2002, ImageURL: 'https://picsum.photos/id/2002/200/200', IsPrimary: true },
  { ImageID: 3001, ProductID: 3001, ImageURL: 'https://picsum.photos/id/3001/200/200', IsPrimary: true },
  { ImageID: 3002, ProductID: 3002, ImageURL: 'https://picsum.photos/id/3002/200/200', IsPrimary: true },
];

const DEFAULT_PLACEHOLDER_IMAGE = '/images/placeholder.png'; // Đảm bảo bạn có file này trong public/images/

const getProductImageUrl = (variantId: number, productId: number): string => {
  const variant = mockProductVariants.find(v => v.VariantID === variantId);
  if (variant && variant.ImageURL) {
    return variant.ImageURL;
  }

  const productPrimaryImage = mockProductImages.find(pi => pi.ProductID === productId && pi.IsPrimary);
  if (productPrimaryImage && productPrimaryImage.ImageURL) {
    return productPrimaryImage.ImageURL;
  }

  return DEFAULT_PLACEHOLDER_IMAGE;
};

// Hàm tạo CheckoutProductItem, đã bao gồm các trường cần thiết từ MockVariant và các trường bổ sung
const generateCheckoutProductItem = (
  itemSeed: number, // Dùng để unique hóa item nếu cần
  productId: number,
  variantId: number,
  productName: string,
  classification: string,
  quantity: number,
  hasInsurance: boolean = false, insurancePrice?: number, insuranceDescription?: string, insuranceLearnMoreLink?: string
): CheckoutProductItem => { // Kiểu trả về là CheckoutProductItem
  const variant = mockProductVariants.find(v => v.VariantID === variantId);

  const price = variant ? variant.Price : 0;
  const originalPrice = variant ? (variant.CompareAtPrice || price) : 0;

  const productImageURL = getProductImageUrl(variantId, productId);

  return {
    // Các trường bắt buộc từ CheckoutProductItem
    VariantID: variantId,
    ProductID: productId,
    productName: productName,
    productImageURL: productImageURL,
    classification: classification,
    price: price,
    originalPrice: originalPrice,
    quantity: quantity,
    subtotal: price * quantity, // subtotal = price * quantity
    hasInsurance: hasInsurance,
    // Các trường optional của bảo hiểm
    insurancePrice: insurancePrice,
    insuranceDescription: insuranceDescription,
    insuranceLearnMoreLink: insuranceLearnMoreLink,
    // Các trường khác từ MockVariant
    SKU: variant?.SKU || null,
    CompareAtPrice: variant?.CompareAtPrice || null, // Đảm bảo trường này có thể null
    StockQuantity: variant?.StockQuantity || 0,
    IsActive: variant?.IsActive || false,
    CreatedAt: variant?.CreatedAt || '',
    UpdatedAt: variant?.UpdatedAt || '',
  };
};

const CheckoutPageContent = () => {
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);

  const calculateSummary = (data: CheckoutData): CheckoutSummaryDetails => {
    let totalProductsPrice = 0; // Tổng tiền hàng (sản phẩm + bảo hiểm)
    let totalShippingFeeRaw = 0; // Tổng phí vận chuyển trước khi áp dụng voucher shop
    let totalShopVoucherDiscount = 0; // Tổng giảm giá từ voucher shop (phí vận chuyển)
    let totalPlatformVoucherDiscount = 0; // Tổng giảm giá từ voucher toàn sàn

    // Tính toán tổng tiền sản phẩm và phí vận chuyển thô
    data.shopOrders.forEach(shopOrder => {
      shopOrder.items.forEach(item => {
        totalProductsPrice += item.subtotal; // Subtotal của item đã là price * quantity
        if (item.hasInsurance && item.insurancePrice) {
          totalProductsPrice += item.insurancePrice; // Cộng thêm phí bảo hiểm
        }
      });
      totalShippingFeeRaw += shopOrder.shippingFee;
      if (shopOrder.shippingVoucherDiscount) {
        totalShopVoucherDiscount += shopOrder.shippingVoucherDiscount;
      }
    });

    // Tổng phí vận chuyển cuối cùng sau khi áp dụng voucher shop
    const totalShippingFeeFinal = Math.max(0, totalShippingFeeRaw - totalShopVoucherDiscount);

    // Lấy giảm giá từ platform voucher đã chọn (chỉ 1 platform voucher được chọn)
    const selectedPlatformVoucher = data.availablePlatformVouchers.find(v => v.isSelected);
    if (selectedPlatformVoucher) {
      totalPlatformVoucherDiscount = selectedPlatformVoucher.discountAmount;
    }

    // Tổng giảm giá từ Shopee Xu
    const totalShopeeCoinsDiscount = data.shopeeCoins.isApplied ? data.shopeeCoins.currentCoins : 0; // Sử dụng currentCoins nếu áp dụng

    // Tổng tiền thanh toán cuối cùng
    // totalProductsPrice (bao gồm bảo hiểm) + totalShippingFeeFinal - totalPlatformVoucherDiscount - totalShopeeCoinsDiscount
    const totalPayment = totalProductsPrice + totalShippingFeeFinal - totalPlatformVoucherDiscount - totalShopeeCoinsDiscount;


    return {
      totalProductsPrice: totalProductsPrice,
      totalShippingFee: totalShippingFeeRaw, // Phí vận chuyển gốc (trước voucher shop)
      totalVoucherDiscount: totalShopVoucherDiscount + totalPlatformVoucherDiscount, // Tổng tất cả các loại voucher giảm giá
      totalShopeeCoinsDiscount: totalShopeeCoinsDiscount,
      totalPayment: totalPayment,
    };
  };

  useEffect(() => {
    // Dữ liệu mock: Cập nhật các ID cho khớp với mockProductVariants/mockProductImages
    const mockData: CheckoutData = {
      user: { UserID: 1, Username: 'duynguynkhc873' },
      address: { AddressID: 1, UserID: 1, FullName: 'Duy nguyen', PhoneNumber: '(+84) 932105214', Street: 'K166/12, Trường Chinh', Ward: 'Phường Hòa An', District: 'Quận Cẩm Lệ', City: 'Đà Nẵng', IsDefault: true, CreatedAt: '', UpdatedAt: '', DeletedAt: null },
      shopOrders: [
        {
          ShopID: 1, shopName: 'Kaw Daily Home', shopLevel: 'Thường', isFavoriteShop: false,
          items: [
            generateCheckoutProductItem(1, 1001, 1, 'Máy Sấy Tóc KAW 2 Chiều Sang Trọng, Công Suất Cao - Sấy Nhanh Khô', 'XANH RÊU', 1, true, 13999, 'Bảo vệ thiết bị điện tử của bạn trước những thiệt hại do sự cố, tiếp xúc với chất lỏng và mất cắp/mất trộm.', '#'),
          ],
          shippingMethod: 'Nhanh', shippingFee: 77900, deliveryEstimate: '19 Tháng 6 - 20 Tháng 6', shippingVoucherDiscount: 0, shippingVoucherNote: 'Nhận Voucher trị giá đ15.000 nếu đơn hàng được giao đến bạn sau ngày 20 Tháng 6 2025.', messageToSeller: '',
        },
        {
          ShopID: 2, shopName: 'Eveline Việt Nam', shopLevel: 'Mall', isFavoriteShop: false,
          items: [
            generateCheckoutProductItem(2, 2001, 3, 'Toner làm căng bóng da Eveline 5% Glycolic Acid', '145ml', 1),
            generateCheckoutProductItem(3, 2002, 5, '[QUÀ TẶNG] Sáp dưỡng da năng V.a.s...', 'QUÀ TẶNG', 1),
          ],
          shippingMethod: 'Nhanh', shippingFee: 32700, deliveryEstimate: '19 Tháng 6 - 20 Tháng 6', shippingVoucherDiscount: 0, shippingVoucherNote: '', messageToSeller: '',
        },
        {
          ShopID: 3, shopName: 'VIBESTU', shopLevel: 'Thường', isFavoriteShop: false,
          items: [
            generateCheckoutProductItem(4, 3001, 8, 'Áo Thun Local Brand VIBESTU "Quýt Làm Cam"', 'Cam Chịu - Đen,M', 3, true, 1199, 'Bảo vệ sản phẩm được bảo hiểm khỏi nhiệt hại do sự cố bất ngờ, tiếp xúc với chất lỏng hoặc hư hỏng trong quá trình sử dụng.', '#'),
            generateCheckoutProductItem(5, 3002, 9, 'Áo Thun Local Brand VIBESTU "Quýt Làm Cam"', 'Quýt Làm - Trắng,M', 1, true, 1199, 'Bảo vệ sản phẩm được bảo hiểm khỏi nhiệt hại do sự cố bất ngờ, tiếp xúc với chất lỏng hoặc hư hỏng trong quá trình sử dụng.', '#'),
          ],
          shippingMethod: 'Nhanh', shippingFee: 45100, deliveryEstimate: '19 Tháng 6 - 20 Tháng 6', shippingVoucherDiscount: 41000, messageToSeller: '',
        },
      ],
      availablePlatformVouchers: [
        { VoucherID: 1, type: 'platform', code: 'PLATFORM_VOUCHER_1', description: 'Mã giảm 45.512đ', discountAmount: 45512, isSelected: true },
      ],
      shopeeCoins: {
        currentCoins: 1000,
        isApplied: false,
        appliedAmount: 0,
      },
      paymentMethod: {
        method: 'Thanh toán khi nhận hàng',
        canChange: true,
      },
      checkoutSummary: {
        totalProductsPrice: 0,
        totalShippingFee: 0,
        totalVoucherDiscount: 0,
        totalShopeeCoinsDiscount: 0,
        totalPayment: 0,
      },
    };

    mockData.checkoutSummary = calculateSummary(mockData);
    setCheckoutData(mockData);
  }, []);

  useEffect(() => {
    if (checkoutData) {
      setCheckoutData(prev => prev ? {
        ...prev,
        checkoutSummary: calculateSummary(prev),
      } : null);
    }
  }, [
    checkoutData?.shopOrders,
    checkoutData?.availablePlatformVouchers,
    checkoutData?.shopeeCoins.isApplied,
    // checkoutData?.shopeeCoins.appliedAmount // Không cần nữa vì nó được tính lại trong calculateSummary
  ]);


  if (!checkoutData) {
    return <div className="text-center py-10">Đang tải trang thanh toán...</div>;
  }

  const toggleShopeeCoins = () => {
    setCheckoutData(prev => {
      if (!prev) return null;
      const newIsApplied = !prev.shopeeCoins.isApplied;
      const newAppliedAmount = newIsApplied ? prev.shopeeCoins.currentCoins : 0;
      return {
        ...prev,
        shopeeCoins: {
          ...prev.shopeeCoins,
          isApplied: newIsApplied,
          appliedAmount: newAppliedAmount,
        },
      };
    });
  };

  const handleAddressChange = () => alert('Thay đổi địa chỉ đang được phát triển!');
  const handleSelectShopVoucher = (shopId: number) => alert(`Chọn voucher của shop ${shopId} đang được phát triển!`);
  const handleMessageChange = (shopId: number, message: string) => {
    setCheckoutData(prev => {
      if (!prev) return null;
      const updatedShopOrders = prev.shopOrders.map(so =>
        so.ShopID === shopId ? { ...so, messageToSeller: message } : so
      );
      return { ...prev, shopOrders: updatedShopOrders };
    });
  };
  const handleShippingMethodChange = (shopId: number) => alert(`Thay đổi phương thức vận chuyển cho shop ${shopId} đang được phát triển!`);
  const handleSelectPlatformVoucher = () => alert('Chọn Shopee Voucher đang được phát triển!');
  const handlePaymentMethodChange = () => alert('Thay đổi phương thức thanh toán đang được phát triển!');


  return (
    <div className="bg-gray-100 min-h-screen pb-40">
      {/* Header cho trang Checkout */}
      <div className="bg-white py-4 px-6 shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <h1 className="text-xl font-bold text-gray-800">Thanh Toán</h1>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto max-w-6xl px-4">
        {/* Địa chỉ nhận hàng */}
        <CheckoutAddressSection
          address={checkoutData.address}
          onAddressChange={handleAddressChange}
        />

        {/* Các sản phẩm theo Shop */}
        {checkoutData.shopOrders.map(shopOrder => (
          <div key={shopOrder.ShopID} className="mt-4 bg-white rounded-md shadow-sm border border-gray-200">
            {/* Component hiển thị Sản phẩm */}
            <CheckoutProductSection shopOrder={shopOrder} />

            {/* Component hiển thị Voucher của Shop, Lời nhắn, Vận chuyển */}
            <CheckoutShopVoucherSection
              shopOrder={shopOrder}
              onMessageChange={handleMessageChange}
              onSelectShopVoucher={handleSelectShopVoucher}
              onShippingMethodChange={handleShippingMethodChange}
            />

            {/* Được đồng kiểm (vẫn giữ ở đây nếu muốn nó nằm riêng) */}
            <div className="flex justify-end items-center text-xs text-gray-500 px-4 pb-3">
              <span>Được đồng kiểm.</span>
              <FaCircleQuestion className="ml-1 text-xs text-gray-400 cursor-pointer hover:text-gray-600" title="Chi tiết về đồng kiểm" />
            </div>

            {/* Tổng số tiền shop */}
            <div className="flex justify-end items-center px-4 pt-3 pb-4 border-t border-gray-100">
              <span className="text-gray-700 text-sm mr-3">Tổng số tiền ({shopOrder.items.length} sản phẩm):</span>
              {/* Tính tổng tiền shop: items subtotal + insurance */}
              <span className="text-xl font-bold text-orange-500">{formatVND(shopOrder.items.reduce((acc, item) => acc + item.subtotal + (item.hasInsurance && item.insurancePrice ? item.insurancePrice : 0), 0))}</span>
            </div>
          </div>
        ))}

        {/* Shopee Voucher và Shopee Xu (Component mới) */}
        <CheckoutPlatformVoucherSection
          availablePlatformVouchers={checkoutData.availablePlatformVouchers}
          shopeeCoins={checkoutData.shopeeCoins}
          onSelectPlatformVoucher={handleSelectPlatformVoucher}
          onToggleShopeeCoins={toggleShopeeCoins}
        />

        {/* Phương thức thanh toán (Component mới) */}
        <CheckoutPaymentSection
          paymentMethod={checkoutData.paymentMethod}
          onPaymentMethodChange={handlePaymentMethodChange}
        />

      {/* Tổng hợp thanh toán (Component mới, cố định ở dưới) */}
      <CheckoutSummary summary={checkoutData.checkoutSummary} />
      </div>


      {/* Nút Chat cố định */}
      {/* <Link href="https://shopee.vn/chat" target="_blank" rel="noopener noreferrer" className="fixed bottom-4 right-4 bg-orange-500 text-white rounded-full p-3 shadow-lg hover:bg-orange-600 transition-colors flex items-center justify-center z-30 w-16 h-16">
        <FaCommentDots className="text-2xl" />
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
          2
        </span>
      </Link> */}
    </div>
  );
};

export default CheckoutPageContent;