import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface OrderEmailProps {
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  items: any[];
}


export async function sendOrderConfirmation({ orderId, customerName, customerEmail, totalAmount, items }: OrderEmailProps) {
  try {
    const formatCurrency = (amt: number) => 
      new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amt);

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #f0f0f0;">
          <div class="item-name">${item.name}</div>
          <div class="item-meta">${item.quantity} x ${formatCurrency(item.price)}</div>
        </td>
        <td style="padding: 16px 0; border-bottom: 1px solid #f0f0f0; vertical-align: middle;" class="item-price">
          ${formatCurrency(item.price * item.quantity)}
        </td>
      </tr>
    `).join("");


    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 20px auto; padding: 0 20px; }
          .card { background: #ffffff; border-radius: 32px; padding: 48px; box-shadow: 0 20px 40px rgba(0,0,0,0.05); border: 1px solid #eee; }
          .header { text-align: center; margin-bottom: 40px; }
          .logo { color: #6B4423; font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; margin-bottom: 8px; }
          .badge { display: inline-block; padding: 6px 16px; background: #FFF4EB; color: #6B4423; border-radius: 100px; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
          .order-id { font-size: 12px; color: #999; margin-top: 12px; font-weight: 600; }
          .content { margin-top: 32px; }
          .summary-box { background: #FBFBFB; border: 1.5px solid #F0F0F0; border-radius: 24px; padding: 32px; margin-top: 32px; }
          .summary-title { font-size: 14px; font-weight: 900; color: #6B4423; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 20px; border-bottom: 2px solid #6B4423; display: inline-block; padding-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; }
          .item-name { font-weight: 800; color: #1a1a1a; font-size: 15px; }
          .item-meta { font-size: 12px; color: #666; font-weight: 500; }
          .item-price { font-weight: 900; color: #1a1a1a; text-align: right; }
          .total-label { font-size: 14px; font-weight: 900; color: #999; text-transform: uppercase; letter-spacing: 1px; }
          .total-amount { font-size: 24px; font-weight: 900; color: #6B4423; text-align: right; }
          .footer { text-align: center; margin-top: 48px; font-size: 12px; color: #bbb; padding-bottom: 40px; }
          .btn { display: inline-block; padding: 16px 32px; background: #6B4423; color: #ffffff !important; text-decoration: none; border-radius: 20px; font-weight: 900; margin-top: 32px; box-shadow: 0 10px 20px rgba(107,68,35,0.2); }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header">
              <div class="logo">BreadGift</div>
              <div class="badge">Pesanan Online Baru!</div>
              <div class="order-id">ID: ${orderId}</div>
            </div>
            
            <div class="content">
              <p style="font-size: 16px;">Halo Bos BreadGift,</p>
              <p style="color: #666;">Ada pesanan online baru masuk nih! Segera siapkan rotinya ya agar pelanggan <strong>${customerName}</strong> mendapatkan kualitas terbaik dari kita.</p>
              
              <div class="summary-box">
                <div class="summary-title">Ringkasan Pesanan</div>
                <table>
                  ${itemsHtml}
                  <tr>
                    <td colspan="2" style="padding-top: 24px;">
                      <div style="border-top: 1px dashed #ddd; margin-bottom: 16px;"></div>
                    </td>
                  </tr>
                  <tr>
                    <td class="total-label">Grand Total</td>
                    <td class="total-amount">${formatCurrency(totalAmount)}</td>
                  </tr>
                </table>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://breadgift.app'}/admin/dashboard" class="btn">
                  Lihat Dashboard Admin
                </a>
              </div>
            </div>
          </div>
          <div class="footer">
            &copy; 2026 BreadGift Bakery & Cafe. All rights reserved.<br>
            Jl. Wangi Roti No. 69, Sukarame, Bandar Lampung.
          </div>
        </div>
      </body>
      </html>
    `;


    // --- DEBUGGING KONFIGURASI ---
    console.log("-----------------------------------------");
    console.log("📧 [MAIL-LOG] Memulai Pengiriman...");
    console.log("🔘 Sender (Robot):", process.env.SMTP_USER);
    const adminTarget = process.env.ADMIN_EMAIL || "dwi_cahyo_kuncoro@teknokrat.ac.id";
    console.log("🔘 Admin Target:", adminTarget);
    console.log("🔘 Customer Target:", customerEmail);
    console.log("-----------------------------------------");

    // 1. KIRIM KE ADMIN (NOTIFIKASI PEMILIK)
    console.log(`👉 [TASK 1] Mengirim Notifikasi ke ADMIN...`);
    try {
      await transporter.sendMail({
        from: `"BreadGift Notification" <${process.env.SMTP_USER}>`,
        to: adminTarget,
        subject: `[NOTIF-ADMIN] Ada Pesanan Masuk! - ${orderId}`,
        html: htmlContent.replace("Halo Bos BreadGift,", "Halo Boss BreadGift,"),
      });
      console.log(`✅ [TASK 1] Notifikasi Admin BERHASIL!`);
    } catch (e: any) {
      console.error(`❌ [TASK 1] Notifikasi Admin GAGAL:`, e.message);
    }

    // 2. KIRIM KE PELANGGAN (STRUK BELANJA)
    if (customerEmail && customerEmail !== 'customer@example.com' && customerEmail !== '') {
      console.log(`👉 [TASK 2] Mengirim Struk ke PELANGGAN...`);
      try {
        await transporter.sendMail({
          from: `"BreadGift Bakery" <${process.env.SMTP_USER}>`,
          to: customerEmail,
          subject: `🍕 Struk Pesanan BreadGift - ${orderId}`,
          html: htmlContent.replace("Halo Bos BreadGift,", `Halo <strong>${customerName}</strong>,`)
                           .replace("Ada pesanan online baru masuk nih!", "Terima kasih sudah memesan roti di BreadGift! Pesanan Anda sedang kami siapkan."),
        });
        console.log(`✅ [TASK 2] Struk Pelanggan BERHASIL!`);
      } catch (e: any) {
        console.error(`❌ [TASK 2] Struk Pelanggan GAGAL:`, e.message);
      }
    }

    console.log(`✨ [MAIL-LOG] Selesai untuk Order ID: ${orderId}`);
    return { success: true };
  } catch (error: any) {
    console.error("❌ [MAIL-SYSTEM] ERROR KRITIS:", error.message);
    return { success: false, error };
  }
}

export async function sendPasswordResetCode(email: string, code: string) {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 20px auto; padding: 0 20px; }
          .card { background: #ffffff; border-radius: 32px; padding: 48px; box-shadow: 0 20px 40px rgba(0,0,0,0.05); border: 1px solid #eee; text-align: center; }
          .header { margin-bottom: 40px; }
          .logo { color: #6B4423; font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; margin-bottom: 8px; }
          .badge { display: inline-block; padding: 6px 16px; background: #FFF4EB; color: #6B4423; border-radius: 100px; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
          .content { margin-top: 32px; }
          .code-box { background: #FBFBFB; border: 2px dashed #6B4423; border-radius: 24px; padding: 24px; margin: 32px 0; }
          .reset-code { font-size: 40px; font-weight: 900; color: #6B4423; letter-spacing: 12px; margin: 0; }
          .footer { text-align: center; margin-top: 48px; font-size: 12px; color: #bbb; padding-bottom: 40px; }
          .warning { font-size: 12px; color: #999; margin-top: 24px; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header">
              <div class="logo">BreadGift</div>
              <div class="badge">Atur Ulang Kata Sandi</div>
            </div>
            
            <div class="content">
              <p style="font-size: 16px; font-weight: 600;">Halo bebs!</p>
              <p style="color: #666;">Kami menerima permintaan untuk mengatur ulang kata sandi akun BreadGift kamu. Gunakan kode verifikasi di bawah ini untuk melanjutkan:</p>
              
              <div class="code-box">
                <h2 class="reset-code">${code}</h2>
              </div>
              
              <p style="color: #666; font-size: 14px;">Kode ini hanya berlaku selama <strong>10 menit</strong>. Jangan berikan kode ini kepada siapapun demi keamanan akunmu.</p>
              
              <p class="warning">Jika kamu tidak merasa meminta pengaturan ulang kata sandi, abaikan saja email ini.</p>
            </div>
          </div>
          <div class="footer">
            &copy; 2026 BreadGift Bakery & Cafe. All rights reserved.<br>
            Jl. Wangi Roti No. 69, Sukarame, Bandar Lampung.
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"BreadGift Security" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `[BreadGift] Kode Verifikasi Lupa Password - ${code}`,
      html: htmlContent,
    });

    console.log(`✅ [MAIL] Kode reset berhasil dikirim ke: ${email}`);
    return { success: true };
  } catch (error: any) {
    console.error("❌ [MAIL-ERROR] Gagal kirim kode reset:", error.message);
    return { success: false, error: error.message };
  }
}




