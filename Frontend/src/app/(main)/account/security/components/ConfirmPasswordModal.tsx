// app/(main)/(account)/security/page.tsx

"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import {
    enableTwoFactorAuth,
    disableTwoFactorAuth,
    getTwoFactorQrCode,
    getRecoveryCodes,
    confirmTwoFactorAuth,
} from '@/services/auth'; // Đảm bảo đường dẫn này đúng, file có thể là `auth.ts`
import { ShieldCheck, ShieldOff } from 'lucide-react'; // Import icons cho đẹp

export default function TwoFactorAuthPage() {
    const { user, fetchUser } = useAuth();

    // States để quản lý dữ liệu 2FA
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [confirmCode, setConfirmCode] = useState('');

    // State để quản lý UI
    const [isLoading, setIsLoading] = useState(false);
    const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);

    // Trạng thái 2FA hiện tại của người dùng
    // Sử dụng optional chaining (?.) để tránh lỗi nếu user là null
    const isTwoFactorEnabled = user?.two_factor_enabled || false;

    // Logic để BẬT 2FA, gọi trực tiếp API không cần confirm password
    const handleEnable2FA = async () => {
        setIsLoading(true);
        const toastId = toast.loading("Đang khởi tạo 2FA...");
        try {
            await enableTwoFactorAuth();

            const [qrCodeResponse, recoveryCodesResponse] = await Promise.all([
                getTwoFactorQrCode(),
                getRecoveryCodes()
            ]);

            setQrCode(qrCodeResponse.svg);
            setRecoveryCodes(recoveryCodesResponse);
            toast.update(toastId, { render: "Vui lòng quét mã QR để tiếp tục.", type: "info", isLoading: false, autoClose: 5000 });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Không thể bật 2FA. Vui lòng thử lại.";
            toast.update(toastId, { render: errorMessage, type: "error", isLoading: false, autoClose: 5000 });
        } finally {
            setIsLoading(false);
        }
    };

    // Logic để TẮT 2FA, có thêm một confirm dialog của trình duyệt
    const handleDisable2FA = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn tắt Xác thực hai yếu tố không? Tài khoản của bạn sẽ kém an toàn hơn.")) {
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading("Đang tắt 2FA...");
        try {
            await disableTwoFactorAuth();
            await fetchUser(); // Làm mới thông tin user, isTwoFactorEnabled sẽ thành false
            toast.update(toastId, { render: "Đã tắt Xác thực hai yếu tố.", type: "success", isLoading: false, autoClose: 3000 });
        } catch (error) {
            toast.update(toastId, { render: "Không thể tắt 2FA.", type: "error", isLoading: false, autoClose: 5000 });
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm để xác nhận mã 6 số từ app Authenticator
    const handleConfirmTwoFactor = async () => {
        setIsLoading(true);
        try {
            await confirmTwoFactorAuth(confirmCode);
            setQrCode(null);
            setRecoveryCodes([]); // Xóa mã khôi phục khỏi state sau khi đã dùng
            await fetchUser();
            toast.success("Đã kích hoạt Xác thực hai yếu tố thành công!");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Mã xác thực không hợp lệ.");
        } finally {
            setIsLoading(false);
        }
    };

    // Lấy lại recovery codes nếu người dùng làm mất
    const handleRegenerateRecoveryCodes = async () => {
        // Có thể thêm bước xác nhận mật khẩu ở đây nếu muốn an toàn hơn
        const toastId = toast.loading("Đang tạo mã mới...");
        try {
            // Fortify không có API riêng để regenerate, nó dùng lại API get
            const codes = await getRecoveryCodes();
            setRecoveryCodes(codes);
            setShowRecoveryCodes(true);
            toast.update(toastId, { render: "Đã tạo mã khôi phục mới.", type: "success", isLoading: false, autoClose: 3000 });
        } catch (error) {
            toast.update(toastId, { render: "Không thể tạo mã mới.", type: "error", isLoading: false, autoClose: 5000 });
        }
    }

    return (
        <div className="p-6 md:p-8 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Xác thực hai yếu tố (2FA)</h2>

            {/* ---- GIAO DIỆN KHI ĐÃ BẬT 2FA ---- */}
            {isTwoFactorEnabled && (
                <div className="space-y-6 mt-6">
                    <div className="flex items-center p-4 bg-green-50 text-green-800 rounded-lg">
                        <ShieldCheck className="w-6 h-6 mr-3" />
                        <p className="font-semibold">Bạn đã bật Xác thực hai yếu tố.</p>
                    </div>

                    {showRecoveryCodes && (
                        <div>
                            <p className="mb-2 text-gray-600">Lưu các mã này ở nơi an toàn.</p>
                            <div className="p-4 bg-gray-100 rounded-md">
                                <pre className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-lg font-mono tracking-wider">
                                    {recoveryCodes.map(code => <span key={code}>{code}</span>)}
                                </pre>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center space-x-4">
                        <button onClick={handleRegenerateRecoveryCodes} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                            Xem mã khôi phục
                        </button>
                        <button
                            onClick={handleDisable2FA}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-400">
                            {isLoading ? 'Đang xử lý...' : 'Tắt 2FA'}
                        </button>
                    </div>
                </div>
            )}

            {/* ---- GIAO DIỆN KHI CHƯA BẬT 2FA VÀ CHƯA CÓ QR CODE ---- */}
            {!isTwoFactorEnabled && !qrCode && (
                <div className="mt-6">
                    <div className="flex items-center p-4 bg-orange-50 text-orange-800 rounded-lg">
                        <ShieldOff className="w-6 h-6 mr-3" />
                        <p className="font-semibold">Bạn chưa bật Xác thực hai yếu tố.</p>
                    </div>
                    <p className="my-4 text-gray-600">Khi 2FA được bật, bạn sẽ được yêu cầu nhập một mã ngẫu nhiên, an toàn trong quá trình đăng nhập để tăng cường bảo mật cho tài khoản.</p>
                    <button
                        onClick={handleEnable2FA}
                        disabled={isLoading}
                        className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                        {isLoading ? 'Đang xử lý...' : 'Bật 2FA'}
                    </button>
                </div>
            )}

            {/* ---- GIAO DIỆN TRONG QUÁ TRÌNH KÍCH HOẠT (ĐÃ CÓ QR CODE) ---- */}
            {!isTwoFactorEnabled && qrCode && (
                <div className="mt-6 space-y-6">
                    <p className="text-lg font-semibold">Hoàn tất kích hoạt 2FA</p>
                    <p className="text-gray-600">1. Quét mã QR sau bằng ứng dụng xác thực của bạn (ví dụ: Google Authenticator, Authy).</p>
                    <div className="p-4 border rounded-lg inline-block bg-white" dangerouslySetInnerHTML={{ __html: qrCode }} />

                    <p className="text-gray-600">2. Lưu lại các mã khôi phục này ở một nơi an toàn. Bạn có thể dùng chúng để truy cập tài khoản nếu mất điện thoại.</p>
                    <div className="p-4 bg-gray-100 rounded-md">
                        <pre className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-lg font-mono tracking-wider">
                            {recoveryCodes.map(code => <span key={code}>{code}</span>)}
                        </pre>
                    </div>

                    <p className="text-gray-600">3. Nhập mã 6 số từ ứng dụng xác thực của bạn vào ô dưới đây để xác nhận và hoàn tất quá trình.</p>
                    <div className="flex items-center space-x-4 max-w-sm">
                        <input
                            type="text"
                            value={confirmCode}
                            onChange={(e) => setConfirmCode(e.target.value)}
                            maxLength={6}
                            className="flex-1 block w-full px-4 py-2 text-xl tracking-widest text-center border rounded-md"
                            placeholder="123456"
                            onKeyDown={(e) => e.key === 'Enter' && handleConfirmTwoFactor()}
                        />
                        <button
                            onClick={handleConfirmTwoFactor}
                            disabled={isLoading}
                            className="px-6 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-400">
                            {isLoading ? 'Đang kiểm tra...' : 'Xác nhận'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
