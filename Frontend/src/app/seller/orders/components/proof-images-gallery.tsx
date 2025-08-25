"use client"

import { useState } from "react"
import Image from "next/image"
import { ZoomIn, Camera } from "lucide-react"
import ImageGalleryModal from "./image-gallery-modal"
import { getStorageImageUrl } from "@/services/api"

interface ProofImagesGalleryProps {
    proof_image1?: string | null
    proof_image2?: string | null
}

export default function ProofImagesGallery({ proof_image1, proof_image2 }: ProofImagesGalleryProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)

    const images = [proof_image1, proof_image2].filter(Boolean) as string[]

    if (images.length === 0) return null

    const openModal = (index: number) => {
        setSelectedImageIndex(index)
        setIsModalOpen(true)
    }

    return (
        <>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Camera className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800">Ảnh minh chứng giao hàng</h4>
                </div>

                <div className={`grid gap-4 ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className="group relative aspect-square bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                            onClick={() => openModal(index)}
                        >
                            <img
                                src={getStorageImageUrl(image)}
                                alt={`Proof Image ${index + 1}`}
                                
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-3">
                                    <ZoomIn className="w-6 h-6 text-gray-700" />
                                </div>
                            </div>

                            {/* Image number badge */}
                            <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                                {index + 1}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Image count info */}
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">{images.length} ảnh minh chứng • Nhấp để xem chi tiết</p>
                </div>
            </div>

            <ImageGalleryModal
                images={images}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialIndex={selectedImageIndex}
            />
        </>
    )
}
