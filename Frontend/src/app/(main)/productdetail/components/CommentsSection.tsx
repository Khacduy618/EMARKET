"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

type Comment = {
  id: string
  name: string
  avatar?: string
  content: string
  createdAt: string // formatted date string
}

const initialComments: Comment[] = [
  {
    id: "c1",
    name: "Nguyễn Văn A",
    avatar: "/placeholder.svg?height=40&width=40",
    content: "Sản phẩm tốt, đúng như mô tả. Giao hàng nhanh!",
    createdAt: "08/01/2024 14:30",
  },
  {
    id: "c2",
    name: "Trần Thị B",
    avatar: "/placeholder.svg?height=40&width=40",
    content: "Mình thấy chất vải ổn, mặc thoải mái.",
    createdAt: "09/01/2024 09:12",
  },
  {
    id: "c3",
    name: "Phạm Minh C",
    avatar: "/placeholder.svg?height=40&width=40",
    content: "Màu hơi khác so với hình nhưng vẫn đẹp.",
    createdAt: "10/01/2024 20:05",
  },
]

function formatNow(): string {
  try {
    return new Date().toLocaleString("vi-VN", {
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    } as Intl.DateTimeFormatOptions)
  } catch {
    const d = new Date()
    const pad = (n: number) => n.toString().padStart(2, "0")
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
}

export function CommentsSection() {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [value, setValue] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!value.trim()) return
    setIsSubmitting(true)
    // Simulate async
    await new Promise((r) => setTimeout(r, 600))
    setComments((prev) => [
      {
        id: `c_${Date.now()}`,
        name: "Bạn",
        avatar: "/placeholder.svg?height=40&width=40",
        content: value.trim(),
        createdAt: formatNow(),
      },
      ...prev,
    ])
    setValue("")
    setIsSubmitting(false)
  }

  return (
    <Card className="review-card">
      <CardContent className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Bình luận</h3>
          <span className="text-sm text-gray-500">{comments.length} bình luận</span>
        </div>

        {/* Input box */}
        <div className="flex gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src="/placeholder.svg?height=40&width=40" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Label htmlFor="comment-input" className="sr-only">Nhập bình luận</Label>
            <Textarea
              id="comment-input"
              placeholder="Viết bình luận của bạn..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="min-h-[80px] resize-y"
              maxLength={500}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{value.length}/500</span>
              <Button
                onClick={handleSubmit}
                disabled={!value.trim() || isSubmitting}
                className="shopee-orange"
              >
                {isSubmitting ? "Đang gửi..." : "Gửi bình luận"}
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Comments list */}
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarImage src={c.avatar || "/placeholder.svg?height=40&width=40&query=avatar"} />
                <AvatarFallback>{c.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-medium text-sm md:text-base">{c.name}</span>
                  <span className="text-xs text-gray-500">{c.createdAt}</span>
                </div>
                <p className="text-gray-800 text-sm md:text-base leading-relaxed">{c.content}</p>
                <div className="pt-1">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-orange-500 px-2">
                    Trả lời
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-sm text-gray-500">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
