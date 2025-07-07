// app/(main)/(auth)/login/TwoFactorChallengeForm.tsx

"use client";

import { useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, KeyRound } from 'lucide-react';

interface TwoFactorChallengeFormProps {
    onCancel: () => void; // Hàm để hủy bỏ luồng 2FA và quay lại form login
}

export default function TwoFactorChallengeForm({ onCancel }: TwoFactorChallengeFormProps) {
    const { twoFactorChallenge } = useAuth();

    // State để chuyển đổi giữa form nhập mã 6 số và mã khôi phục
    const [useRecoveryCode, setUseRecoveryCode] = useState(false);

    // States cho các input
    const [code, setCode] = useState('');
    const [recoveryCode, setRecoveryCode] = useState('');

    // State để quản lý UI
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = useRecoveryCode
            ? { recovery_code: recoveryCode }
            : { code: code };

        try {
            await twoFactorChallenge(payload);
            // AuthContext sẽ tự động cập nhật user và chuyển hướng khi thành công
        } catch (error) {
            // Context sẽ hiển thị toast báo lỗi. 
            // Reset input để người dùng thử lại.
            if (useRecoveryCode) setRecoveryCode('');
            else setCode('');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
            <div className="text-center">
                {useRecoveryCode ?
                    <KeyRound className="w-12 h-12 mx-auto text-indigo-600" /> :
                    <ShieldCheck className="w-12 h-12 mx-auto text-indigo-600" />
                }
                <h2 className="mt-4 text-2xl font-bold text-gray-800">
                    {useRecoveryCode ? 'Sử dụng Mã khôi phục' : 'Xác thực hai yếu tố'}
                </h2>
                <p className="mt-2 text-gray-600">
                    {useRecoveryCode
                        ? 'Vui lòng nhập một trong các mã khôi phục của bạn.'
                        : 'Vui lòng mở ứng dụng xác thực và nhập mã 6 số được cung cấp.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {useRecoveryCode ? (
                    <div>
                        <label htmlFor="recovery_code" className="text-sm font-bold text-gray-600 sr-only">Mã khôi phục</label>
                        <input
                            id="recovery_code" type="text" value={recoveryCode}
                            onChange={(e) => setRecoveryCode(e.target.value)}
                            required autoFocus
                            className="block w-full px-4 py-2 mt-1 border rounded-md"
                            placeholder="abcde-fghij"
                        />
                    </div>
                ) : (
                    <div>
                        <label htmlFor="code" className="text-sm font-bold text-gray-600 sr-only">Mã xác thực</label>
                        <input
                            id="code" type="text" inputMode="numeric"
                            value={code} onChange={(e) => setCode(e.target.value)}
                            maxLength={6} required autoFocus
                            className="block w-full px-4 py-2 mt-1 text-2xl tracking-[.25em] text-center border rounded-md"
                            placeholder="123456"
                        />
                    </div>
                )}
                <div>
                    <button type="submit" disabled={isSubmitting} className="w-full px-4 py-3 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                        {isSubmitting ? 'Đang kiểm tra...' : 'Xác thực & Đăng nhập'}
                    </button>
                </div>
            </form>

            <div className="text-center text-sm">
                <button onClick={() => setUseRecoveryCode(!useRecoveryCode)} className="font-medium text-indigo-600 hover:underline">
                    {useRecoveryCode ? 'Sử dụng mã từ ứng dụng?' : 'Sử dụng mã khôi phục?'}
                </button>
                <span className="mx-2 text-gray-300">|</span>
                <button onClick={onCancel} className="font-medium text-gray-500 hover:underline">
                    Quay lại
                </button>
            </div>
        </div>
    );
}
