import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function QASection() {
  return (
    <Card className="review-card">
      <CardContent className="p-4 md:p-6">
        <h3 className="text-lg font-semibold mb-4">Hỏi & Đáp</h3>
        <p className="text-gray-600 mb-4">Chưa có câu hỏi nào. Hãy là người đầu tiên đặt câu hỏi!</p>
        <Button className="shopee-orange">Đặt Câu Hỏi</Button>
      </CardContent>
    </Card>
  )
}
