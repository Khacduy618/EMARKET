// app/(main)/(auth)/two-factor-challenge/page.tsx

"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, KeyRound } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TwoFactorChallengePage() {
    // Lấy hàm twoFactorChallenge và thông tin user từ context
    const { twoFactorChallenge, user } = useAuth();
    const router = useRouter();

    // State để chuyển đổi giữa 2 form
    const [useRecoveryCode, setUseRecoveryCode] = useState(false);

    // State cho các input
    const [code, setCode] = useState(''); // Cho mã 6 số
    const [recoveryCode, setRecoveryCode] = useState(''); // Cho mã khôi phục

    // State để quản lý UI
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Chuyển hướng người dùng nếu họ vào nhầm trang này
    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]);


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Tạo payload dựa trên form đang được sử dụng
        const payload = useRecoveryCode
            ? { recovery_code: recoveryCode }
            : { code: code };

        try {
            await twoFactorChallenge(payload);
            // AuthContext sẽ tự động chuyển hướng người dùng đến trang chủ khi thành công
        } catch (error) {
            // AuthContext đã lo việc hiển thị toast báo lỗi.
            // Có thể thêm logic reset input ở đây nếu muốn.
            if (useRecoveryCode) {
                setRecoveryCode('');
            } else {
                setCode('');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">

                {/* Phần Header của form, thay đổi theo trạng thái */}
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
                            ? 'Vui lòng nhập một trong các mã khôi phục của bạn để đăng nhập.'
                            : 'Vui lòng mở ứng dụng xác thực trên điện thoại và nhập mã 6 số được cung cấp.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {useRecoveryCode ? (
                        // Form cho Recovery Code
                        <div>
                            <label htmlFor="recovery_code" className="text-sm font-bold text-gray-600 sr-only">Mã khôi phục</label>
                            <input
                                id="recovery_code"
                                type="text"
                                value={recoveryCode}
                                onChange={(e) => setRecoveryCode(e.target.value)}
                                required
                                autoFocus
                                className="block w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                placeholder="abcde-fghij"
                            />
                        </div>
                    ) : (
                        // Form cho mã 6 số
                        <div>
                            <label htmlFor="code" className="text-sm font-bold text-gray-600 sr-only">Mã xác thực</label>
                            <input
                                id="code"
                                type="text"
                                inputMode="numeric" // Gợi ý bàn phím số trên di động
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                maxLength={6}
                                required
                                autoFocus
                                className="block w-full px-4 py-2 mt-1 text-2xl tracking-[.25em] text-center border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                placeholder="123456"
                            />
                        </div>
                    )}
                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center justify-center w-full px-4 py-3 font-semibold tracking-wide text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Đang kiểm tra...' : 'Xác thực & Đăng nhập'}
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    <button
                        onClick={() => setUseRecoveryCode(!useRecoveryCode)}
                        className="text-sm font-medium text-indigo-600 hover:underline focus:outline-none"
                    >
                        {useRecoveryCode ? 'Sử dụng mã từ ứng dụng?' : 'Sử dụng mã khôi phục?'}
                    </button>
                </div>

            </div>
        </div>
    );
}
