// Biến này sẽ lấy giá trị từ Environment Variable trên Render,
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost';

export const API_URL = `${BACKEND_URL}/api`;
// Dùng cho Sanctum CSRF cookie và các đường dẫn không có /api
export const WEB_URL = BACKEND_URL;

// Dùng cho PayPal
export const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'AfQlLBjI2ovq7kyeTT2wIziT3z7G4eNelsnSXuyDmUdbwou5IhClm1EuiEsVdOc24elQK-x3VC8d7ITb';