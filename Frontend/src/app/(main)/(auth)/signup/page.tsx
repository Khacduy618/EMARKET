 "use client";

import { useState, FormEvent, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { useDebounce } from 'use-debounce';
import { checkPhoneAvailability, checkUsernameAvailability, checkEmailAvailability } from '@/services/auth';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Mail, Lock, User, Eye, EyeOff, Phone as PhoneIcon } from "lucide-react"

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
    const [agreeTerms, setAgreeTerms] = useState(false);

    const [debouncedUsername] = useDebounce(formData.Username, 500);
    const [debouncedEmail] = useDebounce(formData.Email, 500);
    const [debouncedPhone] = useDebounce(formData.Phone, 500);

    const [showPw, setShowPw] = useState(false)
    const [showPw2, setShowPw2] = useState(false)

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

        if (!agreeTerms) {
            toast.warn("Vui lòng đồng ý với điều khoản sử dụng và chính sách bảo mật.");
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
        <Card className="shadow-sm max-w-150 mx-auto mt-10 p-6 bg-white">
            <CardHeader className="space-y-2">
                <CardTitle className="text-2xl">Đăng ký</CardTitle>
                <CardDescription>Tạo tài khoản mới để mua sắm nhanh chóng hơn.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                    {/* Full name */}
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Họ và tên</Label>
                        <div className="relative">
                            <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <Input
                                id="fullName"
                                name="FullName"
                                placeholder="Nguyễn Văn A"
                                className="pl-9"
                                value={formData.FullName} onChange={handleChange} onBlur={handleBlur}
                            />
                            {errors.FullName && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={14} /> {errors.FullName}</p>}
                        </div>
                        {/* {formData.FullName && (
                <p id="fullName-error" className="text-sm text-red-600">
                    {formData.FullName}
                </p>
                )} */}
                    </div>

                    {/* Username */}
                    {/* <div className="space-y-2"> */}
                    {/*     <Label htmlFor="username">Tên đăng nhập</Label> */}
                    {/*     <div className="relative"> */}
                    {/*         <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" /> */}
                    {/*         <Input */}
                    {/*             id="username" */}
                    {/*             name="Username" */}
                    {/*             placeholder="ten_dang_nhap" */}
                    {/*             className="pl-9" */}
                    {/*             value={formData.Username} onChange={handleChange} */}
                    {/*         /> */}
                    {/*         {status['Username'] === 'checking' && (<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>)} */}
                    {/*     </div> */}
                    {/*     {errors.Username && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={14} /> {errors.Username}</p>} */}
                    {/*     {status['Username'] === 'valid' && <div className="mt-1 text-xs text-green-600 flex items-center gap-1"><CheckCircle size={14} /> Tên đăng nhập hợp lệ.</div>} */}
                    {/* </div> */}

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <Input
                                id="email"
                                name="Email"
                                type="email"
                                placeholder="you@example.com"
                                className="pl-9"
                                autoComplete="email"
                                value={formData.Email} onChange={handleChange}
                            />
                            {status['Email'] === 'checking' && (<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>)}
                        </div>
                        {/* {state?.fieldErrors?.email && (
                <p id="email-error" className="text-sm text-red-600">
                    {state.fieldErrors.email}
                </p>
                )} */}
                        {errors.Email && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={14} /> {errors.Email}</p>}
                        {status['Email'] === 'valid' && <div className="mt-1 text-xs text-green-600 flex items-center gap-1"><CheckCircle size={14} /> Email có thể sử dụng.</div>}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <div className="relative">
                            <PhoneIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <Input
                                id="phone"
                                name="Phone"
                                type="tel"
                                placeholder="0123456789"
                                className="pl-9"
                                value={formData.Phone} onChange={handleChange}
                            />
                            {status['Phone'] === 'checking' && (<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>)}
                        </div>
                        {errors.Phone && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={14} /> {errors.Phone}</p>}
                        {status['Phone'] === 'valid' && <div className="mt-1 text-xs text-green-600 flex items-center gap-1"><CheckCircle size={14} /> Số điện thoại hợp lệ.</div>}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <Label htmlFor="password">Mật khẩu</Label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <Input
                                id="password"
                                name="Password"
                                type={showPw ? "text" : "password"}
                                placeholder="••••••••"
                                className="pl-9 pr-10"
                                minLength={8}
                                value={formData.Password} onChange={handleChange} onBlur={handleBlur}
                                autoComplete="new-password"
                            />
                            {errors.Password && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={14} /> {errors.Password}</p>}
                            <button
                                type="button"
                                aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                onClick={() => setShowPw((s) => !s)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700"
                            >
                                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {/* {state?.fieldErrors?.password && (
                <p id="password-error" className="text-sm text-red-600">
                    {state.fieldErrors.password}
                </p>
                )} */}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <Input
                                id="confirmPassword"
                                name="Password_confirmation"
                                type={showPw2 ? "text" : "password"}
                                placeholder="••••••••"
                                className="pl-9 pr-10"
                                autoComplete="new-password"
                                value={formData.Password_confirmation} onChange={handleChange} onBlur={handleBlur}

                            />
                            <button
                                type="button"
                                aria-label={showPw2 ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                onClick={() => setShowPw2((s) => !s)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700"
                            >
                                {showPw2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {/* {state?.fieldErrors?.confirmPassword && (
                <p id="confirmPassword-error" className="text-sm text-red-600">
                    {state.fieldErrors.confirmPassword}
                </p>
                )} */}
                        {errors.Password_confirmation && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={14} /> {errors.Password_confirmation}</p>}
                    </div>

                    {/* Terms */}
                    <div className="flex items-start gap-2">
                        <Checkbox id="terms" checked={agreeTerms} onCheckedChange={(checked) => setAgreeTerms(checked === true)} />
                        <Label htmlFor="terms" className="text-sm text-gray-600 leading-5">
                            Tôi đồng ý với{" "}
                            <Link href="#" className="text-orange-600 hover:text-orange-700 underline underline-offset-2">
                                Điều khoản sử dụng
                            </Link>{" "}
                            và{" "}
                            <Link href="#" className="text-orange-600 hover:text-orange-700 underline underline-offset-2">
                                Chính sách bảo mật
                            </Link>
                            .
                        </Label>
                    </div>
                    {/* {state?.fieldErrors?.terms && <p className="text-sm text-red-600">{state.fieldErrors.terms}</p>} */}

                    {/* Global message */}
                    {/* {state?.message && (
                <p
                className={`text-sm ${state.ok ? "text-green-600" : "text-red-600"}`}
                aria-live="polite"
                aria-atomic="true"
                >
                {state.message}
                </p>
            )} */}

                    <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={isSubmitting || Object.values(status).some(s => s === 'checking')}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Đang đăng ký...
                            </>
                        ) : (
                            "Đăng ký"
                        )}
                    </Button>
                </form>

                <div className="flex items-center gap-3">
                    <div className="h-px bg-gray-200 flex-1" />
                    <span className="text-xs text-gray-500">Hoặc</span>
                    <div className="h-px bg-gray-200 flex-1" />
                </div>

                <p className="text-sm text-center text-gray-600">
                    Đã có tài khoản?{" "}
                    <Link href="/login" className="text-orange-600 hover:text-orange-700 font-medium">
                        Đăng nhập
                    </Link>
                </p>
            </CardContent>
        </Card>
        
    );
}
