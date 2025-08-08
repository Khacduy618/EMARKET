import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState, useRef, useEffect } from "react"; 
import { isProfane, cleanText } from "@/lib/profanityFilter" 

interface ReviewTextAreaProps {
  value: string
  onChange: (value: string) => void
  productId: string
}

export function ReviewTextArea({ value, onChange, productId }: ReviewTextAreaProps) {
  const [warning, setWarning] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const rawText = e.target.value;
    const currentCursor = e.target.selectionStart;

    // Sử dụng hàm cleanText để tự động thay thế từ cấm
    const cleanedText = cleanText(rawText);

    // Chỉ cập nhật vị trí con trỏ nếu text thực sự đã bị thay đổi (bị censor)
    if (rawText !== cleanedText) {
      // Tính toán vị trí con trỏ mới để nó không bị nhảy lung tung
      // Cách đơn giản nhất là giữ nguyên vị trí cũ, nhưng có thể điều chỉnh nếu cần
      setCursorPosition(currentCursor - (rawText.length - cleanedText.length));
    }
    if (isProfane(rawText)) {
      setWarning("Nội dung chứa từ ngữ không phù hợp. Vui lòng chỉnh sửa.");
    } else {
      setWarning(null); // Xóa cảnh báo nếu không còn từ cấm
    }

    // Luôn gọi hàm onChange của component cha với text đã được làm sạch
    onChange(cleanedText);
  };

  // Sử dụng useEffect để đặt lại vị trí con trỏ sau khi component đã render xong
  useEffect(() => {
    if (cursorPosition !== null && textareaRef.current) {
      textareaRef.current.selectionStart = cursorPosition;
      textareaRef.current.selectionEnd = cursorPosition;
      // Reset lại state để effect không chạy lại không cần thiết
      setCursorPosition(null);
    }
  }, [cursorPosition, value]); // Chạy lại effect khi cursorPosition hoặc value thay đổi

  
  return (
    <div className="space-y-2">
      <Label htmlFor={`review-${productId}`}>Nội dung đánh giá *</Label>
      <Textarea
        ref={textareaRef}
        id={`review-${productId}`}
        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
        value={value}
        // onChange={(e) => onChange(e.target.value)}
        onChange={handleTextChange} 
        className="min-h-[100px] resize-none focus:ring-orange-500 focus:border-orange-500"
        maxLength={500}
      />
      {/* Hiển thị cảnh báo */}
      {warning && (
        <p className="text-xs text-red-600 mt-1">{warning}</p>
      )}

      <div className="text-right text-sm text-gray-500">
        <span className={value.length > 450 ? 'text-orange-500' : ''}>
          {value.length}/500
        </span>
      </div>
    </div>
  )
}
