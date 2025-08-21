"use client";

import { useState, FormEvent, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UpdateProfilePayload } from '@/types';
import { toast } from 'react-toastify';
import { User, Loader2, ImagePlus } from 'lucide-react';
import { CldUploadWidget, CldImage } from 'next-cloudinary';

interface CloudinaryUploadResult {
    info?: {
        secure_url: string;
    };
}

export default function ProfileDetailsPage() {
    // Luôn lấy user MỚI NHẤT từ context, đây là "nguồn chân lý"
    const { user, updateProfile } = useAuth();

    // formData chỉ dùng để quản lý các thay đổi "nháp" trên form
    const [formData, setFormData] = useState<Partial<UpdateProfilePayload>>({
        FullName: '',
        Username: '',
        Email: '',
        Phone: '',
        Avatar: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // useEffect này CHỈ chạy khi user (từ context) thay đổi.
    // Nó đảm bảo form luôn được đồng bộ với state toàn cục mới nhất.
    // Đây là chìa khóa để sửa lỗi "trắng dữ liệu".
    useEffect(() => {
        if (user) {
            setFormData({
                FullName: user.FullName || '',
                Username: user.Username || '',
                Email: user.Email || '',
                Phone: user.Phone || '',
                Avatar: user.Avatar || '',
            });
        }
    }, [user]);

    // So sánh dữ liệu gốc từ context và dữ liệu trên form
    // để quyết định có cho phép người dùng lưu không.
    const hasChanges = useMemo(() => {
        if (!user) return false;
        return (
            formData.FullName !== user.FullName ||
            formData.Username !== user.Username ||
            formData.Email !== user.Email ||
            formData.Phone !== user.Phone ||
            formData.Avatar !== user.Avatar
        );
    }, [formData, user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleUploadSuccess = (result: any) => {
        const cloudinaryResult = result as CloudinaryUploadResult;
        if (cloudinaryResult.info?.secure_url) {
            setFormData(prev => ({ ...prev, Avatar: cloudinaryResult.info!.secure_url }));
            toast.info("Ảnh đã tải lên. Nhấn 'Lưu Thay Đổi' để cập nhật.");
        }
    };

    const handleUploadError = (error: any) => {
        console.error("Lỗi upload Cloudinary:", error);
        toast.error("Tải ảnh lên thất bại. Vui lòng thử lại.");
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await updateProfile(formData as UpdateProfilePayload);
            // Sau khi update thành công, AuthContext sẽ fetchUser.
            // `user` state trong context thay đổi.
            // `useEffect` ở trên sẽ chạy và đồng bộ lại `formData` một cách an toàn.
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Hồ Sơ Của Tôi</h2>
            <p className="mb-8 text-gray-600">Quản lý thông tin hồ sơ để bảo mật tài khoản.</p>

            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-8 lg:gap-12">
                {/* --- Cột Avatar --- */}
                <div className="flex flex-col items-center flex-shrink-0 md:w-1/4">

                    <div className="relative w-32 h-32 rounded-full group">
                        <div className="w-full h-full rounded-full overflow-hidden border bg-gray-100 flex items-center justify-center">
                            {formData.Avatar ? (
                                <CldImage
                                    src={formData.Avatar}
                                    width="128" height="128"
                                    crop="fill" gravity="face" alt="Ảnh đại diện"
                                />
                            ) : (
                                <User className="w-16 h-16 text-gray-400" />
                            )}
                        </div>

                        <CldUploadWidget
                            options={{
                                sources: ['local', 'url', 'camera'], maxFileSize: 1048576,
                                folder: 'avatars', clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
                            }}
                            onSuccess={handleUploadSuccess}
                            onError={handleUploadError}
                            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                        >
                            {({ open }) => (
                                <button type="button" onClick={() => open()}
                                    className="absolute inset-0 bg-black opacity-0 group-hover:bg-opacity-40 flex items-center justify-center rounded-full transition-all cursor-pointer hover:opacity-50"
                                    aria-label="Thay đổi ảnh đại diện"
                                >
                                    <ImagePlus className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 z-99" />
                                </button>
                            )}
                        </CldUploadWidget>
                    </div>
                    <p className="text-xs text-gray-500 mt-3 text-center">Cho phép JPG, PNG, WEBP.<br />Tối đa 1MB.</p>
                </div>

                {/* --- Cột Thông tin --- */}
                <div className="flex-grow space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700" htmlFor="FullName">Họ và Tên</label>
                        <input id="FullName" name="FullName" type="text" required value={formData.FullName || ''} onChange={handleChange} className="w-full p-2.5 mt-1 border rounded-md" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700" htmlFor="Username">Tên đăng nhập</label>
                        <input id="Username" name="Username" type="text" required value={formData.Username || ''} onChange={handleChange} className="w-full p-2.5 mt-1 border rounded-md" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700" htmlFor="Email">Email</label>
                        <input id="Email" name="Email" type="email" required value={formData.Email || ''} onChange={handleChange} className="w-full p-2.5 mt-1 border rounded-md" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700" htmlFor="Phone">Số điện thoại</label>
                        <input id="Phone" name="Phone" type="tel" value={formData.Phone || ''} onChange={handleChange} className="w-full p-2.5 mt-1 border rounded-md" />
                    </div>
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting || !hasChanges}
                            className="inline-flex items-center px-6 py-3 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
