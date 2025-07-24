// app/(main)/(auth)/register/page.tsx

"use client";

import { useState, FormEvent, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { RegisterPayload } from '@/types';
import Image from 'next/image';

// --- TIỆN ÍCH VALIDATION NÂNG CAO CHO NGƯỜI VIỆT ---

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// Tên không được chứa số
const isValidName = (name: string) => !/\d/.test(name);
// SĐT Việt Nam: Bắt đầu bằng 0, có 10 chữ số
const isValidVietnamesePhone = (phone: string) => /^0\d{9}$/.test(phone);

export default function RegisterPage() {
    const { register, user, error: apiError } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        FullName: '',
        Username: '',
        Email: '',
        Phone: '',
        Password: '',
        Password_confirmation: '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) router.push('/');
    }, [user, router]);

    // Kiểm tra form hợp lệ để kích hoạt nút
    const isFormValid = useMemo(() => {
        return (
            isValidName(formData.FullName.trim()) && formData.FullName.trim() !== '' &&
            formData.Username.trim() !== '' &&
            isValidVietnamesePhone(formData.Phone) &&
            isValidEmail(formData.Email) &&
            formData.Password.length >= 8 &&
            formData.Password === formData.Password_confirmation
        );
    }, [formData]);

    // Hàm validation toàn diện
    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string | undefined } = {};
        let isValid = true;

        if (!formData.FullName.trim()) { newErrors.FullName = "Vui lòng nhập họ và tên."; isValid = false; }
        else if (!isValidName(formData.FullName)) { newErrors.FullName = "Tên không được chứa số."; isValid = false; }

        if (!formData.Username.trim()) { newErrors.Username = "Vui lòng nhập tên đăng nhập."; isValid = false; }

        if (!formData.Email.trim()) { newErrors.Email = "Vui lòng nhập email."; isValid = false; }
        else if (!isValidEmail(formData.Email)) { newErrors.Email = "Định dạng email không hợp lệ."; isValid = false; }

        if (!formData.Phone.trim()) { newErrors.Phone = "Vui lòng nhập số điện thoại."; isValid = false; }
        else if (!isValidVietnamesePhone(formData.Phone)) { newErrors.Phone = "Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng 0)."; isValid = false; }

        if (formData.Password.length < 8) { newErrors.Password = "Mật khẩu phải có ít nhất 8 ký tự."; isValid = false; }

        if (formData.Password !== formData.Password_confirmation) { newErrors.Password_confirmation = "Mật khẩu xác nhận không khớp."; isValid = false; }

        setErrors(newErrors);
        return isValid;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) { setErrors(prev => ({ ...prev, [name]: undefined })); }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        if (isSubmitting) return;
        setIsSubmitting(true);

        const payload: RegisterPayload = {
            ...formData,
            IsActive: true,
            Role: 'Buyer',
        };

        try { await register(payload); }
        catch (err) { console.error("Đăng ký thất bại:", err); }
        finally { setIsSubmitting(false); }
    };

    return (
        <div className="flex min-h-screen bg-white text-black">
            <div className="hidden lg:flex w-1/2 items-center justify-center bg-gray-50 p-12">
                <Image src="/images/app-logo.jpg" alt="E-commerce Register" width={550} height={550} className="object-contain" />
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-sm">
                    <div className="text-left mb-8">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Tạo tài khoản</h2>
                        <p className="mt-2 text-sm text-gray-500">Nhập thông tin của bạn ở bên dưới</p>
                    </div>

                    {apiError && (<div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-md">{apiError}</div>)}

                    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                        <input name="FullName" placeholder="Họ và Tên" value={formData.FullName} onChange={handleChange} className={`w-full py-2 bg-transparent border-b-2 ${errors.FullName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-indigo-600`} />
                        {errors.FullName && <p className="mt-1 text-xs text-red-500">{errors.FullName}</p>}

                        <input name="Username" placeholder="Tên đăng nhập" value={formData.Username} onChange={handleChange} className={`w-full py-2 bg-transparent border-b-2 ${errors.Username ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-indigo-600`} />
                        {errors.Username && <p className="mt-1 text-xs text-red-500">{errors.Username}</p>}

                        <input name="Email" type="email" placeholder="Email" value={formData.Email} onChange={handleChange} className={`w-full py-2 bg-transparent border-b-2 ${errors.Email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-indigo-600`} />
                        {errors.Email && <p className="mt-1 text-xs text-red-500">{errors.Email}</p>}

                        <input name="Phone" type="tel" placeholder="Số điện thoại" value={formData.Phone} onChange={handleChange} className={`w-full py-2 bg-transparent border-b-2 ${errors.Phone ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-indigo-600`} />
                        {errors.Phone && <p className="mt-1 text-xs text-red-500">{errors.Phone}</p>}

                        <input name="Password" type="password" placeholder="Mật khẩu" value={formData.Password} onChange={handleChange} className={`w-full py-2 bg-transparent border-b-2 ${errors.Password ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-indigo-600`} />
                        {errors.Password && <p className="mt-1 text-xs text-red-500">{errors.Password}</p>}

                        <input name="Password_confirmation" type="password" placeholder="Xác nhận mật khẩu" value={formData.Password_confirmation} onChange={handleChange} className={`w-full py-2 bg-transparent border-b-2 ${errors.Password_confirmation ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-indigo-600`} />
                        {errors.Password_confirmation && <p className="mt-1 text-xs text-red-500">{errors.Password_confirmation}</p>}

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting || !isFormValid}
                                className="w-full px-10 py-3 font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none disabled:bg-red-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSubmitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
                            </button>
                        </div>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-500">
                        Đã có tài khoản?{' '}
                        <Link href="/login" className="font-semibold leading-6 text-gray-500 hover:text-gray-900 underline">
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
