// app/(main)/(auth)/login/page.tsx

"use client";

import { useState, FormEvent, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Loader2, Mail, Lock, Chrome, Github } from "lucide-react"

// --- TIỆN ÍCH VALIDATION ---

const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
const startsWithNumber = (email: string) => {
    return /^[0-9]/.test(email);
};

export default function LoginPage() {
    const { login, error: apiError, user, resendVerificationEmail } = useAuth();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResendLink, setShowResendLink] = useState(false);


    // Kiểm tra form có hợp lệ không để kích hoạt nút Đăng nhập
    const isFormValid = useMemo(() => {
        // Chỉ cần validate cơ bản ở đây, validate chi tiết sẽ thực hiện khi submit
        return email.length > 0 && password.length > 0;
    }, [email, password]);

    const validateForm = (): boolean => {
        const newErrors: { email?: string; password?: string } = {};
        let isValid = true;

        if (!email.trim()) {
            newErrors.email = "Vui lòng nhập email của bạn.";
            isValid = false;
        } else if (startsWithNumber(email)) {
            newErrors.email = "Email không được bắt đầu bằng số.";
            isValid = false;
        } else if (!isValidEmail(email)) {
            newErrors.email = "Định dạng email không hợp lệ.";
            isValid = false;
        }

        if (!password.trim()) {
            newErrors.password = "Vui lòng nhập mật khẩu của bạn.";
            isValid = false;
        } else if (password.length < 8) {
            newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự.";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        console.log("Submitting with:", { email, password });
        setShowResendLink(false);

        if (!validateForm()) return;
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            await login({ email, password });
        } catch (err: any) {
            const message = err.response?.data?.message || '';
            if (message.includes('xác minh email')) {
                setShowResendLink(true);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendVerification = async () => {
        if (!email) {
            toast.error("Vui lòng nhập địa chỉ email vào ô bên trên.");
            return;
        }
        await resendVerificationEmail(email);
        setShowResendLink(false);
    };

    return (
         <Card className="shadow-sm max-w-150 mx-auto mt-10 p-6 bg-white">
            <CardHeader className="space-y-2">
                <CardTitle className="text-2xl">Đăng nhập</CardTitle>
                <CardDescription>Chào mừng trở lại! Vui lòng nhập thông tin để tiếp tục.</CardDescription>
                {apiError && !showResendLink && (
                                <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-md" role="alert">
                                    {apiError}
                                </div>
                            )}
                            {showResendLink && (
                                <div className="mb-4 text-center text-sm p-3 bg-yellow-50 rounded-md">
                                    <span className="text-yellow-800">Tài khoản chưa được kích hoạt. </span>
                                    <button onClick={handleResendVerification} className="font-semibold text-indigo-600 hover:underline">
                                        Gửi lại email?
                                    </button>
                                </div>
                            )}
            </CardHeader>
            <CardContent className="space-y-6">
                <form  className="space-y-4" onSubmit={handleSubmit} noValidate>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                        id="email"
                        // name="email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                            setShowResendLink(false);
                        }}
                        onBlur={validateForm}
                        className={`pl-9 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                        required
                    />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Mật khẩu</Label>
                    <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                        }}
                        onBlur={validateForm}
                        className={`pl-9 pr-10 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                        autoComplete="current-password"
                        required
                        minLength={8}
                    />
                    <button
                        type="button"
                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700"
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                    <Checkbox id="remember" />
                    <Label htmlFor="remember" className="text-sm text-gray-600">
                        Ghi nhớ đăng nhập
                    </Label>
                    </div>
                    <Link href="/forgot-password" className="text-sm text-orange-600 hover:text-orange-700">
                    Quên mật khẩu?
                    </Link>
                </div>

                {/* {state?.message && (
                    <p
                    className={`text-sm ${state.ok ? "text-green-600" : "text-red-600"}`}
                    aria-live="polite"
                    aria-atomic="true"
                    >
                    {state.message}
                    </p>
                )} */}

                <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={isSubmitting || !isFormValid}>
                    {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
                    {/* )} */}
                </Button>
                </form>

                {/* <div className="flex items-center gap-3">
                <div className="h-px bg-gray-200 flex-1" />
                <span className="text-xs text-gray-500">Hoặc</span>
                <div className="h-px bg-gray-200 flex-1" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button variant="outline" className="w-full bg-transparent">
                    <Chrome className="w-4 h-4 mr-2" />
                    Tiếp tục với Google
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                    <Github className="w-4 h-4 mr-2" />
                    Tiếp tục với GitHub
                </Button>
                </div> */}

                <p className="text-sm text-center text-gray-600">
                Chưa có tài khoản?{" "}
                <Link href="/signup" className="text-orange-600 hover:text-orange-700 font-medium">
                    Tạo tài khoản
                </Link>
                </p>
            </CardContent>
        </Card>
        
    );
}