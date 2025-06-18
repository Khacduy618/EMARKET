'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await api.post('/forgot-password', { email });
            setSuccess('Vui lòng kiểm tra email của bạn để đặt lại mật khẩu.');
        } catch (err: any) {
            console.error("Forgot password error:", err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err instanceof Error) {
                setError(`Đã xảy ra lỗi: ${err.message}`);
            } else {
                setError('Đã xảy ra lỗi không xác định.');
            }
        }
    };

    return (
        <div className="flex h-screen font-sans container mx-auto mt-4 mb-4 rounded-lg shadow-md">
            <div className="w-1/2 p-10 flex flex-col justify-center items-start bg-white rounded-s-lg">
                <h1 className="text-3xl font-bold text-gray-500 hover:text-gray-700">Quên mật khẩu?</h1>
                <p className="text-gray-500 hover:text-gray-700">Nhập email của bạn để đặt lại mật khẩu</p>
                {error && <p className="text-red-500">{error}</p>}
                {success && <p className="text-green-500">{success}</p>}
                <form onSubmit={handleForgotPassword} className="w-full">
                    <div className="mb-5">
                        <label htmlFor="email" className="block mb-1 text-gray-500 hover:text-gray-700">Email:</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline w-full">
                        Gửi yêu cầu đặt lại mật khẩu
                    </button>
                </form>
                <p className="mt-5 text-gray-500 hover:text-gray-700">
                    Đã nhớ mật khẩu? <a href="/login" className="text-blue-500 hover:text-blue-700">Đăng nhập</a>
                </p>
            </div>
            <div className="w-1/2 bg-purple-200 flex justify-center items-center rounded-e-lg">
                <div className="text-center p-10">
                    <img src="/images/illustration.png" alt="Illustration" className="max-w-full h-auto" />
                    <p className="mt-5 text-gray-500 hover:text-gray-700">Chúng tôi sẽ gửi email hướng dẫn đặt lại mật khẩu cho bạn</p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
