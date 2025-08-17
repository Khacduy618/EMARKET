'use client';
import React, { Dispatch, SetStateAction } from 'react';

// Định nghĩa props mà component này nhận
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: Dispatch<SetStateAction<number>>;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="mt-6 flex justify-end items-center gap-2">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Trước
            </button>
            <span className="text-sm text-gray-700">Trang {currentPage} / {totalPages}</span>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Sau
            </button>
        </div>
    );
};

export default Pagination;