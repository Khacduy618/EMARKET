"use client"

import { useEffect, useState } from "react"
import { OrderHeader } from "./OrderHeader"
import { OrderItem, Order } from '@/types/order.interface'
import { ReviewProgress } from "./ReviewProgress"
import { ProductReviewCard } from "./ProductReviewCard"
import { SubmitSection } from "./SubmitSection"
import { toast } from "react-toastify"
import { Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { API_URL } from "@/lib/config"
export interface ProductReview {
  rating: number
  reviewText: string
  images: (string | File)[]
  videos: (string | File)[]
}

export interface Product {
  id: string
  name: string
  image: string
  price: string
  variant: string
  quantity: number
}

export interface OrderInfo {
  id: string
  date: string
  status: string
  total: string
}

export default function MultiProductReviewPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [productReviews, setProductReviews] = useState<Record<string, ProductReview>>({})
  const [profanityStatus, setProfanityStatus] = useState<Record<string, boolean>>({});
  const [hoverRatings, setHoverRatings] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy orderId từ query
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  
  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setError('Mã đơn hàng không hợp lệ.');
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`${API_URL}/orders/${orderId}`,{
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                    credentials: 'include', // Quan trọng để gửi cookie
                })
      .then(res => {
        if (!res.ok) {
          throw new Error(res.status === 404 ? 'Không tìm thấy đơn hàng.' : 'Không thể tải chi tiết đơn hàng.');
        }
        return res.json();
      })
      .then((data: Order) => {
        // Nếu đơn hàng đã đánh giá thì chuyển hướng
        
        if (data.OverallStatus === 'Rated') {
          toast.info('Đơn hàng này đã được đánh giá trước đó.', { autoClose: 3000 });
          window.location.href = '/account/purchase';
          return;
        }
        setOrderInfo({
          id: data.OrderCode,
          date: data.OrderDate,
          status: data.OverallStatus,
          total: `${data.TotalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`
        });
        console.log('Order info:', {
          id: data.OrderCode,
          date: data.OrderDate,
          status: data.OverallStatus,
          total: `${data.TotalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`
        });
        // Lấy tất cả items từ các shopOrders
        const allItems: OrderItem[] = [];
        data.shopOrders.forEach(shopOrder => {
          shopOrder.items.forEach(item => {
            allItems.push(item);
          });
        });
        setItems(allItems);
        setProductReviews(allItems.reduce((acc, item) => ({
          ...acc,
          [item.OrderItemID]: {
            rating: 0,
            reviewText: "",
            images: [],
            videos: []
          }
        }), {}));
      })
      .catch((err: any) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [orderId]);

  const updateProfanityStatus = (productId: string, isProfane: boolean) => {
    setProfanityStatus(prev => ({
      ...prev,
      [productId]: isProfane
    }));
  };

  const updateProductReview = (productId: string, field: keyof ProductReview, value: any) => {
    setProductReviews(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }))
  }

  const getCompletedReviews = () => {
    return Object.values(productReviews).filter(review => 
      review.rating > 0 && review.reviewText.trim().length > 0
    ).length
  }

  const handleSubmitAll = async () => {
    const incompleteItems = items.filter(item => {
      const review = productReviews[item.OrderItemID]
      return review.rating === 0 || !review.reviewText.trim()
    })
    if (incompleteItems.length > 0) {
      return
    }
    setIsSubmitting(true)
    try {
      // Chuẩn bị FormData để gửi file thật
      const formData = new FormData();
      formData.append('orderId', orderId || '');
      const reviewsArr: Array<{
        productId: string | number;
        rating: number;
        reviewText: string;
        images: string[]; 
        videos: string[];
      }> = [];
      items.forEach((item, idx) => {
        const review = productReviews[item.OrderItemID];
        const reviewObj: {
          productId: string | number;
          rating: number;
          reviewText: string;
          images: string[]; 
          videos: string[];
        } = {
          productId: item.OrderItemID, // Đúng là VariantID để backend nhận đúng
          rating: review.rating,
          reviewText: review.reviewText,
          images: [] as string[],
          videos: [] as string[],
        };
        // Xử lý images
        if (Array.isArray(review.images)) {
          review.images.forEach((img) => {
            if (img instanceof File) {
              formData.append(`images[${idx}][]`, img);

              // Không push blob URL vào reviewObj.images
            } else if (typeof img === 'string') {
              // Chỉ push nếu là URL thật (không phải blob)
              if (!img.startsWith('blob:')) {
                reviewObj.images.push(img);
              }
            }
          });
        }
        // Xử lý videos
        if (Array.isArray(review.videos)) {
          review.videos.forEach((vid) => {
            if (vid instanceof File) {
              formData.append(`videos[${idx}][]`, vid);
              // Không push blob URL vào reviewObj.videos
            } else if (typeof vid === 'string') {
              // Chỉ push nếu là URL thật (không phải blob)
              if (!vid.startsWith('blob:')) {
                reviewObj.videos.push(vid);
              }
            }
          });
        }
        reviewsArr.push(reviewObj);
      });
      console.log('--- Submitting Review FormData ---');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      console.log('---------------------------------');

      formData.append('reviews', JSON.stringify(reviewsArr));
      const res = await fetch(`${API_URL}/reviews/store`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json' 
        },
        body: formData
      });
      const result = await res.json();
      if (result.success) {
        setProductReviews(items.reduce((acc, item) => ({
          ...acc,
          [item.OrderItemID]: {
            rating: 0,
            reviewText: "",
            images: [],
            videos: []
          }
        }), {}))
        setOrderInfo(prev => prev ? { ...prev, status: 'Rated' } : prev);
        //Redirect to purchase history
        window.location.href = '/account/purchase';
        console.log('All reviews saved successfully:', result);
        toast.success('Gửi đánh giá thành công!', { autoClose: 3000 });
      } else {
        toast.error(result.error || 'Gửi đánh giá thất bại!', { autoClose: 4000 });
      }
    } catch (error: any) {
      toast.error(error?.message || 'Có lỗi xảy ra khi gửi đánh giá!', { autoClose: 4000 });
    } finally {
      setIsSubmitting(false)
    }
  }

  const completedCount = getCompletedReviews()
  const progressPercentage = items.length > 0 ? (completedCount / items.length) * 100 : 0
  const containsProfanity = Object.values(profanityStatus).some(isProfane => isProfane);
  
  // Xử lý loading và error giống page order id
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        <p className="ml-4 text-lg">Đang tải chi tiết đơn hàng...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-20 text-red-500 bg-gray-100">{error}</div>;
  }

  if (!orderInfo) {
    return <div className="text-center py-20 bg-gray-100">Không có dữ liệu đơn hàng để hiển thị.</div>;
  }

  // Nếu đơn hàng đã đánh giá thì không hiển thị nút đánh giá
  const isRated = orderInfo?.status === 'Rated';
  return (
    <div className="min-h-screen">
      <OrderHeader orderInfo={orderInfo} />
      <div className="max-w-6xl mx-auto pt-4 space-y-6">
        <ReviewProgress 
          completed={completedCount} 
          total={items.length} 
          percentage={progressPercentage} 
        />
        {items.map((item, index) => (
          <ProductReviewCard
            key={item.OrderItemID}
            product={{
              id: item.OrderItemID.toString(),
              name: item.productName,
              image: item.productImageURL,
              price: `${item.PriceAtPurchase.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`,
              variant: item.classification,
              quantity: item.Quantity
            }}
            review={productReviews[item.OrderItemID]}
            hoverRating={hoverRatings[item.OrderItemID] || 0}
            isLast={index === items.length - 1}
            onUpdateReview={updateProductReview}
            onSetHoverRating={(rating) => setHoverRatings(prev => ({ ...prev, [item.OrderItemID]: rating }))}
            onUpdateProfanityStatus={updateProfanityStatus}
          />
        ))}
        {!isRated && (
          <SubmitSection
            completedCount={completedCount}
            totalCount={items.length}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmitAll}
            containsProfanity={containsProfanity}
          />
        )}
      </div>
    </div>
  );
}
