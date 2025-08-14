"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { useRouter } from "next/navigation" // Thêm hook useRouter

// Components
import { ShopHeader } from "../components/shop-header"
import { ShopSidebar } from "../components/shop-sidebar"
import { ShopContent } from "../components/shop-content"
import { ShopContentSkeleton } from "../components/shop-content-skeleton"
import { toast } from "react-toastify"

// Types
import type { ShopInfoForUI, ProductForUI, ShopCategoryForUI } from "@/types"
import { API_URL } from "@/lib/config"

// === Định nghĩa các kiểu dữ liệu cho từng API Response ===
interface ShopDetailsResponse {
  shopInfo: ShopInfoForUI;
  categories: ShopCategoryForUI[];
}

interface ShopProductsResponse {
 data: ApiProductResponseItem[]; 
   current_page: number;
  last_page: number;
  total: number;
}
interface ApiProductResponseItem {
  ProductID: number;
  Name: string;
  SoldCount: number | null;
  CreatedAt: string;
  CategoryID: number | null;
  price: number | null;
  originalPrice: number | null;
  image: string | null;
  averageRating: number | null;
  ratingCount: number | null;
  discountPercent: number; // API giờ sẽ trả về trường này
}

// Helper debounce
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// === Hàm chuyển đổi dữ liệu ===
const mapApiProductToUiProduct = (p: ApiProductResponseItem): ProductForUI => ({
  id: p.ProductID,
  name: p.Name,
  image: p.image,
  price: p.price ?? 0,
  originalPrice: p.originalPrice,
  sold: p.SoldCount ?? 0,
  rating: p.averageRating ?? 0,
  ratingCount: p.ratingCount ?? 0,
  category: p.CategoryID?.toString() ?? 'unknown',
  createdAt: p.CreatedAt,
  discountPercent: p.discountPercent,
  badge: null,
});

export default function ShopPage() {
  const params = useParams();
  const shopId = params.shopId as string;
  const router = useRouter(); 
  // State tách biệt cho từng phần dữ liệu
  const [details, setDetails] = useState<ShopDetailsResponse | null>(null);
  const [products, setProducts] = useState<ProductForUI[]>([]);
  
  // State quản lý trạng thái loading
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State cho bộ lọc
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"popular" | "newest" | "price-asc" | "price-desc">("popular");
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");

  const debouncedQuery = useDebounce(query, 500);
  const debouncedPriceMin = useDebounce(priceMin, 500);
  const debouncedPriceMax = useDebounce(priceMax, 500);

  // --- API Call Functions ---
  const fetchProducts = useCallback(async () => {
    if (!shopId) return;
    setIsLoadingProducts(true);
    
    const urlParams = new URLSearchParams();
    if (debouncedQuery) urlParams.append('q', debouncedQuery);
    if (category) urlParams.append('category', category);
    if (sortBy) urlParams.append('sortBy', sortBy);
    if (debouncedPriceMin) urlParams.append('priceMin', debouncedPriceMin);
    if (debouncedPriceMax) urlParams.append('priceMax', debouncedPriceMax);

    try {
      const res = await fetch(`${API_URL}/shops/${shopId}/products?${urlParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data: ShopProductsResponse = await res.json();
      setProducts(data.data.map(mapApiProductToUiProduct));
    } catch (e) {
      setError("Không thể tải danh sách sản phẩm.");
    } finally {
      setIsLoadingProducts(false);
    }
  }, [shopId, API_URL, debouncedQuery, category, sortBy, debouncedPriceMin, debouncedPriceMax]);

  // Effect để gọi API chi tiết shop chỉ một lần
  useEffect(() => {
    const fetchDetails = async () => {
      if (!shopId) return;
      try {
        const res = await fetch(`${API_URL}/shops/${shopId}/details`, { credentials: 'include' });
        if (!res.ok) throw new Error("Shop not found");
        const data: ShopDetailsResponse = await res.json();
        setDetails(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoadingDetails(false);
      }
    };
    fetchDetails();
  }, [shopId, API_URL]);

  // Effect để gọi API sản phẩm khi bộ lọc thay đổi
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  const handleToggleFollow = async () => {
    if (!details) return;
    
    const originalInfo = details.shopInfo;
    const isCurrentlyFollowing = originalInfo.isFollowing;

    // Optimistic Update
    setDetails(prev => prev ? ({ 
      ...prev, 
      shopInfo: { 
        ...prev.shopInfo, 
        isFollowing: !isCurrentlyFollowing, 
        followers: isCurrentlyFollowing ? originalInfo.followers - 1 : originalInfo.followers + 1 
      } 
    }) : null);

    try {
      const response = await fetch(`${API_URL}/shops/${shopId}/toggle-follow`, { 
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        // Hoàn tác lại UI trước khi hiển thị thông báo lỗi
        setDetails(prev => prev ? ({ ...prev, shopInfo: originalInfo }) : null);

        if (response.status === 401) {
          // Hiển thị toast cảnh báo thay vì confirm
          toast.warn("Bạn cần đăng nhập để theo dõi shop!", {
            autoClose: 3000,
            onClick: () => router.push('/login'), // Cho phép click vào toast để chuyển trang
            style: { cursor: 'pointer' }
          });
        } else {
          // Lỗi server khác
          toast.error("Đã có lỗi xảy ra, vui lòng thử lại.", { autoClose: 3000 });
        }
        return; // Dừng hàm
      }

      // API thành công, hiển thị toast thành công
      if (isCurrentlyFollowing) {
        toast.success("Đã bỏ theo dõi shop.", { autoClose: 2000 });
      } else {
        toast.success("Đã theo dõi shop thành công!", { autoClose: 2000 });
      }
      
    } catch (error) {
      console.error("Failed to toggle follow:", error);
      // Hoàn tác lại UI nếu có lỗi mạng
      setDetails(prev => prev ? ({ ...prev, shopInfo: originalInfo }) : null);
      toast.error("Lỗi mạng, không thể kết nối đến máy chủ.", { autoClose: 3000 });
    }
  }

  // --- Render Logic ---
  if (isLoadingDetails) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Đang tải thông tin shop...</div>;
  }
  if (error && !details) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">{error}</div>;
  }
  if (!details) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Không tìm thấy shop.</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <ShopHeader
        info={details.shopInfo}
        onToggleFollow={handleToggleFollow}
      />
      <div className="max-w-7xl mx-auto p-2 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-3">
          <ShopSidebar
            info={details.shopInfo}
            categories={details.categories}
            onSelectCategory={setCategory}
            activeCategory={category}
          />
        </aside>
        <section className="lg:col-span-9">
          {/* Toolbar luôn hiển thị */}
          <ShopContent
                // Các props khác vẫn như cũ
                products={products}
                categories={details.categories}
                query={query} onQueryChange={setQuery}
                category={category} onCategoryChange={setCategory}
                sortBy={sortBy} onSortByChange={setSortBy}
                priceMin={priceMin} onPriceMinChange={setPriceMin}
                priceMax={priceMax} onPriceMaxChange={setPriceMax}
                // Truyền prop isLoading và component skeleton
                isLoading={isLoadingProducts}
            >
            {/* Sử dụng children để truyền skeleton */}
            {isLoadingProducts ? <ShopContentSkeleton /> : null}
          </ShopContent>
        </section>
      </div>
    </main>
  );
}

// Bạn cần sửa lại ShopContent để chấp nhận children
// /shop/components/shop-content.tsx

// ... interface Props { ... children?: React.ReactNode }
// export function ShopContent({ ... children }) {
//   ...
//   {/* Grid */}
//   {isLoadingProducts ? (
//       children // Hiển thị skeleton
//   ) : products.length === 0 ? (
//       <Card>...</Card>
//   ) : (
//       <div className="grid ...">{products.map(...)}</div>
//   )}
// }