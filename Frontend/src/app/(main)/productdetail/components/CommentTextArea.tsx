// src/app/(main)/productdetail/components/CommentTextArea.tsx

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const rawText = e.target.value;
    const currentCursor = e.target.selectionStart;

    const cleanedText = cleanText(rawText);
    const hasProfanity = isProfane(rawText);

    if (rawText !== cleanedText) {
      setCursorPosition(currentCursor - (rawText.length - cleanedText.length));
    }
    
    if (hasProfanity) {
      setWarning("Nội dung chứa từ ngữ không phù hợp.");
    } else {
      setWarning(null);
    }
    
    onProfanityChange(hasProfanity);
    onChange(cleanedText);
  };

  useEffect(() => {
    if (cursorPosition !== null && textareaRef.current) {
      textareaRef.current.selectionStart = cursorPosition;
      textareaRef.current.selectionEnd = cursorPosition;
      setCursorPosition(null);
    }
  }, [cursorPosition, value]);

  return (
    <div className="flex-1 space-y-2">
      <Label htmlFor={id} className="sr-only">{placeholder}</Label>
      <Textarea
        ref={textareaRef}
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