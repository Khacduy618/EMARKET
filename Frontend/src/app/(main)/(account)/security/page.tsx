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
    regenerateRecoveryCodes as apiRegenerateRecoveryCodes // Đổi tên để tránh xung đột
} from '@/services/auth'; // Đảm bảo đường dẫn service của bạn là đúng
import { ShieldCheck, ShieldOff, RefreshCw } from 'lucide-react'; // Import thêm icon

export default function TwoFactorAuthPage() {
    const { user, fetchUser } = useAuth();

    // States để quản lý dữ liệu 2FA
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [confirmCode, setConfirmCode] = useState('');

    // States để quản lý UI
    const [isLoading, setIsLoading] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);

    // Trạng thái 2FA hiện tại của người dùng, lấy từ context
    const isTwoFactorEnabled = user?.two_factor_enabled || false;

    // Logic để BẬT 2FA
    const handleEnable2FA = async () => {
        setIsLoading(true);
        try {
            await enableTwoFactorAuth();
            const [qrCodeResponse, recoveryCodesResponse] = await Promise.all([
                getTwoFactorQrCode(),
                getRecoveryCodes()
            ]);
            setQrCode(qrCodeResponse.svg);
            setRecoveryCodes(recoveryCodesResponse);
            toast.info("Vui lòng quét mã QR và xác nhận để hoàn tất.");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Không thể bật 2FA.");
        } finally {
            setIsLoading(false);
        }
    };

    // Logic để TẮT 2FA
    const handleDisable2FA = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn tắt Xác thực hai yếu tố?")) return;
        setIsLoading(true);
        try {
            await disableTwoFactorAuth();
            await fetchUser();
            toast.success("Đã tắt Xác thực hai yếu tố.");
        } catch (error) {
            toast.error("Không thể tắt 2FA.");
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm để xác nhận mã 6 số từ app Authenticator và KÍCH HOẠT
    const handleConfirmTwoFactor = async () => {
        setIsLoading(true);
        try {
            await confirmTwoFactorAuth(confirmCode);
            setQrCode(null);
            setRecoveryCodes([]); // Xóa mã khôi phục khỏi state sau khi đã kích hoạt
            await fetchUser(); // Làm mới state user, isTwoFactorEnabled sẽ là true
            toast.success("Đã kích hoạt Xác thực hai yếu tố thành công!");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Mã xác thực không hợp lệ.");
        } finally {
            setIsLoading(false);
        }
    };

    // Lấy lại hoặc tạo mới mã khôi phục
    const handleRegenerateRecoveryCodes = async () => {
        const confirmRegenerate = window.confirm("Thao tác này sẽ vô hiệu hóa bộ mã cũ. Bạn có chắc chắn muốn tạo mã khôi phục mới không?");
        if (!confirmRegenerate) return;

        setIsRegenerating(true);
        try {
            await apiRegenerateRecoveryCodes(); // Gọi API để backend tạo mã mới
            const codes = await getRecoveryCodes(); // Gọi API để lấy bộ mã mới đó về
            setRecoveryCodes(codes);
            setShowRecoveryCodes(true);
            toast.success("Đã tạo mã khôi phục mới thành công!");
        } catch (error) {
            toast.error("Không thể tạo mã mới.");
        } finally {
            setIsRegenerating(false);
        }
    }

    // Lấy và hiển thị mã khôi phục mà không tạo lại
    const handleShowRecoveryCodes = async () => {
        setIsLoading(true);
        try {
            const codes = await getRecoveryCodes();
            setRecoveryCodes(codes);
            setShowRecoveryCodes(true);
        } catch (e) {
            toast.error("Không thể lấy mã khôi phục.");
        } finally {
            setIsLoading(false);
        }
    }

    // --- JSX RENDER ---
    return (
        <div className="p-6 md:p-8 bg-white rounded-lg shadow-md min-h-[300px]">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Xác thực hai yếu tố (2FA)</h2>

            {/* ---- Trường hợp 1: 2FA ĐÃ ĐƯỢC KÍCH HOẠT ---- */}
            {isTwoFactorEnabled && (
                <div className="space-y-6">
                    <div className="flex items-center p-4 bg-green-50 text-green-800 rounded-lg">
                        <ShieldCheck className="w-6 h-6 mr-3 flex-shrink-0" />
                        <p className="font-semibold">Trạng thái: Đã bật. Tài khoản của bạn đang được bảo vệ bởi một lớp bảo mật bổ sung.</p>
                    </div>

                    {showRecoveryCodes && (
                        <div className="p-4 bg-gray-100 rounded-md">
                            <p className="mb-2 font-medium text-gray-700">Lưu các mã này ở nơi an toàn.</p>
                            <pre className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-lg font-mono tracking-wider">
                                {recoveryCodes.map(code => <span key={code}>{code}</span>)}
                            </pre>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4">
                        <button onClick={handleShowRecoveryCodes} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                            Xem mã khôi phục
                        </button>
                        <button onClick={handleRegenerateRecoveryCodes} disabled={isRegenerating} className="flex items-center px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50">
                            <RefreshCw className={`w-4 h-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
                            Tạo lại mã
                        </button>
                        <button onClick={handleDisable2FA} disabled={isLoading} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-400">
                            {isLoading ? 'Đang xử lý...' : 'Tắt 2FA'}
                        </button>
                    </div>
                </div>
            )}

            {/* ---- Trường hợp 2: ĐANG TRONG QUÁ TRÌNH KÍCH HOẠT ---- */}
            {!isTwoFactorEnabled && qrCode && (
                <div className="mt-6 space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800">Hoàn tất kích hoạt 2FA</h3>
                    <p className="text-gray-600">1. Quét mã QR bằng ứng dụng xác thực của bạn.</p>
                    <div className="p-4 border rounded-lg inline-block bg-white" dangerouslySetInnerHTML={{ __html: qrCode }} />

                    <p className="text-gray-600">2. Lưu lại các mã khôi phục này. Chúng là cách duy nhất để truy cập tài khoản nếu bạn mất thiết bị.</p>
                    <div className="p-4 bg-gray-100 rounded-md">
                        <pre className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-lg font-mono tracking-wider">
                            {recoveryCodes.map(code => <span key={code}>{code}</span>)}
                        </pre>
                    </div>

                    <p className="text-gray-600">3. Nhập mã 6 số từ ứng dụng của bạn để xác nhận.</p>
                    <div className="flex items-center space-x-4 max-w-sm">
                        <input type="text" value={confirmCode} onChange={(e) => setConfirmCode(e.target.value)} maxLength={6} className="flex-1 block w-full px-4 py-2 text-xl tracking-widest text-center border rounded-md" placeholder="123456" />
                        <button onClick={handleConfirmTwoFactor} disabled={isLoading} className="px-6 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-400">
                            {isLoading ? 'Đang kiểm tra...' : 'Xác nhận'}
                        </button>
                    </div>
                </div>
            )}

            {/* ---- Trường hợp 3: CHƯA BẬT 2FA ---- */}
            {!isTwoFactorEnabled && !qrCode && (
                <div className="mt-6">
                    <div className="flex items-center p-4 bg-orange-50 text-orange-800 rounded-lg">
                        <ShieldOff className="w-6 h-6 mr-3 flex-shrink-0" />
                        <p className="font-semibold">Trạng thái: Chưa bật. Hãy bật 2FA để tăng cường bảo mật.</p>
                    </div>
                    <p className="my-4 text-gray-600">Khi 2FA được kích hoạt, bạn sẽ cần cung cấp một mã bảo mật từ điện thoại của mình mỗi khi đăng nhập.</p>
                    <button
                        onClick={handleEnable2FA}
                        disabled={isLoading}
                        className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                        {isLoading ? 'Đang khởi tạo...' : 'Bật 2FA ngay'}
                    </button>
                </div>
            )}
        </div>
    );
}
