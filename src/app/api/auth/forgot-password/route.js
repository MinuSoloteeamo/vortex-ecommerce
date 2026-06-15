import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { captchaStore } from '../captcha/route';

function generatePassword(length = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length];
  }
  return password;
}

export async function POST(request) {
  try {
    const { email, captchaToken, captchaSelected } = await request.json();

    if (!email || !captchaToken || !captchaSelected) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ thông tin' },
        { status: 400 }
      );
    }

    // Verify CAPTCHA internally
    const challenge = captchaStore.get(captchaToken);
    captchaStore.delete(captchaToken); // One-time use

    if (!challenge || Date.now() > challenge.expiresAt) {
      return NextResponse.json(
        { error: 'CAPTCHA đã hết hạn. Vui lòng thử lại.' },
        { status: 400 }
      );
    }

    const sortedSelected = [...captchaSelected].sort((a, b) => a - b);
    const sortedCorrect = [...challenge.correctIds].sort((a, b) => a - b);

    const captchaValid =
      sortedSelected.length === sortedCorrect.length &&
      sortedSelected.every((id, idx) => id === sortedCorrect[idx]);

    if (!captchaValid) {
      return NextResponse.json(
        { error: 'Xác thực CAPTCHA không chính xác. Vui lòng thử lại.' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Don't reveal if email exists (security)
    if (!user) {
      return NextResponse.json({
        message: 'Nếu email tồn tại trong hệ thống, mật khẩu mới sẽ được gửi đến hộp thư của bạn.',
      });
    }

    // Generate new password
    const newPassword = generatePassword(12);
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password in DB
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"VORTEX Store" <${process.env.GMAIL_USER}>`,
      to: user.email,
      subject: '🔐 VORTEX - Mật khẩu mới của bạn',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #00f0ff; font-size: 28px; font-weight: 800; letter-spacing: 2px; margin: 0;">
                ⚡ VORTEX
              </h1>
              <p style="color: #6b7280; font-size: 13px; margin-top: 4px;">Tech & Gaming Store</p>
            </div>
            
            <!-- Card -->
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16162a 100%); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 36px; box-shadow: 0 8px 32px rgba(0,0,0,0.4);">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="font-size: 48px;">🔑</span>
              </div>
              
              <h2 style="color: #f0f0f0; font-size: 20px; font-weight: 700; text-align: center; margin: 0 0 8px 0;">
                Mật khẩu đã được cấp lại
              </h2>
              
              <p style="color: #9ca3af; font-size: 14px; text-align: center; line-height: 1.6; margin: 0 0 28px 0;">
                Xin chào <strong style="color: #e0e0e0;">${user.name}</strong>,<br>
                chúng tôi đã tạo mật khẩu mới cho tài khoản của bạn.
              </p>
              
              <!-- Password Box -->
              <div style="background: rgba(0, 240, 255, 0.06); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <p style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">
                  Mật khẩu mới
                </p>
                <p style="color: #00f0ff; font-size: 22px; font-weight: 700; letter-spacing: 3px; margin: 0; font-family: 'Courier New', monospace;">
                  ${newPassword}
                </p>
              </div>
              
              <!-- Warning -->
              <div style="background: rgba(251, 191, 36, 0.08); border: 1px solid rgba(251, 191, 36, 0.2); border-radius: 10px; padding: 14px 16px; margin-bottom: 24px;">
                <p style="color: #fbbf24; font-size: 13px; margin: 0; line-height: 1.5;">
                  ⚠️ Vui lòng đăng nhập và đổi mật khẩu ngay sau khi nhận được email này để bảo mật tài khoản.
                </p>
              </div>
              
              <!-- Button -->
              <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login" 
                   style="display: inline-block; background: linear-gradient(135deg, #00f0ff, #0080ff); color: #000; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 32px; border-radius: 8px;">
                  Đăng nhập ngay →
                </a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; margin-top: 28px;">
              <p style="color: #4b5563; font-size: 12px; line-height: 1.6; margin: 0;">
                Nếu bạn không yêu cầu cấp lại mật khẩu,<br>
                vui lòng bỏ qua email này hoặc liên hệ hỗ trợ.
              </p>
              <p style="color: #374151; font-size: 11px; margin-top: 12px;">
                © ${new Date().getFullYear()} VORTEX. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      message: 'Nếu email tồn tại trong hệ thống, mật khẩu mới sẽ được gửi đến hộp thư của bạn.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
