'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getShopCategories,
} from '@/services/seller-category';
import Swal from 'sweetalert2';

interface Product {
    ProductID: number;
    ShopID: number;
    CategoryID: number;
    CategoryName: string;
    Name: string;
    Description: string | null;
    Price: number;
    StockQuantity: number;
    ImageURL: string | null;
    CreatedAt: string;
    UpdatedAt: string;
}

interface ShopCategory {
    ShopCategoryID: number;
    CategoryID: number;
    CategoryName: string;
    Status: 'PendingApproval' | 'Approved' | 'Rejected';
    RequestedAt: string;
    ApprovedAt: string | null;
    RejectedReason: string | null;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [shopCategories, setShopCategories] = useState<ShopCategory[]>([]);
    const [formData, setFormData] = useState<{
        ProductID?: number;
        CategoryID: number | null;
        Name: string;
        Description: string;
        Price: number;
        StockQuantity: number;
        ImageURL: string;
    }>({
        CategoryID: null,
        Name: '',
        Description: '',
        Price: 0,
        StockQuantity: 0,
        ImageURL: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            Swal.fire({
                title: 'Unauthorized!',
                text: 'Please log in to access the dashboard',
                icon: 'error',
                draggable: true,
            }).then(() => {
                router.push('/login');
            });
            return;
        }

        fetchData();
    }, [router]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [productsData, categoriesData] = await Promise.all([
                getProducts(),
                getShopCategories(),
            ]);
            setProducts(productsData);
            setShopCategories(categoriesData);
        } catch (err: any) {
            Swal.fire({
                title: 'Error!',
                text: err.response?.data?.message || 'Failed to fetch data',
                icon: 'error',
                draggable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.CategoryID) {
            Swal.fire({
                title: 'Error!',
                text: 'Please select a category',
                icon: 'error',
                draggable: true,
            });
            return;
        }

        setLoading(true);
        try {
            const productData = {
                CategoryID: formData.CategoryID,
                Name: formData.Name,
                Description: formData.Description || null,
                Price: formData.Price,
                StockQuantity: formData.StockQuantity,
                ImageURL: formData.ImageURL || null,
            };

            if (isEditing && formData.ProductID) {
                await updateProduct(formData.ProductID, productData);
                Swal.fire({
                    title: 'Success!',
                    text: 'Product updated successfully',
                    icon: 'success',
                    draggable: true,
                });
            } else {
                await createProduct(productData);
                Swal.fire({
                    title: 'Success!',
                    text: 'Product created successfully',
                    icon: 'success',
                    draggable: true,
                });
            }
            resetForm();
            await fetchData();
        } catch (err: any) {
            Swal.fire({
                title: 'Error!',
                text: err.response?.data?.message || 'Failed to save product',
                icon: 'error',
                draggable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product: Product) => {
        setFormData({
            ProductID: product.ProductID,
            CategoryID: product.CategoryID,
            Name: product.Name,
            Description: product.Description || '',
            Price: product.Price,
            StockQuantity: product.StockQuantity,
            ImageURL: product.ImageURL || '',
        });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (productID: number) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this product?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            draggable: true,
        });

        if (!result.isConfirmed) return;

        setLoading(true);
        try {
            await deleteProduct(productID);
            Swal.fire({
                title: 'Success!',
                text: 'Product deleted successfully',
                icon: 'success',
                draggable: true,
            });
            await fetchData();
        } catch (err: any) {
            Swal.fire({
                title: 'Error!',
                text: err.response?.data?.message || 'Failed to delete product',
                icon: 'error',
                draggable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            CategoryID: null,
            Name: '',
            Description: '',
            Price: 0,
            StockQuantity: 0,
            ImageURL: '',
        });
        setIsEditing(false);
        setIsModalOpen(false);
    };

    const openAddModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    return (
        <div className="flex-1 flex flex-col">
            <div className="p-6 flex-1">
                <div className="mb-6">
                    <button
                        onClick={openAddModal}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        Add Product
                    </button>
                </div>
                <div className="bg-white shadow-md rounded">
                    <div className="p-4 border-b">
                        <h5 className="font-medium">Product List</h5>
                    </div>
                    <div className="p-4">
                        {loading && <p className="text-gray-500">Loading...</p>}
                        {!loading && products.length === 0 ? (
                            <p className="text-gray-500">No products found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="p-2 text-gray-700">Name</th>
                                            <th className="p-2 text-gray-700">Category</th>
                                            <th className="p-2 text-gray-700">Price</th>
                                            <th className="p-2 text-gray-700">Stock</th>
                                            <th className="p-2 text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product) => (
                                            <tr key={product.ProductID} className="border-b hover:bg-gray-50">
                                                <td className="p-2">{product.Name}</td>
                                                <td className="p-2">{product.CategoryName}</td>
                                                {/* <td className="p-2">{product.Price.toFixed(2)}</td> */}
                                                <td className="p-2">{product.StockQuantity}</td>
                                                <td className="p-2 flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(product)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        title="Edit Product"
                                                        disabled={loading}
                                                    >
                                                        <i className="bi bi-pencil-fill"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.ProductID)}
                                                        className="text-red-600 hover:text-red-800"
                                                        title="Delete Product"
                                                        disabled={loading}
                                                    >
                                                        <i className="bi bi-trash-fill"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal for Add/Edit Product */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h5 className="font-medium text-lg">
                                    {isEditing ? 'Edit Product' : 'Add Product'}
                                </h5>
                                <button
                                    onClick={resetForm}
                                    className="text-gray-600 hover:text-gray-800"
                                    title="Close"
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                        Category
                                    </label>
                                    <select
                                        id="category"
                                        value={formData.CategoryID || ''}
                                        onChange={(e) => setFormData({ ...formData, CategoryID: Number(e.target.value) || null })}
                                        className="w-full p-2 border rounded outline-none focus:border-blue-600"
                                        disabled={loading}
                                        required
                                    >
                                        <option value="">Select a category</option>
                                        {shopCategories.map((category) => (
                                            <option key={category.CategoryID} value={category.CategoryID}>
                                                {category.CategoryName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Product Name
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={formData.Name}
                                        onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                                        className="w-full p-2 border rounded outline-none focus:border-blue-600"
                                        disabled={loading}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        value={formData.Description}
                                        onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                                        className="w-full p-2 border rounded outline-none focus:border-blue-600"
                                        disabled={loading}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                                        Price
                                    </label>
                                    <input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        value={formData.Price}
                                        onChange={(e) => setFormData({ ...formData, Price: Number(e.target.value) })}
                                        className="w-full p-2 border rounded outline-none focus:border-blue-600"
                                        disabled={loading}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                                        Stock Quantity
                                    </label>
                                    <input
                                        id="stock"
                                        type="number"
                                        value={formData.StockQuantity}
                                        onChange={(e) => setFormData({ ...formData, StockQuantity: Number(e.target.value) })}
                                        className="w-full p-2 border rounded outline-none focus:border-blue-600"
                                        disabled={loading}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                                        Image URL
                                    </label>
                                    <input
                                        id="image"
                                        type="url"
                                        value={formData.ImageURL}
                                        onChange={(e) => setFormData({ ...formData, ImageURL: e.target.value })}
                                        className="w-full p-2 border rounded outline-none focus:border-blue-600"
                                        disabled={loading}
                                    />
                                </div>
                                <div className="flex gap-4 justify-end">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:bg-gray-400"
                                        disabled={loading}
                                    >
                                        {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Add Product'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}