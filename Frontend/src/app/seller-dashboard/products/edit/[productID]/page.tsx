    'use client';
    import { useState, useEffect, useRef, useCallback } from 'react';
    import { useRouter, useParams } from 'next/navigation';
    import { getProductDetails, updateProduct, getShopCategories, getAttributes, getProductAttributeValues } from '@/services/seller-category';
    import Swal from 'sweetalert2';

    // --- INTERFACES ---
    interface ShopCategory {
        ShopCategoryID: number;
        CategoryID: number;
        CategoryName: string;
    }

    interface Attribute {
        AttributeID: number;
        Name: string;
    }

    interface Variant {
        VariantID?: number;
        AttributeValues: Array<{ AttributeID: number; Value: string; AttributeValueID?: number }>;
        Price: number;
        StockQuantity: number;
        SKU: string;
    }

    interface ExistingImage {
        ImageID: number;
        ImageURL: string;
        IsPrimary: boolean;
        SortOrder: number;
    }

    interface NewImageFile {
        file: File;
        preview: string;
        SortOrder: number;
        IsPrimary: boolean;
    }

    // --- COMPONENT ---
    export default function EditProductPage() {
        const router = useRouter();
        const params = useParams();
        const productID = Number(params.productID);
        const fileInputRef = useRef<HTMLInputElement>(null);

        // --- STATE ---
        const [loading, setLoading] = useState(true);
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [shopCategories, setShopCategories] = useState<ShopCategory[]>([]);
        const [attributes, setAttributes] = useState<Attribute[]>([]);
        const [formData, setFormData] = useState({
            Name: '',
            Description: '',
            CategoryID: null as number | null,
            Discount: 0,
            hasVariants: false,
            variants: [] as Variant[],
            singleVariant: { Price: 0, StockQuantity: 0, SKU: '' },
        });
        const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
        const [newImages, setNewImages] = useState<NewImageFile[]>([]);
        const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
        const [attributeInputs, setAttributeInputs] = useState<{ [key: number]: string }>({});

        // --- DATA FETCHING & EFFECTS ---
        const fetchAttributesForCategory = useCallback(async (catID: number) => {
            try {
                const attributesData = await getAttributes(catID);
                setAttributes(attributesData);
                // Initialize attributeInputs for new attributes
                setAttributeInputs(prev => ({
                    ...prev,
                    ...attributesData.reduce((acc: { [key: number]: string }, attr: Attribute) => {
                        if (!prev[attr.AttributeID]) acc[attr.AttributeID] = '';
                        return acc;
                    }, {}),
                }));
            } catch (err: any) {
                Swal.fire('Lỗi!', err.response?.data?.message || 'Không thể tải thuộc tính.', 'error');
            }
        }, []);

        useEffect(() => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                Swal.fire('Lỗi!', 'Vui lòng đăng nhập để truy cập.', 'error').then(() =>
                    router.push('/login')
                );
                return;
            }

            if (!productID || isNaN(productID)) {
                Swal.fire('Lỗi!', 'ID sản phẩm không hợp lệ.', 'error').then(() =>
                    router.push('/seller-dashboard/products')
                );
                return;
            }

            const fetchInitialData = async () => {
                setLoading(true);
                try {
                    const [productData, categoriesData, attrValues] = await Promise.all([
                        getProductDetails(productID),
                        getShopCategories(),
                        getProductAttributeValues(productID),
                    ]);

                    const hasVariants = productData.variants && productData.variants.length > 1;
                    setFormData({
                        Name: productData.Name || '',
                        Description: productData.Description || '',
                        CategoryID: productData.CategoryID || null,
                        Discount: productData.discount || 0,
                        hasVariants,
                        variants: hasVariants
                            ? productData.variants.map((v: any) => ({
                                VariantID: v.VariantID,
                                AttributeValues: v.AttributeValues.map((av: any) => ({
                                    AttributeID: av.AttributeID,
                                    Value: av.Value,
                                    AttributeValueID: av.AttributeValueID,
                                })),
                                Price: v.Price || 0,
                                StockQuantity: v.StockQuantity || 0,
                                SKU: v.SKU || '',
                            }))
                            : [],
                        singleVariant: !hasVariants && productData.variants?.[0]
                            ? {
                                Price: productData.variants[0].Price || 0,
                                StockQuantity: productData.variants[0].StockQuantity || 0,
                                SKU: productData.variants[0].SKU || '',
                            }
                            : { Price: 0, StockQuantity: 0, SKU: '' },
                    });

                    setExistingImages(
                        productData.images?.map((img: any, index: number) => ({
                            ImageID: img.ImageID,
                            ImageURL: img.ImageURL || '',
                            IsPrimary: img.IsPrimary || index === 0,
                            SortOrder: img.SortOrder || index,
                        })) || []
                    );
                    setShopCategories(categoriesData || []);

                    // Populate attributeInputs with attribute values
                    setAttributeInputs(
                        Object.keys(attrValues).reduce((acc, key) => {
                            acc[Number(key)] = attrValues[key].join(', ');
                            return acc;
                        }, {} as { [key: number]: string })
                    );

                    if (productData.CategoryID) {
                        await fetchAttributesForCategory(productData.CategoryID);
                    }
                } catch (err: any) {
                    Swal.fire('Lỗi!', err.response?.data?.message || 'Không thể tải dữ liệu sản phẩm.', 'error').then(() =>
                        router.push('/seller-dashboard/products')
                    );
                } finally {
                    setLoading(false);
                }
            };
            fetchInitialData();
        }, [productID, router, fetchAttributesForCategory]);

        // Cleanup image previews
        useEffect(() => {
            return () => {
                newImages.forEach(image => URL.revokeObjectURL(image.preview));
            };
        }, [newImages]);

        // --- HANDLERS ---
        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const { name, value, type } = e.target;
            const parsedValue = type === 'number' ? Number(value) : value;
            setFormData(prev => ({ ...prev, [name]: parsedValue }));
            if (name === 'CategoryID') {
                const newCategoryID = Number(value) || null;
                setFormData(prev => ({ ...prev, variants: [], CategoryID: newCategoryID }));
                setAttributeInputs({});
                if (newCategoryID) {
                    fetchAttributesForCategory(newCategoryID);
                } else {
                    setAttributes([]);
                }
            }
        };

        const handleSingleVariantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target;
            const parsedValue = name === 'Price' || name === 'StockQuantity' ? Number(value) : value;
            setFormData(prev => ({
                ...prev,
                singleVariant: { ...prev.singleVariant, [name]: parsedValue },
            }));
        };

        const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (!files) return;

            if (existingImages.length + newImages.length + files.length > 9) {
                Swal.fire('Lỗi!', 'Chỉ được tải lên tối đa 9 hình ảnh.', 'error');
                return;
            }

            const newImageFiles: NewImageFile[] = Array.from(files).map((file, index) => ({
                file,
                preview: URL.createObjectURL(file),
                SortOrder: existingImages.length + newImages.length + index,
                IsPrimary: existingImages.length + newImages.length + index === 0 && existingImages.every(img => !img.IsPrimary),
            }));
            setNewImages(prev => [...prev, ...newImageFiles]);
            if (e.target) e.target.value = '';
        };

        const handleRemoveExistingImage = (imageID: number) => {
            setExistingImages(prev => prev.filter(img => img.ImageID !== imageID));
            setImagesToDelete(prev => [...prev, imageID]);
            setExistingImages(prev => {
                const updated = [...prev];
                if (updated.length > 0 && !updated.some(img => img.IsPrimary)) {
                    updated[0].IsPrimary = true;
                }
                return updated;
            });
            setNewImages(prev => {
                const updated = [...prev];
                if (updated.length > 0 && !updated.some(img => img.IsPrimary) && !existingImages.some(img => img.IsPrimary)) {
                    updated[0].IsPrimary = true;
                }
                return updated;
            });
        };

        const handleRemoveNewImage = (index: number) => {
            setNewImages(prev => {
                const imageToRemove = prev[index];
                URL.revokeObjectURL(imageToRemove.preview);
                const updated = prev.filter((_, i) => i !== index).map((img, idx) => ({
                    ...img,
                    SortOrder: idx + existingImages.length,
                }));
                if (imageToRemove.IsPrimary && updated.length > 0) {
                    updated[0].IsPrimary = true;
                }
                return updated;
            });
        };

        const setPrimaryImage = (type: 'existing' | 'new', idOrIndex: number) => {
            setExistingImages(prev =>
                prev.map(img => ({
                    ...img,
                    IsPrimary: type === 'existing' && img.ImageID === idOrIndex,
                }))
            );
            setNewImages(prev =>
                prev.map((img, index) => ({
                    ...img,
                    IsPrimary: type === 'new' && index === idOrIndex,
                }))
            );
        };

        const moveImage = (type: 'existing' | 'new', index: number, direction: 'up' | 'down') => {
            if (type === 'existing') {
                setExistingImages(prev => {
                    const newImages = [...prev];
                    if (direction === 'up' && index > 0) {
                        [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
                    } else if (direction === 'down' && index < newImages.length - 1) {
                        [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
                    }
                    return newImages.map((img, idx) => ({ ...img, SortOrder: idx }));
                });
            } else {
                setNewImages(prev => {
                    const newImages = [...prev];
                    if (direction === 'up' && index > 0) {
                        [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
                    } else if (direction === 'down' && index < newImages.length - 1) {
                        [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
                    }
                    return newImages.map((img, idx) => ({ ...img, SortOrder: idx + existingImages.length }));
                });
            }
        };

        const handleAttributeInputChange = (attributeID: number, value: string) => {
            setAttributeInputs(prev => ({ ...prev, [attributeID]: value }));
        };

        const generateVariants = () => {
            const attrValues = Object.keys(attributeInputs).reduce((acc, key) => {
                const values = attributeInputs[Number(key)]
                    .split(',')
                    .map(v => v.trim())
                    .filter(Boolean);
                if (values.length > 0) {
                    acc[Number(key)] = values;
                }
                return acc;
            }, {} as { [key: number]: string[] });

            const combinations = generateCombinations(attrValues);
            if (combinations.length === 0) {
                Swal.fire('Cảnh báo!', 'Vui lòng nhập ít nhất một giá trị thuộc tính.', 'warning');
                return;
            }

            const newVariants = combinations.map((combo, index) => ({
                AttributeValues: Object.keys(combo).map(attrID => ({
                    AttributeID: Number(attrID),
                    Value: combo[Number(attrID)],
                })),
                Price: formData.singleVariant.Price || 0,
                StockQuantity: formData.singleVariant.StockQuantity || 0,
                SKU: `${formData.Name.substring(0, 10).replace(/\s+/g, '-')}-V${index + 1}`,
            }));
            setFormData(prev => ({ ...prev, variants: newVariants }));
        };

        const generateCombinations = (attrValues: { [key: number]: string[] }) => {
            const keys = Object.keys(attrValues).map(Number);
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
            setFormData(prev => ({
                ...prev,
                variants: prev.variants.map((v, i) =>
                    i === index ? { ...v, [field]: field === 'Price' || field === 'StockQuantity' ? Number(value) : value } : v
                ),
            }));
        };

        const handleDeleteVariant = (index: number) => {
            Swal.fire({
                title: 'Xác nhận Xóa',
                text: 'Bạn có chắc muốn xóa phân loại này?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Xóa',
                cancelButtonText: 'Hủy',
            }).then(result => {
                if (result.isConfirmed) {
                    setFormData(prev => ({
                        ...prev,
                        variants: prev.variants.filter((_, i) => i !== index),
                    }));
                }
            });
        };

        const handleResetForm = () => {
            setLoading(true);
            const fetchInitialData = async () => {
                try {
                    const [productData, attrValues] = await Promise.all([
                        getProductDetails(productID),
                        getProductAttributeValues(productID),
                    ]);
                    const hasVariants = productData.variants && productData.variants.length > 1;
                    setFormData({
                        Name: productData.Name || '',
                        Description: productData.Description || '',
                        CategoryID: productData.CategoryID || null,
                        Discount: productData.discount || 0,
                        hasVariants,
                        variants: hasVariants
                            ? productData.variants.map((v: any) => ({
                                VariantID: v.VariantID,
                                AttributeValues: v.AttributeValues.map((av: any) => ({
                                    AttributeID: av.AttributeID,
                                    Value: av.Value,
                                    AttributeValueID: av.AttributeValueID,
                                })),
                                Price: v.Price || 0,
                                StockQuantity: v.StockQuantity || 0,
                                SKU: v.SKU || '',
                            }))
                            : [],
                        singleVariant: !hasVariants && productData.variants?.[0]
                            ? {
                                Price: productData.variants[0].Price || 0,
                                StockQuantity: productData.variants[0].StockQuantity || 0,
                                SKU: productData.variants[0].SKU || '',
                            }
                            : { Price: 0, StockQuantity: 0, SKU: '' },
                    });
                    setExistingImages(
                        productData.images?.map((img: any, index: number) => ({
                            ImageID: img.ImageID,
                            ImageURL: img.ImageURL || '',
                            IsPrimary: img.IsPrimary || index === 0,
                            SortOrder: img.SortOrder || index,
                        })) || []
                    );
                    setNewImages([]);
                    setImagesToDelete([]);
                    setAttributeInputs(
                        Object.keys(attrValues).reduce((acc, key) => {
                            acc[Number(key)] = attrValues[key].join(', ');
                            return acc;
                        }, {} as { [key: number]: string })
                    );
                    if (productData.CategoryID) {
                        await fetchAttributesForCategory(productData.CategoryID);
                    }
                    Swal.fire('Đặt lại!', 'Đã đặt lại biểu mẫu về giá trị ban đầu.', 'info');
                } catch (err: any) {
                    Swal.fire('Lỗi!', err.response?.data?.message || 'Không thể đặt lại dữ liệu.', 'error');
                } finally {
                    setLoading(false);
                }
            };
            fetchInitialData();
        };

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!formData.CategoryID) {
                Swal.fire('Lỗi!', 'Vui lòng chọn ngành hàng.', 'error');
                return;
            }
            if (existingImages.length + newImages.length === 0) {
                Swal.fire('Lỗi!', 'Cần ít nhất một hình ảnh.', 'error');
                return;
            }
            if (formData.hasVariants && formData.variants.length === 0) {
                Swal.fire('Lỗi!', 'Vui lòng tạo phân loại hoặc tắt phân loại sản phẩm.', 'error');
                return;
            }
            if (formData.Discount < 0 || formData.Discount > 100) {
                Swal.fire('Lỗi!', 'Giảm giá phải từ 0 đến 100.', 'error');
                return;
            }
            if (!formData.hasVariants) {
                if (formData.singleVariant.Price <= 0) {
                    Swal.fire('Lỗi!', 'Giá phải lớn hơn 0.', 'error');
                    return;
                }
                if (formData.singleVariant.StockQuantity < 0) {
                    Swal.fire('Lỗi!', 'Số lượng tồn kho không được âm.', 'error');
                    return;
                }
            }
            if (formData.hasVariants) {
                for (const variant of formData.variants) {
                    if (variant.Price <= 0) {
                        Swal.fire('Lỗi!', 'Giá của tất cả phân loại phải lớn hơn 0.', 'error');
                        return;
                    }
                    if (variant.StockQuantity < 0) {
                        Swal.fire('Lỗi!', 'Số lượng tồn kho của tất cả phân loại không được âm.', 'error');
                        return;
                    }
                }
            }

            setIsSubmitting(true);
            const productFormData = new FormData();
            productFormData.append('ProductID', String(productID));
            productFormData.append('CategoryID', String(formData.CategoryID));
            productFormData.append('Name', formData.Name);
            productFormData.append('Description', formData.Description);
            productFormData.append('Discount', String(formData.Discount));

            const imageData = [
                ...existingImages.map(img => ({ ImageID: img.ImageID, IsPrimary: img.IsPrimary, SortOrder: img.SortOrder })),
                ...newImages.map((img, index) => ({
                    ImageID: null,
                    IsPrimary: img.IsPrimary,
                    SortOrder: img.SortOrder,
                })),
            ];
            productFormData.append('ImageData', JSON.stringify(imageData));
            newImages.forEach(img => productFormData.append('Images[]', img.file));
            imagesToDelete.forEach(id => productFormData.append('ImagesToDelete[]', String(id)));

            if (formData.hasVariants) {
                productFormData.append('Variants', JSON.stringify(formData.variants));
            } else {
                productFormData.append('Price', String(formData.singleVariant.Price));
                productFormData.append('StockQuantity', String(formData.singleVariant.StockQuantity));
                productFormData.append('SKU', formData.singleVariant.SKU);
            }

            try {
                await updateProduct(productID, productFormData);
                Swal.fire('Thành công!', 'Sản phẩm đã được cập nhật và đang chờ phê duyệt.', 'success').then(() =>
                    router.push('/seller-dashboard/products')
                );
            } catch (err: any) {
                Swal.fire('Lỗi!', err.response?.data?.message || 'Không thể cập nhật sản phẩm.', 'error');
            } finally {
                setIsSubmitting(false);
            }
        };

        // --- RENDER ---
        if (loading) return <div className="flex justify-center items-center h-screen">Đang tải...</div>;

        return (
            <div className="flex-1 flex flex-col p-6 bg-gray-50">
                <h2 className="text-2xl font-bold mb-6">Chỉnh sửa Sản phẩm</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* --- BASIC INFORMATION --- */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold mb-4 border-b pb-2">Thông tin Cơ bản</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="Name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên Sản phẩm<span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="Name"
                                    name="Name"
                                    type="text"
                                    value={formData.Name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-2 border rounded-md outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="CategoryID" className="block text-sm font-medium text-gray-700 mb-1">
                                    Ngành hàng<span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="CategoryID"
                                    name="CategoryID"
                                    value={formData.CategoryID || ''}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-2 border rounded-md outline-none focus:border-blue-500"
                                >
                                    <option value="">Chọn ngành hàng</option>
                                    {shopCategories.map(cat => (
                                        <option key={cat.CategoryID} value={cat.CategoryID}>
                                            {cat.CategoryName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="Discount" className="block text-sm font-medium text-gray-700 mb-1">
                                    Giảm giá (%)
                                </label>
                                <input
                                    id="Discount"
                                    name="Discount"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.Discount}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded-md outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="mt-6">
                            <label htmlFor="Description" className="block text-sm font-medium text-gray-700 mb-1">
                                Mô tả
                            </label>
                            <textarea
                                id="Description"
                                name="Description"
                                value={formData.Description}
                                onChange={handleInputChange}
                                rows={6}
                                className="w-full p-2 border rounded-md outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* --- MEDIA MANAGEMENT --- */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold mb-4 border-b pb-2">Quản lý Hình ảnh</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {existingImages.map((image, index) => (
                                <div
                                    key={image.ImageID}
                                    className="relative group border-2 rounded-md overflow-hidden"
                                    style={{ aspectRatio: '1 / 1' }}
                                >
                                    <img
                                        src={`http://localhost:8001/storage/${image.ImageURL}`}
                                        alt="Existing product"
                                        className="w-full h-full object-cover"
                                        onError={e => (e.currentTarget.src = 'https://via.placeholder.com/150?text=Error')}
                                    />
                                    <div className="absolute top-1 right-1 flex gap-1">
                                        <button
                                            type="button"
                                            onClick={() => moveImage('existing', index, 'up')}
                                            disabled={index === 0}
                                            className="w-6 h-6 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors disabled:opacity-50"
                                        >
                                            ↑
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveImage('existing', index, 'down')}
                                            disabled={index === existingImages.length - 1 && newImages.length === 0}
                                            className="w-6 h-6 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors disabled:opacity-50"
                                        >
                                            ↓
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveExistingImage(image.ImageID)}
                                            className="w-6 h-6 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                                        >
                                            ×
                                        </button>
                                    </div>
                                    {!image.IsPrimary && (
                                        <div
                                            className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-1 cursor-pointer hover:bg-opacity-70"
                                            onClick={() => setPrimaryImage('existing', image.ImageID)}
                                        >
                                            Đặt làm ảnh bìa
                                        </div>
                                    )}
                                    {image.IsPrimary && (
                                        <div className="absolute top-0 left-0 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-br-md">
                                            Ảnh bìa
                                        </div>
                                    )}
                                </div>
                            ))}
                            {newImages.map((image, index) => (
                                <div
                                    key={image.preview}
                                    className="relative group border-2 rounded-md overflow-hidden"
                                    style={{ aspectRatio: '1 / 1' }}
                                >
                                    <img
                                        src={image.preview}
                                        alt="New product"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-1 right-1 flex gap-1">
                                        <button
                                            type="button"
                                            onClick={() => moveImage('new', index, 'up')}
                                            disabled={index === 0 && existingImages.length === 0}
                                            className="w-6 h-6 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors disabled:opacity-50"
                                        >
                                            ↑
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveImage('new', index, 'down')}
                                            disabled={index === newImages.length - 1}
                                            className="w-6 h-6 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors disabled:opacity-50"
                                        >
                                            ↓
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveNewImage(index)}
                                            className="w-6 h-6 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                                        >
                                            ×
                                        </button>
                                    </div>
                                    {!image.IsPrimary && (
                                        <div
                                            className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-1 cursor-pointer hover:bg-opacity-70"
                                            onClick={() => setPrimaryImage('new', index)}
                                        >
                                            Đặt làm ảnh bìa
                                        </div>
                                    )}
                                    {image.IsPrimary && (
                                        <div className="absolute top-0 left-0 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-br-md">
                                            Ảnh bìa
                                        </div>
                                    )}
                                </div>
                            ))}
                            {existingImages.length + newImages.length < 9 && (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed rounded-md flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100 hover:text-blue-500 transition-colors"
                                    style={{ aspectRatio: '1 / 1' }}
                                >
                                    <svg
                                        className="w-10 h-10"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1}
                                            d="M12 4v16m8-8H4"
                                        />
                                    </svg>
                                    <span className="text-sm mt-2">Thêm Hình ảnh</span>
                                    <span className="text-xs">({existingImages.length + newImages.length}/9)</span>
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageSelect}
                            multiple
                            accept="image/*"
                            className="hidden"
                        />
                    </div>

                    {/* --- SALES INFORMATION --- */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold mb-4 border-b pb-2">Thông tin chi tiết</h3>
                        <div className="flex items-center mb-4">
                            <label className="mr-4 text-gray-700 font-medium">Phân loại hàng</label>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, hasVariants: !prev.hasVariants }))}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${formData.hasVariants ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${formData.hasVariants ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        {!formData.hasVariants ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Giá<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="Price"
                                        value={formData.singleVariant.Price}
                                        onChange={handleSingleVariantChange}
                                        required
                                        className="w-full p-2 border rounded-md outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Kho hàng<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="StockQuantity"
                                        value={formData.singleVariant.StockQuantity}
                                        onChange={handleSingleVariantChange}
                                        required
                                        className="w-full p-2 border rounded-md outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">SKU (Tùy chọn)</label>
                                    <input
                                        type="text"
                                        name="SKU"
                                        value={formData.singleVariant.SKU}
                                        onChange={handleSingleVariantChange}
                                        className="w-full p-2 border rounded-md outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="border-t pt-4 space-y-4">
                                <p className="text-sm text-gray-500">
                                    Thêm các nhóm phân loại như Màu sắc, Kích thước, v.v.
                                </p>
                                {attributes.map(attr => (
                                    <div key={attr.AttributeID}>
                                        <label className="block text-sm font-medium text-gray-700">{attr.Name}</label>
                                        <input
                                            type="text"
                                            value={attributeInputs[attr.AttributeID] || ''}
                                            onChange={e => handleAttributeInputChange(attr.AttributeID, e.target.value)}
                                            className="w-full p-2 border rounded-md outline-none focus:border-blue-500"
                                            placeholder="Nhập các giá trị, cách nhau bởi dấu phẩy (VD: Đỏ, Xanh, Vàng)"
                                        />
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={generateVariants}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                >
                                    Áp dụng
                                </button>
                                {formData.variants.length > 0 && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b bg-gray-50">
                                                    <th className="p-2">Phân loại</th>
                                                    <th className="p-2">Giá</th>
                                                    <th className="p-2">Kho hàng</th>
                                                    <th className="p-2">SKU</th>
                                                    <th className="p-2">Hành động</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {formData.variants.map((variant, index) => (
                                                    <tr key={index} className="border-b">
                                                        <td className="p-2">
                                                            {variant.AttributeValues.map(av => av.Value).join(' / ')}
                                                        </td>
                                                        <td className="p-2">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={variant.Price}
                                                                onChange={e =>
                                                                    handleVariantChange(index, 'Price', e.target.value)
                                                                }
                                                                className="w-24 p-1 border rounded"
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={variant.StockQuantity}
                                                                onChange={e =>
                                                                    handleVariantChange(index, 'StockQuantity', e.target.value)
                                                                }
                                                                className="w-24 p-1 border rounded"
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <input
                                                                type="text"
                                                                value={variant.SKU}
                                                                onChange={e => handleVariantChange(index, 'SKU', e.target.value)}
                                                                className="w-32 p-1 border rounded"
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteVariant(index)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                Xóa
                                                            </button>
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

                    {/* --- SUBMIT ACTIONS --- */}
                    <div className="flex justify-end gap-4 mt-8">
                        <button
                            type="button"
                            onClick={handleResetForm}
                            className="bg-yellow-200 text-gray-800 px-6 py-2 rounded-md hover:bg-yellow-300"
                        >
                            Đặt lại
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/seller-dashboard/products')}
                            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 disabled:bg-gray-400"
                        >
                            {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
                        </button>
                    </div>
                </form>
            </div>
        );
    }