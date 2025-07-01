"use client"

import { useEffect, useState } from "react"
import { Package, Store, Eye, Calendar, Tag, DollarSign, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"

interface Variant {
  VariantID: number
  SKU: string
  Price: number
  CompareAtPrice: number
  StockQuantity: number
  ImageURL: string
}

interface ProductDetail {
  ProductID: number
  Name: string
  Description: string
  Discount: number
  viewCount: number
  IsActive: boolean
  AdminApprovalStatus: string
  ReasonForRejection?: string
  CreatedAt: string
  UpdatedAt: string
  shop: {
    ShopName: string
    ShopPhone: string
  }
  category: {
    Name: string
  }
  images: {
    ImageURL: string
  }[]
  variants: Variant[]
}

export default function ProductDetailModal({
  productId,
  show,
  onHide,
}: {
  productId: number | null
  show: boolean
  onHide: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState<ProductDetail | null>(null)

  useEffect(() => {
    if (!productId) return
    const fetchDetail = async () => {
      setLoading(true)
      try {
        const res = await fetch(`http://localhost:8001/api/admin/products/${productId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        })
        const json = await res.json()
        if (json.status) {
          setProduct(json.data)
        }
      } catch (err) {
        console.error("Lỗi lấy chi tiết:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [productId])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-100 text-green-800">Đã duyệt</Badge>
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>
      case "Rejected":
        return <Badge className="bg-red-100 text-red-800">Từ chối</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Dialog open={show} onOpenChange={onHide}>
      <DialogContent className="!w-[70vw] !max-w-[1400px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="w-5 h-5 text-orange-500" />
            Chi tiết sản phẩm
          </DialogTitle>
          <DialogDescription>Thông tin chi tiết về sản phẩm trong hệ thống</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-3 text-gray-600">Đang tải...</span>
          </div>
        ) : product ? (
          <div className="space-y-6">
            {/* Product Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.Name}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    ID: {product.ProductID}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {product.viewCount.toLocaleString()} lượt xem
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(product.CreatedAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {getStatusBadge(product.AdminApprovalStatus)}
                <Badge className={product.IsActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                  {product.IsActive ? "Đang hiển thị" : "Đã ẩn"}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Product Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Thông tin cơ bản
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Mô tả sản phẩm</label>
                    <p className="mt-1 text-gray-900">{product.Description || "Không có mô tả"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Danh mục</label>
                    <p className="mt-1">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {product.category.Name}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Giảm giá</label>
                    <p className="mt-1 text-gray-900">{product.Discount}%</p>
                  </div>
                  {product.ReasonForRejection && (
                    <div>
                      <label className="text-sm font-medium text-red-600">Lý do từ chối</label>
                      <p className="mt-1 text-red-700 bg-red-50 p-2 rounded">{product.ReasonForRejection}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Shop Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="w-4 h-4" />
                    Thông tin shop
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/placeholder.svg?height=48&width=48" />
                      <AvatarFallback className="bg-orange-100 text-orange-600">
                        {product.shop.ShopName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">{product.shop.ShopName}</p>
                      <p className="text-sm text-gray-600">{product.shop.ShopPhone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Product Images */}
            {product.images && product.images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Hình ảnh sản phẩm</CardTitle>
                  <CardDescription>{product.images.length} hình ảnh</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {product.images.map((img, idx) => (
                      <div key={idx} className="aspect-square rounded-lg overflow-hidden border">
                        <img
                          src={img.ImageURL || "/placeholder.svg?height=120&width=120"}
                          alt={`Ảnh sản phẩm ${idx + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Product Variants */}
            {product.variants && product.variants.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Archive className="w-4 h-4" />
                    Biến thể sản phẩm
                  </CardTitle>
                  <CardDescription>{product.variants.length} biến thể</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>Ảnh</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Giá bán</TableHead>
                          <TableHead>Giá gốc</TableHead>
                          <TableHead>Tồn kho</TableHead>
                          <TableHead>Giảm giá</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {product.variants.map((variant) => {
                          const discountPercent =
                            variant.CompareAtPrice > 0
                              ? Math.round(((variant.CompareAtPrice - variant.Price) / variant.CompareAtPrice) * 100)
                              : 0

                          return (
                            <TableRow key={variant.VariantID}>
                              <TableCell>
                                <Avatar className="h-12 w-12 rounded-lg">
                                  <AvatarImage
                                    src={variant.ImageURL || "/placeholder.svg?height=48&width=48"}
                                    alt="Ảnh biến thể"
                                    className="object-cover"
                                  />
                                  <AvatarFallback className="rounded-lg bg-gray-100">
                                    <Package className="h-4 w-4 text-gray-400" />
                                  </AvatarFallback>
                                </Avatar>
                              </TableCell>
                              <TableCell>
                                <code className="bg-gray-100 px-2 py-1 rounded text-xs">{variant.SKU}</code>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3 text-green-600" />
                                  <span className="font-medium text-green-600">{variant.Price.toLocaleString()}₫</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-gray-500 line-through">
                                  {variant.CompareAtPrice.toLocaleString()}₫
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={variant.StockQuantity > 0 ? "default" : "destructive"}
                                  className={variant.StockQuantity > 0 ? "bg-green-100 text-green-800" : ""}
                                >
                                  {variant.StockQuantity} sản phẩm
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {discountPercent > 0 && (
                                  <Badge className="bg-red-100 text-red-800">-{discountPercent}%</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Không có dữ liệu sản phẩm</p>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onHide} variant="outline">
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
