const layout = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0a0a0a; font-family: "DM Sans", -apple-system, sans-serif; color: #f0ece4; }
    .wrapper { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #1c1c1c; border: 1px solid rgba(212,168,83,0.15); border-radius: 8px; overflow: hidden; }
    .header { background: #141414; padding: 28px 32px; border-bottom: 1px solid rgba(212,168,83,0.1); display: flex; align-items: center; gap: 12px; }
    .logo-box { position: relative; width: 22px; height: 22px; flex-shrink: 0; }
    .logo-diamond { display: inline-block; width: 22px; height: 22px; background: #d4a853; transform: rotate(45deg); }
    .logo-text { font-size: 18px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: #f0ece4; }
    .body { padding: 32px; }
    .title { font-size: 22px; font-weight: 300; color: #f0ece4; margin-bottom: 8px; }
    .subtitle { font-size: 13px; color: #9a9590; margin-bottom: 24px; line-height: 1.6; }
    .divider { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 24px 0; }
    .label { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: #9a9590; margin-bottom: 4px; }
    .value { font-size: 14px; color: #f0ece4; margin-bottom: 16px; }
    .gold { color: #d4a853; }
    .item-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
    .item-name { font-size: 13px; color: #f0ece4; }
    .item-meta { font-size: 11px; color: #9a9590; margin-top: 2px; }
    .item-price { font-size: 13px; color: #f0ece4; white-space: nowrap; }
    .total-row { display: flex; justify-content: space-between; padding: 14px 0 0; }
    .total-label { font-size: 14px; color: #f0ece4; font-weight: 500; }
    .total-value { font-size: 18px; color: #d4a853; font-weight: 600; }
    .btn { display: inline-block; background: linear-gradient(135deg, #d4a853 0%, #a07830 100%); color: #0a0a0a !important; text-decoration: none; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 12px 28px; border-radius: 4px; margin-top: 24px; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
    .badge-pending    { background: rgba(245,158,11,0.12); color: #f59e0b; border: 1px solid rgba(245,158,11,0.25); }
    .badge-processing { background: rgba(59,130,246,0.12); color: #60a5fa; border: 1px solid rgba(59,130,246,0.25); }
    .badge-shipped    { background: rgba(168,85,247,0.12); color: #c084fc; border: 1px solid rgba(168,85,247,0.25); }
    .badge-delivered  { background: rgba(34,197,94,0.12);  color: #4ade80; border: 1px solid rgba(34,197,94,0.25); }
    .badge-cancelled  { background: rgba(239,68,68,0.12);  color: #f87171; border: 1px solid rgba(239,68,68,0.25); }
    .footer { padding: 20px 32px; background: #141414; border-top: 1px solid rgba(255,255,255,0.04); }
    .footer p { font-size: 11px; color: #4a4845; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="logo-diamond"></div>
        <span class="logo-text">EduCom</span>
      </div>
      <div class="body">${content}</div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} EduCom. This email was sent to you because you have an account with us.</p>
        <p style="margin-top:6px">If you did not perform this action, please ignore this email.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n ?? 0);

// 1. Login notification 
export const loginEmailTemplate = ({ name, time, device = 'Unknown device' }) =>
    layout(`
    <h2 class="title">New Sign-In Detected</h2>
    <p class="subtitle">Hi ${name}, we noticed a new sign-in to your EduCom account.</p>
    <hr class="divider" />
    <p class="label">Time</p>
    <p class="value">${time}</p>
    <p class="label">Device / Browser</p>
    <p class="value">${device}</p>
    <hr class="divider" />
    <p style="font-size:13px;color:#9a9590;line-height:1.7">
      If this was you, no action is needed. If you didn't sign in,
      please change your password immediately.
    </p>
  `);

//  2. Order placed confirmation 
export const orderPlacedEmailTemplate = ({ name, order }) => {
    const itemsHtml = order.orderItems
        .map(
            (item) => `
        <div class="item-row">
          <div>
            <div class="item-name">${item.name}</div>
            <div class="item-meta">Qty: ${item.quantity} &nbsp;·&nbsp; ${fmt(item.price)} each</div>
          </div>
          <div class="item-price">${fmt(item.price * item.quantity)}</div>
        </div>`
        )
        .join('');

    return layout(`
    <h2 class="title">Order Confirmed ✓</h2>
    <p class="subtitle">
      Hi ${name}, thank you for your order! We've received it and are getting it ready.
    </p>
    <hr class="divider" />

    <p class="label">Order ID</p>
    <p class="value gold">#${order._id.toString().slice(-10).toUpperCase()}</p>

    <p class="label">Shipping to</p>
    <p class="value">
      ${order.shippingAddress.address},
      ${order.shippingAddress.city},
      ${order.shippingAddress.postalCode},
      ${order.shippingAddress.country}
    </p>

    <hr class="divider" />
    <p class="label" style="margin-bottom:8px">Items</p>
    ${itemsHtml}

    <div class="total-row">
      <span class="label">Subtotal</span>
      <span style="font-size:13px;color:#f0ece4">${fmt(order.itemsPrice)}</span>
    </div>
    <div class="total-row">
      <span class="label">GST (18%)</span>
      <span style="font-size:13px;color:#f0ece4">${fmt(order.taxPrice)}</span>
    </div>
    <div class="total-row">
      <span class="label">Shipping</span>
      <span style="font-size:13px;color:#f0ece4">${order.shippingPrice === 0 ? 'Free' : fmt(order.shippingPrice)}</span>
    </div>
    ${order.couponApplied ? `
    <div class="total-row">
      <span class="label">Discount (${order.couponApplied.code})</span>
      <span style="font-size:13px;color:#4ade80">-${fmt(order.couponApplied.discount)}</span>
    </div>` : ''}
    <hr class="divider" />
    <div class="total-row">
      <span class="total-label">Total Paid</span>
      <span class="total-value">${fmt(order.totalPrice)}</span>
    </div>
  `);
};

// 3. Order status update 
const STATUS_MSG = {
    processing: { headline: 'Your order is being processed 📦', body: 'We have confirmed your payment and are preparing your items.' },
    shipped: { headline: 'Your order is on its way! 🚚', body: 'Your package has been handed over to the courier and is on its way to you.' },
    delivered: { headline: 'Your order has been delivered ✓', body: 'Your order has been delivered. We hope you love it!' },
    cancelled: { headline: 'Your order has been cancelled', body: 'Your order has been cancelled. If you paid, a refund will be processed within 5–7 business days.' },
    pending: { headline: 'Order status update', body: 'Your order status has been updated.' },
};

export const orderStatusEmailTemplate = ({ name, order, status }) => {
    const msg = STATUS_MSG[status] || STATUS_MSG.pending;

    return layout(`
    <h2 class="title">${msg.headline}</h2>
    <p class="subtitle">Hi ${name}, ${msg.body}</p>
    <hr class="divider" />

    <p class="label">Order ID</p>
    <p class="value gold">#${order._id.toString().slice(-10).toUpperCase()}</p>

    <p class="label">New Status</p>
    <p class="value">
      <span class="status-badge badge-${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </p>

    <p class="label">Order Total</p>
    <p class="value">${fmt(order.totalPrice)}</p>

    ${status === 'shipped' ? `
    <hr class="divider" />
    <p style="font-size:13px;color:#9a9590">
      Your tracking details will be shared by the courier directly.
      Estimated delivery: <strong style="color:#f0ece4">3–5 business days</strong>.
    </p>` : ''}
  `);
};