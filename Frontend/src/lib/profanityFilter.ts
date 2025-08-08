import { Filter } from 'bad-words';

// Danh sách từ cấm Tiếng Việt (bạn nên giữ danh sách này đồng bộ với backend)
const vietnameseBadwords = [
  '2 ngựa', 'am vật', 'ăn cứt', 'ăn cặc', 'ăn lồn',
  'bà cha mày', 'bà mẹ mày', 'buồi', 'buồi gì',
  'cặc', 'cặc gì', 'cái lồn', 'cái đéo', 'chịch',
  'cl', 'clgt', 'clmm', 'cmm', 'con cặc', 'con chó',
  'con mẹ mày', 'cờ hó', 'củ cặc', 'cứt', 'đái', 'đcm',
  'đéo', 'đéo mẹ', 'đĩ', 'đĩ mẹ', 'địt', 'địt mẹ',
  'địt mẹ mày', 'dmm', 'đụ', 'đụ má', 'đụ mẹ',
  'giao cấu', 'hiếp dâm', 'kẹc', 'lìn', 'lồn',
  'lồn gì', 'loz', 'mẹ mày', 'mẹ kiếp', 'óc chó', 'súc vật',
  // ... danh sách đầy đủ
];

// Tạo một instance của bộ lọc
const profanityFilter = new Filter();

// Thêm danh sách từ Tiếng Việt vào bộ lọc
profanityFilter.addWords(...vietnameseBadwords);

// Bạn có thể export instance hoặc các hàm tiện ích
export const isProfane = (text: string): boolean => {
  return profanityFilter.isProfane(text);
};

export const cleanText = (text: string): string => {
  return profanityFilter.clean(text); // Thay thế từ cấm bằng '***'
};

export default profanityFilter;