
'use client'

import useSWR from 'swr'
import axios from 'axios'
import { useState, useEffect, useMemo } from 'react' // Import useMemo
// Đảm bảo đường dẫn import của bạn là chính xác
import { getActiveSeasonTheme, SeasonTheme } from '../../types/seasonalThemes'
// iconMap và DefaultIcon không còn được sử dụng cho kiểu menu này
// import { iconMap, DefaultIcon } from '../../types/iconMap'
// import { IconType } from 'react-icons' // Có thể xóa nếu không dùng icons nào
// FaChevronDown không còn được sử dụng
// import { FaChevronDown } from 'react-icons/fa'

const fetcher = (url: string) => axios.get(url).then(res => res.data)

/**
 * Component con CHUYÊN DỤNG để render một mục danh mục.
 * Đã được sửa đổi để chỉ hiển thị các mục menu văn bản đơn giản trên một hàng.
 * Không có icon, không có dropdown.
 */
const CategoryMenuItem = ({ item, theme, isScrolled }: { item: any, theme: SeasonTheme, isScrolled: boolean }) => {
    // Không cần IconComponent và hasChildren nữa
    // const IconComponent = iconMap[item.icon] || DefaultIcon;
    // const hasChildren = item.children && item.children.length > 0;

    const finalClass = isScrolled
        ? `${theme.itemClass.scrolled} ${theme.itemClass.scrolledHover}`
        : `${theme.itemClass.base} ${theme.itemClass.hover}`;

    return (
        // Loại bỏ 'relative group' vì không còn dropdown hay hiệu ứng group hover
        // Loại bỏ 'rounded-t-md' khỏi a tag vì không còn dropdown
        <div>
            <a
                href={`#${item.Slug}`}
                className={`flex items-center gap-2 whitespace-nowrap px-3 py-3 font-medium transition-all duration-200 cursor-pointer ${finalClass}`}
            >
                {/* Loại bỏ IconComponent */}
                {/* <span>{item.Name}</span> */}
                {/* Hiển thị tên danh mục. Bạn có thể thêm dấu phân cách ở đây nếu muốn,
                    ví dụ: `<span>{item.Name}</span> <span className="text-gray-400">|</span>`
                    Tuy nhiên, thường sẽ để khoảng cách giữa các mục bằng `space-x-4` của Tailwind.
                */}
                <span>{item.Name}</span>
                {/* Loại bỏ FaChevronDown */}
            </a>
            {/* Loại bỏ hoàn toàn phần dropdown */}
        </div>
    );
};


/**
 * Component NavMenu chính
 */
export default function NavMenu() {
    const { data, error } = useSWR('http://localhost:8001/api/category', fetcher)
    const [isScrolled, setIsScrolled] = useState(false)
    const [activeTheme, setActiveTheme] = useState<SeasonTheme | null>(null);

    useEffect(() => {
        setActiveTheme(getActiveSeasonTheme());
        const handleScroll = () => setIsScrolled(window.scrollY > 10)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Sử dụng useMemo để làm phẳng dữ liệu danh mục khi 'data' thay đổi
    const flattenedCategories = useMemo(() => {
        if (!data) return [];
        let flatList: any[] = [];
        data.forEach((parentItem: any) => {
            // Thêm danh mục cha
            flatList.push({
                CategoryID: parentItem.CategoryID,
                Name: parentItem.Name,
                Slug: parentItem.Slug,
                // Giữ lại icon nếu bạn muốn sử dụng nó cho mục cha,
                // dù CategoryMenuItem hiện tại không dùng
                icon: parentItem.icon
            });
            // Thêm các danh mục con nếu có
            if (parentItem.children && parentItem.children.length > 0) {
                parentItem.children.forEach((childItem: any) => {
                    flatList.push({
                        CategoryID: childItem.CategoryID,
                        Name: childItem.Name,
                        Slug: childItem.Slug
                    });
                });
            }
        });
        return flatList;
    }, [data]);


    if (error) return <div className="h-[30px] bg-red-100 flex items-center justify-center text-red-600 font-semibold">Lỗi tải danh mục!</div>
    if (!data || !activeTheme) return <div className="h-[30px] bg-gray-200 animate-pulse" />

    return (
        <div className={`md:sticky top-0 z-50 h-[30px] transition-all duration-300 ${activeTheme.navClass} ${isScrolled ? 'shadow-lg' : ''} flex items-center`}>
            <div className="container mx-auto px-4 w-full h-full flex items-center">
                <nav className="flex w-full h-full items-center">
                    <style jsx>{`
                        .hide-scrollbar::-webkit-scrollbar { 
                            display: none; 
                        }
                        .hide-scrollbar { 
                            -ms-overflow-style: none; 
                            scrollbar-width: none; 
                        }
                    `}</style>
                    {/* Map qua flattenedCategories để hiển thị tất cả cha và con trên một hàng */}
                    <div className="flex space-x-4 items-center mx-auto hide-scrollbar overflow-x-auto">
                        {flattenedCategories.map((item: any) => (
                            <CategoryMenuItem
                                key={item.CategoryID} // key vẫn là CategoryID
                                item={item}
                                theme={activeTheme}
                                isScrolled={isScrolled}
                            />
                        ))}
                    </div>
                </nav>
            </div>
        </div>
    )
}