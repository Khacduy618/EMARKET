'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    getShopCategories,
    createProduct, // Đảm bảo service này đã được cập nhật để gửi FormData
    getAttributes,
} from '@/services/seller-category';
import Swal from 'sweetalert2';

// --- INTERFACES ---
interface ShopCategory {
    ShopCategoryID: number;
    CategoryID: number;
    CategoryName: string;
}

interface ImageFile {
    file: File;
    preview: string;
    isPrimary: boolean;
    sortOrder: number;
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

// --- COMPONENT ---
export default function AddProductPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- STATES ---
    const [loading, setLoading] = useState(true);
    const [shopCategories, setShopCategories] = useState<ShopCategory[]>([]);
    const [attributes, setAttributes] = useState<Attribute[]>([]);

    // Form states
    const [categoryID, setCategoryID] = useState<number | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState<ImageFile[]>([]);
    const [discount, setDiscount] = useState(0);

    // Variant states
    const [hasVariants, setHasVariants] = useState(false);
    const [attributeValues, setAttributeValues] = useState<{ [key: number]: string[] }>({});
    const [variants, setVariants] = useState<Variant[]>([]);
    const [singleVariant, setSingleVariant] = useState({ Price: 0, StockQuantity: 0, SKU: '' });


    // --- EFFECTS ---
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            Swal.fire('Unauthorized!', 'Please log in to access the dashboard.', 'error')
                .then(() => router.push('/login'));
            return;
        }
        fetchShopCategories();
    }, [router]);

    // Cleanup image preview URLs on component unmount
    useEffect(() => {
        return () => {
            images.forEach(image => URL.revokeObjectURL(image.preview));
        };
    }, [images]);


    // --- DATA FETCHING ---
    const fetchShopCategories = async () => {
        setLoading(true);
        try {
            const categoriesData = await getShopCategories();
            setShopCategories(categoriesData);
        } catch (err: any) {
            Swal.fire('Error!', err.response?.data?.message || 'Failed to fetch categories', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchAttributesForCategory = async (catID: number) => {
        setLoading(true);
        try {
            const attributesData = await getAttributes(catID);
            setAttributes(attributesData);
            // Reset attribute values state
            setAttributeValues(
                attributesData.reduce((acc, attr) => ({ ...acc, [attr.AttributeID]: [] }), {})
            );
        } catch (err: any) {
            Swal.fire('Error!', err.response?.data?.message || 'Failed to fetch attributes.', 'error');
            setAttributes([]);
            setAttributeValues({});
        } finally {
            setLoading(false);
        }
    };


    // --- HANDLERS ---
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCategoryID = Number(e.target.value) || null;
        setCategoryID(newCategoryID);
        setVariants([]); // Reset variants when category changes
        if (newCategoryID) {
            fetchAttributesForCategory(newCategoryID);
        } else {
            setAttributes([]);
            setAttributeValues({});
        }
    };

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        if (images.length + files.length > 9) {
            Swal.fire('Limit Reached!', 'You can upload a maximum of 9 images.', 'warning');
            return;
        }

        const newImageFiles: ImageFile[] = Array.from(files).map((file, index) => ({
            file,
            preview: URL.createObjectURL(file),
            isPrimary: images.length === 0 && index === 0,
            sortOrder: images.length + index,
        }));

        setImages(prev => [...prev, ...newImageFiles]);
        // Reset file input value to allow selecting the same file again
        if (event.target) event.target.value = '';
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setImages(prev => {
            const imageToRemove = prev[indexToRemove];
            URL.revokeObjectURL(imageToRemove.preview); // Cleanup memory

            const remainingImages = prev.filter((_, index) => index !== indexToRemove);
            if (imageToRemove.isPrimary && remainingImages.length > 0) {
                remainingImages[0].isPrimary = true; // Set new primary if the old one was removed
            }
            return remainingImages;
        });
    };

    const setPrimaryImage = (indexToSet: number) => {
        setImages(prev => prev.map((img, index) => ({ ...img, isPrimary: index === indexToSet })));
    };

    const handleAttributeValueChange = (attributeID: number, value: string) => {
        setAttributeValues({
            ...attributeValues,
            [attributeID]: value.trim() ? value.split(',').map(v => v.trim()).filter(Boolean) : [],
        });
    };

    const generateVariants = () => {
        const combinations = generateCombinations(attributeValues);
        if (combinations.length === 0) {
            Swal.fire('Warning!', 'Please provide at least one value for an attribute to generate variants.', 'warning');
            return;
        }
        const newVariants = combinations.map((combo, index) => ({
            AttributeValues: Object.keys(combo).map(attrID => ({
                AttributeID: Number(attrID),
                Value: combo[Number(attrID)],
            })),
            Price: singleVariant.Price, // Use default price
            Discount: discount,
            StockQuantity: singleVariant.StockQuantity, // Use default stock
            SKU: `${name.substring(0, 10).replace(/\s+/g, '-')}-V${index + 1}`,
        }));
        setVariants(newVariants);
    };

    const generateCombinations = (attrValues: { [key: number]: string[] }) => {
        const keys = Object.keys(attrValues).map(Number).filter(id => attrValues[id].length > 0);
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

    const handleVariantChange = (index: number, field: keyof Omit<Variant, 'AttributeValues'>, value: string | number) => {
        const newVariants = [...variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setVariants(newVariants);
    };
    // Trong AddProductPage.js

    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     setLoading(true);

    //     const productFormData = new FormData();
    //     productFormData.append('CategoryID', String(categoryID));
    //     productFormData.append('Name', name);
    //     productFormData.append('Description', description);
    //     productFormData.append('Discount', String(discount));

    //     // Metadata ảnh
    //     const imageData = images.map(img => ({
    //         IsPrimary: img.isPrimary,
    //         SortOrder: img.sortOrder
    //     }));
    //     productFormData.append('ImageData', JSON.stringify(imageData));

    //     // Lọc và thêm ảnh hợp lệ
    //     const validImages = images.filter(img => img.file instanceof File);
    //     if (validImages.length === 0) {
    //         console.warn("Không có ảnh hợp lệ để upload");
    //     } else {
    //         validImages.forEach(img => {
    //             productFormData.append('Images[]', img.file);
    //         });
    //     }

    //     // Thêm variants hoặc single variant
    //     if (hasVariants) {
    //         productFormData.append('Variants', JSON.stringify(variants));
    //     } else {
    //         productFormData.append('Price', String(singleVariant.Price));
    //         productFormData.append('StockQuantity', String(singleVariant.StockQuantity));
    //         productFormData.append('SKU', singleVariant.SKU);
    //     }

    //     try {
    //         await createProduct(productFormData);
    //         Swal.fire('Success!', 'Product created successfully...', 'success')
    //             .then(() => router.push('/products'));
    //     } catch (err: any) {
    //         console.error("API Error:", err.response?.data);
    //         Swal.fire('Error!', err.response?.data?.message || 'Failed to save product.', 'error');
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // --- Validation ---
        if (!categoryID) {
            Swal.fire('Error!', 'Please select a category.', 'error');
            return;
        }
        if (images.length === 0) {
            Swal.fire('Error!', 'At least one image is required.', 'error');
            return;
        }
        if (hasVariants && variants.length === 0) {
            Swal.fire('Error!', 'Please generate variants or disable product variations.', 'error');
            return;
        }

        setLoading(true);

        const productFormData = new FormData();
        productFormData.append('CategoryID', String(categoryID));
        productFormData.append('Name', name);
        productFormData.append('Description', description);
        productFormData.append('Discount', String(discount));

        // Append image data and files
        const imageData = images.map(img => ({ IsPrimary: img.isPrimary, SortOrder: img.sortOrder }));
        productFormData.append('ImageData', JSON.stringify(imageData));
        if (images.length > 0) {
            images.forEach(img => {
                // Đảm bảo img.file là một đối tượng File
                if (img.file instanceof File) {
                    productFormData.append('Images[]', img.file);
                } else {
                    // Nếu không phải là File, log ra lỗi để biết ngay
                    console.error("Data for image is not a File object:", img);
                }
            });
        }
        // images.forEach(img => productFormData.append('Images[]', img.file));
         
        // Append variants or single product info
        if (hasVariants) {
            productFormData.append('Variants', JSON.stringify(variants));
        } else {
            productFormData.append('Price', String(singleVariant.Price));
            productFormData.append('StockQuantity', String(singleVariant.StockQuantity));
            productFormData.append('SKU', singleVariant.SKU);
        }

        try {
            await createProduct(productFormData); // The service now sends FormData
            Swal.fire('Success!', 'Product created successfully and is pending approval.', 'success')
                .then(() => router.push('/products'));
        } catch (err: any) {
            Swal.fire('Error!', err.response?.data?.message || 'Failed to save product.', 'error');
        } finally {
            setLoading(false);
        }
    };


    // --- RENDER ---
    return (
        <div className="flex-1 flex flex-col p-6 bg-gray-50">
            <h2 className="text-2xl font-bold mb-6">Thêm Sản phẩm Mới</h2>
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* --- BASIC INFORMATION --- */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold mb-4 border-b pb-2">1. Thông tin Cơ bản</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Tên Sản phẩm<span className="text-red-500">*</span></label>
                            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 border rounded-md outline-none focus:border-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Ngành hàng<span className="text-red-500">*</span></label>
                            <select id="category" value={categoryID || ''} onChange={handleCategoryChange} required className="w-full p-2 border rounded-md outline-none focus:border-blue-500" disabled={loading}>
                                <option value="">Chọn một ngành hàng</option>
                                {shopCategories.map(cat => (
                                    <option key={cat.CategoryID} value={cat.CategoryID}>{cat.CategoryName}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="mt-6">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Mô tả Sản phẩm</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={6} className="w-full p-2 border rounded-md outline-none focus:border-blue-500" />
                    </div>
                </div>

                {/* --- MEDIA MANAGEMENT --- */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold mb-4 border-b pb-2">2. Quản lý Hình ảnh</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {images.map((image, index) => (
                            <div key={image.preview} className="relative group border-2 rounded-md overflow-hidden" style={{ aspectRatio: '1 / 1' }}>
                                <img src={image.preview} alt={`preview ${index}`} className="w-full h-full object-cover" />
                                <div className="absolute top-1 right-1">
                                    <button type="button" onClick={() => handleRemoveImage(index)} className="w-6 h-6 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors">
                                        ×
                                    </button>
                                </div>
                                {!image.isPrimary && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-1 cursor-pointer hover:bg-opacity-70" onClick={() => setPrimaryImage(index)}>
                                        Đặt làm ảnh bìa
                                    </div>
                                )}
                                {image.isPrimary && <div className="absolute top-0 left-0 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-br-md">Ảnh bìa</div>}
                            </div>
                        ))}
                        {images.length < 9 && (
                            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed rounded-md flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100 hover:text-blue-500 transition-colors" style={{ aspectRatio: '1 / 1' }}>
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" /></svg>
                                <span className="text-sm mt-2">Thêm Hình ảnh</span>
                                <span className="text-xs">({images.length}/9)</span>
                            </div>
                        )}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleImageSelect} multiple accept="image/*" className="hidden" />
                </div>

                {/* --- SALES INFORMATION --- */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold mb-4 border-b pb-2">3. Thông tin Bán hàng</h3>
                    <div className="flex items-center mb-4">
                        <label className="mr-4 text-gray-700 font-medium">Phân loại hàng</label>
                        <button type="button" onClick={() => setHasVariants(!hasVariants)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${hasVariants ? 'bg-blue-600' : 'bg-gray-200'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${hasVariants ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {!hasVariants ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Giá<span className="text-red-500">*</span></label>
                                <input type="number" value={singleVariant.Price} onChange={e => setSingleVariant({ ...singleVariant, Price: Number(e.target.value) })} required className="w-full p-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Kho hàng<span className="text-red-500">*</span></label>
                                <input type="number" value={singleVariant.StockQuantity} onChange={e => setSingleVariant({ ...singleVariant, StockQuantity: Number(e.target.value) })} required className="w-full p-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">SKU (Tùy chọn)</label>
                                <input type="text" value={singleVariant.SKU} onChange={e => setSingleVariant({ ...singleVariant, SKU: e.target.value })} className="w-full p-2 border rounded-md" />
                            </div>
                        </div>
                    ) : (
                        <div className="border-t pt-4 space-y-4">
                            <p className="text-sm text-gray-500">Thêm các nhóm phân loại như Màu sắc, Kích thước, v.v.</p>
                            {attributes.map(attr => (
                                <div key={attr.AttributeID}>
                                    <label className="block text-sm font-medium text-gray-700">{attr.Name}</label>
                                    <input type="text" onChange={e => handleAttributeValueChange(attr.AttributeID, e.target.value)} className="w-full p-2 border rounded-md" placeholder="Nhập các giá trị, cách nhau bởi dấu phẩy (VD: Đỏ,Xanh,Vàng)" />
                                </div>
                            ))}
                            <button type="button" onClick={generateVariants} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Áp dụng</button>
                            {variants.length > 0 && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b bg-gray-50"><th className="p-2">Phân loại</th><th className="p-2">Giá</th><th className="p-2">Kho hàng</th><th className="p-2">SKU</th></tr>
                                        </thead>
                                        <tbody>
                                            {variants.map((variant, index) => (
                                                <tr key={index} className="border-b">
                                                    <td className="p-2">{variant.AttributeValues.map(av => av.Value).join(' / ')}</td>
                                                    <td className="p-2"><input type="number" value={variant.Price} onChange={e => handleVariantChange(index, 'Price', Number(e.target.value))} className="w-24 p-1 border rounded" /></td>
                                                    <td className="p-2"><input type="number" value={variant.StockQuantity} onChange={e => handleVariantChange(index, 'StockQuantity', Number(e.target.value))} className="w-24 p-1 border rounded" /></td>
                                                    <td className="p-2"><input type="text" value={variant.SKU} onChange={e => handleVariantChange(index, 'SKU', e.target.value)} className="w-32 p-1 border rounded" /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* --- SUBMIT ACTIONS --- */}
                <div className="flex justify-end gap-4">
                    <button type="button" onClick={() => router.push('/products')} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300">Hủy</button>
                    <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                        {loading ? 'Đang lưu...' : 'Lưu & Hiển thị'}
                    </button>
                </div>
            </form>
        </div>
    );
}