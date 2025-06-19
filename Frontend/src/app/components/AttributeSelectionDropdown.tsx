'use client'; // Đảm bảo có 'use client' vì đây là client component

import React, { useState, useEffect, RefObject, useRef } from 'react';
import useClickOutside from '@/app/hooks/useClickOutside'; // Import custom hook
import { FiCheck } from "react-icons/fi";


interface AttributeSelectionDropdownProps {
    productId: number;
    attributeOptions: { [key: string]: { AttributeValueID: number; Value: string; AttributeID: number }[] } | null;
    onAttributeSelected: (selectedAttributes: { [key: string]: number[] }) => void;
    onClose: () => void;
    // KIỂM TRA ĐÂY: prop này phải chấp nhận RefObject có thể là null
    excludedButtonRef: RefObject<HTMLElement | null>;
}

const AttributeSelectionDropdown: React.FC<AttributeSelectionDropdownProps> = ({
    productId,
    attributeOptions,
    onAttributeSelected,
    onClose,
    excludedButtonRef,
}) => {
    const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: number[] }>({});

    // Ref cho chính dropdown này
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Sử dụng custom hook useClickOutside
    // Đảm bảo các kiểu truyền vào khớp với chữ ký của useClickOutside
    useClickOutside(dropdownRef, onClose, [excludedButtonRef]);


    const isConfirmButtonEnabled = () => {
        if (!attributeOptions || Object.keys(attributeOptions).length === 0) {
            return true;
        }

        for (const attributeName of Object.keys(attributeOptions)) {
            if (!selectedAttributes[attributeName] || selectedAttributes[attributeName].length === 0) {
                return false;
            }
        }
        return true;
    };

    const handleAttributeClick = (attributeName: string, attributeValueId: number) => {
        setSelectedAttributes(prevSelectedAttributes => {
            const newSelectedAttributes = { ...prevSelectedAttributes };

            if (newSelectedAttributes[attributeName] && newSelectedAttributes[attributeName][0] === attributeValueId) {
                newSelectedAttributes[attributeName] = [];
            } else {
                newSelectedAttributes[attributeName] = [attributeValueId];
            }

            onAttributeSelected(newSelectedAttributes);
            return newSelectedAttributes;
        });
    };

    return (
        // Gắn ref vào phần tử gốc của dropdown
        <div ref={dropdownRef} className="absolute z-50 bg-white border rounded-md shadow-lg p-4 top-full left-0 w-max min-w-[300px]">
            <h3 className="text-lg font-semibold mb-4">Chọn Phân Loại Hàng</h3>
            {attributeOptions && Object.keys(attributeOptions).length > 0 ? (
                <div>
                    {Object.entries(attributeOptions).map(([attributeName, attributeValues]) => (
                        <div key={attributeName} className="mb-4">
                            <span className="font-semibold text-sm text-gray-700">{attributeName}:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {attributeValues.map((attrValue) => {
                                    const isSelected = selectedAttributes[attributeName]?.includes(attrValue.AttributeValueID);
                                    return (
                                        <button
                                            key={attrValue.AttributeValueID}
                                            className={`px-4 py-2 border rounded-sm text-sm relative overflow-hidden
                                                        ${isSelected ? 'bg-white text-red-500 border-red-500' : 'border-gray-300 text-gray-700 hover:border-red-500'}
                                                        transition-colors duration-200`}
                                            onClick={() => handleAttributeClick(attributeName, attrValue.AttributeValueID)}
                                        >
                                            {attrValue.Value}
                                            {isSelected && (
                                                <div
                                                    className="absolute bottom-0 right-0 w-5 h-5 bg-red-500 flex items-end justify-end"
                                                    style={{ clipPath: 'polygon(100% 0, 100% 100%, 0% 100%)' }}
                                                >
                                                    <span className="text-white text-xs ">
                                                        <FiCheck />

                                                    </span>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500">Không có phân loại hàng nào khác.</p>
            )}

            <div className="flex justify-end gap-4 mt-6">
                <button
                    className="px-6 py-2 text-gray-700 border border-gray-300 rounded-sm hover:bg-gray-100 transition-colors duration-200"
                    onClick={onClose}
                >
                    TRỞ LẠI
                </button>
                <button
                    className={`px-6 py-2 rounded-sm font-semibold transition-colors duration-200
                                ${isConfirmButtonEnabled()
                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                                }`}
                    onClick={() => {
                        if (isConfirmButtonEnabled()) {
                            console.log('XÁC NHẬN clicked with selected attributes:', selectedAttributes);
                            onClose();
                        }
                    }}
                    disabled={!isConfirmButtonEnabled()}
                >
                    XÁC NHẬN
                </button>
            </div>
        </div>
    );
};

export default AttributeSelectionDropdown;