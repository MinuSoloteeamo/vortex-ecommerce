import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Không có quyền truy cập' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'year';
    const year = parseInt(searchParams.get('year')) || new Date().getFullYear();
    const month = parseInt(searchParams.get('month')) || new Date().getMonth() + 1;

    // Build date range filter
    let dateStart, dateEnd;

    if (period === 'day') {
      // Show days in a specific month
      dateStart = new Date(year, month - 1, 1);
      dateEnd = new Date(year, month, 0, 23, 59, 59, 999);
    } else if (period === 'month') {
      // Show months in a specific year
      dateStart = new Date(year, 0, 1);
      dateEnd = new Date(year, 11, 31, 23, 59, 59, 999);
    } else if (period === 'quarter') {
      // Show quarters in a specific year
      dateStart = new Date(year, 0, 1);
      dateEnd = new Date(year, 11, 31, 23, 59, 59, 999);
    } else {
      // period === 'year': show last 5 years
      const currentYear = new Date().getFullYear();
      dateStart = new Date(currentYear - 4, 0, 1);
      dateEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999);
    }

    // Get all non-cancelled orders within the date range
    const orders = await prisma.order.findMany({
      where: {
        status: { not: 'CANCELLED' },
        createdAt: {
          gte: dateStart,
          lte: dateEnd,
        },
      },
      select: {
        id: true,
        totalAmount: true,
        paymentMethod: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
            price: true,
            product: {
              select: {
                brand: true,
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // === TIMELINE ===
    const timeline = buildTimeline(orders, period, year, month);

    // === BY CATEGORY ===
    const categoryMap = {};
    for (const order of orders) {
      for (const item of order.items) {
        const catName = item.product?.category?.name || 'Khác';
        const itemRevenue = item.price * item.quantity;
        categoryMap[catName] = (categoryMap[catName] || 0) + itemRevenue;
      }
    }
    const byCategory = Object.entries(categoryMap)
      .map(([name, revenue]) => ({ name, revenue: Math.round(revenue) }))
      .sort((a, b) => b.revenue - a.revenue);

    // === BY BRAND ===
    const brandMap = {};
    for (const order of orders) {
      for (const item of order.items) {
        const brandName = item.product?.brand || 'Không rõ';
        const itemRevenue = item.price * item.quantity;
        brandMap[brandName] = (brandMap[brandName] || 0) + itemRevenue;
      }
    }
    const byBrand = Object.entries(brandMap)
      .map(([name, revenue]) => ({ name, revenue: Math.round(revenue) }))
      .sort((a, b) => b.revenue - a.revenue);

    // === BY PAYMENT METHOD ===
    const paymentMap = {};
    for (const order of orders) {
      const method = order.paymentMethod || 'Khác';
      paymentMap[method] = (paymentMap[method] || 0) + order.totalAmount;
    }
    const paymentLabels = {
      COD: 'Thanh toán khi nhận hàng',
      BANK_TRANSFER: 'Chuyển khoản ngân hàng',
      VNPAY: 'VNPay',
      MOMO: 'MoMo',
    };
    const byPayment = Object.entries(paymentMap)
      .map(([name, revenue]) => ({
        name: paymentLabels[name] || name,
        revenue: Math.round(revenue),
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json({
      timeline,
      byCategory,
      byBrand,
      byPayment,
    });
  } catch (error) {
    console.error('Revenue API error:', error);
    return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
  }
}

function buildTimeline(orders, period, year, month) {
  if (period === 'year') {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear - 4; y <= currentYear; y++) {
      years.push({ label: `${y}`, revenue: 0 });
    }
    for (const order of orders) {
      const orderYear = new Date(order.createdAt).getFullYear();
      const entry = years.find((y) => y.label === `${orderYear}`);
      if (entry) entry.revenue += Math.round(order.totalAmount);
    }
    return years;
  }

  if (period === 'quarter') {
    const quarters = [
      { label: 'Q1', revenue: 0 },
      { label: 'Q2', revenue: 0 },
      { label: 'Q3', revenue: 0 },
      { label: 'Q4', revenue: 0 },
    ];
    for (const order of orders) {
      const orderMonth = new Date(order.createdAt).getMonth();
      const qIndex = Math.floor(orderMonth / 3);
      quarters[qIndex].revenue += Math.round(order.totalAmount);
    }
    return quarters;
  }

  if (period === 'month') {
    const monthNames = [
      'Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6',
      'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12',
    ];
    const months = monthNames.map((label) => ({ label, revenue: 0 }));
    for (const order of orders) {
      const orderMonth = new Date(order.createdAt).getMonth();
      months[orderMonth].revenue += Math.round(order.totalAmount);
    }
    return months;
  }

  if (period === 'day') {
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ label: `${d}`, revenue: 0 });
    }
    for (const order of orders) {
      const orderDate = new Date(order.createdAt);
      const day = orderDate.getDate();
      if (day >= 1 && day <= daysInMonth) {
        days[day - 1].revenue += Math.round(order.totalAmount);
      }
    }
    return days;
  }

  return [];
}
