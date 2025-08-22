import React from 'react';

interface InfoBlockProps {
    title: string;
    children: React.ReactNode;
}

export const InfoRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium text-gray-900 text-right">{value ?? 'N/A'}</span>
    </div>
);

const InfoBlock: React.FC<InfoBlockProps> = ({ title, children }) => {
    return (
        <div className="bg-white rounded-lg shadow">
            <h3 className="text-base font-semibold text-gray-900 px-6 py-4 border-b">{title}</h3>
            <div className="px-6 py-4 space-y-1 text-sm text-gray-700">
                {children}
            </div>
        </div>
    );
};

export default InfoBlock;