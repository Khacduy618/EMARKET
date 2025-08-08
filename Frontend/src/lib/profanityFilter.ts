// src/lib/profanityFilter.ts

const vietnameseBadwords: string[] = [
  // Danh sách từ cấm của bạn (đã mở rộng từ lần trước)
  'đéo', 'đếch', 'đệch', 'đệt', 'mẹ kiếp', 'khốn nạn', 'tổ sư',
  'lồn', 'cặc', 'buồi', 'cu', 'chim', 'bướm', 'dái', 'âm vật', 'dương vật',
  'âm hộ', 'kẹc', 'lìn', 'loz',
  'địt', 'đụ', 'chịch', 'xoạc', 'nện', 'phang', 'giao cấu', 'hiếp dâm',
  'địt mẹ', 'đụ mẹ', 'đm', 'dm', 'dmm', 'đcm', 'dcm', 'cmm', 'đéo mẹ',
  'mẹ mày', 'cha mày', 'má mày', 'bà cha mày', 'con mẹ mày', 'mả cha', 'mả mẹ',
  'tổ cha', 'địt cụ', 'bà mẹ mày',
  'đĩ', 'điếm', 'phò', 'cave', 'súc vật', 'chó', 'cờ hó', 'chó đẻ',
  'chó chết', 'óc chó', 'não chó', 'óc lợn', 'não lợn', 'ngu như chó',
  'ngu như bò', 'ngu', 'đần', 'đần độn', 'óc cứt',
  'cứt', 'ăn cứt', 'đái', 'ỉa',
  'con cặc', 'cái lồn', 'cái cặc', 'cái buồi', 'củ cặc', 'lồn má', 'lồn mẹ',
  'cặc gì', 'buồi gì', 'lồn gì', 'đụ má', 'địt con mẹ',
  'vcl', 'vl', 'vkl', 'vler', 'v~',
  'cc', 'cl', 'clgt', 'clmm',
  'dkm', 'đkm',
  'dit me', 'du ma', 'vlxx',
  'dit', 'lon', 'cac', 'buoi',
  'nứng', 'thủ dâm'
];

/**
 * Hàm này biến đổi một từ cấm thành một biểu thức chính quy (Regex)
 * có khả năng phát hiện các biến thể của từ đó.
 * 
 * Ví dụ: 'ngu' -> /\b(n+g+u+)\b/i
 *   - \b: Word boundary - Đảm bảo nó khớp với một từ hoàn chỉnh (trước sau là khoảng trắng hoặc đầu/cuối chuỗi).
 *         Điều này ngăn chặn việc khớp sai, ví dụ 'đụ' trong 'lao động'.
 *   - (n+g+u+): Tạo một capturing group.
 *     - n+: Khớp với một hoặc nhiều ký tự 'n'. (Xử lý 'nnnnngu')
 *     - g+: Khớp với một hoặc nhiều ký tự 'g'. (Xử lý 'ngggggu')
 *     - u+: Khớp với một hoặc nhiều ký tự 'u'. (Xử lý 'nguuuuu')
 *   - \b: Word boundary ở cuối.
 *   - i: Flag ignore case - Không phân biệt chữ hoa/thường.
 */
const createProfanityRegex = (word: string): RegExp => {
  // Tách từ thành các ký tự và thêm dấu '+' sau mỗi ký tự
  const pattern = word.split('').map(char => {
    // Escape các ký tự đặc biệt của regex, ví dụ: '$', '^'
    // Mặc dù danh sách hiện tại không có, nhưng đây là một thói quen tốt
    const escapedChar = char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return escapedChar + '+';
  }).join('');
  
  // Ghép lại thành một biểu thức chính quy hoàn chỉnh
  // Sử dụng lookarounds (?<!\w) và (?!\w) thay cho \b để xử lý tốt hơn tiếng Việt có dấu
  // (?<!\w) : Negative lookbehind - Đảm bảo ký tự trước đó không phải là ký tự chữ
  // (?!\w)  : Negative lookahead - Đảm bảo ký tự sau đó không phải là ký tự chữ
  return new RegExp(`(?<!\\w)(${pattern})(?!\\w)`, 'gi');
};

// Tạo một mảng các Regex từ danh sách từ cấm
const profanityRegexList: RegExp[] = vietnameseBadwords.map(createProfanityRegex);

/**
 * Kiểm tra xem văn bản có chứa từ cấm hay không.
 * @param text Văn bản cần kiểm tra.
 * @returns true nếu có từ cấm, ngược lại false.
 */
export const isProfane = (text: string): boolean => {
  // Duyệt qua từng Regex trong danh sách
  for (const regex of profanityRegexList) {
    if (regex.test(text)) {
      // Nếu tìm thấy một từ khớp, trả về true ngay lập tức
      return true;
    }
  }
  // Nếu duyệt hết mà không tìm thấy, trả về false
  return false;
};

/**
 * Làm sạch văn bản, thay thế các từ cấm bằng dấu '*'.
 * @param text Văn bản cần làm sạch.
 * @returns Văn bản đã được làm sạch.
 */
export const cleanText = (text: string): string => {
  let cleanedText = text;
  // Duyệt qua từng Regex trong danh sách
  for (const regex of profanityRegexList) {
    // Sử dụng replace với một hàm callback để đảm bảo số lượng dấu '*'
    // khớp với độ dài của từ cấm được tìm thấy.
    cleanedText = cleanedText.replace(regex, (match) => '*'.repeat(match.length));
  }
  return cleanedText;
};