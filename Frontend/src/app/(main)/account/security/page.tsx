"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import {
    enableTwoFactorAuth,
    disableTwoFactorAuth,
    getTwoFactorQrCode,
    getRecoveryCodes,
    confirmTwoFactorAuth,
    regenerateRecoveryCodes as apiRegenerateRecoveryCodes
} from '@/services/auth';
import { ShieldCheck, ShieldOff, RefreshCw, Loader2 } from 'lucide-react';

export default function SecurityPage() {
    const { user, fetchUser } = useAuth();

    // States để quản lý dữ liệu 2FA
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [confirmCode, setConfirmCode] = useState('');

    // States để quản lý UI
    const [isLoading, setIsLoading] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);

    const isTwoFactorEnabled = user?.two_factor_enabled || false;

    // useEffect để tự động hủy 2FA nếu người dùng rời trang khi đang kích hoạt
    useEffect(() => {
        const isInActivationProcess = qrCode !== null && !isTwoFactorEnabled;
        return () => {
            if (isInActivationProcess) {
                console.log("LOG: Rời trang Security, tự động hủy bỏ kích hoạt 2FA.");
                disableTwoFactorAuth().catch(err => {
                    console.error("Lỗi khi tự động hủy 2FA:", err);
                });
            }
        };
    }, [qrCode, isTwoFactorEnabled]);


    const handleInitiate2FA = async () => {
        setIsLoading(true);
        try {
            await enableTwoFactorAuth();
            const [qrCodeResponse, recoveryCodesResponse] = await Promise.all([
                getTwoFactorQrCode(),
                getRecoveryCodes()
            ]);
            setQrCode(qrCodeResponse.svg);
            setRecoveryCodes(recoveryCodesResponse);
            toast.info("Vui lòng quét mã QR, lưu mã khôi phục và xác nhận để hoàn tất.");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Không thể bật 2FA.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmAndActivate2FA = async () => {
        if (!confirmCode || confirmCode.length < 6) {
            toast.error("Vui lòng nhập mã xác thực 6 số.");
            return;
        }
        setIsLoading(true);
        try {
            await confirmTwoFactorAuth(confirmCode);
            await fetchUser();
            setQrCode(null);
            setConfirmCode('');
            setShowRecoveryCodes(true);
            toast.success("Đã kích hoạt Xác thực hai yếu tố thành công!");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Mã xác thực không hợp lệ.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelActivation = async () => {
        setIsLoading(true);
        try {
            await disableTwoFactorAuth();
            setQrCode(null);
            setRecoveryCodes([]);
            setConfirmCode('');
            toast.info("Đã hủy bỏ quá trình kích hoạt 2FA.");
        } catch (error) {
            toast.error("Có lỗi xảy ra, vui lòng tải lại trang.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisable2FA = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn tắt Xác thực hai yếu tố?")) return;
        setIsLoading(true);
        try {
            await disableTwoFactorAuth();
            await fetchUser();
            setRecoveryCodes([]);
            setShowRecoveryCodes(false);
            toast.success("Đã tắt Xác thực hai yếu tố.");
        } catch (error) {
            toast.error("Không thể tắt 2FA.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegenerateRecoveryCodes = async () => {
        const confirm = window.confirm("Thao tác này sẽ vô hiệu hóa bộ mã cũ. Bạn chắc chứ?");
        if (!confirm) return;
        setIsRegenerating(true);
        try {
            await apiRegenerateRecoveryCodes();
            const codes = await getRecoveryCodes();
            setRecoveryCodes(codes);
            setShowRecoveryCodes(true);
            toast.success("Đã tạo mã khôi phục mới! Hãy lưu chúng lại cẩn thận.");
        } catch (error) {
            toast.error("Không thể tạo mã mới.");
        } finally {
            setIsRegenerating(false);
        }
    };

    const handleShowRecoveryCodes = async () => {
        if (showRecoveryCodes) {
            setShowRecoveryCodes(false);
            return;
        }
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
    };

    return (
        <div className="p-6 md:p-8 bg-white rounded-lg shadow-md min-h-[300px]">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Xác thực hai yếu tố (2FA)</h2>

            {/* --- GIAO DIỆN KHI ĐÃ BẬT --- */}
            {isTwoFactorEnabled && (
                <div className="space-y-6">
                    <div className="flex items-center p-4 bg-green-50 text-green-800 rounded-lg">
                        <ShieldCheck className="w-6 h-6 mr-3 flex-shrink-0" />
                        <p className="font-semibold">Trạng thái: Đã bật. Tài khoản của bạn được tăng cường bảo mật.</p>
                    </div>

                    {showRecoveryCodes && (
                        <div className="p-4 bg-gray-100 rounded-md animate-fade-in">
                            <h4 className="font-semibold text-gray-800">Mã khôi phục của bạn</h4>
                            <p className="text-sm text-gray-600 mb-3">Lưu các mã này ở nơi an toàn. Chúng được dùng để truy cập tài khoản nếu bạn mất thiết bị xác thực.</p>
                            <pre className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-lg font-mono tracking-wider">
                                {recoveryCodes.map((code: string) => <span key={code}>{code}</span>)}
                            </pre>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4">
                        <button onClick={handleShowRecoveryCodes} disabled={isLoading} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                            {showRecoveryCodes ? "Ẩn mã khôi phục" : "Xem mã khôi phục"}
                        </button>
                        <button onClick={handleRegenerateRecoveryCodes} disabled={isRegenerating || isLoading} className="flex items-center px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50">
                            <RefreshCw className={`w-4 h-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
                            Tạo lại mã
                        </button>
                        <button onClick={handleDisable2FA} disabled={isLoading} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-400">
                            Tắt 2FA
                        </button>
                    </div>
                </div>
            )}

            {/* --- GIAO DIỆN KHI ĐANG KÍCH HOẠT --- */}
            {!isTwoFactorEnabled && qrCode && (
                <div className="mt-6 space-y-6 animate-fade-in">
                    <h3 className="text-xl font-bold text-gray-800">Hoàn tất kích hoạt 2FA</h3>
                    <div className="text-sm text-yellow-800 bg-yellow-50 p-3 rounded-md">
                        Quan trọng: Nếu bạn rời khỏi trang, quá trình kích hoạt sẽ tự động bị hủy để đảm bảo an toàn.
                    </div>
                    <div className="space-y-2">
                        <p className="font-semibold text-gray-700">1. Quét mã QR bằng ứng dụng xác thực của bạn:</p>
                        <div className="p-4 border rounded-lg inline-block bg-white" dangerouslySetInnerHTML={{ __html: qrCode }} />
                    </div>
                    <div className="space-y-2">
                        <p className="font-semibold text-gray-700">2. Lưu lại các mã khôi phục này một cách an toàn:</p>
                        <div className="p-4 bg-gray-100 rounded-md">
                            <pre className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-lg font-mono tracking-wider">
                                {recoveryCodes.map((code: string) => <span key={code}>{code}</span>)}
                            </pre>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="font-semibold text-gray-700">3. Nhập mã 6 số từ ứng dụng để xác nhận:</p>
                        <div className="flex flex-wrap items-center gap-4">
                            <input type="text" value={confirmCode} onChange={(e) => setConfirmCode(e.target.value)} maxLength={6} inputMode="numeric" className="flex-1 block w-full sm:w-auto px-4 py-2 text-xl tracking-widest text-center border rounded-md" placeholder="123456" />
                            <button onClick={handleConfirmAndActivate2FA} disabled={isLoading} className="px-5 py-2.5 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-400">
                                {isLoading ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Đang kiểm tra...</> : 'Xác nhận & Kích hoạt'}
                            </button>
                            <button onClick={handleCancelActivation} disabled={isLoading} className="px-5 py-2.5 font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                                Hủy bỏ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- GIAO DIỆN KHI CHƯA BẬT --- */}
            {!isTwoFactorEnabled && !qrCode && (
                <div className="mt-6">
                    <div className="flex items-center p-4 bg-orange-50 text-orange-800 rounded-lg">
                        <ShieldOff className="w-6 h-6 mr-3 flex-shrink-0" />
                        <p className="font-semibold">Trạng thái: Chưa bật. Hãy bật 2FA để tăng cường bảo mật.</p>
                    </div>
                    <p className="my-4 text-gray-600">Khi 2FA được kích hoạt, bạn sẽ cần cung cấp một mã bảo mật từ điện thoại của mình mỗi khi đăng nhập.</p>
                    <button
                        onClick={handleInitiate2FA}
                        disabled={isLoading}
                        className="inline-flex items-center px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                        {isLoading ? <><Loader2 className="animate-spin mr-2 h-5 w-5" /> Đang khởi tạo...</> : 'Bật 2FA ngay'}
                    </button>
                </div>
            )}
        </div>
    );
}
