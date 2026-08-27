// lib/email.js
//
// Nodemailer doesn't run its own mail servers — it just knows how to
// connect to one and hand off a message. Here, we point it at Gmail's
// servers, authenticating with an "app password" (a special password
// just for apps like this, generated from your Google Account settings —
// not your real Gmail password).

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendOrderConfirmationEmail(order) {
  // No email on file (it was optional at checkout) — nothing to send to.
  if (!order.customer_email) return;

  const itemRows = order.order_items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;">${item.product_name_at_purchase} × ${item.quantity}</td>
          <td style="padding:8px 0; text-align:right;">₦${Number(
            item.price_at_purchase * item.quantity,
          ).toLocaleString()}</td>
        </tr>`,
    )
    .join("");

  await transporter.sendMail({
    from: `"KwikMart" <${process.env.GMAIL_USER}>`,
    to: order.customer_email,
    subject: `Order Confirmed — ${order.order_number}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #0d6438;">Thanks for your order, ${order.customer_name}!</h2>
        <p>Your order <strong>${order.order_number}</strong> is confirmed and being prepared.</p>

        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          ${itemRows}
        </table>

        <div style="border-top: 1px solid #e0e4dd; padding-top: 8px; font-weight: bold;">
          Total: ₦${Number(order.total_amount).toLocaleString()}
        </div>

        <p style="margin-top: 24px;">
          <strong>Pickup location:</strong><br/>
          14 Allen Avenue, Ikeja, Lagos, Nigeria
        </p>

        <p style="color: #3f4941; font-size: 14px;">
          Track your order anytime using your order number above.
        </p>
      </div>
    `,
  });
}

// Sent whenever an admin moves an order forward (Preparing, Ready for
// Pickup, Picked Up) or cancels it. Deliberately NOT sent for "Paid" —
// that's already covered by sendOrderConfirmationEmail right after
// checkout, so a second email for the same moment would be redundant.
export async function sendOrderStatusUpdateEmail(order, statusLabel) {
  if (!order.customer_email) return;

  await transporter.sendMail({
    from: `"KwikMart" <${process.env.GMAIL_USER}>`,
    to: order.customer_email,
    subject: `Order Update — ${order.order_number} is now ${statusLabel}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #0d6438;">Hi ${order.customer_name},</h2>
        <p>
          Your order <strong>${order.order_number}</strong> is now:
          <strong>${statusLabel}</strong>.
        </p>
        <p style="color: #3f4941; font-size: 14px;">
          You can check full order details anytime on the Track Order page
          using your order number.
        </p>
      </div>
    `,
  });
}
