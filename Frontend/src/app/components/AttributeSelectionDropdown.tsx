import React from 'react';

interface AttributeSelectionDropdownProps {
    productId: number;
    attributeOptions: { [key: string]: any[] } | null;
    onAttributeSelected: (selectedAttributes: { [key: string]: number[] }) => void;
    onClose: () => void;
}

const AttributeSelectionDropdown: React.FC<AttributeSelectionDropdownProps> = ({
    productId,
    attributeOptions,
    onAttributeSelected,
    onClose,
}) => {
    const handleAttributeClick = (attributeName: string, attributeValueId: number) => {
        onAttributeSelected({ [attributeName]: [attributeValueId] });
    };

    return (
        <div className="absolute z-50 bg-white border rounded-md shadow-lg p-4 top-full left-0">
            <h3 className="text-lg font-semibold mb-4">Chọn Phân Loại Hàng</h3>
            {attributeOptions && Object.keys(attributeOptions).length > 0 ? (
                <div>
                    {Object.entries(attributeOptions).map(([attributeName, attributeValues]) => (
                        <div key={attributeName} className="mb-2">
                            <span className="font-semibold text-sm text-gray-700">{attributeName}:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {attributeValues.map((attrValue: any) => (
                                    <button
                                        key={attrValue.AttributeValueID}
                                        className="px-4 py-2 border rounded-sm text-sm border-red-500 text-red-500" // Indicate selected
                                        onClick={() => handleAttributeClick(attributeName, attrValue.AttributeValueID)}
                                    >
                                        {attrValue.Value}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500">Không có phân loại hàng nào khác.</p>
            )}

            <div className="flex justify-end gap-4 mt-6">
                <button
                    className="px-6 py-2 text-gray-700 border border-gray-300 rounded-sm hover:bg-gray-100"
                    onClick={onClose} // Close dropdown
                >
                    TRỞ LẠI
                </button>
                {/* TODO: Implement confirmation logic */}
                <button
                    className="px-6 py-2 bg-red-500 text-white rounded-sm hover:bg-red-600 font-semibold"
                    onClick={() => {
                        console.log('XÁC NHẬN clicked');
                        onClose(); // Close dropdown after action
                    }}
                >
                    XÁC NHẬN
                </button>
            </div>
        </div>
    );
};

export default AttributeSelectionDropdown;
