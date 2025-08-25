"use client";

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'success' | 'info';
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    variant = 'danger'
}: ConfirmModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Xử lý khi nhấn phím Escape để đóng modal
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            await onConfirm(); // Gọi đến hàm action thực sự
        } catch (e) {
            // Lỗi sẽ được xử lý ở component cha và hiển thị qua toast
            console.error("Confirmation action failed:", e);
        } finally {
            setIsSubmitting(false);
            // onClose(); // Tự đóng modal sau khi hành động hoàn tất
        }
    };

    // Chọn màu sắc và icon dựa trên `variant`
    const theme = {
        danger: {
            icon: <AlertTriangle className="h-10 w-10 text-red-500" />,
            buttonClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        },
        success: {
            icon: <CheckCircle className="h-10 w-10 text-green-500" />,
            buttonClass: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
        },
        info: {
            icon: <AlertTriangle className="h-10 w-10 text-blue-500" />,
            buttonClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        },
    }[variant];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg animate-fade-in-up">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                        <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${variant === 'danger' ? 'bg-red-100' : 'bg-green-100'} sm:mx-0 sm:h-10 sm:w-10`}>
                            {theme.icon}
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 className="text-lg font-semibold leading-6 text-gray-900" id="modal-title">
                                {title}
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    {message}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                        type="button"
                        className={`inline-flex w-full justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${theme.buttonClass} disabled:opacity-50`}
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Đang xử lý...' : confirmText}
                    </button>
                    <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        onClick={onClose}
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
}
