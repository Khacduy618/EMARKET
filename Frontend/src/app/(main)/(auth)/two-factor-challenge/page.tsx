// app/(main)/(auth)/two-factor-challenge/page.tsx
"use client";

import { useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck } from 'lucide-react';

export default function TwoFactorChallengePage() {
    const { twoFactorChallenge } = useAuth(); // Lấy hàm mới từ context
    const [code, setCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // (Tùy chọn) Thêm state cho recovery code
    const [isRecovery, setIsRecovery] = useState(false);
    const [recoveryCode, setRecoveryCode] = useState('');


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await twoFactorChallenge(code);
            // Context sẽ tự chuyển hướng khi thành công
        } catch (error) {
            // Context sẽ hiển thị toast báo lỗi
            console.error("2FA Challenge failed", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Logic cho recovery code có thể thêm ở đây sau

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
                <div className="text-center">
                    <ShieldCheck className="w-12 h-12 mx-auto text-indigo-600" />
                    <h2 className="mt-4 text-2xl font-bold text-gray-800">Xác thực hai yếu tố</h2>
                    <p className="mt-2 text-gray-600">
                        Vui lòng nhập mã từ ứng dụng xác thực của bạn để hoàn tất đăng nhập.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="code" className="text-sm font-bold text-gray-600">Mã xác thực</label>
                        <input
                            id="code"
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            maxLength={6}
                            required
                            autoFocus
                            className="block w-full px-4 py-2 mt-1 text-2xl tracking-widest text-center border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            placeholder="123 456"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full px-4 py-3 font-semibold tracking-wide text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                            {isSubmitting ? 'Đang kiểm tra...' : 'Xác thực & Đăng nhập'}
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    {/* Link để chuyển sang nhập recovery code */}
                    {/* <button onClick={() => setIsRecovery(!isRecovery)} className="text-sm text-gray-500 hover:underline">
                       {isRecovery ? 'Dùng mã xác thực?' : 'Dùng mã khôi phục?'}
                    </button> */}
                </div>

            </div>
        </div>
    );
}
