// // app/(main)/checkout/components/CheckoutPaymentSection.tsx
// 'use client';

// import React from 'react';
// import { CheckoutData } from '@/types';

// interface CheckoutPaymentSectionProps {
//   paymentMethod: {
//     method: string;
//     canChange: boolean;
//   };
//   onPaymentMethodChange: () => void;
// }

// const CheckoutPaymentSection: React.FC<CheckoutPaymentSectionProps> = ({ paymentMethod, onPaymentMethodChange }) => {
//   return (
//     <div className="mt-4 bg-white rounded-md shadow-sm border border-gray-200 py-4 px-4 mb-4">
//       <div className="flex justify-between items-center text-sm text-gray-800">
//         <span className="font-semibold">Phương thức thanh toán</span>
//         <span className="ml-auto mr-4">{paymentMethod.method}</span>
//         {paymentMethod.canChange && (
//           <button onClick={onPaymentMethodChange} className="text-blue-500 hover:text-blue-600">THAY ĐỔI</button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CheckoutPaymentSection;
// 'use client';

// import React from 'react';
// import { CreditCard } from 'lucide-react';
// import { CheckoutData } from '@/types';

// interface CheckoutPaymentSectionProps {
//   paymentMethod: CheckoutData['paymentMethod'];
//   onPaymentMethodChange: () => void;
// }

// const CheckoutPaymentSection: React.FC<CheckoutPaymentSectionProps> = ({ paymentMethod, onPaymentMethodChange }) => {
//   return (
//     <div className="mt-4 bg-white rounded-sm shadow-sm border border-gray-200 py-4 px-4">
//       <div className="flex justify-between items-center">
//         <div className="flex items-center font-semibold text-gray-800">
//            <CreditCard size={18} className="mr-2"/>
//            <span>Phương thức thanh toán</span>
//         </div>
//         <div className="flex items-center text-sm">
//           <span className="ml-auto mr-4 text-gray-700">{paymentMethod.method}</span>
//           {paymentMethod.canChange && (
//             <button onClick={onPaymentMethodChange} className="text-blue-500 hover:text-blue-600 font-medium">THAY ĐỔI</button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CheckoutPaymentSection;

// app/(main)/checkout/components/CheckoutPaymentSection.tsx (Corrected)
'use client';

import React from 'react';
import { CreditCard, Loader, AlertTriangle } from 'lucide-react';
import { CheckoutData } from '@/types';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { toast } from 'react-toastify';
import type { OnApproveData, CreateOrderData, OrderResponseBody } from "@paypal/paypal-js";


interface CheckoutPaymentSectionProps {
  paymentMethod: CheckoutData['paymentMethod'];
  onPaymentMethodChange: () => void;
  payPalClientID: string;
  // Pass down the summary or final total to be used in the order
  summary: CheckoutData['summary']; 
}

const PaypalButtonWrapper = ({ currency, summary, onPlaceOrder }: { currency: string, summary: CheckoutData['summary'], onPlaceOrder: (details: any) => void }) => {
    const [{ isPending, isRejected }] = usePayPalScriptReducer();

    if (isPending) {
        return (
            <div className="flex gap-2 justify-center items-center text-center w-full py-2">
                <Loader className="w-4 h-4 animate-spin" /> 
                <span>Loading PayPal...</span>
            </div>
        );
    }
    if (isRejected) {
        return (
            <div className="flex gap-2 justify-center items-center text-center text-red-600 w-full py-2">
                 <AlertTriangle className="w-4 h-4" />
                <span>Error: Could not load PayPal.</span>
            </div>
        );
    }
    
    const createOrder = (data: CreateOrderData, actions: any) => {
        console.log("Creating PayPal order with amount:", summary.finalTotal);
        // Ensure the finalTotal is a string with two decimal places
        const amountValue = summary.finalTotal.toFixed(2);

        return actions.order.create({
            purchase_units: [{
                amount: {
                    // FIX #1: Added currency_code as required by the PayPal API
                    currency_code: currency,
                    value: amountValue, 
                },
                // You can add more details here, like item breakdown or shipping info
            }],
        });
    };

    const onApprove = (data: OnApproveData, actions: any) => {
        console.log("PayPal order approved:", data);
        
        // Capture the funds from the transaction
        return actions.order.capture().then(function(details: any) {
            // FIX #2 & #3: Using the modern, non-deprecated way to get payer info
            // The shipping name is often the most useful for order fulfillment.
            const payerName = details.purchase_units?.[0]?.shipping?.name?.full_name || details.payer?.name?.given_name || 'Customer';
            
            console.log("Transaction Details:", details);
            toast.success(`Transaction completed successfully by ${payerName}.`);

            // This is where you would call your backend to save the order
            // and then redirect the user or update the UI.
            // Example: onPlaceOrder(details);
        }).catch((err: any) => {
            console.error("Failed to capture PayPal transaction:", err);
            toast.error("An error occurred while processing your payment.");
        });
    };

    const onError = (err: any) => {
        console.error("PayPal Buttons Error:", err);
        toast.error("An error occurred with the PayPal payment.");
    };

    return (
        <PayPalButtons
            style={{ layout: "vertical", label: "pay", height: 48 }}
            createOrder={createOrder}
            onApprove={onApprove}
            onError={onError}
        />
    );
}

// You will need to pass the `summary` and `onPlaceOrder` props to this component
const CheckoutPaymentSection: React.FC<CheckoutPaymentSectionProps> = ({ paymentMethod, onPaymentMethodChange, payPalClientID, summary }) => {
  return (
    <div className="mt-4 bg-white rounded-sm shadow-sm border border-gray-200 py-4 px-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center font-semibold text-gray-800">
           <CreditCard size={18} className="mr-2"/>
           <span>Phương thức thanh toán</span>
        </div>
        <div className="flex items-center text-sm">
          <div className="ml-auto mr-4 text-gray-700 min-w-[250px]">
            {paymentMethod.type === 'Paypal' ? (
                payPalClientID ? (
                    // Note: You might want to use a currency like "VND" if your PayPal account supports it.
                    // For sandbox testing, "USD" is the most reliable.
                    <PayPalScriptProvider options={{ clientId: payPalClientID, currency: "VND" }}>
                        <PaypalButtonWrapper 
                          currency="VND" 
                          summary={summary}
                          onPlaceOrder={(details) => console.log("Order placed with details:", details)}
                        />
                    </PayPalScriptProvider> 
                ) : (
                    <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span>PayPal is not configured.</span>
                    </div>
                )
            ) : (
                <span>{paymentMethod.method}</span>
            )}
          </div>
          {paymentMethod.canChange && (
            <button onClick={onPaymentMethodChange} className="text-blue-500 hover:text-blue-600 font-medium">THAY ĐỔI</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPaymentSection;