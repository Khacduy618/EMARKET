"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Check, MessageCircle, UserPlus } from "lucide-react"
// Thay đổi import type ở đây
import type { ShopInfoForUI as ShopInfo } from "@/types"
import { getFullImageUrl } from "@/services/api"


interface Props {
  info: ShopInfo
  onToggleFollow?: () => void
}

export function ShopHeader({ info, onToggleFollow }: Props) {
  // Toàn bộ JSX giữ nguyên vì tên trường đã khớp
  const bannerUrl = getFullImageUrl(info.banner);
  const avatarUrl = getFullImageUrl(info.avatar);
  return (
    <div className="bg-white border-b">
      {/* Banner */}
      <div
        className="h-44 md:h-55 w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${bannerUrl})` }}
        aria-hidden="true"
      />

      {/* Info */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-4 md:pb-6">
        <div className="flex items-start -mt-10 md:-mt-12 gap-4 md:gap-6">
          <Avatar className="w-20 h-20 md:w-24 md:h-24 ring-2 ring-white shadow-md">
            <AvatarImage
              src={avatarUrl}
              alt={`Avatar ${info.name}`}
            />
            <AvatarFallback>{info.name?.[0]?.toUpperCase() || "S"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="flex items-center flex-wrap gap-2">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">{info.name}</h1>
                  {info.isVerified && <Badge className="bg-green-500 hover:bg-green-600">Chính hãng</Badge>}
                </div>
                <div className="flex items-center flex-wrap gap-4 text-sm text-gray-600 mt-1">
                  <div className="flex items-center gap-1">
                    <span className="text-orange-500 font-semibold">{info.rating.toFixed(1)}</span>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i <= Math.round(info.rating) ? "fill-orange-500 text-orange-500" : "text-gray-300"}`}
                      />
                    ))}
                    <span className="ml-2">{info.ratingCount.toLocaleString()} đánh giá</span>
                  </div>
                  <div>
                    <span className="font-medium">{info.followers.toLocaleString()}</span> người theo dõi
                  </div>
                  <div>
                    <span className="font-medium">{info.productsCount}</span> sản phẩm
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" className="font-medium bg-transparent">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat
                </Button>
                <Button
                  className={`font-medium ${info.isFollowing ? "bg-gray-200 text-gray-800 hover:bg-gray-300" : "bg-orange-500 hover:bg-orange-600 text-white"}`}
                  onClick={onToggleFollow}
                >
                  {info.isFollowing ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Đang theo dõi
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Theo dõi
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Quick stats row */}
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <Stat label="Tỉ lệ phản hồi chat" value={`${info.chatResponseRate}%`} />
              <Stat label="Thời gian phản hồi" value={info.responseSpeed} />
              <Stat label="Tỉ lệ giao đúng hạn" value={`${info.onTimeDeliveryRate}%`} />
              <Stat label="Tham gia" value={info.joinedAt} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded border p-2">
      <div className="text-gray-500">{label}</div>
      <div className="font-medium text-gray-900">{value}</div>
    </div>
  )
}