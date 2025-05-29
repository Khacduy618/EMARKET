// app/products/page.tsx
import React from 'react';
import ProductCard from './components/ProductCard';
import axios from 'axios';
import Layout from '../components/Layout'; // Import Layout

interface Product {
    id: number;
    name: string;
    description?: string;
    price: number; // Đảm bảo price là number ở đây
    stock?: number;
    image?: string;
}

interface ProductData {
    id: number;
    name: string;
    description: string | null;
    price: string | number; // Cho phép string hoặc number từ API
    stock: number | null;
    image: string | null;
    created_at: string;
    updated_at: string;
}

async function fetchProducts(): Promise<Product[]> {
    try {
        const apiUrl = 'http://localhost:8001/api/Products';
        const response = await axios.get<ProductData[]>(apiUrl);
        const products: Product[] = response.data.map((data) => ({
            id: data.id,
            name: data.name,
            description: data.description === null ? undefined : data.description,
            price: typeof data.price === 'string' ? parseFloat(data.price) : data.price, // Chuyển đổi sang number
            stock: data.stock === null ? undefined : data.stock,
            image: data.image === null ? undefined : data.image,
        }));
        return products;
    } catch (error) {
        console.error('Lỗi khi fetching sản phẩm:', error);
        return [];
    }
}

export default async function ProductsPage() {
    const products = await fetchProducts();

    return (
        <Layout> {/* Wrap content with Layout */}
            <h1 className="text-2xl font-bold mb-4">Danh sách sản phẩm</h1>

            <h2>Chúc ngủ ngon</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </Layout> // Close Layout
    );
}
