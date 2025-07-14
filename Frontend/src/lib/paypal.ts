import { PAYPAL_API_URL, PAYPAL_APP_SECRET, PAYPAL_CLIENT_ID } from "@/types";

const base = PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

// export const paypal = {
//     createOrder: async function  createOrder(price: number) {
//         const accessToken = await generateAccessToken();
//         const response  = await fetch(base + '/v2/checkout/orders', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${accessToken}`
//             },
//             body: JSON.stringify({
//                 intent: 'CAPTURE',
//                 purchase_units: [{
//                     amount: {
//                         currency_code: 'USD',
//                         value: price
//                     }
//                 }]
//             })
//         });
//         return handleResponse(response);    
//     },
//     createPayment: async function createPayment(orderId: string) {
//         const accessToken = await generateAccessToken();

//         // const response = await fetch(base + '/v2/checkout/orders/' + orderId + '/' + 'CAPTURE', {
//         const response = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${accessToken}`
//             }
//         })
//         return handleResponse(response);    
//     }
// }

// async function generateAccessToken() {
//     const auth = `${PAYPAL_CLIENT_ID}:${PAYPAL_APP_SECRET}`
//     const response = await fetch(base + '/v1/oauth2/token', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/x-www-form-urlencoded',
//             'Authorization': `Basic ${Buffer.from(auth).toString('base64')}`
//         },
//         body: 'grant_type=client_credentials'
//     });

//     const jsonData = await handleResponse(response);
//     return jsonData.access_token;
   
// }

// async function handleResponse(response: Response) {
//     if (response.ok) {
//         return response.json();
//     } else {
//         const errorMessage = await response.text();
//         throw new Error(errorMessage);
//     } 
// }

async function generateAccessToken() {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_APP_SECRET) {
        throw new Error('MISSING_PAYPAL_API_CREDENTIALS');
    }
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_APP_SECRET}`).toString("base64");
    const response = await fetch(`${base}/v1/oauth2/token`, {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
        },
    });
    const data = await response.json();
    return data.access_token;
}

// Hàm helper để xử lý response
async function handleResponse(response: Response) {
    try {
        const jsonResponse = await response.json();
        return {
            jsonResponse,
            httpStatusCode: response.status,
        };
    } catch (err) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }
}

// Tạo đơn hàng PayPal và trả về toàn bộ response
export async function createOrder(totalAmount: number, returnUrl: string, cancelUrl: string) {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders`;

    const payload = {
        intent: 'CAPTURE',
        purchase_units: [
            {
                amount: {
                    currency_code: 'USD',
                    value: totalAmount.toFixed(2),
                },
            },
        ],
        application_context: {
            return_url: returnUrl,
            cancel_url: cancelUrl,
        },
    };

    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        method: "POST",
        body: JSON.stringify(payload),
    });

    return handleResponse(response);
}

// Hoàn tất (capture) đơn hàng PayPal
export async function captureOrder(orderID: string) {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders/${orderID}/capture`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    });

    return handleResponse(response);
}