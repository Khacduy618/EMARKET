// components/PageHeader.tsx
import React from 'react';

interface PageHeaderProps {
    title: string;
    welcomeText: string;
    breadcrumb: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, welcomeText, breadcrumb }) => {
    return (
        <div className="app-hero-header">
            <h5 className="fw-light">{welcomeText}</h5>
            <h3 className="fw-light mb-5">
                <span>{breadcrumb}</span> / <span className="menu-text">{title}</span>
            </h3>
        </div>
    );
};

export default PageHeader;