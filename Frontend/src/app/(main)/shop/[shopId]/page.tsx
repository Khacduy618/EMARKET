'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import ShopHeader from '../components/ShopHeader';
import BestSellingProducts from '../components/BestSellingProducts';
import AllProducts from '../components/AllProducts';
import ProductFilter from '../components/ProductFilter';
import SortBar from '../components/SortBar';
import { getShopDetails, getShopProducts, getShopBestSelling } from '@/services/shop';

interface Shop {
    ShopID: number;
    ShopName: string;
    ShopDescription?: string;
    ShopPhone?: string;
    ShopEmail?: string;
    ShopAddress?: string;
    ShopLogo?: string;
    ShopCoverImage?: string;
    ShopLevel?: number;
    FollowerCount?: number;
    IsFollowing?: boolean;
}

interface Product {
    ProductID: number;
    Name: string;
    Price: number;
    CompareAtPrice?: number;
    ImageURL?: string;
    Discount?: number;
    StockQuantity: number;
}

interface FilterOptions {
    categories: string[];
    priceRange: { min: number; max: number };
    sortBy: 'newest' | 'price-asc' | 'price-desc' | 'best-selling' | 'rating';
}

export default function ShopPage() {
    const params = useParams();
    const shopId = params.shopId as string;
    
    const [shop, setShop] = useState<Shop | null>(null);
    const [bestSellingProducts, setBestSellingProducts] = useState<Product[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [filters, setFilters] = useState<FilterOptions>({
        categories: [],
        priceRange: { min: 0, max: 10000000 },
        sortBy: 'newest'
    });

    useEffect(() => {
        if (shopId) {
            fetchShopData();
        }
    }, [shopId]);

    useEffect(() => {
        applyFilters();
    }, [allProducts, filters]);

    const fetchShopData = async () => {
        try {
            setLoading(true);
            const [shopData, bestSellingData, allProductsData] = await Promise.all([
                getShopDetails(shopId),
                getShopBestSelling(shopId),
                getShopProducts(shopId)
            ]);
            
            setShop(shopData);
            setBestSellingProducts(bestSellingData);
            setAllProducts(allProductsData);
        } catch (err) {
            setError('Không thể tải thông tin cửa hàng');
            console.error('Error fetching shop data:', err);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...allProducts];

        // Filter by categories
        if (filters.categories.length > 0) {
            // filtered = filtered.filter(product => 
            //     filters.categories.includes(product.CategoryName)
            // );
        }

        // Filter by price range
        filtered = filtered.filter(product => 
            product.Price >= filters.priceRange.min && 
            product.Price <= filters.priceRange.max
        );

        // Sort products
        switch (filters.sortBy) {
            case 'price-asc':
                filtered.sort((a, b) => a.Price - b.Price);
                break;
            case 'price-desc':
                filtered.sort((a, b) => b.Price - a.Price);
                break;
            case 'best-selling':
                // filtered.sort((a, b) => (b.SoldCount || 0) - (a.SoldCount || 0));
                break;
            case 'rating':
                // filtered.sort((a, b) => (b.Rating || 0) - (a.Rating || 0));
                break;
            default: // newest
                // filtered.sort((a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime());
                break;
        }

        setFilteredProducts(filtered);
    };

    const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="animate-pulse">
                        <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }).map((_, index) => (
                                <div key={index} className="h-64 bg-gray-200 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !shop) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="container mx-auto px-4 py-8 text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        {error || 'Cửa hàng không tồn tại'}
                    </h1>
                    <p className="text-gray-600">Vui lòng thử lại sau hoặc quay về trang chủ.</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            
            <main className="container mx-auto px-4 py-6">
                {/* Section 1: Shop Information */}
                <ShopHeader shop={shop} />
                
                {/* Sort Bar */}
                <SortBar 
                    sortBy={filters.sortBy}
                    onSortChange={(sortBy) => handleFilterChange({ sortBy })}
                />
                
                {/* Section 2: Best Selling Products */}
                <BestSellingProducts products={bestSellingProducts} />
                
                {/* Section 3: All Products with Filter */}
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 mt-6 md:mt-8">
                    {/* Mobile Filter Toggle */}
                    <div className="lg:hidden">
                        <button 
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            onClick={() => {/* TODO: Toggle mobile filter */}}
                        >
                            🔍 Bộ lọc & Sắp xếp
                        </button>
                    </div>

                    {/* Sidebar Filter - Desktop */}
                    <div className="hidden lg:block w-64 flex-shrink-0">
                        <ProductFilter 
                            filters={filters}
                            onFilterChange={handleFilterChange}
                        />
                    </div>
                    
                    {/* All Products */}
                    <div className="flex-1">
                        <AllProducts products={filteredProducts} />
                    </div>
                </div>
            </main>
            
            <Footer />
        </div>
    );
}