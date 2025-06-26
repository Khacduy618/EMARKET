'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    getShopCategories,
    createProduct,
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
    Images: ImageFile[];
    Price: number;
    CompareAtPrice: number | null;
    StockQuantity: number;
    SKU: string;
}

// --- COMPONENT ---
export default function AddProductPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const variantFileInputs = useRef<(HTMLInputElement | null)[]>([]);

    // --- STATES ---
    const [loading, setLoading] = useState(true);
    const [shopCategories, setShopCategories] = useState<ShopCategory[]>([]);
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [categoryID, setCategoryID] = useState<number | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState<ImageFile[]>([]);
    const [discount, setDiscount] = useState(0);
    const [hasVariants, setHasVariants] = useState(false);
    const [variants, setVariants] = useState<Variant[]>([
        { Images: [], Price: 0, CompareAtPrice: null, StockQuantity: 0, SKU: '' },
    ]);
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

    useEffect(() => {
        return () => {
            images.forEach(image => URL.revokeObjectURL(image.preview));
            variants.forEach(variant => variant.Images.forEach(img => URL.revokeObjectURL(img.preview)));
        };
    }, [images, variants]);

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
        } catch (err: any) {
            Swal.fire('Error!', err.response?.data?.message || 'Failed to fetch attributes.', 'error');
            setAttributes([]);
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLERS ---
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCategoryID = Number(e.target.value) || null;
        setCategoryID(newCategoryID);
        setVariants([{ Images: [], Price: 0, CompareAtPrice: null, StockQuantity: 0, SKU: '' }]);
        if (newCategoryID) {
            fetchAttributesForCategory(newCategoryID);
        } else {
            setAttributes([]);
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
        if (event.target) event.target.value = '';
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setImages(prev => {
            const imageToRemove = prev[indexToRemove];
            URL.revokeObjectURL(imageToRemove.preview);
            const remainingImages = prev.filter((_, index) => index !== indexToRemove);
            if (imageToRemove.isPrimary && remainingImages.length > 0) {
                remainingImages[0].isPrimary = true;
            }
            return remainingImages.map((img, idx) => ({ ...img, sortOrder: idx }));
        });
    };

    const setPrimaryImage = (indexToSet: number) => {
        setImages(prev =>
            prev.map((img, index) => ({ ...img, isPrimary: index === indexToSet }))
        );
    };

    const handleVariantImageSelect = (event: React.ChangeEvent<HTMLInputElement>, variantIndex: number) => {
        const files = event.target.files;
        if (!files) return;

        if (variants[variantIndex].Images.length + files.length > 3) {
            Swal.fire('Limit Reached!', 'Each variant can have a maximum of 3 images.', 'warning');
            return;
        }

        const newImageFiles: ImageFile[] = Array.from(files).map((file, index) => ({
            file,
            preview: URL.createObjectURL(file),
            isPrimary: variants[variantIndex].Images.length === 0 && index === 0,
            sortOrder: variants[variantIndex].Images.length + index,
        }));

        setVariants(prev =>
            prev.map((v, i) =>
                i === variantIndex
                    ? { ...v, Images: [...v.Images, ...newImageFiles] }
                    : v
            )
        );
        if (event.target) event.target.value = '';
    };

    const handleRemoveVariantImage = (variantIndex: number, imageIndex: number) => {
        setVariants(prev =>
            prev.map((v, i) =>
                i === variantIndex
                    ? {
                        ...v,
                        Images: v.Images.filter((_, idx) => idx !== imageIndex).map((img, idx) => ({
                            ...img,
                            sortOrder: idx,
                            isPrimary: idx === 0 && v.Images[imageIndex].isPrimary,
                        })),
                    }
                    : v
            )
        );
    };

    const handleVariantChange = (index: number, field: keyof Omit<Variant, 'Images'>, value: string | number | null) => {
        setVariants(prev =>
            prev.map((v, i) =>
                i === index
                    ? {
                        ...v,
                        [field]:
                            field === 'Price' || field === 'StockQuantity'
                                ? Number(value)
                                : field === 'CompareAtPrice'
                                    ? value === '' || value === null
                                        ? null
                                        : Number(value)
                                    : value,
                    }
                    : v
            )
        );
    };

    const handleSingleVariantChange = (field: keyof typeof singleVariant, value: string | number) => {
        setSingleVariant(prev => ({
            ...prev,
            [field]: field === 'Price' || field === 'StockQuantity' ? Number(value) : value,
        }));
    };

    const addVariant = () => {
        setVariants(prev => [
            ...prev,
            { Images: [], Price: 0, CompareAtPrice: null, StockQuantity: 0, SKU: '' },
        ]);
        variantFileInputs.current = [...variantFileInputs.current, null];
    };

    const handleRemoveVariant = (index: number) => {
        Swal.fire({
            title: 'Xác nhận Xóa',
            text: 'Bạn có chắc muốn xóa phân loại này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        }).then(result => {
            if (result.isConfirmed) {
                setVariants(prev => prev.filter((_, i) => i !== index));
                setVariants(prev =>
                    prev.map((v, i) => ({
                        ...v,
                        Images: v.Images.map((img, idx) => ({ ...img, sortOrder: idx })),
                    }))
                );
                variantFileInputs.current = variantFileInputs.current.filter((_, i) => i !== index);
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryID) {
            Swal.fire('Error!', 'Please select a category.', 'error');
            return;
        }
        if (images.length === 0 && variants.every(v => v.Images.length === 0)) {
            Swal.fire('Error!', 'At least one image is required for the product or variants.', 'error');
            return;
        }
        if (hasVariants && variants.length === 0) {
            Swal.fire('Error!', 'Please add at least one variant.', 'error');
            return;
        }
        if (hasVariants && variants.some(v => v.Price <= 0 || v.StockQuantity < 0)) {
            Swal.fire('Error!', 'Price and stock quantity must be valid for all variants.', 'error');
            return;
        }
        if (!hasVariants && singleVariant.Price <= 0) {
            Swal.fire('Error!', 'Price must be greater than 0 for single variant.', 'error');
            return;
        }
        if (discount < 0 || discount > 100) {
            Swal.fire('Error!', 'Discount must be between 0 and 100.', 'error');
            return;
        }

        setLoading(true);

        const productFormData = new FormData();
        productFormData.append('CategoryID', String(categoryID));
        productFormData.append('Name', name);
        productFormData.append('Description', description);
        productFormData.append('Discount', String(discount));

        const imageData = images.map(img => ({ IsPrimary: img.isPrimary, SortOrder: img.sortOrder }));
        productFormData.append('ImageData', JSON.stringify(imageData));
        images.forEach(img => productFormData.append('Images[]', img.file));

        if (hasVariants) {
            const variantData = variants.map(v => ({
                Price: v.Price,
                CompareAtPrice: v.CompareAtPrice,
                StockQuantity: v.StockQuantity,
                SKU: v.SKU,
            }));
            console.log('Variant Data:', variantData); // Debugging log
            productFormData.append('Variants', JSON.stringify(variantData));
            variants.forEach((v, index) =>
                v.Images.forEach(img => productFormData.append(`VariantImages[${index}][]`, img.file))
            );
        } else {
            productFormData.append('Price', String(singleVariant.Price));
            productFormData.append('StockQuantity', String(singleVariant.StockQuantity));
            productFormData.append('SKU', singleVariant.SKU);
        }

        try {
            await createProduct(productFormData);
            Swal.fire('Success!', 'Product created successfully and is pending approval.', 'success')
                .then(() => router.push('/products'));
        } catch (err: any) {
            console.error('API Error:', err.response?.data); // Debugging log
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
                                <input
                                    type="number"
                                    value={singleVariant.Price}
                                    onChange={e => handleSingleVariantChange('Price', e.target.value)}
                                    required
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Kho hàng<span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    value={singleVariant.StockQuantity}
                                    onChange={e => handleSingleVariantChange('StockQuantity', e.target.value)}
                                    required
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">SKU (Tùy chọn)</label>
                                <input
                                    type="text"
                                    value={singleVariant.SKU}
                                    onChange={e => handleSingleVariantChange('SKU', e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="border-t pt-4 space-y-4">
                            {variants.map((variant, index) => (
                                <div key={index} className="border p-4 rounded-md">
                                    <h4 className="text-lg font-medium mb-2">Phân loại {index + 1}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh</label>
                                            <input
                                                type="file"
                                                ref={el => (variantFileInputs.current[index] = el)}
                                                onChange={e => handleVariantImageSelect(e, index)}
                                                multiple
                                                accept="image/*"
                                                className="w-full p-2 border rounded-md"
                                            />
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {variant.Images.map((img, imgIndex) => (
                                                    <div key={imgIndex} className="relative w-16 h-16 border rounded-md overflow-hidden">
                                                        <img src={img.preview} alt={`variant ${index} preview ${imgIndex}`} className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveVariantImage(index, imgIndex)}
                                                            className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center"
                                                        >
                                                            ×
                                                        </button>
                                                        {!img.isPrimary && (
                                                            <div
                                                                className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-1 cursor-pointer hover:bg-opacity-70"
                                                                onClick={() =>
                                                                    setVariants(prev =>
                                                                        prev.map((v, i) =>
                                                                            i === index
                                                                                ? {
                                                                                    ...v,
                                                                                    Images: v.Images.map((i, idx) => ({
                                                                                        ...i,
                                                                                        isPrimary: idx === imgIndex,
                                                                                    })),
                                                                                }
                                                                                : v
                                                                        )
                                                                    )
                                                                }
                                                            >
                                                                Đặt làm ảnh bìa
                                                            </div>
                                                        )}
                                                        {img.isPrimary && (
                                                            <div className="absolute top-0 left-0 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-br-md">
                                                                Ảnh bìa
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Giá<span className="text-red-500">*</span></label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={variant.Price}
                                                onChange={e => handleVariantChange(index, 'Price', e.target.value)}
                                                required
                                                className="w-full p-2 border rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Giá so sánh</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={variant.CompareAtPrice ?? ''}
                                                onChange={e => handleVariantChange(index, 'CompareAtPrice', e.target.value || null)}
                                                className="w-full p-2 border rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">SKU<span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={variant.SKU}
                                                onChange={e => handleVariantChange(index, 'SKU', e.target.value)}
                                                required
                                                className="w-full p-2 border rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng<span className="text-red-500">*</span></label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={variant.StockQuantity}
                                                onChange={e => handleVariantChange(index, 'StockQuantity', e.target.value)}
                                                required
                                                className="w-full p-2 border rounded-md"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveVariant(index)}
                                        className="mt-2 text-red-500 hover:text-red-700"
                                    >
                                        Xóa phân loại
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addVariant}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                            >
                                Thêm Phân loại
                            </button>
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