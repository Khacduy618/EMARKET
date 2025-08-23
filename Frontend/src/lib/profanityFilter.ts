// src/lib/profanityFilter.ts

const vietnameseBadwords: string[] = [
    // --- Nhóm 1: Chửi thề, lăng mạ trực tiếp ---
    'đéo', 'đếch', 'đệch', 'đệt', 'đách', 'dcm', 'đcm', 'đkm', 'dkm', 'đmm', 'dmm',
    'mẹ kiếp', 'khốn nạn', 'tổ sư', 'thằng chó', 'con chó',

    // --- Nhóm 2: Từ ngữ liên quan đến bộ phận sinh dục (Nặng) ---
    'lồn', 'cặc', 'buồi', 'cu', 'chim', 'bướm', 'dái', 'âm vật', 'dương vật',
    'âm hộ', 'kẹc', 'lìn', 'loz', 'trứng dái',

    // --- Nhóm 3: Từ ngữ liên quan đến hành vi tình dục (Nặng) ---
    'địt', 'đụ', 'chịch', 'xoạc', 'nện', 'phang', 'giao cấu', 'hiếp dâm', 'đút',

    // --- Nhóm 4: Lăng mạ gia đình, cha mẹ (Rất nặng) ---
    'địt mẹ', 'đụ mẹ', 'đm', 'dm', 'đéo mẹ', 'địt con mẹ', 'đụ má', 'đù má',
    'mẹ mày', 'cha mày', 'má mày', 'bà cha mày', 'con mẹ mày', 'mả cha', 'mả mẹ',
    'tổ cha', 'địt cụ', 'bà mẹ mày',

    // --- Nhóm 5: Từ ngữ miệt thị, xúc phạm nhân phẩm ---
    'đĩ', 'điếm', 'phò', 'cave', 'súc vật', 'chó', 'cờ hó', 'chó đẻ',
    'chó chết', 'thứ súc sinh', 'đồ chó',

    // --- Nhóm 6: Từ ngữ miệt thị trí tuệ ---
    'óc chó', 'não chó', 'óc lợn', 'não lợn', 'ngu như chó', 'ngu như bò', 'ngu như lợn',
    'ngu', 'đần', 'đần độn', 'óc cứt', 'ngu si', 'ngu dốt',

    // --- Nhóm 7: Từ ngữ liên quan đến chất thải ---
    'cứt', 'ăn cứt', 'cức', 'ăn cức', 'đái', 'ỉa', 'phân',

    // --- Nhóm 8: Các cụm từ lăng mạ phổ biến ---
    'con cặc', 'cái lồn', 'cái cặc', 'cái buồi', 'củ cặc', 'lồn má', 'lồn mẹ',
    'cặc gì', 'buồi gì', 'lồn gì',

    // --- Nhóm 9: Tiếng lóng, từ viết tắt trên mạng ---
    'vcl', 'vl', 'vkl', 'vler', 'v~', 'vãi', 'vãi cả lồn', 'vãi cả cặc',
    'cc', 'cl', 'clgt', 'clmm', 'cclh',
    'gato',
    
    // --- Nhóm 10: Viết không dấu hoặc biến thể tiếng Anh ---
    'dit me', 'du ma', 'vlxx', 'dm', 'dcm', 'dkm', 'dmm',
    'dit', 'du', 'lon', 'cac', 'buoi', 'cu',
    'ngu', 'dan', 'suc vat', 'cho chet','cút'
];

/**
 * (ĐÃ CẬP NHẬT) Tạo một biểu thức chính quy (Regex) lớn từ toàn bộ danh sách.
 * 
 * - `|`: Là toán tử OR trong Regex, dùng để nối tất cả các từ cấm lại.
 * - `\b`: Word Boundary, đảm bảo chỉ khớp với các từ hoàn chỉnh.
 * - `gi`: g (global - tìm tất cả các từ khớp) và i (case-insensitive - không phân biệt hoa thường).
 */
const profaneRegex = new RegExp(`\\b(${vietnameseBadwords.join('|')})\\b`, 'gi');

/**
 * Kiểm tra xem văn bản có chứa từ cấm hay không.
 * @param text Văn bản cần kiểm tra.
 * @returns true nếu có từ cấm, ngược lại false.
 */export const isProfane = (text: string): boolean => {
  // Reset lại trạng thái của regex trước khi kiểm tra để đảm bảo chính xác
  profaneRegex.lastIndex = 0; 
  return profaneRegex.test(text);
};

/**
 * Làm sạch văn bản bằng cách XÓA BỎ các từ cấm.
 * @param text Văn bản cần làm sạch.
 * @returns Văn bản đã được làm sạch.
 */
export const cleanText = (text: string): string => {
  // Reset lại trạng thái của regex
  profaneRegex.lastIndex = 0;
  // Thay thế các từ cấm bằng chuỗi rỗng và xử lý khoảng trắng thừa.
  // ĐÃ XÓA .trim() để người dùng có thể gõ dấu cách ở cuối câu.
  return text.replace(profaneRegex, '').replace(/\s{2,}/g, ' ');
};