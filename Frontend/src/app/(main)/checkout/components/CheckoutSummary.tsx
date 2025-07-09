// 'use client';

// import React from 'react';
// import Link from 'next/link';
// import { CheckoutSummaryDetails } from '@/types';

// const formatPrice = (price: number): string => {
//   return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
// };

// interface CheckoutSummaryProps {
//   summary: CheckoutSummaryDetails;
//   onPlaceOrder: () => void;
// }

// const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({ summary, onPlaceOrder }) => {
//   return (
//     <div className='sticky bottom-0 mt-4'>
//       <div className=" bg-white rounded-ss-sm rounded-se-sm shadow-sm border border-gray-200">
//         <div className="p-4 space-y-2 text-sm border-b">
//           <h3 className="text-lg font-semibold text-gray-800 mb-2">Chi tiết thanh toán</h3>
//           <div className="flex justify-between">
//             <span className="text-gray-600">Tổng tiền hàng</span>
//             <span className="text-gray-800">{formatPrice(summary.totalProductsPrice)}</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-600">Phí vận chuyển</span>
//             <span className="text-gray-800">{formatPrice(summary.totalShippingFee)}</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-600">Tổng cộng Voucher giảm giá</span>
//             <span className="text-green-600 font-medium">-{formatPrice(summary.totalDiscount)}</span>
//           </div>
//         </div>
//         <div className="py-4 px-4 flex justify-between items-center">
//           <span className="font-semibold text-gray-800">Tổng thanh toán:</span>
//           <span className="text-2xl font-bold text-orange-500">{formatPrice(summary.finalTotal)}</span>
//         </div>
//       </div>
//       <div className=" bg-white p-4 rounded-es-sm rounded-ee-sm shadow-sm border border-gray-200 flex justify-between items-center">
//         <p className="text-xs text-gray-500 max-w-md">
//           Nhấn "Đặt Hàng" đồng nghĩa với việc bạn đồng ý tuân theo 
//           <Link href="/terms" className="text-blue-500"> Điều khoản E-Market</Link>.
//         </p>
//         <button
//           onClick={onPlaceOrder}
//           className="bg-orange-500 text-white px-12 py-3 rounded-md text-base font-semibold hover:bg-orange-600 transition-colors"
//         >
//           Đặt Hàng
//         </button>
//       </div>
//     </div>
//   );
// };

// export default CheckoutSummary;

'use client';

import React from 'react';
import Link from 'next/link';
// Import các types cần thiết
import { CheckoutData } from '@/types';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import type { OrderResponseBody } from "@paypal/paypal-js";
import { toast } from 'react-toastify';
import { Loader, AlertTriangle } from 'lucide-react';

// --- Helper component cho các nút PayPal (để giữ cho code chính gọn gàng) ---
const PaypalButtonWrapper = ({ currency, summary, onPlaceOrder }: { currency: string, summary: CheckoutData['summary'], onPlaceOrder: (details: OrderResponseBody) => void }) => {
    const [{ isPending, isRejected }] = usePayPalScriptReducer();

    // Trạng thái tải và lỗi cho chính script PayPal
    if (isPending) return <div className="flex justify-center items-center h-[48px]"><Loader className="w-6 h-6 animate-spin text-blue-500" /></div>;
    if (isRejected) {
        return (
            <div className="flex flex-col items-center justify-center text-center text-red-600 p-2">
                <AlertTriangle className="w-5 h-5 mb-1" />
                <span className="text-xs">Lỗi tải PayPal. Vui lòng tải lại trang.</span>
            </div>
        );
    }
    
    // Các hàm xử lý của PayPal
    const createOrder = (data: any, actions: any) => {
        const amountValue = summary.finalTotal.toFixed(2); // PayPal cần giá trị dạng chuỗi
        console.log("Attempting to create PayPal order with amount:", amountValue, "and currency:", currency);
        if (parseFloat(amountValue) <= 0) {
            toast.error("Tổng tiền phải lớn hơn 0.");
            return Promise.reject(new Error("Invalid order amount."));
        }
        return actions.order.create({
            purchase_units: [{ amount: { currency_code: currency, value: amountValue } }],
        });
    };

    const onApprove = (data: any, actions: any) => {
        return actions.order.capture().then((details: OrderResponseBody) => {
            const payerName = details.purchase_units?.[0]?.shipping?.name?.full_name || 'Khách hàng';
            toast.success(`Giao dịch thành công bởi ${payerName}.`);
            onPlaceOrder(details); // Chuyển thông tin chi tiết về cho handler chính
        }).catch((err: any) => {
            toast.error("Không thể xử lý thanh toán. Vui lòng thử lại.");
            console.error("PayPal Capture Error:", err);
        });
    };

    const onError = (err: any) => {
        toast.error("Đã xảy ra lỗi với PayPal.");
        console.error("PayPal Button Error:", err);
    };

    return (
        <PayPalButtons
            key={`${summary.finalTotal}-${currency}`}
            style={{ layout: "vertical", label: "pay", height: 48 }}
            createOrder={createOrder}
            onApprove={onApprove}
            onError={onError}
            className="w-full" // Đảm bảo nút PayPal chiếm đủ không gian
        />
    );
};


// --- Cập nhật Props Interface ---
interface CheckoutSummaryProps {
  summary: CheckoutData['summary'];
  paymentMethod: CheckoutData['paymentMethod'];
  payPalClientID: string;
  onPlaceOrder: (paypalDetails?: OrderResponseBody) => void;
}

// --- Component CheckoutSummary Chính ---
const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({ summary, paymentMethod, payPalClientID, onPlaceOrder }) => {
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className='sticky bottom-0 mt-4'>
      {/* Phần hiển thị chi tiết giữ nguyên */}
      <div className=" bg-white rounded-ss-sm rounded-se-sm shadow-sm border border-gray-200">
        <div className="p-4 space-y-2 text-sm border-b">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Chi tiết thanh toán</h3>
          <div className="flex justify-between">
            <span className="text-gray-600">Tổng tiền hàng</span>
            <span className="text-gray-800">{formatPrice(summary.totalProductsPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phí vận chuyển</span>
            <span className="text-gray-800">{formatPrice(summary.totalShippingFee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tổng cộng Voucher giảm giá</span>
            <span className="text-green-600 font-medium">-{formatPrice(summary.totalDiscount)}</span>
          </div>
        </div>
        <div className="py-4 px-4 flex justify-between items-center">
          <span className="font-semibold text-gray-800">Tổng thanh toán:</span>
          <span className="text-2xl font-bold text-orange-500">{formatPrice(summary.finalTotal)}</span>
        </div>
      </div>

      {/* --- KHU VỰC HÀNH ĐỘNG ĐÃ ĐƯỢC CẬP NHẬT --- */}
      <div className=" bg-white p-4 rounded-es-sm rounded-ee-sm shadow-sm border border-gray-200 flex justify-between items-center">
        <p className="text-xs text-gray-500 max-w-md">
          Nhấn "Đặt Hàng" đồng nghĩa với việc bạn đồng ý tuân theo 
          <Link href="/terms" className="text-blue-500"> Điều khoản E-Market</Link>.
        </p>
        
        <div className="w-full max-w-[250px]">
          {/* --- LOGIC ĐIỀU KIỆN --- */}
          {paymentMethod.type === 'Paypal' ? (
            // Nếu là PayPal, hiển thị các nút PayPal
            payPalClientID ? (
              <PayPalScriptProvider options={{ clientId: payPalClientID, currency: "USD" }}>
                <PaypalButtonWrapper 
                  currency="USD"
                  summary={summary}
                  onPlaceOrder={onPlaceOrder}
                />
              </PayPalScriptProvider>
            ) : (
              <div className="text-red-500 text-center text-sm p-3">PayPal chưa được cấu hình.</div>
            )
          ) : (
            // Nếu là COD, hiển thị nút "Đặt Hàng" truyền thống
            <button
              onClick={() => onPlaceOrder()} // Gọi onPlaceOrder không có tham số
              className="w-full bg-orange-500 text-white px-12 py-3 rounded-md text-base font-semibold hover:bg-orange-600 transition-colors"
            >
              Đặt Hàng
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutSummary;