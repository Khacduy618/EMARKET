// import { CheckoutData, formatError } from "@/types";
// import { getAuthToken } from "./api";
// import { useState } from "react";
// import { isRedirectError } from "next/dist/client/components/redirect-error";
// import { paypal } from "@/lib/paypal";
// const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
// export async function createPayPalOrder(orderId: string) {
//     try {
        
//         try {
//             // Bạn cần tạo một API endpoint mới để lấy chi tiết đơn hàng
//             const response = await fetch(`/api/orders/${orderId}`, {
//                 headers: {
//                     'Authorization': `Bearer ${getAuthToken()}` // Đảm bảo có xác thực
//                 }
//             });
//             if (!response.ok) throw new Error("Không tìm thấy thông tin đơn hàng.");
            
//             const orderDetails = await response.json();
            
//             // Chuyển đổi dữ liệu từ API về định dạng CheckoutData để hiển thị lại
//             // (Phần này cần bạn tự viết logic chuyển đổi, dưới đây là ví dụ)
//             const reconstructedCheckoutData: CheckoutData = {
//                 orderId: orderDetails.OrderID,
//                 address: orderDetails.address,
//                 shopOrders: orderDetails.shopOrders,
                
//                 // Thêm giá trị mặc định cho trường bị thiếu
//                 appliedPlatformVouchers: {
//                     freeShipVoucher: null,
//                     saleOffVoucher: null,
//                 },

//                 summary: {
//                     totalProductsPrice: orderDetails.SubtotalAmount,
//                     totalShippingFee: orderDetails.ShippingFee,
//                     totalDiscount: orderDetails.DiscountAmount,
//                     finalTotal: orderDetails.TotalAmount,
//                     // Giả định các giá trị này = 0 khi hiển thị lại
//                     totalSaleoff: 0,
//                     totalFreeship: 0,
//                     totalShopVoucherDiscount: 0, 
//                     totalPlatformVoucherDiscount: 0,
//                     address: orderDetails.address
//                 },
//                 paymentMethod: {
//                     method: orderDetails.PaymentMethod === 'PAYPAL' ? 'PAYPAL' : 'Thanh toán khi nhận hàng',
//                     type: orderDetails.PaymentMethod === 'PAYPAL' ? 'PAYPAL' : 'COD',
//                     canChange: false,
//                 },
//             };
//                 setCheckoutData(reconstructedCheckoutData);
//         } catch (e: any) {
//             console.error("Failed to fetch pending order:", e);
//         }
        
//         const paypalOrder = await paypal.createOrder(Number(checkoutData?.orderId));
//         // console.log({ 'paypalOrder': paypalOrder });
       
//         return { success: true, message: 'Item order created successfully', data: paypalOrder.id }
//     } catch (error) {
//         if (isRedirectError(error)) throw error;
//         return { success: false, message: formatError(error) }
//     } 
// }

// // approve paypal order
// export async function approvePayPalOrder(orderId: string, data: {orderID: string}) { 
//  try {
//     try {
//             // Bạn cần tạo một API endpoint mới để lấy chi tiết đơn hàng
//             const response = await fetch(`/api/orders/${orderId}`, {
//                 headers: {
//                     'Authorization': `Bearer ${getAuthToken()}` // Đảm bảo có xác thực
//                 }
//             });
//             if (!response.ok) throw new Error("Không tìm thấy thông tin đơn hàng.");
            
//             const orderDetails = await response.json();
            
//             // Chuyển đổi dữ liệu từ API về định dạng CheckoutData để hiển thị lại
//             // (Phần này cần bạn tự viết logic chuyển đổi, dưới đây là ví dụ)
//             const reconstructedCheckoutData: CheckoutData = {
//                 orderId: orderDetails.OrderID,
//                 address: orderDetails.address,
//                 shopOrders: orderDetails.shopOrders,
                
//                 // Thêm giá trị mặc định cho trường bị thiếu
//                 appliedPlatformVouchers: {
//                     freeShipVoucher: null,
//                     saleOffVoucher: null,
//                 },

//                 summary: {
//                     totalProductsPrice: orderDetails.SubtotalAmount,
//                     totalShippingFee: orderDetails.ShippingFee,
//                     totalDiscount: orderDetails.DiscountAmount,
//                     finalTotal: orderDetails.TotalAmount,
//                     // Giả định các giá trị này = 0 khi hiển thị lại
//                     totalSaleoff: 0,
//                     totalFreeship: 0,
//                     totalShopVoucherDiscount: 0, 
//                     totalPlatformVoucherDiscount: 0,
//                     address: orderDetails.address
//                 },
//                 paymentMethod: {
//                     method: orderDetails.PaymentMethod === 'PAYPAL' ? 'PAYPAL' : 'Thanh toán khi nhận hàng',
//                     type: orderDetails.PaymentMethod === 'PAYPAL' ? 'PAYPAL' : 'COD',
//                     canChange: false,
//                 },
//             };
//                 setCheckoutData(reconstructedCheckoutData);
//         } catch (e: any) {
//             console.error("Failed to fetch pending order:", e);
//         }
//      const captureData = await paypal.createPayment(data.orderID);
//     //  console.log({ 'captureData': captureData });
//      if (!captureData || captureData.status !== 'COMPLETED' || captureData.id !== (checkoutData?.paymentMethod as PaymentResult)?.id) {
//          throw new Error('Error in PayPal payment');
//      }

//      await updateOrderToPaid({
//          orderId,
//          paymentResult: {
//              id: captureData.id,
//              status: captureData.status,
//              email_address: captureData.payer.email_address,
//              pricePaid: captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value
//          }
//      });

//      revalidatePath(`/order/${orderId}`);

//      return {
//          success: true,
//          message: 'Your order has been paid'
//      }
//     } catch (error) {
//         if (isRedirectError(error)) throw error;
//         return { success: false, message: formatError(error) }
//     }
// }

// export async function updateOrderToPaid({ orderId, paymentResult }: { orderId: string, paymentResult: PaymentResult }) {
//     const order = await prisma.order.findFirst({ where: { id: orderId }, include: { orderitems:  true} });
//     if (!order) throw new Error('Order not found');
//     if (order.isPaid) throw new Error('Order is already paid');

//     await prisma.$transaction(async (tx) => {
//         // update all products stock
//         for (const item of order.orderitems) {
//             await tx.product.update({
//                 where: { id: item.productId },
//                 data: { stock: { increment: -item.qty } }
//             });
//         }
//         await tx.order.update({
//             where: { id: orderId },
//             data: {isPaid: true, paidAt: new Date(), paymentResult}
//         });
//     });

//     //TODO: fetch updated order and send mail to the user for their order confirmation

// }