// export async function createPayPalOrder(orderId: string) {
//     try {
//         const order = await prisma.order.findFirst({ where: { id: orderId } });
//         if (!order) throw new Error('Order not found');
//         const paypalOrder = await paypal.createOrder(Number(order.totalPrice));
//         // console.log({ 'paypalOrder': paypalOrder });
//         await prisma.order.update({
//             where: { id: orderId },
//             data: {
//                 paymentResult: {
//                     id: paypalOrder.id,
//                     email_address: '',
//                     status: '',
//                     pricePaid: 0,
//                 }
//             }
//         });
//         return { success: true, message: 'Item order created successfully', data: paypalOrder.id }
//     } catch (error) {
//         if (isRedirectError(error)) throw error;
//         return { success: false, message: formatError(error) }
//     } 
// }

// // approve paypal order
// export async function approvePayPalOrder(orderId: string, data: {orderID: string}) { 
//  try {
//      const order = await prisma.order.findFirst({ where: { id: orderId } });
//      if (!order) throw new Error('Order not found');
//      const captureData = await paypal.createPayment(data.orderID);
//     //  console.log({ 'captureData': captureData });
//      if (!captureData || captureData.status !== 'COMPLETED' || captureData.id !== (order.paymentResult as PaymentResult)?.id) {
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