"use client";

import { useState, FormEvent, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { RegisterPayload } from '@/types';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { useDebounce } from 'use-debounce';
import { checkPhoneAvailability, checkUsernameAvailability, checkEmailAvailability } from '@/services/auth';
import { CheckCircle, AlertCircle } from 'lucide-react';

// --- TIỆN ÍCH VALIDATION ---
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const startsWithNumber = (text: string) => /^[0-9]/.test(text);
const containsNumber = (text: string) => /\d/.test(text);
const isValidVietnamesePhone = (phone: string) => /^0\d{9}$/.test(phone);

type FormErrors = { [key: string]: string | undefined };
type FieldStatus = 'idle' | 'checking' | 'valid' | 'invalid';

export default function RegisterPage() {
    const { register, user } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        FullName: '', Username: '', Email: '', Phone: '',
        Password: '', Password_confirmation: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [status, setStatus] = useState<{ [key: string]: FieldStatus }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [debouncedUsername] = useDebounce(formData.Username, 500);
    const [debouncedEmail] = useDebounce(formData.Email, 500);
    const [debouncedPhone] = useDebounce(formData.Phone, 500);

    useEffect(() => { if (user) router.push('/'); }, [user, router]);

    // --- CÁC HÀM VALIDATION REAL-TIME ---
    const checkUsername = useCallback(async (value: string) => {
        if (!value.trim()) return;
        if (value.length <= 3) { setErrors(p => ({ ...p, Username: "Phải dài hơn 3 ký tự." })); return; }
        if (startsWithNumber(value)) { setErrors(p => ({ ...p, Username: "Không được bắt đầu bằng số." })); return; }

        setStatus(p => ({ ...p, Username: 'checking' }));
        const { isAvailable } = await checkUsernameAvailability(value);
        if (isAvailable) { setStatus(p => ({ ...p, Username: 'valid' })); }
        else { setErrors(p => ({ ...p, Username: "Tên đăng nhập đã tồn tại." })); setStatus(p => ({ ...p, Username: 'invalid' })); }
    }, []);

    const checkEmail = useCallback(async (value: string) => {
        if (!value.trim()) return;
        if (startsWithNumber(value)) { setErrors(p => ({ ...p, Email: "Không được bắt đầu bằng số." })); return; }
        if (!isValidEmail(value)) { setErrors(p => ({ ...p, Email: "Định dạng email không hợp lệ." })); return; }

        setStatus(p => ({ ...p, Email: 'checking' }));
        const { isAvailable } = await checkEmailAvailability(value);
        if (isAvailable) { setStatus(p => ({ ...p, Email: 'valid' })); }
        else { setErrors(p => ({ ...p, Email: "Email này đã được sử dụng." })); setStatus(p => ({ ...p, Email: 'invalid' })); }
    }, []);

    const checkPhone = useCallback(async (value: string) => {
        if (!value.trim()) return;
        if (!isValidVietnamesePhone(value)) { setErrors(p => ({ ...p, Phone: "Số điện thoại không hợp lệ." })); return; }

        setStatus(p => ({ ...p, Phone: 'checking' }));
        const { isAvailable } = await checkPhoneAvailability(value);
        if (isAvailable) { setStatus(p => ({ ...p, Phone: 'valid' })); }
        else { setErrors(p => ({ ...p, Phone: "Số điện thoại đã được sử dụng." })); setStatus(p => ({ ...p, Phone: 'invalid' })); }
    }, []);

    useEffect(() => { checkUsername(debouncedUsername); }, [debouncedUsername, checkUsername]);
    useEffect(() => { checkEmail(debouncedEmail); }, [debouncedEmail, checkEmail]);
    useEffect(() => { checkPhone(debouncedPhone); }, [debouncedPhone, checkPhone]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: undefined }));
        setStatus(prev => ({ ...prev, [name]: 'idle' }));
    };

    // --- HÀM ONBLUR CHO VALIDATION ĐỒNG BỘ ---
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target as { name: keyof typeof formData; value: string };
        let error: string | undefined;

        switch (name) {
            case 'FullName':
                if (!value.trim()) error = "Vui lòng nhập họ và tên.";
                else if (containsNumber(value)) error = "Tên không được chứa số.";
                break;
            case 'Password':
                if (value.length < 8) error = "Mật khẩu phải có ít nhất 8 ký tự.";
                break;
            case 'Password_confirmation':
                if (value !== formData.Password) error = "Mật khẩu xác nhận không khớp.";
                break;
        }
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // ... (Logic submit cuối cùng có thể giữ nguyên hoặc đơn giản hóa thêm)

        if (Object.values(errors).some(e => e) || Object.values(status).some(s => s === 'checking' || s === 'invalid')) {
            toast.warn("Vui lòng sửa các lỗi hoặc chờ quá trình kiểm tra hoàn tất.");
            return;
        }

        setIsSubmitting(true);
        try {
            await register(formData);
        } catch (err) { }
        finally {
            setIsSubmitting(false);
        }
    };

    const getInputClassName = (field: keyof FormErrors) => {
        const baseClass = "w-full py-2 bg-transparent border-b-2 text-gray-900 focus:outline-none focus:border-indigo-600 transition-colors";
        if (errors[field]) return `${baseClass} border-red-500`;
        if (status[field] === 'valid') return `${baseClass} border-green-500`;
        return `${baseClass} border-gray-300`;
    };

    return (
        <div className="flex min-h-screen bg-white text-black">
            <div className="hidden lg:flex w-1/2 items-center justify-center bg-gray-50 p-12">
                <Image src="/images/app-logo.jpg" alt="E-commerce Register" width={550} height={550} className="object-contain" />
            </div>
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="text-left mb-8">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Tạo tài khoản</h2>
                        <p className="mt-2 text-sm text-gray-500">Bắt đầu hành trình mua sắm của bạn</p>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <input name="FullName" placeholder="Họ và Tên" value={formData.FullName} onChange={handleChange} onBlur={handleBlur} className={getInputClassName('FullName')} />
                                {errors.FullName && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={14} /> {errors.FullName}</p>}
                            </div>
                            <div className="relative">
                                <input name="Username" placeholder="Tên đăng nhập" value={formData.Username} onChange={handleChange} className={getInputClassName('Username')} />
                                {status['Username'] === 'checking' && (<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>)}
                            </div>
                        </div>
                        {errors.Username && <p className="mt-1 text-xs text-red-500 flex items-center gap-1 -mt-3 md:mt-1"><AlertCircle size={14} /> {errors.Username}</p>}
                        {status['Username'] === 'valid' && <div className="mt-1 text-xs text-green-600 flex items-center gap-1 -mt-3 md:mt-1"><CheckCircle size={14} /> Tên đăng nhập hợp lệ.</div>}

                        <div className="relative">
                            <input name="Email" type="email" placeholder="Email" value={formData.Email} onChange={handleChange} className={getInputClassName('Email')} />
                            {status['Email'] === 'checking' && (<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>)}
                        </div>
                        {errors.Email && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={14} /> {errors.Email}</p>}
                        {status['Email'] === 'valid' && <div className="mt-1 text-xs text-green-600 flex items-center gap-1"><CheckCircle size={14} /> Email có thể sử dụng.</div>}

                        <div className="relative">
                            <input name="Phone" type="tel" placeholder="Số điện thoại" value={formData.Phone} onChange={handleChange} className={getInputClassName('Phone')} />
                            {status['Phone'] === 'checking' && (<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>)}
                        </div>
                        {errors.Phone && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={14} /> {errors.Phone}</p>}
                        {status['Phone'] === 'valid' && <div className="mt-1 text-xs text-green-600 flex items-center gap-1"><CheckCircle size={14} /> Số điện thoại hợp lệ.</div>}

                        <input name="Password" type="password" placeholder="Mật khẩu (ít nhất 8 ký tự)" value={formData.Password} onChange={handleChange} onBlur={handleBlur} className={getInputClassName('Password')} />
                        {errors.Password && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={14} /> {errors.Password}</p>}

                        <input name="Password_confirmation" type="password" placeholder="Xác nhận mật khẩu" value={formData.Password_confirmation} onChange={handleChange} onBlur={handleBlur} className={getInputClassName('Password_confirmation')} />
                        {errors.Password_confirmation && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={14} /> {errors.Password_confirmation}</p>}

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting || Object.values(status).some(s => s === 'checking')}
                                className="w-full px-10 py-3 font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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
