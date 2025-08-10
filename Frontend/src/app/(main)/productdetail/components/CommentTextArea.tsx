// // src/app/(main)/productdetail/components/CommentTextArea.tsx

// 'use client';

// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { useState, useRef, useEffect } from "react"; 
// import { isProfane, cleanText } from "@/lib/profanityFilter";

// interface CommentTextAreaProps {
//   value: string;
//   onChange: (value: string) => void;
//   onProfanityChange: (isProfane: boolean) => void;
//   placeholder: string;
//   maxLength: number;
//   id: string;
// }

// export function CommentTextArea({ value, onChange, onProfanityChange, placeholder, maxLength, id }: CommentTextAreaProps) {
//   const [warning, setWarning] = useState<string | null>(null);
//   const textareaRef = useRef<HTMLTextAreaElement>(null);
//   const [cursorPosition, setCursorPosition] = useState<number | null>(null);

//   const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     const rawText = e.target.value;
//     const currentCursor = e.target.selectionStart;

//     const cleanedText = cleanText(rawText);
//     const hasProfanity = isProfane(rawText);

//     if (rawText !== cleanedText) {
//       setCursorPosition(currentCursor - (rawText.length - cleanedText.length));
//     }
    
//     if (hasProfanity) {
//       setWarning("Nội dung chứa từ ngữ không phù hợp.");
//     } else {
//       setWarning(null);
//     }
    
//     onProfanityChange(hasProfanity);
//     onChange(cleanedText);
//   };

//   useEffect(() => {
//     if (cursorPosition !== null && textareaRef.current) {
//       textareaRef.current.selectionStart = cursorPosition;
//       textareaRef.current.selectionEnd = cursorPosition;
//       setCursorPosition(null);
//     }
//   }, [cursorPosition, value]);

//   return (
//     <div className="flex-1 space-y-2">
//       <Label htmlFor={id} className="sr-only">{placeholder}</Label>
//       <Textarea
//         ref={textareaRef}
//         id={id}
//         placeholder={placeholder}
//         value={value}
//         onChange={handleTextChange}
//         className={`min-h-[80px] resize-y ${warning ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
//         maxLength={maxLength}
//       />
//       <div className="flex items-center justify-between">
//         <span className="text-xs text-red-600 h-4">{warning || ''}</span>
//         <span className="text-xs text-gray-500">{value.length}/{maxLength}</span>
//       </div>
//     </div>
//   );
// }

'use client';

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef, useEffect } from "react"; 
import { isProfane, cleanText } from "@/lib/profanityFilter";

interface CommentTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  onProfanityChange: (isProfane: boolean) => void;
  placeholder: string;
  maxLength: number;
  id: string;
}

export function CommentTextArea({ value, onChange, onProfanityChange, placeholder, maxLength, id }: CommentTextAreaProps) {
  const [warning, setWarning] = useState<string | null>(null);
  
  // --- BƯỚC 1: Thêm Ref và State để quản lý con trỏ ---
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const rawText = e.target.value;
    const currentCursor = e.target.selectionStart;

    // Lấy văn bản đã được lọc
    const cleanedText = cleanText(rawText);
    const hasProfanity = isProfane(rawText);
    
    // --- BƯỚC 2: Tính toán lại vị trí con trỏ nếu văn bản bị thay đổi ---
    if (rawText !== cleanedText) {
      // Tính số lượng ký tự đã bị xóa đi
      const diff = rawText.length - cleanedText.length;
      
      // Vị trí con trỏ mới sẽ là vị trí hiện tại trừ đi số ký tự đã mất.
      // Dùng Math.max để đảm bảo vị trí không bao giờ là số âm.
      const newCursorPos = Math.max(0, currentCursor - diff);
      
      // Lưu vị trí con trỏ mới này vào state để sử dụng ở Bước 3
      setCursorPosition(newCursorPos);
    } else {
      // Nếu không có từ nào bị lọc, không cần can thiệp vào vị trí con trỏ
      setCursorPosition(null);
    }
    
    if (hasProfanity) {
      setWarning("Nội dung chứa từ ngữ không phù hợp.");
    } else {
      setWarning(null);
    }
    
    // Cập nhật state ở component cha như bình thường
    onProfanityChange(hasProfanity);
    onChange(cleanedText);
  };

  // --- BƯỚC 3: Sử dụng useEffect để đặt lại vị trí con trỏ SAU KHI component đã render ---
  useEffect(() => {
    // Effect này sẽ chạy mỗi khi `cursorPosition` hoặc `value` thay đổi.
    // Nếu có một vị trí con trỏ đã được tính toán và lưu lại...
    if (cursorPosition !== null && textareaRef.current) {
      
      // ...thì ra lệnh cho trình duyệt đặt con trỏ của ô textarea về đúng vị trí đó.
      textareaRef.current.selectionStart = cursorPosition;
      textareaRef.current.selectionEnd = cursorPosition;
      
      // Sau khi đặt xong, reset lại state để effect này không chạy lại không cần thiết ở lần render sau
      setCursorPosition(null);
    }
  }, [cursorPosition, value]); // Dependencies của effect

  return (
    <div className="flex-1 space-y-2">
      <Label htmlFor={id} className="sr-only">{placeholder}</Label>
      <Textarea
        ref={textareaRef} // Gắn ref vào đây để có thể truy cập DOM của textarea
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={handleTextChange}
        className={`min-h-[80px] resize-y ${warning ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
        maxLength={maxLength}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-red-600 h-4">{warning || ''}</span>
        <span className="text-xs text-gray-500">{value.length}/{maxLength}</span>
      </div>
    </div>
  );
}