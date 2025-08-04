export interface ShopStats {
  rating_count: string;
  product_count: number;
  follower_count: string;
  join_duration: string;
  response_rate: string;
  response_time: string;
  online_status: string;
}

// 2. Cập nhật interface Shop để bao gồm 'stats'
export interface Shop {
  ShopID: number;
  UserID: number;
  ShopName: string;
  Description: string;
  LogoURL: string;
  // ... các trường khác của shop
  UpdatedAt: string;
  stats: ShopStats; // <--- THÊM DÒNG NÀY
}

// Các interface khác (Product, Variant, Image...) giữ nguyên
export interface Product {
    // ...
    shop: Shop; // Đảm bảo trường này dùng interface Shop đã cập nhật
    // ...
}