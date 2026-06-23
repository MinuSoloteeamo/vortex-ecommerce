import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyVnPayReturn } from '@/lib/vnpay';
import { sendOrderConfirmationEmail } from '@/lib/mail';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const vnp_Params = Object.fromEntries(searchParams.entries());

    const isValidSignature = verifyVnPayReturn({ ...vnp_Params });
    const orderId = vnp_Params['vnp_TxnRef'];
    const responseCode = vnp_Params['vnp_ResponseCode'];

    if (!isValidSignature) {
      return NextResponse.redirect(new URL(`/checkout/failed?reason=invalid_signature`, req.url));
    }

    if (responseCode === '00') {
      // Payment success
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: true,
          items: {
            include: { product: true }
          }
        }
      });

      if (order && order.paymentStatus !== 'PAID') {
        // Update order status
        await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: 'PAID', status: 'PROCESSING' }
        });

        // Send Email Bill
        const userEmail = order.user?.email;
        if (userEmail) {
          // Send asynchronously
          sendOrderConfirmationEmail(userEmail, order, order.items).catch(console.error);
        }
      }

      // Redirect to success page
      return NextResponse.redirect(new URL(`/checkout/success/${orderId}`, req.url));
    } else {
      // Payment failed or canceled
      return NextResponse.redirect(new URL(`/checkout/failed?reason=payment_failed&orderId=${orderId}`, req.url));
    }

  } catch (error) {
    console.error('VNPay Return Error:', error);
    return NextResponse.redirect(new URL(`/checkout/failed?reason=server_error`, req.url));
  }
}
