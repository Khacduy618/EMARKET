'use client';
import { useState, useEffect } from 'react';
// import HeroHeader from '@/components/HeroHeader';
import { getPlatformCategories, getShopCategories, registerCategory, deleteCategory } from '@/services/seller-category';

interface PlatformCategory {
    CategoryID: number;
    Name: string;
    ParentName: string | null;
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

export default function CategoriesPage() {
    const [platformCategories, setPlatformCategories] = useState<PlatformCategory[]>([]);
    const [shopCategories, setShopCategories] = useState<ShopCategory[]>([]);
    const [selectedCategoryID, setSelectedCategoryID] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const [platformCats, shopCats] = await Promise.all([
                getPlatformCategories(),
                getShopCategories(),
            ]);
            setPlatformCategories(platformCats);
            setShopCategories(shopCats);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategoryID) {
            setError('Please select a category');
            return;
        }

        setLoading(true);
        try {
            await registerCategory(selectedCategoryID);
            setSuccess('Category registration requested successfully');
            setSelectedCategoryID(null);
            await fetchCategories();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to register category');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (shopCategoryID: number) => {
        if (!confirm('Are you sure you want to delete this category request?')) return;

        setLoading(true);
        try {
            await deleteCategory(shopCategoryID);
            setSuccess('Category request deleted successfully');
            await fetchCategories();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete category');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col">
            {/* <HeroHeader title="Categories" welcomeText="Manage Categories," breadcrumb="Category Management" /> */}
            
          
            
            <div className="p-6 flex-1">
                {/* Messages */}
                {error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
                )}
                {success && (
                    <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">{success}</div>
                )}

                {/* Register Category Section */}
                <div className="bg-white shadow-md rounded mb-6">
                    <div className="p-4 border-b">
                        <h5 className="font-medium">Register New Category</h5>
                    </div>
                    <div className="p-4">
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <select
                                    value={selectedCategoryID || ''}
                                    onChange={(e) => setSelectedCategoryID(Number(e.target.value) || null)}
                                    className="w-full p-2 border rounded outline-none focus:border-blue-600"
                                    disabled={loading}
                                >
                                    <option value="">Select a category</option>
                                    {platformCategories.map((category) => (
                                        <option key={category.CategoryID} value={category.CategoryID}>
                                            {category.Name} {category.ParentName ? `(Parent: ${category.ParentName})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:bg-gray-400"
                                disabled={loading}
                            >
                                {loading ? 'Submitting...' : 'Add Category'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Registered Categories Section */}
                <div className="bg-white shadow-md rounded">
                    <div className="p-4 border-b">
                        <h5 className="font-medium">Registered Categories</h5>
                    </div>
                    <div className="p-4">
                        {loading && <p className="text-gray-500">Loading...</p>}
                        {!loading && shopCategories.length === 0 ? (
                            <p className="text-gray-500">No categories registered.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="p-2 text-gray-700">Category Name</th>
                                            <th className="p-2 text-gray-700">Status</th>
                                            <th className="p-2 text-gray-700">Requested At</th>
                                            <th className="p-2 text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {shopCategories.map((category) => (
                                            <tr key={category.ShopCategoryID} className="border-b hover:bg-gray-50">
                                                <td className="p-2">{category.CategoryName}</td>
                                                <td className="p-2">
                                                    <span
                                                        className={`px-2 py-1 rounded text-sm ${category.Status === 'Approved'
                                                                ? 'bg-green-100 text-green-700'
                                                                : category.Status === 'Rejected'
                                                                    ? 'bg-red-100 text-red-700'
                                                                    : 'bg-yellow-100 text-yellow-700'
                                                            }`}
                                                    >
                                                        {category.Status}
                                                    </span>
                                                    {category.RejectedReason && (
                                                        <p className="text-red-600 text-sm mt-1">{category.RejectedReason}</p>
                                                    )}
                                                </td>
                                                <td className="p-2">{new Date(category.RequestedAt).toLocaleDateString()}</td>
                                                <td className="p-2">
                                                    {category.Status === 'PendingApproval' && (
                                                        <button
                                                            onClick={() => handleDelete(category.ShopCategoryID)}
                                                            className="text-red-600 hover:text-red-800"
                                                            title="Delete Category Request"
                                                            disabled={loading}
                                                        >
                                                            <i className="bi bi-trash-fill"></i>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
