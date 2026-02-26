import { renderShell } from '../components/shell'

export function renderCheckoutSuccess(): string {
  const body = `
  <style>
    .success-page {
      max-width: 600px; margin: 0 auto; padding: 100px 24px;
      text-align: center;
    }
    .success-icon {
      width: 80px; height: 80px; border-radius: 50%;
      background: #f0fdf4; color: #16a34a;
      display: flex; align-items: center; justify-content: center;
      font-size: 36px; margin: 0 auto 24px;
    }
    .success-title {
      font-family: var(--font-serif); font-size: 32px;
      margin-bottom: 12px;
    }
    .success-text {
      font-size: 15px; color: var(--gray-400); line-height: 1.7;
      margin-bottom: 40px;
    }
    .success-cta {
      display: inline-block; padding: 16px 40px;
      background: var(--black); color: var(--white);
      font-size: 13px; font-weight: 600; letter-spacing: 1px;
      text-transform: uppercase; transition: all 0.3s;
    }
    .success-cta:hover { background: var(--gray-600); }
  </style>

  <div class="success-page">
    <div class="success-icon"><i class="fas fa-check"></i></div>
    <h1 class="success-title">Order Confirmed</h1>
    <p class="success-text">
      Thank you for shopping with intru.in! Your order has been placed successfully.
      You'll receive a confirmation email shortly with tracking details.
    </p>
    <a href="/" class="success-cta">Continue Shopping</a>
  </div>

  <script>
    // Clear cart after successful checkout
    localStorage.removeItem('intru_cart');
    cart = [];
    updateCartUI();
  </script>
  `;

  return renderShell(
    'Order Confirmed — intru.in',
    'Your order has been placed successfully at intru.in.',
    body,
    { canonical: 'https://intru.in/checkout/success' }
  );
}
