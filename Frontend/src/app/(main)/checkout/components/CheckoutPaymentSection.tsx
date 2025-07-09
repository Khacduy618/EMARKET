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
import { Badge } from "@/components/ui/badge";
import { CheckoutData, formatDateTime } from '@/types';
import { toast } from 'react-toastify';


interface CheckoutPaymentSectionProps {
  paymentMethod: CheckoutData['paymentMethod'];
  onPaymentMethodChange: () => void;
//   payPalClientID: string;
  isPaid: boolean;
  paidAt: any;
  // Pass down the summary or final total to be used in the order
//   summary: CheckoutData['summary']; 
}


// You will need to pass the `summary` and `onPlaceOrder` props to this component
const CheckoutPaymentSection: React.FC<CheckoutPaymentSectionProps> = ({ paymentMethod, onPaymentMethodChange ,isPaid, paidAt}) => {
  return (
    <div className="mt-4 bg-white rounded-sm shadow-sm border border-gray-200 py-4 px-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center font-semibold text-gray-800">
           <CreditCard size={18} className="mr-2"/>
           <span>Phương thức thanh toán</span>
        </div>
        <div className="flex items-center text-sm">
          <div className="ml-auto mr-4 text-gray-700 min-w-[250px] justify-center">
            {/* {paymentMethod.type === 'Paypal' ? (
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
            )} */}
                        <p className="text-center">{paymentMethod.method}</p>
                        
                            {/* Hiển thị trạng thái thanh toán cho các phương thức không phải COD */}
                            {paymentMethod.type !== 'COD' && (
                                <div className="mt-3 text-center">
                                {isPaid ? (
                                    <Badge variant='secondary'>
                                        Paid at {formatDateTime(paidAt!).dateTime}
                                    </Badge>
                                ) : (
                                    <Badge variant='destructive'>
                                        Not Paid
                                    </Badge>
                                )}
                                </div>
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