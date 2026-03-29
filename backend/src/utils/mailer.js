const nodemailer = require('nodemailer');

const transporter = process.env.SMTP_USER
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

/**
 * Send order confirmation email.
 * Falls back to console log in dev mode (no SMTP configured).
 */
async function sendOrderConfirmationEmail({ to, name, orderId, items, total, address, paymentMethod }) {
  const itemRows = items.map(item => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0">
        <strong>${item.name}</strong><br/>
        <span style="color:#888;font-size:12px">${item.brand || ''}</span>
      </td>
      <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0;text-align:center">${item.quantity}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0;text-align:right">₹${Number(item.price * item.quantity).toLocaleString('en-IN')}</td>
    </tr>`).join('');

  const html = `
  <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e8e8e8;border-radius:12px;overflow:hidden">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#6c3fc5,#00c9a7);padding:32px 40px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:28px;letter-spacing:-0.5px">Flipkart Clone</h1>
      <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px">best deals, every day</p>
    </div>

    <!-- Body -->
    <div style="padding:32px 40px">
      <div style="text-align:center;margin-bottom:28px">
        <div style="display:inline-block;background:#e8f5e9;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:32px">✅</div>
        <h2 style="margin:12px 0 4px;color:#212121">Order Confirmed!</h2>
        <p style="color:#666;margin:0;font-size:14px">Hi ${name}, your order has been placed successfully.</p>
      </div>

      <!-- Order ID -->
      <div style="background:#f8f4ff;border-left:4px solid #6c3fc5;padding:14px 18px;border-radius:6px;margin-bottom:24px">
        <p style="margin:0;font-size:13px;color:#888">Order ID</p>
        <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#6c3fc5;letter-spacing:1px">${orderId}</p>
      </div>

      <!-- Items -->
      <h3 style="font-size:15px;color:#333;margin:0 0 12px">Items Ordered</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <thead>
          <tr style="background:#f5f5f5">
            <th style="padding:10px 8px;text-align:left;font-size:13px;color:#666;font-weight:600">Product</th>
            <th style="padding:10px 8px;text-align:center;font-size:13px;color:#666;font-weight:600">Qty</th>
            <th style="padding:10px 8px;text-align:right;font-size:13px;color:#666;font-weight:600">Price</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:12px 8px;font-weight:700;font-size:15px">Total</td>
            <td style="padding:12px 8px;text-align:right;font-weight:700;font-size:16px;color:#6c3fc5">₹${Number(total).toLocaleString('en-IN')}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Delivery & Payment -->
      <div style="display:flex;gap:16px;margin-bottom:24px">
        <div style="flex:1;background:#f9f9f9;border-radius:8px;padding:16px">
          <p style="margin:0 0 6px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px">Delivery Address</p>
          <p style="margin:0;font-size:14px;color:#333;line-height:1.6">
            <strong>${address.full_name}</strong><br/>
            ${address.address_line1}${address.address_line2 ? ', ' + address.address_line2 : ''}<br/>
            ${address.city}, ${address.state} — ${address.pincode}<br/>
            📞 ${address.phone}
          </p>
        </div>
        <div style="flex:1;background:#f9f9f9;border-radius:8px;padding:16px">
          <p style="margin:0 0 6px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px">Payment</p>
          <p style="margin:0;font-size:14px;color:#333"><strong>${paymentMethod}</strong></p>
          <p style="margin:8px 0 0;font-size:12px;color:#888">Expected delivery in 3–5 business days</p>
        </div>
      </div>

      <p style="text-align:center;color:#888;font-size:13px;margin:0">
        Thank you for shopping with <strong style="color:#2874f0">Flipkart Clone</strong> 🛍️
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f5f5f5;padding:16px 40px;text-align:center">
      <p style="margin:0;font-size:12px;color:#aaa">This is an automated email. Please do not reply.</p>
    </div>
  </div>`;

  if (transporter) {
    await transporter.sendMail({
      from: `"Flipkart Clone" <${process.env.SMTP_USER}>`,
      to,
      subject: `✅ Order Confirmed — ${orderId} | Flipkart Clone`,
      html,
    });
    console.log(`📧 Order confirmation sent to ${to}`);
  } else {
    // Dev fallback
    console.log(`\n📧 [DEV] Order confirmation email for ${to}`);
    console.log(`   Order ID : ${orderId}`);
    console.log(`   Total    : ₹${total}`);
    console.log(`   Items    : ${items.map(i => i.name).join(', ')}\n`);
  }
}

module.exports = { sendOrderConfirmationEmail };
