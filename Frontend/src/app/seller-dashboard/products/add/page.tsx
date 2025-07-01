"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import { getShopCategories, createProduct, getAttributes } from "@/services/seller-category"
import Swal from "sweetalert2"

// --- INTERFACES ---
interface ShopCategory {
    ShopCategoryID: number
    CategoryID: number
    CategoryName: string
}

interface ImageFile {
    file: File
    preview: string
    isPrimary: boolean
    sortOrder: number
}

interface Attribute {
    AttributeID: number
    Name: string
    CategoryID: number
}

interface Variant {
    Images: ImageFile[]
    Price: number
    CompareAtPrice: number | null
    StockQuantity: number
    SKU: string
}

// --- COMPONENT ---
export default function ShopeeAddProductPage() {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const variantFileInputs = useRef<(HTMLInputElement | null)[]>([])

    // --- STATES ---
    const [loading, setLoading] = useState(true)
    const [shopCategories, setShopCategories] = useState<ShopCategory[]>([])
    const [attributes, setAttributes] = useState<Attribute[]>([])
    const [attributeValues, setAttributeValues] = useState<{ [key: number]: string }>({})
    const [categoryID, setCategoryID] = useState<number | null>(null)
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [images, setImages] = useState<ImageFile[]>([])
    const [discount, setDiscount] = useState(0)
    const [hasVariants, setHasVariants] = useState(false)
    const [variants, setVariants] = useState<Variant[]>([
        { Images: [], Price: 0, CompareAtPrice: null, StockQuantity: 0, SKU: "" },
    ])
    const [singleVariant, setSingleVariant] = useState({ Price: 0, StockQuantity: 0, SKU: "" })
    const [activeTab, setActiveTab] = useState("basic")

    // --- EFFECTS ---
    useEffect(() => {
        const token = localStorage.getItem("authToken")
        if (!token) {
            Swal.fire("Unauthorized!", "Please log in to access the dashboard.", "error").then(() => router.push("/login"))
            return
        }
        fetchShopCategories()
    }, [router])

    useEffect(() => {
        // Cleanup function sẽ chạy khi component unmount hoặc dependencies thay đổi
        return () => {
            // Cleanup existing images
            images.forEach((image) => {
                if (image.preview && image.preview.startsWith("blob:")) {
                    URL.revokeObjectURL(image.preview)
                }
            })
            // Cleanup variant images
            variants.forEach((variant) =>
                variant.Images.forEach((img) => {
                    if (img.preview && img.preview.startsWith("blob:")) {
                        URL.revokeObjectURL(img.preview)
                    }
                }),
            )
        }
    }, []) // Empty dependency array - chỉ cleanup khi unmount

    // --- DATA FETCHING ---
    const fetchShopCategories = async () => {
        setLoading(true)
        try {
            const categoriesData = await getShopCategories()
            setShopCategories(categoriesData)
        } catch (err: any) {
            Swal.fire("Error!", err.response?.data?.message || "Failed to fetch categories", "error")
        } finally {
            setLoading(false)
        }
    }

    const fetchAttributesForCategory = async (catID: number) => {
        setLoading(true)
        try {
            // Lấy dữ liệu từ API (không có CategoryID)
            const attributesDataFromApi = await getAttributes(catID);
            // Bổ sung CategoryID cho đúng interface local
            const attributesData: Attribute[] = attributesDataFromApi.map((attr: any) => ({
                ...attr,
                CategoryID: catID,
            }));
            setAttributes(attributesData)
            const initialValues = attributesData.reduce(
                (acc, attr) => ({
                    ...acc,
                    [attr.AttributeID]: "",
                }),
                {},
            )
            setAttributeValues(initialValues)
        } catch (err: any) {
            Swal.fire("Error!", err.response?.data?.message || "Failed to fetch attributes.", "error")
            setAttributes([])
            setAttributeValues({})
        } finally {
            setLoading(false)
        }
    }

    // --- HANDLERS ---
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCategoryID = Number(e.target.value) || null
        setCategoryID(newCategoryID)
        setVariants([{ Images: [], Price: 0, CompareAtPrice: null, StockQuantity: 0, SKU: "" }])
        if (newCategoryID) {
            fetchAttributesForCategory(newCategoryID)
        } else {
            setAttributes([])
            setAttributeValues({})
        }
    }

    const handleImageSelect = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const files = event.target.files
            if (!files) return

            if (images.length + files.length > 9) {
                Swal.fire("Limit Reached!", "You can upload a maximum of 9 images.", "warning")
                return
            }

            const newImageFiles: ImageFile[] = Array.from(files).map((file, index) => {
                const preview = URL.createObjectURL(file)
                return {
                    file,
                    preview,
                    isPrimary: images.length === 0 && index === 0,
                    sortOrder: images.length + index,
                }
            })

            setImages((prev) => [...prev, ...newImageFiles])
            if (event.target) event.target.value = ""
        },
        [images.length],
    )

    const handleRemoveImage = useCallback((indexToRemove: number) => {
        setImages((prev) => {
            const imageToRemove = prev[indexToRemove]
            // Revoke URL để tránh memory leak
            if (imageToRemove.preview && imageToRemove.preview.startsWith("blob:")) {
                URL.revokeObjectURL(imageToRemove.preview)
            }

            const remainingImages = prev.filter((_, index) => index !== indexToRemove)
            if (imageToRemove.isPrimary && remainingImages.length > 0) {
                remainingImages[0].isPrimary = true
            }
            return remainingImages.map((img, idx) => ({ ...img, sortOrder: idx }))
        })
    }, [])

    const setPrimaryImage = useCallback((indexToSet: number) => {
        setImages((prev) => prev.map((img, index) => ({ ...img, isPrimary: index === indexToSet })))
    }, [])

    const handleVariantImageSelect = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>, variantIndex: number) => {
            const files = event.target.files
            if (!files) return

            if (variants[variantIndex].Images.length + files.length > 3) {
                Swal.fire("Limit Reached!", "Each variant can have a maximum of 3 images.", "warning")
                return
            }

            const newImageFiles: ImageFile[] = Array.from(files).map((file, index) => ({
                file,
                preview: URL.createObjectURL(file),
                isPrimary: variants[variantIndex].Images.length === 0 && index === 0,
                sortOrder: variants[variantIndex].Images.length + index,
            }))

            setVariants((prev) =>
                prev.map((v, i) => (i === variantIndex ? { ...v, Images: [...v.Images, ...newImageFiles] } : v)),
            )
            if (event.target) event.target.value = ""
        },
        [variants],
    )

    const handleRemoveVariantImage = (variantIndex: number, imageIndex: number) => {
        setVariants((prev) =>
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
                    : v,
            ),
        )
    }

    const handleVariantChange = (index: number, field: keyof Omit<Variant, "Images">, value: string | number | null) => {
        setVariants((prev) =>
            prev.map((v, i) =>
                i === index
                    ? {
                        ...v,
                        [field]:
                            field === "Price" || field === "StockQuantity"
                                ? Number(value)
                                : field === "CompareAtPrice"
                                    ? value === "" || value === null
                                        ? null
                                        : Number(value)
                                    : value,
                    }
                    : v,
            ),
        )
    }

    const handleSingleVariantChange = (field: keyof typeof singleVariant, value: string | number) => {
        setSingleVariant((prev) => ({
            ...prev,
            [field]: field === "Price" || field === "StockQuantity" ? Number(value) : value,
        }))
    }

    const handleAttributeValueChange = (attributeID: number, value: string) => {
        setAttributeValues((prev) => ({
            ...prev,
            [attributeID]: value,
        }))
    }

    const addVariant = () => {
        setVariants((prev) => [...prev, { Images: [], Price: 0, CompareAtPrice: null, StockQuantity: 0, SKU: "" }])
        variantFileInputs.current = [...variantFileInputs.current, null]
    }

    const handleRemoveVariant = (index: number) => {
        Swal.fire({
            title: "Xác nhận Xóa",
            text: "Bạn có chắc muốn xóa phân loại này?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy",
        }).then((result) => {
            if (result.isConfirmed) {
                setVariants((prev) => prev.filter((_, i) => i !== index))
                setVariants((prev) =>
                    prev.map((v, i) => ({
                        ...v,
                        Images: v.Images.map((img, idx) => ({ ...img, sortOrder: idx })),
                    })),
                )
                variantFileInputs.current = variantFileInputs.current.filter((_, i) => i !== index)
            }
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!categoryID) {
            Swal.fire("Error!", "Please select a category.", "error")
            return
        }
        if (images.length === 0 && variants.every((v) => v.Images.length === 0)) {
            Swal.fire("Error!", "At least one image is required for the product or variants.", "error")
            return
        }
        if (hasVariants && variants.length === 0) {
            Swal.fire("Error!", "Please add at least one variant.", "error")
            return
        }
        if (hasVariants && variants.some((v) => v.Price <= 0 || v.StockQuantity < 0)) {
            Swal.fire("Error!", "Price and stock quantity must be valid for all variants.", "error")
            return
        }
        if (!hasVariants && singleVariant.Price <= 0) {
            Swal.fire("Error!", "Price must be greater than 0 for single variant.", "error")
            return
        }
        if (discount < 0 || discount > 100) {
            Swal.fire("Error!", "Discount must be between 0 and 100.", "error")
            return
        }

        setLoading(true)

        const productFormData = new FormData()
        productFormData.append("CategoryID", String(categoryID))
        productFormData.append("Name", name)
        productFormData.append("Description", description)
        productFormData.append("Discount", String(discount))

        const imageData = images.map((img) => ({ IsPrimary: img.isPrimary, SortOrder: img.sortOrder }))
        productFormData.append("ImageData", JSON.stringify(imageData))
        images.forEach((img) => productFormData.append("Images[]", img.file))

        if (hasVariants) {
            const variantData = variants.map((v) => ({
                Price: v.Price,
                CompareAtPrice: v.CompareAtPrice,
                StockQuantity: v.StockQuantity,
                SKU: v.SKU,
            }))
            productFormData.append("Variants", JSON.stringify(variantData))
            variants.forEach((v, index) =>
                v.Images.forEach((img) => productFormData.append(`VariantImages[${index}][]`, img.file)),
            )
        } else {
            productFormData.append("Price", String(singleVariant.Price))
            productFormData.append("StockQuantity", String(singleVariant.StockQuantity))
            productFormData.append("SKU", singleVariant.SKU)
        }

        productFormData.append("AttributeValues", JSON.stringify(attributeValues))

        try {
            await createProduct(productFormData)
            Swal.fire("Success!", "Product created successfully and is pending approval.", "success").then(() =>
                router.push("/seller-dashboard/products"),
            )
        } catch (err: any) {
            console.error("API Error:", err.response?.data)
            Swal.fire("Error!", err.response?.data?.message || "Failed to save product.", "error")
        } finally {
            setLoading(false)
        }
    }

    // --- RENDER ---
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Shopee Header */}
            <div className="bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="text-2xl font-bold text-orange-500">Shopee</div>
                        <div className="text-gray-400">|</div>
                        <div className="text-lg text-gray-700">Kênh Người Bán</div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12h5v12z" />
                        </svg>
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>
                        <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-sm text-gray-700">duynguykhc8</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-12 gap-6">
                    {/* Left Sidebar - Tips */}
                    <div className="col-span-3">
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="bg-blue-50 p-4 border-b border-blue-100">
                                <h3 className="font-medium text-blue-800">Gợi ý điền Thông tin</h3>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex items-start space-x-3">
                                    <div
                                        className={`w-5 h-5 rounded-full flex-shrink-0 mt-0.5 ${images.length >= 3 ? "bg-green-500" : "bg-gray-200"}`}
                                    >
                                        {images.length >= 3 && (
                                            <svg className="w-3 h-3 text-white m-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-sm text-gray-600">Thêm ít nhất 3 hình ảnh</span>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="w-5 h-5 rounded-full bg-gray-200 flex-shrink-0 mt-0.5"></div>
                                    <span className="text-sm text-gray-600">Thêm video sản phẩm</span>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div
                                        className={`w-5 h-5 rounded-full flex-shrink-0 mt-0.5 ${name.length >= 25 && name.length <= 100 ? "bg-green-500" : "bg-gray-200"}`}
                                    >
                                        {name.length >= 25 && name.length <= 100 && (
                                            <svg className="w-3 h-3 text-white m-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-sm text-gray-600">Tên sản phẩm có ít nhất 25-100 ký tự</span>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div
                                        className={`w-5 h-5 rounded-full flex-shrink-0 mt-0.5 ${description.length >= 100 ? "bg-green-500" : "bg-gray-200"}`}
                                    >
                                        {description.length >= 100 && (
                                            <svg className="w-3 h-3 text-white m-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        Thêm ít nhất 100 ký tự hoặc 1 hình ảnh trong mô tả sản phẩm
                                    </span>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="w-5 h-5 rounded-full bg-gray-200 flex-shrink-0 mt-0.5"></div>
                                    <span className="text-sm text-gray-600">Thêm thương hiệu</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="col-span-6">
                        {/* Tab Navigation */}
                        <div className="bg-white rounded-t-lg shadow-sm">
                            <div className="flex border-b">
                                <button
                                    onClick={() => setActiveTab("basic")}
                                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "basic"
                                        ? "border-orange-500 text-orange-600 bg-orange-50"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    Thông tin cơ bản
                                </button>
                                <button
                                    onClick={() => setActiveTab("sales")}
                                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "sales"
                                        ? "border-orange-500 text-orange-600 bg-orange-50"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    Thông tin bán hàng
                                </button>
                                <button
                                    onClick={() => setActiveTab("shipping")}
                                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "shipping"
                                        ? "border-orange-500 text-orange-600 bg-orange-50"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    Vận chuyển
                                </button>
                                <button
                                    onClick={() => setActiveTab("other")}
                                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "other"
                                        ? "border-orange-500 text-orange-600 bg-orange-50"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    Thông tin khác
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="bg-white rounded-b-lg shadow-sm">
                            {/* Basic Information Tab */}
                            {activeTab === "basic" && (
                                <div className="p-6 space-y-6">
                                    <h3 className="text-lg font-medium text-orange-600 mb-4">Thông tin cơ bản</h3>

                                    {/* Product Images */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <span className="text-red-500">*</span> Hình ảnh sản phẩm
                                        </label>
                                        <div className="flex items-center space-x-4 mb-4">
                                            <div className="flex items-center space-x-2">
                                                <input type="radio" id="ratio-1-1" name="ratio" defaultChecked className="text-orange-500" />
                                                <label htmlFor="ratio-1-1" className="text-sm">
                                                    Hình ảnh tỷ lệ 1:1
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <input type="radio" id="ratio-3-4" name="ratio" />
                                                <label htmlFor="ratio-3-4" className="text-sm">
                                                    Hình ảnh tỷ lệ 3:4
                                                </label>
                                            </div>
                                            <span className="text-blue-500 text-sm cursor-pointer hover:underline">Ví dụ</span>
                                        </div>

                                        <div className="grid grid-cols-5 gap-4">
                                            {images.map((image, index) => (
                                                <div
                                                    key={image.preview}
                                                    className="relative aspect-square border-2 border-dashed border-gray-300 rounded-lg overflow-hidden group"
                                                >
                                                    <img
                                                        src={image.preview || "/placeholder.svg"}
                                                        alt={`preview ${index}`}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            console.error("Image load error:", e)
                                                            e.currentTarget.src = "/placeholder.svg?height=150&width=150"
                                                        }}
                                                        onLoad={() => {
                                                            // Optional: log successful load
                                                            console.log("Image loaded successfully")
                                                        }}
                                                    />
                                                    <div className="absolute top-1 right-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveImage(index)}
                                                            className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                    {!image.isPrimary && (
                                                        <div
                                                            className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-1 cursor-pointer hover:bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => setPrimaryImage(index)}
                                                        >
                                                            Đặt làm ảnh bìa
                                                        </div>
                                                    )}
                                                    {image.isPrimary && (
                                                        <div className="absolute top-0 left-0 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-br-md">
                                                            Ảnh bìa
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {images.length < 9 && (
                                                <div
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="aspect-square border-2 border-dashed border-orange-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-colors"
                                                >
                                                    <svg
                                                        className="w-8 h-8 text-orange-400 mb-2"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    <span className="text-xs text-orange-600">Thêm hình ảnh ({images.length}/9)</span>
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

                                    {/* Cover Image */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <span className="text-red-500">*</span> Ảnh bìa
                                        </label>
                                        <div className="border-2 border-dashed border-orange-300 rounded-lg p-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center">
                                                    <svg
                                                        className="w-8 h-8 text-orange-400"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <p>Tải lên hình ảnh 1:1.</p>
                                                    <p>
                                                        Ảnh bìa sẽ được hiển thị tại các trang Kết quả tìm kiếm, Gợi ý hôm nay,... Việc sử dụng ảnh
                                                        bìa đẹp sẽ thu hút thêm lượt truy cập vào sản phẩm của bạn
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Video Section */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Video sản phẩm</label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <p>Kích thước tối đa 30Mb, độ phân giải không vượt quá 1280x1280px</p>
                                                    <p>Độ dài: 10s-60s</p>
                                                    <p>Định dạng: MP4</p>
                                                    <p>
                                                        Lưu ý: sản phẩm có thể hiển thị trong khi video đang được xử lý. Video sẽ tự động hiển thị
                                                        sau khi đã xử lý thành công.
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="mt-3 px-4 py-2 border border-orange-500 text-orange-500 rounded-md hover:bg-orange-50 transition-colors"
                                            >
                                                Thêm video
                                            </button>
                                        </div>
                                    </div>

                                    {/* Product Name */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                            <span className="text-red-500">*</span> Tên sản phẩm
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Tên sản phẩm + Thương hiệu + Model + Thông số kỹ thuật"
                                            required
                                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                        <div className="text-right text-sm text-gray-500 mt-1">{name.length}/120</div>
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                                            <span className="text-red-500">*</span> Ngành hàng
                                        </label>
                                        <select
                                            id="category"
                                            value={categoryID || ""}
                                            onChange={handleCategoryChange}
                                            required
                                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            disabled={loading}
                                        >
                                            <option value="">Chọn ngành hàng</option>
                                            {shopCategories.map((cat) => (
                                                <option key={cat.CategoryID} value={cat.CategoryID}>
                                                    {cat.CategoryName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                            Mô tả Sản phẩm
                                        </label>
                                        <textarea
                                            id="description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={6}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="Nhập mô tả chi tiết về sản phẩm..."
                                        />
                                        <div className="text-right text-sm text-gray-500 mt-1">{description.length} ký tự</div>
                                    </div>

                                    {/* Attributes */}
                                    {categoryID && attributes.length > 0 && (
                                        <div>
                                            <h4 className="text-md font-medium text-gray-700 mb-3">Thông số Thuộc tính</h4>
                                            <div className="space-y-4">
                                                {attributes.map((attr) => (
                                                    <div key={attr.AttributeID}>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">{attr.Name}</label>
                                                        <input
                                                            type="text"
                                                            value={attributeValues[attr.AttributeID] || ""}
                                                            onChange={(e) => handleAttributeValueChange(attr.AttributeID, e.target.value)}
                                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                            placeholder={`Nhập giá trị cho ${attr.Name}`}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Sales Information Tab */}
                            {activeTab === "sales" && (
                                <div className="p-6 space-y-6">
                                    <h3 className="text-lg font-medium text-orange-600 mb-4">Thông tin bán hàng</h3>

                                    {/* Variant Toggle */}
                                    <div className="flex items-center mb-6">
                                        <label className="mr-4 text-gray-700 font-medium">Phân loại hàng</label>
                                        <button
                                            type="button"
                                            onClick={() => setHasVariants(!hasVariants)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${hasVariants ? "bg-orange-500" : "bg-gray-200"
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${hasVariants ? "translate-x-6" : "translate-x-1"
                                                    }`}
                                            />
                                        </button>
                                    </div>

                                    {!hasVariants ? (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    <span className="text-red-500">*</span> Giá
                                                </label>
                                                <input
                                                    type="number"
                                                    value={singleVariant.Price}
                                                    onChange={(e) => handleSingleVariantChange("Price", e.target.value)}
                                                    required
                                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    <span className="text-red-500">*</span> Kho hàng
                                                </label>
                                                <input
                                                    type="number"
                                                    value={singleVariant.StockQuantity}
                                                    onChange={(e) => handleSingleVariantChange("StockQuantity", e.target.value)}
                                                    required
                                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">SKU (Tùy chọn)</label>
                                                <input
                                                    type="text"
                                                    value={singleVariant.SKU}
                                                    onChange={(e) => handleSingleVariantChange("SKU", e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="border-t pt-6 space-y-6">
                                            {variants.map((variant, index) => (
                                                <div key={index} className="border border-gray-200 p-4 rounded-lg">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="text-lg font-medium">Phân loại {index + 1}</h4>
                                                        {variants.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveVariant(index)}
                                                                className="text-red-500 hover:text-red-700 text-sm"
                                                            >
                                                                Xóa phân loại
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh</label>
                                                            <input
                                                                type="file"
                                                                ref={el => { variantFileInputs.current[index] = el }}
                                                                onChange={e => handleVariantImageSelect(e, index)}
                                                                multiple
                                                                accept="image/*"
                                                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                                            />
                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                {variant.Images.map((img, imgIndex) => (
                                                                    <div key={imgIndex} className="relative w-16 h-16 border rounded-md overflow-hidden">
                                                                        <img
                                                                            src={img.preview || "/placeholder.svg"}
                                                                            alt={`variant ${index} preview ${imgIndex}`}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemoveVariantImage(index, imgIndex)}
                                                                            className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                                                                        >
                                                                            ×
                                                                        </button>
                                                                        {img.isPrimary && (
                                                                            <div className="absolute bottom-0 left-0 right-0 bg-orange-500 text-white text-xs text-center">
                                                                                Chính
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                <span className="text-red-500">*</span> Giá
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={variant.Price}
                                                                onChange={(e) => handleVariantChange(index, "Price", e.target.value)}
                                                                required
                                                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Giá so sánh</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={variant.CompareAtPrice ?? ""}
                                                                onChange={(e) => handleVariantChange(index, "CompareAtPrice", e.target.value || null)}
                                                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                <span className="text-red-500">*</span> SKU
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={variant.SKU}
                                                                onChange={(e) => handleVariantChange(index, "SKU", e.target.value)}
                                                                required
                                                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                <span className="text-red-500">*</span> Số lượng
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={variant.StockQuantity}
                                                                onChange={(e) => handleVariantChange(index, "StockQuantity", e.target.value)}
                                                                required
                                                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={addVariant}
                                                className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
                                            >
                                                Thêm Phân loại
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Other tabs placeholder */}
                            {activeTab === "shipping" && (
                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-orange-600 mb-4">Vận chuyển</h3>
                                    <p className="text-gray-500">Nội dung vận chuyển sẽ được thêm vào đây...</p>
                                </div>
                            )}

                            {activeTab === "other" && (
                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-orange-600 mb-4">Thông tin khác</h3>
                                    <p className="text-gray-500">Nội dung thông tin khác sẽ được thêm vào đây...</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="border-t p-6">
                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => router.push("/seller-dashboard/products")}
                                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="button"
                                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                    >
                                        Lưu & Ẩn
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-400 transition-colors"
                                    >
                                        {loading ? "Đang lưu..." : "Lưu & Hiển thị"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Right Sidebar - Preview */}
                    <div className="col-span-3">
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="p-4 border-b">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium">Xem trước</h3>
                                    <div className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded border border-orange-200">
                                        Chi tiết sản phẩm
                                    </div>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="border-2 border-orange-200 rounded-lg p-4 mb-4 min-h-[200px] flex items-center justify-center bg-gray-50">
                                    {images.length > 0 ? (
                                        <img
                                            src={images[0].preview || "/placeholder.svg"}
                                            alt="Preview"
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                            <p className="text-sm">0 phân loại có sẵn</p>
                                        </div>
                                    )}
                                </div>

                                <div className="text-center text-gray-500 text-sm mb-4">
                                    ₫
                                    {hasVariants
                                        ? variants.length > 0
                                            ? `${Math.min(...variants.map((v) => v.Price))} - ₫${Math.max(...variants.map((v) => v.Price))}`
                                            : "0 - ₫0"
                                        : singleVariant.Price}
                                </div>

                                <div className="flex items-center space-x-2 mb-4">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium">duynguykhc8</span>
                                    <button className="ml-auto px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">
                                        Xem
                                    </button>
                                </div>

                                <div className="flex space-x-2">
                                    <button className="flex-1 py-2 bg-orange-100 text-orange-600 rounded flex items-center justify-center hover:bg-orange-200 transition-colors">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                            />
                                        </svg>
                                    </button>
                                    <button className="flex-1 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors">
                                        Mua Ngay
                                    </button>
                                </div>

                                <p className="text-xs text-gray-500 mt-4 text-center">
                                    Hình ảnh có tính chất minh họa, không phải hình ảnh cuối cùng Người mua thấy.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
