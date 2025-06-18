'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';

const RegisterPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        if (authToken) {
            router.push('/');
        }
    }, [router]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Mật khẩu không khớp. Vui lòng kiểm tra lại.');
            return;
        }

        try {
            const response = await api.post('/register', {
                Email: email,
                Password: password,
                FullName: fullName
            });

            if (response.Token && response.User) {
                localStorage.setItem('authToken', response.Token);
                localStorage.setItem('user', JSON.stringify(response.User));
                router.push('/');
            } else {
                setError('Đăng ký thất bại. Vui lòng thử lại.');
            }
        } catch (err: any) {
            console.error("Registration error:", err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else if (err instanceof Error) {
                setError(`Đã xảy ra lỗi trong quá trình đăng ký: ${err.message}`);
            } else {
                setError('Đã xảy ra lỗi không xác định trong quá trình đăng ký.');
            }
        }
    };

    return (
        <div className="flex h-screen font-sans container mx-auto mt-4 mb-4 rounded-lg shadow-md">
            <div className="w-1/2 p-10 flex flex-col justify-center items-start bg-white rounded-s-lg ">
                <h1 className="text-3xl font-bold text-gray-500 hover:text-gray-700">Create Account</h1>
                <p className="text-gray-500 hover:text-gray-700">Join us and start your journey</p>
                {error && <p className="text-red-500">{error}</p>}
                <form onSubmit={handleRegister} className="w-full">
                    <div className="mb-5">
                        <label htmlFor="fullName" className="block mb-1 text-gray-500 hover:text-gray-700">Họ và tên:</label>
                        <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
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
                    <div className="mb-5">
                        <label htmlFor="password" className="block mb-1 text-gray-500 hover:text-gray-700">Mật khẩu:</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mb-5">
                        <label htmlFor="confirmPassword" className="block mb-1 text-gray-500 hover:text-gray-700">Xác nhận mật khẩu:</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline w-full">Sign Up</button>
                </form>
                <p className="mt-5 text-gray-500 hover:text-gray-700">Already have an account? <a href="/login" className="text-blue-500 hover:text-blue-700">Sign In</a></p>
            </div>
            <div className="w-1/2 bg-purple-200 flex justify-center items-center rounded-e-lg">
                <div className="text-center p-10">
                    <img src="/images/illustration.png" alt="Illustration" className="max-w-full h-auto" />
                    <p className="mt-5 text-gray-500 hover:text-gray-700">Start your journey with us</p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;

