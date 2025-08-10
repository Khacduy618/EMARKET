// // /shop/[shopId]/page.tsx
// "use client"

// import { useMemo, useState } from "react"
// import { ShopHeader } from "../components/shop-header"
// import { ShopSidebar } from "../components/shop-sidebar"
// import { ShopContent } from "../components/shop-content"
// import type { ShopInfo, Product } from "../types/shop"
// import { shopInfo as defaultShopInfo, products as allProducts, categories as allCategories } from "../data/shop-data"

// export default function ShopPage() {
//   const [shopInfo, setShopInfo] = useState<ShopInfo>(defaultShopInfo)
//   const [query, setQuery] = useState("")
//   const [category, setCategory] = useState<string>("all")
//   const [sortBy, setSortBy] = useState<"popular" | "newest" | "price-asc" | "price-desc">("popular")
//   const [priceMin, setPriceMin] = useState<string>("")
//   const [priceMax, setPriceMax] = useState<string>("")

//   const filtered: Product[] = useMemo(() => {
//     let list = [...allProducts]

//     // Search
//     if (query.trim()) {
//       const q = query.toLowerCase()
//       list = list.filter((p) => p.name.toLowerCase().includes(q))
//     }

//     // Category
//     if (category !== "all") {
//       list = list.filter((p) => p.category === category)
//     }

//     // Price
//     const min = priceMin ? Number(priceMin) : undefined
//     const max = priceMax ? Number(priceMax) : undefined
//     if (min !== undefined) list = list.filter((p) => p.price >= min)
//     if (max !== undefined) list = list.filter((p) => p.price <= max)

//     // Sort
//     switch (sortBy) {
//       case "popular":
//         list.sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0))
//         break
//       case "newest":
//         list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
//         break
//       case "price-asc":
//         list.sort((a, b) => a.price - b.price)
//         break
//       case "price-desc":
//         list.sort((a, b) => b.price - a.price)
//         break
//     }

//     return list
//   }, [query, category, sortBy, priceMin, priceMax])

//   return (
//     <main className="min-h-screen bg-gray-50">
//       <ShopHeader
//         info={shopInfo}
//         onToggleFollow={() =>
//           setShopInfo((prev) => ({
//             ...prev,
//             isFollowing: !prev.isFollowing,
//             followers: prev.isFollowing ? prev.followers - 1 : prev.followers + 1,
//           }))
//         }
//       />

//       <div className="max-w-7xl mx-auto p-2 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
//         {/* Sidebar */}
//         <aside className="lg:col-span-3">
//           <ShopSidebar
//             info={shopInfo}
//             categories={allCategories}
//             onSelectCategory={setCategory}
//             activeCategory={category}
//           />
//         </aside>

//         {/* Content */}
//         <section className="lg:col-span-9">
//           <ShopContent
//             products={filtered}
//             categories={allCategories}
//             query={query}
//             onQueryChange={setQuery}
//             category={category}
//             onCategoryChange={setCategory}
//             sortBy={sortBy}
//             onSortByChange={setSortBy}
//             priceMin={priceMin}
//             priceMax={priceMax}
//             onPriceMinChange={setPriceMin}
//             onPriceMaxChange={setPriceMax}
//           />
//         </section>
//       </div>
//     </main>
//   )
// }

"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { ShopHeader } from "../components/shop-header"
import { ShopSidebar } from "../components/shop-sidebar"
import { ShopContent } from "../components/shop-content"

import { Shop, Product } from "@/types"

// Helper để debounce (trì hoãn) việc gọi API khi người dùng gõ
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}


export default function ShopPage() {
  const params = useParams();
  const shopId = params.shopId as string;

  // State để lưu dữ liệu từ API
  const [data, setData] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State cho các bộ lọc
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"popular" | "newest" | "price-asc" | "price-desc">("popular")
  const [priceMin, setPriceMin] = useState<string>("")
  const [priceMax, setPriceMax] = useState<string>("")

  // Sử dụng debounce cho các input text để tránh gọi API liên tục
  const debouncedQuery = useDebounce(query, 500);
  const debouncedPriceMin = useDebounce(priceMin, 500);
  const debouncedPriceMax = useDebounce(priceMax, 500);

  // Hàm gọi API
  const fetchShopData = useCallback(async () => {
    if (!shopId) return;
    setIsLoading(true);
    
    // Xây dựng URL với các tham số query
    const urlParams = new URLSearchParams();
    if (debouncedQuery) urlParams.append('q', debouncedQuery);
    if (category) urlParams.append('category', category);
    if (sortBy) urlParams.append('sortBy', sortBy);
    if (debouncedPriceMin) urlParams.append('priceMin', debouncedPriceMin);
    if (debouncedPriceMax) urlParams.append('priceMax', debouncedPriceMax);

    try {
      const response = await fetch(`/api/shop/${shopId}?${urlParams.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: Shop = await response.json();
      
      // Chuyển đổi dữ liệu API về dạng component cần
      const shopInfoForComponent: Shop = {
          ...result.shopInfo,
          createdAt: result.shopInfo.joinedAt, // Ánh xạ trường
      };

      const productsForComponent: Product[] = result.products.map(p => ({
          ...p,
          // Đảm bảo các trường không có trong API nhưng có trong type được gán giá trị mặc định
          originalPrice: p.originalPrice ?? undefined,
          sold: p.sold ?? 0,
          rating: p.rating ?? 0,
          ratingCount: p.ratingCount ?? 0,
          badge: p.badge ?? undefined,
      }));
      
      setData({
          shopInfo: shopInfoForComponent as any, // Dùng 'as any' nếu type không khớp 100%
          products: productsForComponent,
          categories: result.categories,
      });

      setError(null);
    } catch (e: any) {
      setError("Không thể tải dữ liệu của shop. Vui lòng thử lại.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [shopId, debouncedQuery, category, sortBy, debouncedPriceMin, debouncedPriceMax]);

  // useEffect để gọi API khi các bộ lọc thay đổi
  useEffect(() => {
    fetchShopData();
  }, [fetchShopData]);
  
  // Hàm xử lý Follow/Unfollow
  const handleToggleFollow = async () => {
      if (!data) return;
      
      const originalFollowingState = data.shopInfo.isFollowing;
      const originalFollowers = data.shopInfo.followers;
      
      // Cập nhật giao diện ngay lập tức (Optimistic Update)
      setData(prev => prev ? ({
          ...prev,
          shopInfo: {
              ...prev.shopInfo,
              isFollowing: !originalFollowingState,
              followers: originalFollowingState ? originalFollowers - 1 : originalFollowers + 1
          }
      }) : null);
      
      // Gọi API
      try {
          const response = await fetch(`/api/shop/${shopId}`, { method: 'POST' });
          if (!response.ok) {
              // Nếu API lỗi, hoàn tác lại thay đổi trên giao diện
              throw new Error('API call failed');
          }
      } catch (error) {
           // Hoàn tác
           setData(prev => prev ? ({
              ...prev,
              shopInfo: {
                  ...prev.shopInfo,
                  isFollowing: originalFollowingState,
                  followers: originalFollowers
              }
           }) : null);
           alert('Không thể thay đổi trạng thái theo dõi. Vui lòng thử lại.');
      }
  }

  if (isLoading && !data) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Đang tải trang shop...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">{error}</div>;
  }

  if (!data) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Không tìm thấy shop.</div>;
  }
  
  return (
    <main className="min-h-screen bg-gray-50">
      <ShopHeader
        info={data.shopInfo}
        onToggleFollow={handleToggleFollow}
      />

      <div className="max-w-7xl mx-auto p-2 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-3">
          <ShopSidebar
            info={data.shopInfo}
            categories={data.categories}
            onSelectCategory={setCategory}
            activeCategory={category}
          />
        </aside>

        {/* Content */}
        <section className="lg:col-span-9">
          <ShopContent
            products={data.products}
            categories={data.categories} // Truyền danh mục để hiển thị thanh lọc nhanh
            query={query}
            onQueryChange={setQuery}
            category={category}
            onCategoryChange={setCategory}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            priceMin={priceMin}
            priceMax={priceMax}
            onPriceMinChange={setPriceMin}
            onPriceMaxChange={setPriceMax}
          />
        </section>
      </div>
    </main>
  )
}