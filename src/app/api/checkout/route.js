import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { createAdminNotification } from '@/lib/notification';
import crypto from 'crypto';
import { sendOrderConfirmationEmail } from '@/lib/mail';

function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `VTX-${dateStr}-${randomStr}`;
}

export async function POST(req) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ message: 'Bạn cần đăng nhập để đặt hàng' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    
    // Trích xuất thông tin người nhận, địa chỉ, mã giảm giá từ body request
    const {
      recipientName,
      recipientPhone,
      shippingAddress,
      note,
      paymentMethod,
      items,
      couponCode, // Nhận mã giảm giá từ frontend (nếu có)
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ message: 'Giỏ hàng trống' }, { status: 400 });
    }

    const orderNumber = generateOrderNumber();

    // 1. Kiểm tra thông tin người dùng và hạng VIP
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // 2. Lấy thông tin sản phẩm từ DB để tính giá tạm tính chuẩn xác (chống gian lận giá từ frontend)
    const productIds = items.map(item => item.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    let subtotal = 0;
    const finalOrderItems = [];

    for (const item of items) {
      const dbProduct = dbProducts.find(p => p.id === item.productId);
      if (!dbProduct || !dbProduct.isActive) {
        return NextResponse.json({ message: `Sản phẩm không hợp lệ: ${item.productId}` }, { status: 400 });
      }

      let priceToUse = dbProduct.salePrice || dbProduct.price;
      let variantName = null;
      let variantId = item.variantId || null;

      // Kiểm tra tồn kho của biến thể sản phẩm (nếu có chọn biến thể)
      if (variantId) {
        const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
        if (!variant || variant.stock < item.quantity) {
          return NextResponse.json({ message: `Biến thể không hợp lệ hoặc hết hàng: ${variant?.name || variantId}` }, { status: 400 });
        }
        priceToUse += variant.priceOffset;
        variantName = variant.name;
      } else {
        if (dbProduct.stock < item.quantity) {
          // Sản phẩm gốc hết hàng → Kiểm tra xem có biến thể nào còn hàng để tự động thay thế (Auto-fallback) không
          const availableVariants = await prisma.productVariant.findMany({
            where: { productId: item.productId, stock: { gte: item.quantity } },
            orderBy: { createdAt: 'desc' },
            take: 1
          });

          if (availableVariants.length > 0) {
            // Tự động chuyển sang biến thể còn hàng
            const fallbackVariant = availableVariants[0];
            variantId = fallbackVariant.id;
            variantName = fallbackVariant.name;
            priceToUse += fallbackVariant.priceOffset;
          } else {
            return NextResponse.json({ message: `Sản phẩm hết hàng: ${dbProduct.name}` }, { status: 400 });
          }
        }
      }

      subtotal += priceToUse * item.quantity;
      
      finalOrderItems.push({
        productId: item.productId,
        variantId: variantId,
        variantName: variantName,
        quantity: item.quantity,
        price: priceToUse,
      });
    }

    // 3. Tính toán mức giảm giá dành cho hạng VIP
    let vipDiscountPercent = 0;
    switch (user.vipTier) {
      case 'DIAMOND': vipDiscountPercent = 0.10; break;
      case 'GOLD': vipDiscountPercent = 0.05; break;
      case 'SILVER': vipDiscountPercent = 0.02; break;
      case 'MEMBER':
      default: vipDiscountPercent = 0; break;
    }
    const vipDiscountAmount = Math.floor(subtotal * vipDiscountPercent);
    let totalAfterVip = subtotal - vipDiscountAmount;

    // 4. Tính toán mức giảm giá từ Mã giảm giá (Coupon)
    let couponDiscountAmount = 0;
    let validCouponCode = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() }
      });

      if (coupon && coupon.isActive && new Date() <= new Date(coupon.validUntil) && coupon.usedCount < coupon.maxUsage) {
        if (totalAfterVip >= coupon.minOrderValue) {
          // Kiểm tra xem người dùng đã từng sử dụng mã giảm giá này chưa
          const alreadyUsed = await prisma.order.findFirst({
            where: { userId, couponCode: coupon.code, status: { not: 'CANCELLED' } }
          });
          
          if (!alreadyUsed) {
            validCouponCode = coupon.code;
            if (coupon.discountPercent) {
              couponDiscountAmount = Math.floor(totalAfterVip * (coupon.discountPercent / 100));
            } else if (coupon.discountAmount) {
              couponDiscountAmount = coupon.discountAmount;
            }
            
            // Đảm bảo số tiền giảm không vượt quá tổng giá trị đơn hàng
            if (couponDiscountAmount > totalAfterVip) {
              couponDiscountAmount = totalAfterVip;
            }
          }
        }
      }
    }

    const totalDiscountAmount = vipDiscountAmount + couponDiscountAmount;
    let totalAfterDiscounts = subtotal - totalDiscountAmount;

    // 5. Tính phí vận chuyển (Miễn phí ship cho GOLD/DIAMOND hoặc đơn >= 1.000.000đ)
    let shippingFee = 30000;
    if (user.vipTier === 'GOLD' || user.vipTier === 'DIAMOND' || totalAfterDiscounts >= 1000000) {
      shippingFee = 0; // Miễn phí giao hàng
    }

    const finalTotalAmount = totalAfterDiscounts + shippingFee;

    // 6. Tính số điểm tích lũy V-Points kiếm được từ đơn hàng (cứ 10.000đ = 1 điểm)
    const earnedPoints = Math.floor(finalTotalAmount / 10000);
    const newTotalPoints = (user.points || 0) + earnedPoints;

    // Xác định hạng VIP mới dựa trên tổng điểm tích lũy
    let newVipTier = 'MEMBER';
    if (newTotalPoints >= 5000) newVipTier = 'DIAMOND';
    else if (newTotalPoints >= 2000) newVipTier = 'GOLD';
    else if (newTotalPoints >= 500) newVipTier = 'SILVER';

    // Thực hiện Giao dịch an toàn (Transaction) tạo đơn hàng, trừ kho, cộng điểm
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          totalAmount: finalTotalAmount,
          shippingFee,
          discount: totalDiscountAmount,
          recipientName,
          recipientPhone,
          shippingAddress,
          note,
          paymentMethod,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          couponCode: validCouponCode,
        }
      });

      const orderItemsData = finalOrderItems.map(item => ({
        orderId: newOrder.id,
        productId: item.productId,
        variantId: item.variantId,
        variantName: item.variantName,
        quantity: item.quantity,
        price: item.price,
      }));

      await tx.orderItem.createMany({
        data: orderItemsData,
      });

      if (validCouponCode) {
        await tx.coupon.update({
          where: { code: validCouponCode },
          data: { usedCount: { increment: 1 } }
        });
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          points: newTotalPoints,
          vipTier: newVipTier,
        }
      });

      // Cập nhật số lượng tồn kho và lượt bán của sản phẩm
      for (const item of finalOrderItems) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } }
          });
          // Tăng số lượt đã bán của sản phẩm
          await tx.product.update({
            where: { id: item.productId },
            data: { soldCount: { increment: item.quantity } }
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
              soldCount: { increment: item.quantity }
            }
          });
        }
      }

      // Đánh dấu chuyển đổi mua hàng thành công cho phân tích Analytics
      await tx.productView.updateMany({
        where: {
          userId: userId,
          productId: { in: finalOrderItems.map(i => i.productId) }
        },
        data: {
          converted: true
        }
      });

      return newOrder;
    });

    // 7. Phát thông báo đến Admin
    await createAdminNotification(
      '📦 Đơn hàng mới',
      `Khách hàng ${recipientName} vừa đặt đơn hàng ${order.orderNumber} trị giá ${finalTotalAmount.toLocaleString('vi-VN')}đ`,
      'ORDER_PLACED',
      `/admin/orders`
    );

    // Kiểm tra sản phẩm sắp hết hàng (stock < 5) để phát cảnh báo tồn kho cho Admin
    for (const item of finalOrderItems) {
      const dbProduct = dbProducts.find(p => p.id === item.productId);
      const remainingStock = dbProduct.stock - item.quantity;
      if (remainingStock < 5) {
        await createAdminNotification(
          '⚠️ Cảnh báo tồn kho',
          `Sản phẩm "${dbProduct.name}" sắp hết hàng (chỉ còn ${remainingStock} cái).`,
          'LOW_STOCK',
          `/admin/products`
        );
      }
    }

    // Phát thông báo chúc mừng thăng hạng VIP cho người dùng (nếu có thăng hạng)
    if (user.vipTier !== newVipTier) {
      const { createUserNotification } = await import('@/lib/notification');
      await createUserNotification(
        userId,
        '🌟 Thăng hạng VIP thành công',
        `Chúc mừng bạn đã chính thức thăng hạng lên ${newVipTier}! Khám phá ngay các đặc quyền mới dành riêng cho bạn.`,
        'VIP_UPGRADE',
        '/account/vip'
      );
    }

    // Gửi email xác nhận đơn hàng (đối với phương thức thanh toán COD)
    if (paymentMethod === 'COD') {
      const orderItemsForEmail = finalOrderItems.map(item => {
        const dbProduct = dbProducts.find(p => p.id === item.productId);
        return {
          ...item,
          product: { name: dbProduct?.name || 'Sản phẩm' }
        };
      });
      if (user.email) {
        sendOrderConfirmationEmail(user.email, order, orderItemsForEmail).catch(console.error);
      }
    }

    return NextResponse.json({ 
      message: 'Đặt hàng thành công', 
      orderId: order.id,
      orderNumber: order.orderNumber 
    }, { status: 201 });

  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json({ message: 'Đã xảy ra lỗi khi đặt hàng' }, { status: 500 });
  }
}
