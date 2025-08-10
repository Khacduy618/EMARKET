// /shop/types/shop-ui.types.ts

/**
 * Các interface trong file này đóng vai trò là "View Model" hay "UI Types".
 * Chúng định nghĩa cấu trúc dữ liệu mà các component React (ShopHeader, ProductCard,...)
 * thực sự cần để hiển thị. Dữ liệu thô từ API sẽ được "ánh xạ" (map)
 * sang các kiểu dữ liệu này trước khi được truyền vào component.
 */

// Kiểu dữ liệu cho các component ShopHeader, ShopSidebar
export interface ShopInfoForUI {
  id: number;
  name: string;
  avatar: string | null;
  banner: string | null;
  rating: number;
  ratingCount: number;
  followers: number;
  productsCount: number;
  isFollowing: boolean;
  isVerified: boolean; // Dựa trên shop.Level === 'Mall'
  chatResponseRate: number;
  responseSpeed: string;
  onTimeDeliveryRate: number;
  joinedAt: string; // Đã được định dạng
}

// Kiểu dữ liệu cho component ProductCard
export interface ProductForUI {
  id: number;
  name: string;
  image: string | null;
  price: number;
  originalPrice?: number | null;
  sold?: number;
  rating?: number;
  ratingCount?: number;
  category: string; // Giữ ở dạng string (CategoryID)
  createdAt: string;
  badge?: string | null;
  discountPercent?: number; 
}

// Kiểu dữ liệu cho danh mục
export interface ShopCategoryForUI {
  key: string;
  label: string;
  count: number;
}

// Kiểu dữ liệu tổng hợp cho state của trang ShopPage
export interface ShopPageDataForUI {
    shopInfo: ShopInfoForUI;
    products: ProductForUI[];
    categories: ShopCategoryForUI[];
}