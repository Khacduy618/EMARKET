// app/(main)/(auth)/register/page.tsx

"use client";

import { useState, FormEvent, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { RegisterPayload } from '@/types';
import { toast } from 'react-toastify';
import Image from 'next/image';

// --- TIỆN ÍCH VALIDATION ---
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const startsWithNumber = (email: string) => /^[0-9]/.test(email);
const isValidName = (name: string) => !/\d/.test(name);
const isValidVietnamesePhone = (phone: string) => /^0\d{9}$/.test(phone);

// Type cho object lỗi để có gợi ý code
type FormErrors = {
    [key in keyof Omit<RegisterPayload, 'IsActive' | 'Role'> | 'Password_confirmation']?: string;
};


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
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Hàm validation toàn diện
    const validateForm = useCallback((data: typeof formData): FormErrors => {
        const newErrors: FormErrors = {};

        if (!data.FullName.trim()) { newErrors.FullName = "Vui lòng nhập họ và tên."; }
        else if (!isValidName(data.FullName)) { newErrors.FullName = "Tên không được chứa số."; }

        if (!data.Username.trim()) { newErrors.Username = "Vui lòng nhập tên đăng nhập."; }

        if (!data.Email.trim()) { newErrors.Email = "Vui lòng nhập email."; }
        else if (startsWithNumber(data.Email)) { newErrors.Email = "Email không được bắt đầu bằng số."; }
        else if (!isValidEmail(data.Email)) { newErrors.Email = "Định dạng email không hợp lệ."; }

        if (!data.Phone.trim()) { newErrors.Phone = "Vui lòng nhập số điện thoại."; }
        else if (!isValidVietnamesePhone(data.Phone)) { newErrors.Phone = "Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng 0)."; }

        if (data.Password.length < 8) { newErrors.Password = "Mật khẩu phải có ít nhất 8 ký tự."; }

        if (data.Password !== data.Password_confirmation) { newErrors.Password_confirmation = "Mật khẩu xác nhận không khớp."; }

        return newErrors;
    }, []);

    // Validate form mỗi khi dữ liệu thay đổi
    useEffect(() => {
        const hasStartedTyping = Object.values(formData).some(val => val !== '');
        if (hasStartedTyping) {
            setErrors(validateForm(formData));
        }
    }, [formData, validateForm]);

    // Nút submit chỉ được kích hoạt khi không có lỗi và các trường quan trọng đã điền
    const isFormValid = useMemo(() => {
        const currentErrors = validateForm(formData);
        return Object.keys(currentErrors).length === 0 &&
            formData.FullName.trim() !== '' &&
            formData.Username.trim() !== '' &&
            formData.Email.trim() !== '' &&
            formData.Phone.trim() !== '' &&
            formData.Password.trim() !== '' &&
            formData.Password_confirmation.trim() !== '';
    }, [formData, validateForm]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const finalErrors = validateForm(formData);
        setErrors(finalErrors);

        if (Object.keys(finalErrors).length > 0 || isSubmitting) {
            toast.warn("Vui lòng kiểm tra lại các thông tin đã nhập.");
            return;
        }

        setIsSubmitting(true);
        const payload: RegisterPayload = {
            ...formData, IsActive: true, Role: 'Buyer',
        };

        try {
            await register(payload);
        } catch (err: any) {
            if (err.response?.data?.errors) {
                const serverErrors = err.response.data.errors;
                const formattedErrors: FormErrors = {};
                for (const key in serverErrors) {
                    formattedErrors[key] = serverErrors[key][0];
                }
                setErrors(prev => ({ ...prev, ...formattedErrors }));
                toast.error("Một số thông tin không hợp lệ, vui lòng kiểm tra lại.");
            }
        }
        finally { setIsSubmitting(false); }
    };

    return (
        <div className="flex min-h-screen bg-white">
            <div className="hidden lg:flex w-1/2 items-center justify-center bg-gray-50 p-12">
                <Image src="/login-banner.png" alt="E-commerce Register" width={550} height={550} className="object-contain" priority />
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="text-left mb-8">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Tạo tài khoản</h2>
                        <p className="mt-2 text-sm text-gray-500">Bắt đầu hành trình mua sắm của bạn</p>
                    </div>

                    {apiError && (<div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-md">{apiError}</div>)}

                    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <input name="FullName" placeholder="Họ và Tên" value={formData.FullName} onChange={handleChange} className={`w-full py-2 bg-transparent border-b-2 ${errors.FullName ? 'border-red-500' : 'border-gray-300'} text-gray-900 focus:outline-none focus:border-indigo-600 transition-colors`} />
                                {errors.FullName && <p className="mt-1 text-xs text-red-500">{errors.FullName}</p>}
                            </div>
                            <div>
                                <input name="Username" placeholder="Tên đăng nhập" value={formData.Username} onChange={handleChange} className={`w-full py-2 bg-transparent border-b-2 ${errors.Username ? 'border-red-500' : 'border-gray-300'} text-gray-900 focus:outline-none focus:border-indigo-600 transition-colors`} />
                                {errors.Username && <p className="mt-1 text-xs text-red-500">{errors.Username}</p>}
                            </div>
                        </div>

                        <input name="Email" type="email" placeholder="Email" value={formData.Email} onChange={handleChange} className={`w-full py-2 bg-transparent border-b-2 ${errors.Email ? 'border-red-500' : 'border-gray-300'} text-gray-900 focus:outline-none focus:border-indigo-600 transition-colors`} />
                        {errors.Email && <p className="mt-1 text-xs text-red-500">{errors.Email}</p>}

                        <input name="Phone" type="tel" placeholder="Số điện thoại" value={formData.Phone} onChange={handleChange} className={`w-full py-2 bg-transparent border-b-2 ${errors.Phone ? 'border-red-500' : 'border-gray-300'} text-gray-900 focus:outline-none focus:border-indigo-600 transition-colors`} />
                        {errors.Phone && <p className="mt-1 text-xs text-red-500">{errors.Phone}</p>}

                        <input name="Password" type="password" placeholder="Mật khẩu (ít nhất 8 ký tự)" value={formData.Password} onChange={handleChange} className={`w-full py-2 bg-transparent border-b-2 ${errors.Password ? 'border-red-500' : 'border-gray-300'} text-gray-900 focus:outline-none focus:border-indigo-600 transition-colors`} />
                        {errors.Password && <p className="mt-1 text-xs text-red-500">{errors.Password}</p>}

                        <input name="Password_confirmation" type="password" placeholder="Xác nhận mật khẩu" value={formData.Password_confirmation} onChange={handleChange} className={`w-full py-2 bg-transparent border-b-2 ${errors.Password_confirmation ? 'border-red-500' : 'border-gray-300'} text-gray-900 focus:outline-none focus:border-indigo-600 transition-colors`} />
                        {errors.Password_confirmation && <p className="mt-1 text-xs text-red-500">{errors.Password_confirmation}</p>}

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting || !isFormValid}
                                className="w-full px-10 py-3 font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none disabled:bg-red-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSubmitting ? 'Đang xử lý...' : 'Tạo tài khoản'}
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
