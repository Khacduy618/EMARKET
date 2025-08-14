'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import InputField from './InputField';
import Button from './Button';
import {API_URL} from '@/lib/config';

export default function SellerRegisterForm() {
    const [formData, setFormData] = useState({
        shop_name: '',
        description: '',
        shop_address: '',
        shop_phone: '',
        logo_url: '',
        cover_image_url: '',
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const token = getAuthToken();
    // Kiểm tra trạng thái đăng nhập
    useEffect(() => {
        if (!token) {
            router.push('/login');
            return;
        }

    }, [router]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        console.log('Validating form:', formData);
        let isValid = true;
        const requiredFields = ['shop_name', 'shop_address', 'shop_phone'];

        requiredFields.forEach((field) => {
            if (!formData[field]) {
                isValid = false;
                document.getElementById(field)?.classList.add('border-red-500');
            } else {
                document.getElementById(field)?.classList.remove('border-red-500');
            }
        });

        if (!isValid) {
            setError('Vui lòng điền đầy đủ các trường bắt buộc.');
        }
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Submitting form with data:', formData);
        if (validateForm()) {
            setLoading(true);
            setError(null);
            try {
                console.log('Sending POST /api/seller/register');
                const response = await axios.post(
                    `${API_URL}/seller/register`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data', 
                            'Authorization': `Bearer ${token}`
                        }
                    }
                  );
                setSuccess(response.data.message || 'Đăng ký thành công!');
                setTimeout(() => router.push('/'), 2000);
            } catch (err) {
                console.error('Submit error:', err);
                let errorMessage = err.response?.data?.message || 'Đăng ký thất bại.';
                if (axios.isAxiosError(err) && err.response) {
                    errorMessage += ` (Lỗi: ${err.response.status} ${err.response.statusText || ''})`;
                } else if (err instanceof Error) {
                    errorMessage += ` (${err.message})`;
                }
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-10 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8">Đăng Ký Bán Hàng</h1>

            <form
                id="seller-register-form"
                onSubmit={(e) => {
                    console.log('Form submit triggered');
                    handleSubmit(e);
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                    }
                }}
            >
                <InputField
                    label="Tên Cửa Hàng"
                    name="shop_name"
                    value={formData.shop_name}
                    onChange={handleChange}
                    placeholder="Nhập tên cửa hàng"
                    required
                />
                <InputField
                    label="Mô Tả"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Nhập mô tả cửa hàng (tùy chọn)"
                />
                <InputField
                    label="Địa Chỉ Cửa Hàng"
                    name="shop_address"
                    value={formData.shop_address}
                    onChange={handleChange}
                    placeholder="Nhập địa chỉ cửa hàng"
                    required
                />
                <InputField
                    label="Số Điện Thoại Cửa Hàng"
                    name="shop_phone"
                    value={formData.shop_phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại cửa hàng"
                    required
                />
                <InputField
                    label="URL Logo"
                    name="logo_url"
                    type="text"
                    value={formData.logo_url}
                    onChange={handleChange}
                    placeholder="Nhập URL logo (tùy chọn)"
                />
                <InputField
                    label="URL Ảnh Bìa"
                    name="cover_image_url"
                    type="text"
                    value={formData.cover_image_url}
                    onChange={handleChange}
                    placeholder="Nhập URL ảnh bìa (tùy chọn)"
                />

                <div className="mt-8 text-center">
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Đang Gửi...' : 'Đăng Ký'}
                    </Button>
                </div>

                {success && <div className="bg-green-100 text-green-700 p-4 mt-4 rounded">{success}</div>}
                {error && <div className="bg-red-100 text-red-700 p-4 mt-4 rounded">{error}</div>}
            </form>
        </div>
    );
}


