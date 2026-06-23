import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + '₫';
}

export async function sendOrderConfirmationEmail(userEmail, order, orderItems) {
  const itemsHtml = orderItems.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">
        <strong>${item.product.name}</strong>
        ${item.variantName ? `<br><small style="color: #666;">Phân loại: ${item.variantName}</small>` : ''}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${formatPrice(item.price)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;"><strong>${formatPrice(item.price * item.quantity)}</strong></td>
    </tr>
  `).join('');

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #6366f1; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Cảm ơn bạn đã đặt hàng tại VORTEX!</h1>
      </div>
      
      <div style="padding: 20px;">
        <p>Xin chào <strong>${order.recipientName}</strong>,</p>
        <p>Đơn hàng <strong>${order.orderNumber}</strong> của bạn đã được đặt thành công. Dưới đây là chi tiết hóa đơn:</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-top: 0;">Thông tin giao hàng:</h3>
          <p style="margin: 5px 0;"><strong>Người nhận:</strong> ${order.recipientName}</p>
          <p style="margin: 5px 0;"><strong>Điện thoại:</strong> ${order.recipientPhone}</p>
          <p style="margin: 5px 0;"><strong>Địa chỉ:</strong> ${order.shippingAddress}</p>
          <p style="margin: 5px 0;"><strong>Phương thức thanh toán:</strong> ${order.paymentMethod === 'VNPAY' ? 'Thanh toán qua VNPAY' : 'Thanh toán khi nhận hàng (COD)'}</p>
          <p style="margin: 5px 0;"><strong>Trạng thái thanh toán:</strong> <span style="color: ${order.paymentStatus === 'PAID' ? '#22c55e' : '#f59e0b'}; font-weight: bold;">${order.paymentStatus === 'PAID' ? 'Đã Thanh Toán' : 'Chưa Thanh Toán'}</span></p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Sản phẩm</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">SL</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Đơn giá</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Tạm tính:</td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${formatPrice(order.totalAmount + order.discount - order.shippingFee)}</td>
            </tr>
            ${order.discount > 0 ? `
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd; color: #10b981;">Khuyến mãi:</td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd; color: #10b981;">-${formatPrice(order.discount)}</td>
            </tr>
            ` : ''}
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Phí vận chuyển:</td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${order.shippingFee === 0 ? 'Miễn phí' : formatPrice(order.shippingFee)}</td>
            </tr>
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right; font-size: 18px; font-weight: bold;">Tổng cộng:</td>
              <td style="padding: 10px; text-align: right; font-size: 18px; font-weight: bold; color: #ef4444;">${formatPrice(order.totalAmount)}</td>
            </tr>
          </tfoot>
        </table>

        <p style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
          Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi qua email này.
        </p>
      </div>
      <div style="background-color: #1f2937; color: #9ca3af; padding: 15px; text-align: center; font-size: 12px;">
        © 2026 VORTEX Shop. Mọi quyền được bảo lưu.
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"VORTEX Shop" <${process.env.GMAIL_USER}>`,
    to: userEmail,
    subject: `Xác nhận đơn hàng ${order.orderNumber} từ VORTEX`,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending order email:', error);
  }
}
