// File: app/productdetail/[id]/page.tsx

import ProductDetail from '../components/Productdetail';
import { Product } from '@/types'; // Import the Product type
import { fetchProductById } from '@/services/product'; // Import the getProductById function

interface ProductPageProps {
    params: {
        id: string;
    };
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = params;

    try {
        const product: Product | null = await fetchProductById(parseInt(id, 10)); // Fetch product data
        if (!product) {
            return (
                <main>
                    <p>Product not found.</p>
                </main>
            );
        }
        return (
            <main>
                <ProductDetail product={product} />
            </main>
        );
    } catch (error) {
        console.error("Failed to fetch product:", error);
        // You might want to render an error message or redirect to an error page here
        return (
            <main>
                <p>Failed to load product.</p>
            </main>
        );
    }
}

export async function generateMetadata({ params }: ProductPageProps) {
    // In the future, you can fetch API here to get the real product name
    // const response = await fetch(`http://localhost:8001/api/products/${params.id}`);
    // const product = await response.json();
    return {
        // title: product.Name,
        title: `Sản phẩm ID: ${params.id}`,
        description: `Chi tiết sản phẩm với ID ${params.id}`,
    };
}
