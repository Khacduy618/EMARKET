'use client';
import React, { useEffect, useState } from 'react';

type Product = {
    ProductID: number;
    Name: string;
    Price: number;
    discount: number;
    AverageRating: number;
    SoldCount: number;
    ViewCount: number;
    ImageURL: string;
};

export default function BestSellingProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    useEffect(() => {
        fetch('http://localhost:8001/api/products/best-selling')
            .then((res) => res.json())
            .then(setProducts);
    }, []);

    return (
        <div>
            <hr className="mt-10 mb-10 mx-auto w-[1500px] border-t-2 border-gray-400" />
            <section className="p-4 sm:p-4 md:p-8 max-w-[1500px] mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <p className="text-red-500 font-semibold">This Month</p>
                        <h2 className="text-3xl font-bold">Best Selling Products</h2>
                    </div>
                    <button className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600">View All</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div key={product.ProductID} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
                            <div className="relative">
                                <img
                                    src={product.ImageURL || 'https://via.placeholder.com/200'}
                                    alt={product.Name}
                                    className="mx-auto mb-4 h-40 object-contain"
                                />
                                <div className="absolute top-2 right-2 flex flex-col space-y-2">
                                    <button className="text-gray-500 hover:text-red-500">
                                        ❤️
                                    </button>
                                    <button className="text-gray-500 hover:text-black">
                                        👁️
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-sm font-semibold mb-1">{product.Name}</h3>
                            <div className="flex items-center mb-1">
                                <span className="text-red-500 font-bold mr-2">
                                    ${(Number(product.Price - product.discount) / 1000000).toFixed(2)}M
                                </span>
                                <span className="line-through text-gray-400 text-sm">
                                    ${(Number(product.Price) / 1000000).toFixed(2)}M
                                </span>
                            </div>
                            <div className="flex items-center text-yellow-400 text-sm">
                                {'★'.repeat(Math.round(product.AverageRating))} <span className="text-gray-500 ml-1">(65)</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
