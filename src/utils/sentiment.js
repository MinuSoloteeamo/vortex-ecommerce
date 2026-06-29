/**
 * Phân tích sắc thái bình luận (Sentiment Analysis) mini cho Tiếng Việt
 */

// Các từ mang ý nghĩa tích cực
const positiveWords = [
  'tốt', 'ngon', 'tuyệt', 'tuyệt vời', 'xịn', 'mượt', 'đẹp', 'chất', 'ổn',
  'ok', 'ưng', 'chuẩn', 'nhanh', 'đáng tiền', 'sang', 'thích'
];

// Các từ mang ý nghĩa tiêu cực
const negativeWords = [
  'tệ', 'chán', 'lỗi', 'hỏng', 'vỡ', 'lag', 'đơ', 'đắt', 'kém', 'xấu',
  'bực', 'thất vọng', 'dở', 'chậm', 'móp', 'trầy', 'xước'
];

// Các từ phủ định sẽ đảo ngược sắc thái của từ ngay sau nó
const negationWords = [
  'không', 'chả', 'chưa', 'kém', 'đếch', 'đừng'
];

/**
 * Hàm phân tích và trả về nhãn sắc thái
 * @param {string} text - Nội dung bình luận
 * @returns {object} { score: number, label: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' }
 */
export function analyzeSentiment(text) {
  if (!text || typeof text !== 'string') return { score: 0, label: 'NEUTRAL' };

  // Chuẩn hóa chuỗi: chữ thường, bỏ dấu câu đặc biệt
  const normalizedText = text.toLowerCase().replace(/[.,!?;:()]/g, ' ');
  const words = normalizedText.split(/\s+/).filter(w => w.length > 0);

  let score = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    
    // Kiểm tra xem từ trước đó có phải từ phủ định không
    let isNegated = false;
    if (i > 0 && negationWords.includes(words[i - 1])) {
      isNegated = true;
    }

    if (positiveWords.includes(word)) {
      score += isNegated ? -1 : 1;
    } else if (negativeWords.includes(word)) {
      score += isNegated ? 1 : -1;
    }
  }

  // Xác định nhãn dựa trên tổng điểm
  let label = 'NEUTRAL';
  if (score > 0) label = 'POSITIVE';
  if (score < 0) label = 'NEGATIVE';

  return { score, label };
}
