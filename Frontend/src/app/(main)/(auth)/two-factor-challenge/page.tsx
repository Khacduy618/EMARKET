// app/(main)/(auth)/two-factor-challenge/page.tsx

"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ShieldCheck, KeyRound, LogIn } from 'lucide-react';

export default function TwoFactorChallengePage() {
    // Lấy hàm cancelAndGoToLogin từ context
    const { twoFactorChallenge, user, cancelAndGoToLogin } = useAuth();
    const router = useRouter();

    const [useRecoveryCode, setUseRecoveryCode] = useState(false);
    const [code, setCode] = useState('');
    const [recoveryCode, setRecoveryCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Chuyển hướng nếu user đã đăng nhập
    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]);


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const payload = useRecoveryCode
            ? { recovery_code: recoveryCode }
            : { code: code };

        try {
            await twoFactorChallenge(payload);
        } catch (error) {
            if (useRecoveryCode) setRecoveryCode('');
            else setCode('');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        // Gọi hàm từ context để logout và quay về trang login
        cancelAndGoToLogin();
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
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
                            : 'Vui lòng mở ứng dụng xác thực và nhập mã 6 số.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {useRecoveryCode ? (
                        <div>
                            <label htmlFor="recovery_code" className="text-sm font-bold text-gray-600 sr-only">Mã khôi phục</label>
                            <input
                                id="recovery_code"
                                type="text"
                                value={recoveryCode}
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
                                id="code"
                                type="text"
                                inputMode="numeric"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                maxLength={6}
                                required autoFocus
                                className="block w-full px-4 py-2 mt-1 text-2xl tracking-[.25em] text-center border rounded-md"
                                placeholder="123 456"
                            />
                        </div>
                    )}
                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full px-4 py-3 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                            {isSubmitting ? 'Đang kiểm tra...' : 'Xác thực & Đăng nhập'}
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm">
                    <button
                        onClick={() => setUseRecoveryCode(!useRecoveryCode)}
                        className="font-medium text-indigo-600 hover:underline"
                    >
                        {useRecoveryCode ? 'Dùng mã từ ứng dụng' : 'Dùng mã khôi phục'}
                    </button>
                </div>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Hoặc</span>
                    </div>
                </div>

                <div className="text-center">
                    <button
                        onClick={handleCancel}
                        className="w-full px-4 py-3 font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                        Hủy và đăng nhập bằng tài khoản khác
                    </button>
                </div>

            </div>
        </div>
    );
}
