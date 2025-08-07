"use client"

import { useEffect, useState } from "react"
import { OrderHeader } from "./OrderHeader"
import { OrderItem, Order } from '@/types/order.interface'
import { ReviewProgress } from "./ReviewProgress"
import { ProductReviewCard } from "./ProductReviewCard"
import { SubmitSection } from "./SubmitSection"
export interface ProductReview {
  rating: number
  reviewText: string
  images: string[]
  videos: string[]
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
  const [hoverRatings, setHoverRatings] = useState<Record<string, number>>({})

  // Lấy orderId từ query
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const orderId = searchParams?.get('orderId')

  
  useEffect(() => {
    if (!orderId) return
    fetch(`/api/orders/${orderId}`)
      .then(res => res.json())
      .then((data: Order) => {
        setOrderInfo({
          id: data.OrderCode,
          date: data.OrderDate,
          status: data.OverallStatus,
          total: `${data.TotalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`
        })
        // Lấy tất cả items từ các shopOrders
        const allItems: OrderItem[] = []
        data.shopOrders.forEach(shopOrder => {
          shopOrder.items.forEach(item => {
            allItems.push(item)
          })
        })
        setItems(allItems)
        setProductReviews(allItems.reduce((acc, item) => ({
          ...acc,
          [item.OrderItemID]: {
            rating: 0,
            reviewText: "",
            images: [],
            videos: []
          }
        }), {}))
      })
  }, [orderId])

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000))
      setProductReviews(items.reduce((acc, item) => ({
        ...acc,
        [item.OrderItemID]: {
          rating: 0,
          reviewText: "",
          images: [],
          videos: []
        }
      }), {}))
    } catch (error) {
    } finally {
      setIsSubmitting(false)
    }
  }

  const completedCount = getCompletedReviews()
  const progressPercentage = items.length > 0 ? (completedCount / items.length) * 100 : 0

  return (
    <div className="min-h-screen">
      {orderInfo && <OrderHeader orderInfo={orderInfo} />}
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
          />
        ))}
        <SubmitSection
          completedCount={completedCount}
          totalCount={items.length}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmitAll}
        />
      </div>
    </div>
  )
}
