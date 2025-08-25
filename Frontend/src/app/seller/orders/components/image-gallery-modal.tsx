"use client"

import { useState } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react"
import { getStorageImageUrl } from "@/services/api"

interface ImageGalleryModalProps {
    images: string[]
    isOpen: boolean
    onClose: () => void
    initialIndex?: number
}

export default function ImageGalleryModal({ images, isOpen, onClose, initialIndex = 0 }: ImageGalleryModalProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)

    if (!isOpen) return null

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
    }

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    const downloadImage = () => {
        const link = document.createElement("a")
        link.href = `${process.env.NEXT_PUBLIC_API_URL}/storage/${images[currentIndex]}`
        link.download = `proof-image-${currentIndex + 1}.jpg`
        link.click()
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative max-w-4xl max-h-[90vh] w-full">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent">
                    <div className="text-white font-medium">
                        Ảnh minh chứng {currentIndex + 1} / {images.length}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={downloadImage}
                            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                        >
                            <Download size={20} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Main Image */}
                <div className="relative w-full h-[70vh] bg-gray-900 rounded-lg overflow-hidden">
                    <img
                        src={getStorageImageUrl(images[currentIndex])}
                        alt={`Proof Image ${currentIndex + 1}`}
                        
                        className="object-contain"
                        
                    />
                </div>

                {/* Navigation */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}

                {/* Thumbnails */}
                {images.length > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-3 h-3 rounded-full transition-colors ${index === currentIndex ? "bg-white" : "bg-white/40 hover:bg-white/60"
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
