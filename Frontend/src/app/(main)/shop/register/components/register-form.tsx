"use client"

import type React from "react"

import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle, Store, MapPin, Phone, ImageIcon, FileText } from "lucide-react"
import { getAuthToken } from "@/services/api"

interface FormData {
    shop_name: string
    description: string
    shop_address: string
    shop_phone: string
    logo_url: string
    cover_image_url: string
}

export default function SellerRegisterForm() {
    const [formData, setFormData] = useState<FormData>({
        shop_name: "",
        description: "",
        shop_address: "",
        shop_phone: "",
        logo_url: "",
        cover_image_url: "",
    })
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState("")
    const [loading, setLoading] = useState(false)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })

        // Clear field error when user starts typing
        if (fieldErrors[name]) {
            setFieldErrors({ ...fieldErrors, [name]: "" })
        }
    }

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {}
        const requiredFields = [
            { key: "shop_name", label: "Tên cửa hàng" },
            { key: "shop_address", label: "Địa chỉ cửa hàng" },
            { key: "shop_phone", label: "Số điện thoại" },
        ]

        requiredFields.forEach(({ key, label }) => {
            if (!formData[key as keyof FormData].trim()) {
                errors[key] = `${label} là bắt buộc`
            }
        })

        // Phone validation
        if (formData.shop_phone && !/^[0-9]{10,11}$/.test(formData.shop_phone)) {
            errors.shop_phone = "Số điện thoại không hợp lệ"
        }

        // URL validation
        if (formData.logo_url && !isValidUrl(formData.logo_url)) {
            errors.logo_url = "URL logo không hợp lệ"
        }

        if (formData.cover_image_url && !isValidUrl(formData.cover_image_url)) {
            errors.cover_image_url = "URL ảnh bìa không hợp lệ"
        }

        setFieldErrors(errors)
        return Object.keys(errors).length === 0
    }

    const isValidUrl = (string: string): boolean => {
        try {
            new URL(string)
            return true
        } catch (_) {
            return false
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            setError("Vui lòng kiểm tra lại thông tin đã nhập")
            return
        }

        setLoading(true)
        setError(null)

        try {
            const token = getAuthToken()
            const response = await axios.post("http://localhost/api/seller/register", formData, {
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`,
                },
            })

            setSuccess(response.data.message || "Đăng ký thành công!")
            setTimeout(() => router.push("/seller/dashboard"), 2000)
        } catch (err: any) {
            let errorMessage = "Đăng ký thất bại. Vui lòng thử lại."

            if (err.response?.data?.message) {
                errorMessage = err.response.data.message
            } else if (err.response?.status) {
                errorMessage += ` (Mã lỗi: ${err.response.status})`
            }

            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
                <CardTitle className="text-2xl font-bold text-center">Thông tin cửa hàng</CardTitle>
                <p className="text-center text-orange-100">Điền thông tin để tạo cửa hàng của bạn</p>
            </CardHeader>
            <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Shop Name */}
                    <div className="space-y-2">
                        <Label htmlFor="shop_name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Store className="h-4 w-4 text-orange-500" />
                            Tên cửa hàng *
                        </Label>
                        <Input
                            id="shop_name"
                            name="shop_name"
                            value={formData.shop_name}
                            onChange={handleChange}
                            placeholder="VD: Cửa hàng thời trang ABC"
                            className={`h-12 ${fieldErrors.shop_name ? "border-red-500" : ""}`}
                        />
                        {fieldErrors.shop_name && (
                            <p className="text-red-500 text-sm flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {fieldErrors.shop_name}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-orange-500" />
                            Mô tả cửa hàng
                        </Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Mô tả ngắn gọn về cửa hàng của bạn..."
                            rows={4}
                            className="resize-none"
                        />
                    </div>

                    {/* Shop Address */}
                    <div className="space-y-2">
                        <Label htmlFor="shop_address" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-orange-500" />
                            Địa chỉ cửa hàng *
                        </Label>
                        <Input
                            id="shop_address"
                            name="shop_address"
                            value={formData.shop_address}
                            onChange={handleChange}
                            placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM"
                            className={`h-12 ${fieldErrors.shop_address ? "border-red-500" : ""}`}
                        />
                        {fieldErrors.shop_address && (
                            <p className="text-red-500 text-sm flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {fieldErrors.shop_address}
                            </p>
                        )}
                    </div>

                    {/* Shop Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="shop_phone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Phone className="h-4 w-4 text-orange-500" />
                            Số điện thoại *
                        </Label>
                        <Input
                            id="shop_phone"
                            name="shop_phone"
                            value={formData.shop_phone}
                            onChange={handleChange}
                            placeholder="VD: 0901234567"
                            className={`h-12 ${fieldErrors.shop_phone ? "border-red-500" : ""}`}
                        />
                        {fieldErrors.shop_phone && (
                            <p className="text-red-500 text-sm flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {fieldErrors.shop_phone}
                            </p>
                        )}
                    </div>

                    {/* Logo URL */}
                    <div className="space-y-2">
                        {/* <Label htmlFor="logo_url" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-orange-500" />
                            URL Logo cửa hàng
                        </Label>
                        <Input
                            id="logo_url"
                            name="logo_url"
                            value={formData.logo_url}
                            onChange={handleChange}
                            placeholder="https://example.com/logo.jpg"
                            className={`h-12 ${fieldErrors.logo_url ? "border-red-500" : ""}`}
                        />
                        {fieldErrors.logo_url && (
                            <p className="text-red-500 text-sm flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {fieldErrors.logo_url}
                            </p>
                        )} */}
                    </div>

                    {/* Cover Image URL */}
                    <div className="space-y-2">
                        {/* <Label htmlFor="cover_image_url" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-orange-500" />
                            URL Ảnh bìa cửa hàng
                        </Label>
                        <Input
                            id="cover_image_url"
                            name="cover_image_url"
                            value={formData.cover_image_url}
                            onChange={handleChange}
                            placeholder="https://example.com/cover.jpg"
                            className={`h-12 ${fieldErrors.cover_image_url ? "border-red-500" : ""}`}
                        />
                        {fieldErrors.cover_image_url && (
                            <p className="text-red-500 text-sm flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {fieldErrors.cover_image_url}
                            </p>
                        )} */}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-lg"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Đang xử lý...
                                </div>
                            ) : (
                                "Đăng ký bán hàng"
                            )}
                        </Button>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <p className="text-green-700 font-medium">{success}</p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <p className="text-red-700 font-medium">{error}</p>
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    )
}
