// components/Sidebar.tsx
import React from 'react';
import Link from 'next/link';

const Sidebar: React.FC = () => {
    return (
        <nav id="sidebar" className="sidebar-wrapper">
            {/* Phần này đã đúng */}
            <div className="app-brand px-3 py-3 d-flex align-items-center">
                <Link href="/">
                    <img src="/assets/images/logo.svg" className="logo" alt="Bootstrap Gallery" />
                </Link>
            </div>

            <div className="sidebar-user-profile">
                <img src="/assets/images/user.png" className="profile-thumb rounded-2 p-2 d-lg-flex d-none" alt="Bootstrap Gallery" />
                <h5 className="profile-name lh-lg mt-2 text-truncate">Harriet Bradford</h5>
                {/* Phần này không có Link, giữ nguyên */}
                <ul className="profile-actions d-flex m-0 p-0">
                    <li>
                        {/* Link này có thể cần sửa nếu bạn muốn nó điều hướng */}
                        <a href="javascript:void(0)">
                            <i className="bi bi-skype fs-4"></i>
                            <span className="count-label"></span>
                        </a>
                    </li>
                    <li>
                        <a href="javascript:void(0)">
                            <i className="bi bi-dribbble fs-4"></i>
                        </a>
                    </li>
                    <li>
                        <a href="javascript:void(0)">
                            <i className="bi bi-twitter fs-4"></i>
                        </a>
                    </li>
                </ul>
            </div>

            <div className="sidebarMenuScroll">
                <ul className="sidebar-menu">
                    {/* SỬA LẠI TỪ ĐÂY */}
                    <li className="active current-page">
                        
                    </li>
                    <li>
                        {/* Bỏ thẻ <a> */}
                        <Link href="/widgets">
                            <i className="bi bi-clipboard-data"></i>
                            <span className="menu-text">Widgets</span>
                        </Link>
                    </li>

                    {/* 
                        TÔI SẼ GIẢ SỬ VÀ SỬA NỐT CÁC MỤC MENU KHÁC TRONG TEMPLATE GỐC
                        BẠN CHỈ CẦN SAO CHÉP VÀ DÁN TOÀN BỘ CODE NÀY LÀ ĐƯỢC
                    */}

                    <li className="treeview">
                        <a href="#!"> {/* Link dạng dropdown giữ nguyên thẻ <a> vì nó không điều hướng trang */}
                            <i className="bi bi-columns-gap"></i>
                            <span className="menu-text">Components</span>
                        </a>
                        <ul className="treeview-menu">
                            <li><Link href="/accordions">Accordions</Link></li>
                            <li><Link href="/alerts">Alerts</Link></li>
                            {/* ... và các link khác trong Components ... */}
                        </ul>
                    </li>

                    <li className="treeview">
                        <a href="#!">
                            <i className="bi bi-code-square"></i>
                            <span className="menu-text">Forms</span>
                        </a>
                        <ul className="treeview-menu">
                            <li><Link href="/form-inputs">Form Inputs</Link></li>
                            {/* ... và các link khác trong Forms ... */}
                        </ul>
                    </li>
                    {/* ... (Bạn cần áp dụng tương tự cho tất cả các mục menu còn lại) ... */}
                </ul>
            </div>
        </nav>
    );
};

export default Sidebar;