// Đường dẫn: src/app/(main)/productdetail/components/ProductDescription.tsx

import axios from 'axios';
import React from 'react';

// ==============================================================================
// 1. ĐỊNH NGHĨA TYPES (Cập nhật để khớp hoàn toàn với JSON)
// ==============================================================================

interface ProductDescriptionProps {
    productId: number; // <- BẮT BUỘC
}

interface Category {
    Name: string;
    // Thêm các trường khác nếu bạn cần dùng
}

interface Variant {
    SKU: string;
    StockQuantity: number;
    // Thêm các trường khác nếu bạn cần dùng
}

interface ProductData {
    Description: string;
    category: Category;
    variants: Variant[];
    // Thêm các trường khác của sản phẩm nếu cần
}

// ==============================================================================
// 2. HÀM GỌI API ĐỂ LẤY DỮ LIỆU
// ==============================================================================

async function getProductData(id: number): Promise<ProductData | null> {
    try {
        const response = await axios.get(`http://localhost:8001/api/productDetail/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch product data for component (ID: ${id}):`, error);
        return null;
    }
}

// ==============================================================================
// 3. ĐỊNH NGHĨA COMPONENT
// ==============================================================================

// Component con để render mỗi dòng chi tiết, giúp code sạch hơn
const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => {
    // Chỉ render dòng nếu value có giá trị
    if (!value) return null;

    return (
        <div className="flex py-3 border-b border-gray-200 text-sm">
            <dt className="w-1/3 text-gray-500">{label}</dt>
            <dd className="w-2/3 text-gray-800 font-medium">{value}</dd>
        </div>
    );
};

export default async function ProductDescription({ productId }: ProductDescriptionProps) {
    const product = await getProductData(productId);

    if (!product) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200">
                <p className="text-gray-500">Không thể tải thông tin chi tiết sản phẩm.</p>
            </div>
        );
    }

    // Lấy biến thể đầu tiên làm thông tin mặc định (cho SKU, Tồn kho)
    const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;

    return (
        // Wrapper chung cho cả 2 section
        <div className="flex flex-col gap-8">
            {/* === Section 1: Product Details (Thông số kỹ thuật) === */}
            <div className="bg-white rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold p-4 bg-gray-100 rounded-t-md text-gray-800">
                    Chi tiết sản phẩm
                </h2>
                <dl className="p-4">
                    {/* Dữ liệu động từ JSON */}
                    <DetailRow label="Danh mục" value={product.category?.Name} />
                    <DetailRow label="SKU" value={defaultVariant?.SKU} />
                    <DetailRow label="Số Lượng" value={defaultVariant ? `${defaultVariant.StockQuantity} sản phẩm có sẵn` : 'N/A'} />

                    {/* 
                        Các trường như Brand, Warranty Type, Connectivity không có trong JSON nên sẽ không hiển thị,
                        đảm bảo không có dữ liệu tĩnh.
                    */}
                </dl>
            </div>

            {/* === Section 2: Product Description (Mô tả sản phẩm) === */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* 
        Tiêu đề nổi bật, có đường gạch chân màu nhấn mạnh,
        giống phong cách các trang e-commerce hiện đại.
    */}
                <h2 className="text-2xl font-bold text-gray-900 p-6 border-b border-gray-200">
                    Mô Tả Chi Tiết Sản Phẩm
                </h2>

                {/* 
        Phần nội dung chính.
        Sử dụng padding lớn hơn (p-6) để tạo không gian thoáng đãng.
        Các lớp text-* và leading-* giúp văn bản dễ đọc hơn.
    */}
                <div className="p-6">
                    <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                        {/* 
                `whitespace-pre-line` là một mẹo rất hay:
                Nó sẽ giữ lại các lần xuống dòng (Enter) trong chuỗi `product.Description` của bạn,
                giúp bạn dễ dàng tạo các đoạn văn mới từ trang admin mà không cần dùng HTML.
            */}
                        {product.Description}


                    </p>
                </div>
            </div>
        </div>
    );
}