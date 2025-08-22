
// app/(main)/categoryDetail/components/PriceRangeFilter.tsx
"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from 'react-toastify'; // Nhập toast từ react-toastify

export default function PriceRangeFilter() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // --- STATE MANAGEMENT ---
    const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
    const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
    const [isDragging, setIsDragging] = useState<"min" | "max" | null>(null);
    const sliderRef = useRef<HTMLDivElement>(null);

    // --- CONSTANTS ---
    const MIN_VALUE = 0;
    const MAX_VALUE = 50000000; // 50 triệu

    // --- HELPER FUNCTIONS ---
    const formatPrice = (price: string | number) => {
        const num = typeof price === "string" ? Number.parseInt(price, 10) || 0 : price;
        return new Intl.NumberFormat("vi-VN", { style: 'currency', currency: 'VND' }).format(num);
    };

    const getPercentage = (value: string | number) => {
        const num = typeof value === "string" ? Number.parseInt(value, 10) || MIN_VALUE : value;
        if (num > MAX_VALUE) return 100;
        if (num < MIN_VALUE) return 0;
        return ((num - MIN_VALUE) / (MAX_VALUE - MIN_VALUE)) * 100;
    };

    const getValueFromPercentage = (percentage: number) => {
        return Math.round(MIN_VALUE + (percentage / 100) * (MAX_VALUE - MIN_VALUE));
    };

    // --- EVENT HANDLERS ---
    const handleApplyFilter = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (minPrice) params.set("min_price", minPrice);
        else params.delete("min_price");
        if (maxPrice) params.set("max_price", maxPrice);
        else params.delete("max_price");
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleApplyFilter();
    };

    const handlePriceChange = (value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
        if (value === "") {
            setter("");
            return;
        }
        const numericValue = parseInt(value, 10);
        if (numericValue > MAX_VALUE) {
            setter(MAX_VALUE.toString());
            // Sử dụng cú pháp của react-toastify
            toast.error(`Giá trị không thể vượt quá ${formatPrice(MAX_VALUE)}`);
        } else {
            setter(value);
        }
    };

    const handleMouseDown = (type: "min" | "max") => (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(type);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || !sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const newValue = getValueFromPercentage(percentage);

        if (isDragging === "min") {
            const currentMax = Number.parseInt(maxPrice, 10) || MAX_VALUE;
            const newMinPrice = Math.min(newValue, currentMax);
            setMinPrice(Math.max(MIN_VALUE, newMinPrice).toString());
        } else if (isDragging === "max") {
            const currentMin = Number.parseInt(minPrice, 10) || MIN_VALUE;
            const newMaxPrice = Math.max(newValue, currentMin);
            setMaxPrice(Math.min(MAX_VALUE, newMaxPrice).toString());
        }
    };

    const handleMouseUp = () => setIsDragging(null);

    // --- LIFECYCLE HOOKS ---
    useEffect(() => {
        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            return () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
            };
        }
    }, [isDragging, minPrice, maxPrice]);

    // --- RENDER LOGIC ---
    const minPercentage = getPercentage(minPrice);
    const maxPercentage = getPercentage(maxPrice);

    return (
        <div className="space-y-4">
            <h4 className="font-semibold text-sm text-gray-700">Khoảng Giá</h4>

            <div className="flex items-center justify-between text-sm text-gray-800 font-medium">
                <span>{formatPrice(minPrice || MIN_VALUE)}</span>
                <span>{formatPrice(maxPrice || MAX_VALUE)}</span>
            </div>

            {/* Slider */}
            <div className="relative py-2">
                <div ref={sliderRef} className="relative h-1.5 bg-gray-200 rounded-full cursor-pointer">
                    <div className="absolute h-full bg-orange-500 rounded-full" style={{ left: `${minPercentage}%`, width: `${maxPercentage - minPercentage}%` }} />
                    <div className="absolute w-4 h-4 bg-white border-2 border-orange-500 rounded-full shadow-md cursor-pointer transform -translate-y-1.5 -translate-x-2 transition-transform hover:scale-110" style={{ left: `${minPercentage}%` }} onMouseDown={handleMouseDown("min")} />
                    <div className="absolute w-4 h-4 bg-white border-2 border-orange-500 rounded-full shadow-md cursor-pointer transform -translate-y-1.5 -translate-x-2 transition-transform hover:scale-110" style={{ left: `${maxPercentage}%` }} onMouseDown={handleMouseDown("max")} />
                </div>
            </div>

            {/* Input Fields */}
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    placeholder="TỪ"
                    value={minPrice}
                    onChange={(e) => handlePriceChange(e.target.value, setMinPrice)}
                    onKeyDown={handleKeyDown}
                    className="custom-number-input w-full px-3 py-1.5 text-center text-sm border border-gray-300 rounded-md focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition"
                />
                <span className="text-gray-400">-</span>
                <input
                    type="number"
                    placeholder="ĐẾN"
                    value={maxPrice}
                    onChange={(e) => handlePriceChange(e.target.value, setMaxPrice)}
                    onKeyDown={handleKeyDown}
                    className="custom-number-input w-full px-3 py-1.5 text-center text-sm border border-gray-300 rounded-md focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition"
                />
            </div>

            {/* Apply Button */}
            <button
                onClick={handleApplyFilter}
                className="w-full bg-orange-500 text-white py-2 rounded-md text-sm font-semibold uppercase tracking-wide hover:bg-orange-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
                Áp dụng
            </button>

            {/* CSS to hide number input spinners */}
            <style jsx global>{`
                .custom-number-input::-webkit-outer-spin-button,
                .custom-number-input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                .custom-number-input[type='number'] {
                    -moz-appearance: textfield;
                }
            `}</style>
        </div>
    );
}