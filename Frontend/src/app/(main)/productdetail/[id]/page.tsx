import { notFound } from 'next/navigation';
import ProductDetail from '../components/Productdetail';
import ProductDescription from '../components/ProductDescription';
import FeaturedProductsSidebar from '../components/FeaturedProductsSidebar';
import RelatedProductsSidebar from '../components/FeaturedProductsSidebar';

interface ProductPageProps {
    params: {
        id: string;
    };
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = params;
    const productIdAsNumber = parseInt(id, 10);
    if (isNaN(productIdAsNumber)) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <main>
                <ProductDetail
                    productId={productIdAsNumber}
                    descriptionSlot={<ProductDescription productId={productIdAsNumber} />}
                    sidebarSlot={<RelatedProductsSidebar currentProductId={productIdAsNumber} />}
                />
            </main>
        </div>
    );
}

// Hàm generateMetadata của bạn vẫn hoạt động tốt, không cần thay đổi
export async function generateMetadata({ params }: ProductPageProps) {
    // ...
}