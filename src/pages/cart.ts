import { renderShell } from '../components/shell'
import { STORE_CONFIG } from '../data'

export function renderCartPage(): string {
  const body = `
  <style>
    .cart-page { max-width: 900px; margin: 0 auto; padding: 60px 24px 100px; }
    .cart-page-title {
      font-family: var(--font-serif); font-size: 36px;
      font-weight: 400; margin-bottom: 40px;
    }
    .cart-page-empty {
      text-align: center; padding: 80px 0; color: var(--gray-400);
    }
    .cart-page-empty i { font-size: 64px; margin-bottom: 20px; display: block; }
    .cart-page-empty p { font-size: 16px; margin-bottom: 24px; }
    .cart-page-empty a {
      display: inline-block; padding: 14px 32px;
      background: var(--black); color: var(--white);
      font-size: 13px; font-weight: 600; letter-spacing: 1px;
      text-transform: uppercase;
    }
  </style>

  <div class="cart-page">
    <h1 class="cart-page-title">Your Bag</h1>
    <div id="cartPageContent">
      <div class="cart-page-empty">
        <i class="fas fa-shopping-bag"></i>
        <p>Your bag is empty</p>
        <a href="/#products">Continue Shopping</a>
      </div>
    </div>
  </div>

  <script>
    // Cart page shows the drawer instead
    document.addEventListener('DOMContentLoaded', () => {
      if (cart.length > 0) {
        openCart();
      }
    });
  </script>
  `;

  return renderShell(
    'Your Bag — intru.in',
    'Review your shopping bag at intru.in.',
    body,
    { canonical: 'https://intru.in/cart' }
  );
}
