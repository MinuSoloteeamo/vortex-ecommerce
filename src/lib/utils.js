/**
 * Format price to Vietnamese currency format
 * @param {number} price
 * @returns {string}
 */
export function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

/**
 * Generate a slug from a string
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Generate order number
 * @returns {string}
 */
export function generateOrderNumber() {
  const date = new Date();
  const prefix = 'VTX';
  const timestamp = date.getFullYear().toString().slice(-2) +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Truncate text to a max length
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Calculate discount percentage
 * @param {number} originalPrice
 * @param {number} salePrice
 * @returns {number}
 */
export function calcDiscount(originalPrice, salePrice) {
  if (!salePrice || salePrice >= originalPrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

/**
 * Translate order status to Vietnamese
 * @param {string} status
 * @returns {string}
 */
export function translateOrderStatus(status) {
  const map = {
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    PROCESSING: 'Đang xử lý',
    SHIPPING: 'Đang giao hàng',
    DELIVERED: 'Đã giao hàng',
    CANCELLED: 'Đã huỷ',
  };
  return map[status] || status;
}

/**
 * Translate payment method to Vietnamese
 * @param {string} method
 * @returns {string}
 */
export function translatePaymentMethod(method) {
  const map = {
    COD: 'Thanh toán khi nhận hàng',
    BANK_TRANSFER: 'Chuyển khoản ngân hàng',
    VNPAY: 'VNPay',
    MOMO: 'Ví MoMo',
  };
  return map[method] || method;
}

/**
 * Remove Vietnamese diacritics from a string for search matching
 * Example: 'Chuột Gaming' → 'chuot gaming'
 * @param {string} str
 * @returns {string}
 */
export function removeVietnameseDiacritics(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd');
}
