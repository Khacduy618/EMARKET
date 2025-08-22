"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Link from 'next/link';
import {
    Store,
    MapPin,
    Phone,
    Upload,
    CreditCard,
    User,
    X,
    Eye,
    Lock,
} from "lucide-react";

export default function ShopRegistrationForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        shopName: "",
        addressStreet: "",
        addressWard: "",
        addressDistrict: "",
        addressCity: "",
        shopPhone: "",
        logo: null as File | null,
        cccdFront: null as File | null,
        cccdBack: null as File | null,
    });

    const [imagePreviews, setImagePreviews] = useState({
        logo: null as string | null,
        cccdFront: null as string | null,
        cccdBack: null as string | null,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [twoFAEnabled, setTwoFAEnabled] = useState<boolean | null>(null); // Thêm trạng thái 2FA

    useEffect(() => {
        const checkTwoFA = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8001/api/seller/register`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                        withCredentials: true,
                    }
                );
                setTwoFAEnabled(true); // Nếu thành công, 2FA đã được bật
            }
            
             catch (err: any) {
                if (err.response?.status === 403) {
                    setTwoFAEnabled(false); // Chưa bật 2FA
                    setError("Bạn chưa xác thực 2 yếu tố. Vui lòng kích hoạt 2FA trước.");
                } else {
                    setError("Đã xảy ra lỗi khi kiểm tra xác thực.");
                }
            }
        };
        checkTwoFA();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            const file = files[0];
            if (file.size > 5 * 1024 * 1024) {
                setError("Kích thước file không được vượt quá tối đa 2MB.");
                return;
            }
            if (!file.type.startsWith("image/")) {
                setError("Vui lòng chọn file ảnh (PNG, JPG, JPEG).");
                return;
            }
            setFormData((prev) => ({ ...prev, [name]: file }));

            if (imagePreviews[name as keyof typeof imagePreviews]) {
                URL.revokeObjectURL(imagePreviews[name as keyof typeof imagePreviews]!);
            }
            const previewUrl = URL.createObjectURL(file);
            setImagePreviews((prev) => ({ ...prev, [name]: previewUrl }));
        }
    };

    const removeImage = (fieldName: string) => {
        setFormData((prev) => ({ ...prev, [fieldName]: null }));
        if (imagePreviews[fieldName as keyof typeof imagePreviews]) {
            URL.revokeObjectURL(imagePreviews[fieldName as keyof typeof imagePreviews]!);
        }
        setImagePreviews((prev) => ({ ...prev, [fieldName]: null }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!twoFAEnabled) {
            setError("Vui lòng kích hoạt 2FA trước khi đăng ký cửa hàng.");
            return;
        }
        setLoading(true);
        setError(null);

        const formDataToSend = new FormData();
        formDataToSend.append("shopName", formData.shopName);
        formDataToSend.append("addressStreet", formData.addressStreet);
        formDataToSend.append("addressWard", formData.addressWard);
        formDataToSend.append("addressDistrict", formData.addressDistrict);
        formDataToSend.append("addressCity", formData.addressCity);
        formDataToSend.append("shopPhone", formData.shopPhone);
        if (formData.logo) formDataToSend.append("logo", formData.logo);
        if (formData.cccdFront) formDataToSend.append("cccdFront", formData.cccdFront);
        if (formData.cccdBack) formDataToSend.append("cccdBack", formData.cccdBack);

        try {
            const response = await axios.post(
                "http://localhost:8001/api/seller/register",
                formDataToSend,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    withCredentials: true,
                }
            );

            Swal.fire({
                icon: "success",
                title: "Thành công!",
                text: "Đăng ký cửa hàng thành công. Vui lòng chờ phê duyệt.",
                confirmButtonText: "OK",
                confirmButtonColor: "#EE4D2D",
            });
            router.push("/");
        } catch (err: any) {
            const msg = err.response?.data?.message || "Đã xảy ra lỗi khi đăng ký cửa hàng.";
            setError(msg);
            Swal.fire({
                icon: "error",
                title: "Lỗi!",
                text: msg,
                confirmButtonText: "OK",
                confirmButtonColor: "#EE4D2D",
            });
        } finally {
            setLoading(false);
        }
    };

    if (twoFAEnabled === null) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8 px-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4 animate-pulse">
                        <Store className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-gray-600">Đang kiểm tra xác thực...</p>
                </div>
            </div>
        );
    }

    if (twoFAEnabled === false) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8 px-4 flex items-center justify-center">
                <div className="max-w-md mx-auto text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                        <Lock className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Xác Thực 2 Yếu Tố Bắt Buộc
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Bạn chưa kích hoạt xác thực hai yếu tố (2FA). Vui lòng kích hoạt 2FA
                        trong phần cài đặt tài khoản để tiếp tục đăng ký cửa hàng.
                    </p>
                    <Link
                        href="/account/security"
                        className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                        Đi Đến Cài Đặt
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-4">
                        <Store className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Đăng Ký Cửa Hàng</h1>
                    <p className="text-gray-600">
                        Tham gia cùng hàng triệu người bán trên nền tảng của chúng tôi
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                       

                        {/* Shop Information Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                                <Store className="w-5 h-5 text-orange-500" />
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Thông Tin Cửa Hàng
                                </h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="shopName"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Tên Cửa Hàng *
                                    </label>
                                    <input
                                        id="shopName"
                                        name="shopName"
                                        type="text"
                                        required
                                        value={formData.shopName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                        placeholder="Nhập tên cửa hàng của bạn"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="shopPhone"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Số Điện Thoại *
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            id="shopPhone"
                                            name="shopPhone"
                                            type="tel"
                                            required
                                            value={formData.shopPhone}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                            placeholder="Nhập số điện thoại"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="logo"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Logo Cửa Hàng
                                    </label>
                                    {imagePreviews.logo ? (
                                        <div className="relative">
                                            <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-200">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <img
                                                            src={imagePreviews.logo}
                                                            alt="Logo preview"
                                                            className="w-20 h-20 object-cover rounded-lg border"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src =
                                                                    "/placeholder.svg";
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage("logo")}
                                                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {(formData.logo as File)?.name || "Logo"}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {((formData.logo as File)?.size / 1024 / 1024).toFixed(
                                                                2
                                                            ) || "0"}{" "}
                                                            MB
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <input
                                                id="logo"
                                                name="logo"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="logo"
                                                className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 cursor-pointer transition-colors group"
                                            >
                                                <div className="text-center">
                                                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-orange-500 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-600">Chọn file logo</p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                         tối đa 2MB
                                                    </p>
                                                </div>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Address Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                                <MapPin className="w-5 h-5 text-orange-500" />
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Địa Chỉ Cửa Hàng
                                </h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="addressStreet"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Địa Chỉ Chi Tiết *
                                    </label>
                                    <input
                                        id="addressStreet"
                                        name="addressStreet"
                                        type="text"
                                        required
                                        value={formData.addressStreet}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                        placeholder="Số nhà, tên đường"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="addressWard"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Phường/Xã *
                                        </label>
                                        <input
                                            id="addressWard"
                                            name="addressWard"
                                            type="text"
                                            required
                                            value={formData.addressWard}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                            placeholder="Phường/Xã"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="addressDistrict"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Quận/Huyện *
                                        </label>
                                        <input
                                            id="addressDistrict"
                                            name="addressDistrict"
                                            type="text"
                                            required
                                            value={formData.addressDistrict}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                            placeholder="Quận/Huyện"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="addressCity"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Tỉnh/Thành Phố *
                                    </label>
                                    <input
                                        id="addressCity"
                                        name="addressCity"
                                        type="text"
                                        required
                                        value={formData.addressCity}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                        placeholder="Tỉnh/Thành Phố"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Identity Verification Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                                <CreditCard className="w-5 h-5 text-orange-500" />
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Xác Thực Danh Tính
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label
                                        htmlFor="cccdFront"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        CCCD Mặt Trước *
                                    </label>
                                    {imagePreviews.cccdFront ? (
                                        <div className="relative">
                                            <div className="bg-gray-50 rounded-lg p-3 border-2 border-dashed border-gray-200">
                                                <div className="relative">
                                                    <img
                                                        src={imagePreviews.cccdFront}
                                                        alt="CCCD mặt trước"
                                                        className="w-full h-32 object-cover rounded-lg border"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src =
                                                                "/placeholder.svg";
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage("cccdFront")}
                                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-2 text-center truncate">
                                                    {(formData.cccdFront as File)?.name || "CCCD Front"}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <input
                                                id="cccdFront"
                                                name="cccdFront"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="cccdFront"
                                                className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 cursor-pointer transition-colors group"
                                            >
                                                <div className="text-center">
                                                    <User className="w-8 h-8 text-gray-400 group-hover:text-orange-500 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-600">Chọn ảnh mặt trước</p>
                                                </div>
                                            </label>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="cccdBack"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        CCCD Mặt Sau *
                                    </label>
                                    {imagePreviews.cccdBack ? (
                                        <div className="relative">
                                            <div className="bg-gray-50 rounded-lg p-3 border-2 border-dashed border-gray-200">
                                                <div className="relative">
                                                    <img
                                                        src={imagePreviews.cccdBack}
                                                        alt="CCCD mặt sau"
                                                        className="w-full h-32 object-cover rounded-lg border"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src =
                                                                "/placeholder.svg";
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage("cccdBack")}
                                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-2 text-center truncate">
                                                    {(formData.cccdBack as File)?.name || "CCCD Back"}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <input
                                                id="cccdBack"
                                                name="cccdBack"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="cccdBack"
                                                className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 cursor-pointer transition-colors group"
                                            >
                                                <div className="text-center">
                                                    <CreditCard className="w-8 h-8 text-gray-400 group-hover:text-orange-500 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-600">Chọn ảnh mặt sau</p>
                                                </div>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Đang xử lý...
                                    </div>
                                ) : (
                                    "Đăng Ký Cửa Hàng"
                                )}
                            </button>
                        </div>

                        {/* Terms */}
                        <div className="text-center text-sm text-gray-500">
                            Bằng cách đăng ký, bạn đồng ý với{" "}
                            <a
                                href="#"
                                className="text-orange-500 hover:text-orange-600 font-medium"
                            >
                                Điều khoản dịch vụ
                            </a>{" "}
                            và{" "}
                            <a
                                href="#"
                                className="text-orange-500 hover:text-orange-600 font-medium"
                            >
                                Chính sách bảo mật
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}