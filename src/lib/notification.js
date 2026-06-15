import { prisma } from './prisma';

/**
 * Tạo thông báo cho một User cụ thể
 * @param {string} userId - ID của User
 * @param {string} title - Tiêu đề thông báo
 * @param {string} message - Nội dung chi tiết
 * @param {string} type - Loại thông báo (VD: POINTS_REDEEMED, CART_ADDED)
 * @param {string} link - Link điều hướng (tuỳ chọn)
 */
export async function createUserNotification(userId, title, message, type, link = null) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        targetRole: 'USER',
        title,
        message,
        type,
        link,
        isRead: false
      }
    });
  } catch (error) {
    console.error('Failed to create user notification', error);
    return null;
  }
}

/**
 * Tạo thông báo hệ thống cho toàn bộ Admin
 * @param {string} title - Tiêu đề thông báo
 * @param {string} message - Nội dung chi tiết
 * @param {string} type - Loại thông báo (VD: ORDER_PLACED, LOW_STOCK, SUPPORT_MSG)
 * @param {string} link - Link điều hướng (tuỳ chọn)
 */
export async function createAdminNotification(title, message, type, link = null) {
  try {
    return await prisma.notification.create({
      data: {
        userId: null,
        targetRole: 'ADMIN',
        title,
        message,
        type,
        link,
        isRead: false
      }
    });
  } catch (error) {
    console.error('Failed to create admin notification', error);
    return null;
  }
}
