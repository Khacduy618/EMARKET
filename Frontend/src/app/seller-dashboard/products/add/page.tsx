'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    getShopCategories,
    createProduct,
    getAttributes,
} from '@/services/seller-category';
import Swal from 'sweetalert2';

interface ShopCategory {
    ShopCategoryID: number;
    CategoryID: number;
    CategoryName: string;
    Status: 'PendingApproval' | 'Approved' | 'Rejected';
    RequestedAt: string;
    ApprovedAt: string | null;
    RejectedReason: string | null;
}

interface Attribute {
    AttributeID: number;
    Name: string;
}

interface Variant {
    AttributeValues: Array<{ AttributeID: number; Value: string }>;
    Price: number;
    Discount: number;
    StockQuantity: number;
    SKU: string;
}

export default function AddProductPage() {
    const [shopCategories, setShopCategories] = useState<ShopCategory[]>([]);
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [formData, setFormData] = useState<{
        CategoryID: number | null;
        Name: string;
        Description: string;
        SKU: string;
        Price: number;
        Discount: number;
        StockQuantity: number;
        Images: Array<{ ImageURL: string; IsPrimary: boolean; SortOrder: number }>;
        Variants: Variant[];
    }>({
        CategoryID: null,
        Name: '',
        Description: '',
        SKU: '',
        Price: 0,
        Discount: 0,
        StockQuantity: 0,
        Images: [{ ImageURL: '', IsPrimary: true, SortOrder: 0 }],
        Variants: [],
    });
    const [attributeValues, setAttributeValues] = useState<{ [key: number]: string[] }>({});
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

        fetchShopCategories();
    }, [router]);

    const fetchShopCategories = async () => {
        setLoading(true);
        try {
            const categoriesData = await getShopCategories();
            setShopCategories(categoriesData);
        } catch (err: any) {
            Swal.fire({
                title: 'Error!',
                text: err.response?.data?.message || 'Failed to fetch categories',
                icon: 'error',
                draggable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchAttributes = async (categoryID: number) => {
        setLoading(true);
        try {
            const attributesData = await getAttributes(categoryID);
            setAttributes(attributesData);
            setAttributeValues(
                attributesData.reduce((acc, attr) => ({
                    ...acc,
                    [attr.AttributeID]: [],
                }), {})
            );
        } catch (err: any) {
            Swal.fire({
                title: 'Error!',
                text: err.response?.data?.message || 'Failed to fetch attributes for this category',
                icon: 'error',
                draggable: true,
            });
            setAttributes([]);
            setAttributeValues({});
        } finally {
            setLoading(false);
        }
    };

    const handleAddImage = () => {
        if (formData.Images.length < 9) {
            setFormData({
                ...formData,
                Images: [...formData.Images, { ImageURL: '', IsPrimary: false, SortOrder: formData.Images.length }],
            });
        } else {
            Swal.fire({
                title: 'Limit Reached!',
                text: 'Maximum 9 images allowed per product',
                icon: 'warning',
                draggable: true,
            });
        }
    };

    const handleImageChange = (index: number, field: 'ImageURL' | 'IsPrimary', value: string | boolean) => {
        const newImages = [...formData.Images];
        if (field === 'IsPrimary' && value === true) {
            newImages.forEach((img, i) => {
                img.IsPrimary = i === index;
            });
        } else {
            newImages[index] = { ...newImages[index], [field]: value };
        }
        setFormData({ ...formData, Images: newImages });
    };

    const handleRemoveImage = (index: number) => {
        const newImages = formData.Images.filter((_, i) => i !== index);
        if (newImages.length > 0 && !newImages.some((img) => img.IsPrimary)) {
            newImages[0].IsPrimary = true;
        }
        setFormData({ ...formData, Images: newImages });
    };

    const handleAttributeValueChange = (attributeID: number, value: string) => {
        setAttributeValues({
            ...attributeValues,
            [attributeID]: value.trim() ? value.split(',').map((v) => v.trim()).filter((v) => v) : [],
        });
    };

    const generateVariants = () => {
        const combinations = generateCombinations(attributeValues);
        if (combinations.length === 0) {
            Swal.fire({
                title: 'Warning!',
                text: 'Please provide at least one value for an attribute to generate variants',
                icon: 'warning',
                draggable: true,
            });
            return;
        }
        const newVariants = combinations.map((combo, index) => ({
            AttributeValues: Object.keys(combo).map((attrID) => ({
                AttributeID: Number(attrID),
                Value: combo[attrID],
            })),
            Price: formData.Price,
            Discount: formData.Discount,
            StockQuantity: formData.StockQuantity,
            SKU: `SKU-${formData.Name.replace(/\s+/g, '-')}-${index + 1}`,
        }));
        setFormData({ ...formData, Variants: newVariants });
    };

    const generateCombinations = (attrValues: { [key: number]: string[] }) => {
        const keys = Object.keys(attrValues).map(Number).filter((id) => attrValues[id].length > 0);
        if (keys.length === 0) return [];

        let results: Array<{ [key: number]: string }> = [{}];
        for (const attrID of keys) {
            const values = attrValues[attrID];
            const newResults: Array<{ [key: number]: string }> = [];
            for (const result of results) {
                for (const value of values) {
                    newResults.push({ ...result, [attrID]: value });
                }
            }
            results = newResults;
        }
        return results;
    };

    const handleVariantChange = (index: number, field: keyof Variant, value: string | number) => {
        const newVariants = [...formData.Variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setFormData({ ...formData, Variants: newVariants });
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
        if (!formData.Images.some((img) => img.ImageURL.trim() !== '')) {
            Swal.fire({
                title: 'Error!',
                text: 'At least one valid image URL is required',
                icon: 'error',
                draggable: true,
            });
            return;
        }
        if (!formData.Images.some((img) => img.IsPrimary)) {
            Swal.fire({
                title: 'Error!',
                text: 'At least one image must be set as primary',
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
                SKU: formData.SKU || null,
                Price: formData.Price,
                Discount: formData.Discount,
                StockQuantity: formData.StockQuantity,
                Images: formData.Images.filter((img) => img.ImageURL.trim() !== ''),
                Variants: formData.Variants,
            };

            await createProduct(productData);
            Swal.fire({
                title: 'Success!',
                text: 'Product created successfully',
                icon: 'success',
                draggable: true,
            }).then(() => {
                router.push('/products');
            });
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

    return (
        <div className="flex-1 flex flex-col p-6">
            <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="bg-white shadow-md rounded p-6">
                    <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                Category
                            </label>
                            <select
                                id="category"
                                value={formData.CategoryID || ''}
                                onChange={(e) => {
                                    const categoryID = Number(e.target.value) || null;
                                    setFormData({ ...formData, CategoryID: categoryID, Variants: [] });
                                    if (categoryID) fetchAttributes(categoryID);
                                    else {
                                        setAttributes([]);
                                        setAttributeValues({});
                                    }
                                }}
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
                            <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                                SKU
                            </label>
                            <input
                                id="sku"
                                type="text"
                                value={formData.SKU}
                                onChange={(e) => setFormData({ ...formData, SKU: e.target.value })}
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
                            <label htmlFor="discount" className="block text-sm font-medium text-gray-700">
                                Discount (%)
                            </label>
                            <input
                                id="discount"
                                type="number"
                                min="0"
                                max="100"
                                value={formData.Discount}
                                onChange={(e) => setFormData({ ...formData, Discount: Number(e.target.value) })}
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
                            <label className="block text-sm font-medium text-gray-700">Images (up to 9)</label>
                            {formData.Images.map((image, index) => (
                                <div key={index} className="flex items-center gap-2 mb-2">
                                    <input
                                        type="url"
                                        value={image.ImageURL}
                                        onChange={(e) => handleImageChange(index, 'ImageURL', e.target.value)}
                                        className="w-full p-2 border rounded outline-none focus:border-blue-600"
                                        placeholder={`Image URL ${index + 1}`}
                                        disabled={loading}
                                    />
                                    <input
                                        type="checkbox"
                                        checked={image.IsPrimary}
                                        onChange={(e) => handleImageChange(index, 'IsPrimary', e.target.checked)}
                                        disabled={loading}
                                    />
                                    <label className="text-sm text-gray-700">Primary</label>
                                    {formData.Images.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(index)}
                                            className="text-red-600 hover:text-red-800"
                                            disabled={loading}
                                        >
                                            <i className="bi bi-trash-fill"></i>
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddImage}
                                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
                                disabled={loading || formData.Images.length >= 9}
                            >
                                Add Image
                            </button>
                        </div>
                    </div>
                </div>

                {/* Detailed Information */}
                <div className="bg-white shadow-md rounded p-6">
                    <h3 className="text-lg font-medium mb-4">Detailed Information</h3>
                    {!formData.CategoryID ? (
                        <p className="text-gray-500">Please select a category to add detailed information.</p>
                    ) : attributes.length === 0 ? (
                        <p className="text-gray-500">No attributes available for this category.</p>
                    ) : (
                        <div className="space-y-4">
                            {attributes.map((attribute) => (
                                <div key={attribute.AttributeID} className="flex flex-col">
                                    <label className="block text-sm font-medium text-gray-700">
                                        {attribute.Name} (comma-separated values, e.g., {attribute.Name === 'Màu sắc' ? 'Red,Blue,Green' : attribute.Name === 'Bộ nhớ trong (ROM)' ? '128GB,256GB' : 'Value1,Value2'})
                                    </label>
                                    <input
                                        type="text"
                                        onChange={(e) => handleAttributeValueChange(attribute.AttributeID, e.target.value)}
                                        className="w-full p-2 border rounded outline-none focus:border-blue-600"
                                        placeholder={`Enter values for ${attribute.Name} (e.g., ${attribute.Name === 'Màu sắc' ? 'Red,Blue,Green' : attribute.Name === 'Bộ nhớ trong (ROM)' ? '128GB,256GB' : 'Value1,Value2'})`}
                                        disabled={loading}
                                    />
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={generateVariants}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                                disabled={loading}
                            >
                                Generate Variants
                            </button>
                            {formData.Variants.length > 0 && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="p-2 text-gray-700">Attributes</th>
                                                <th className="p-2 text-gray-700">Price</th>
                                                <th className="p-2 text-gray-700">Discount (%)</th>
                                                <th className="p-2 text-gray-700">Stock</th>
                                                <th className="p-2 text-gray-700">SKU</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.Variants.map((variant, index) => (
                                                <tr key={index} className="border-b">
                                                    <td className="p-2">
                                                        {variant.AttributeValues.map((av) => {
                                                            const attr = attributes.find((a) => a.AttributeID === av.AttributeID);
                                                            return `${attr?.Name}: ${av.Value}`;
                                                        }).join(', ')}
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={variant.Price}
                                                            onChange={(e) => handleVariantChange(index, 'Price', Number(e.target.value))}
                                                            className="w-full p-1 border rounded"
                                                            disabled={loading}
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={variant.Discount}
                                                            onChange={(e) => handleVariantChange(index, 'Discount', Number(e.target.value))}
                                                            className="w-full p-1 border rounded"
                                                            disabled={loading}
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            value={variant.StockQuantity}
                                                            onChange={(e) => handleVariantChange(index, 'StockQuantity', Number(e.target.value))}
                                                            className="w-full p-1 border rounded"
                                                            disabled={loading}
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="text"
                                                            value={variant.SKU}
                                                            onChange={(e) => handleVariantChange(index, 'SKU', e.target.value)}
                                                            className="w-full p-1 border rounded"
                                                            disabled={loading}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => router.push('/products')}
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
                        {loading ? 'Saving...' : 'Add Product'}
                    </button>
                </div>
            </form>
        </div>
    );
}