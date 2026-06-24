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
    
    // Extract coupon if any
    const {
      recipientName,
      recipientPhone,
      shippingAddress,
      note,
      paymentMethod,
      items,
      couponCode, // Receive coupon code from frontend
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ message: 'Giỏ hàng trống' }, { status: 400 });
    }

    const orderNumber = generateOrderNumber();

    // 1. Fetch user to check VIP tier
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // 2. Fetch products to calculate TRUE subtotal
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

      // Check variant stock if applicable
      if (variantId) {
        const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
        if (!variant || variant.stock < item.quantity) {
          return NextResponse.json({ message: `Biến thể không hợp lệ hoặc hết hàng: ${variant?.name || variantId}` }, { status: 400 });
        }
        priceToUse += variant.priceOffset;
        variantName = variant.name;
      } else {
        if (dbProduct.stock < item.quantity) {
          // Base product out of stock — check if any variant has stock
          const availableVariants = await prisma.productVariant.findMany({
            where: { productId: item.productId, stock: { gte: item.quantity } },
            orderBy: { createdAt: 'desc' },
            take: 1
          });

          if (availableVariants.length > 0) {
            // Auto-fallback to the available variant
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

    // 3. Calculate VIP discount
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

    // 4. Calculate Coupon discount
    let couponDiscountAmount = 0;
    let validCouponCode = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() }
      });

      if (coupon && coupon.isActive && new Date() <= new Date(coupon.validUntil) && coupon.usedCount < coupon.maxUsage) {
        if (totalAfterVip >= coupon.minOrderValue) {
          // Check if already used
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
            
            // Prevent total from going negative
            if (couponDiscountAmount > totalAfterVip) {
              couponDiscountAmount = totalAfterVip;
            }
          }
        }
      }
    }

    const totalDiscountAmount = vipDiscountAmount + couponDiscountAmount;
    let totalAfterDiscounts = subtotal - totalDiscountAmount;

    // 5. Calculate Shipping Fee
    let shippingFee = 30000;
    if (user.vipTier === 'GOLD' || user.vipTier === 'DIAMOND' || totalAfterDiscounts >= 1000000) {
      shippingFee = 0; // Free shipping
    }

    const finalTotalAmount = totalAfterDiscounts + shippingFee;

    // 6. Calculate points earned from this order
    const earnedPoints = Math.floor(finalTotalAmount / 10000);
    const newTotalPoints = (user.points || 0) + earnedPoints;

    // Calculate new VIP tier
    let newVipTier = 'MEMBER';
    if (newTotalPoints >= 5000) newVipTier = 'DIAMOND';
    else if (newTotalPoints >= 2000) newVipTier = 'GOLD';
    else if (newTotalPoints >= 500) newVipTier = 'SILVER';

    // Run within a transaction to ensure both order and items are created
    const order = await prisma.$transaction(async (tx) => {
      // ... transaction code ...
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

      // Update stock
      for (const item of finalOrderItems) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } }
          });
          // Also increment product sold count
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

      // Record conversion for analytics
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

    // 7. Trigger Admin Notifications
    await createAdminNotification(
      '📦 Đơn hàng mới',
      `Khách hàng ${recipientName} vừa đặt đơn hàng ${order.orderNumber} trị giá ${finalTotalAmount.toLocaleString('vi-VN')}đ`,
      'ORDER_PLACED',
      `/admin/orders`
    );

    // Check low stock
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

    // Trigger VIP Upgrade Notification for User
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

    // Send email for COD
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
