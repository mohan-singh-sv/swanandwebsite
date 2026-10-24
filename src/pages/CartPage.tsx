import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartPayable, cartTotal, isLoggedIn, useShop } from '../store/shop';
import { formatMoney } from '../utils/money';

export function CartPage() {
  const navigate = useNavigate();
  const items = useShop((s) => s.items);
  const setQty = useShop((s) => s.setQty);
  const couponCode = useShop((s) => s.couponCode);
  const setCouponCode = useShop((s) => s.setCouponCode);
  const promo = useShop((s) => s.promo);
  const refreshPromotions = useShop((s) => s.refreshPromotions);
  const user = useShop((s) => s.user);
  const [code, setCode] = useState(couponCode);
  const subtotal = cartTotal(items);
  const total = cartPayable(items, promo);

  useEffect(() => {
    refreshPromotions().catch(() => undefined);
  }, [refreshPromotions]);

  function applyCoupon(event: FormEvent) {
    event.preventDefault();
    setCouponCode(code);
    refreshPromotions().catch(() => undefined);
  }

  return (
    <main className="page split">
      <section>
        <h1>Your cart</h1>
        {!items.length ? <p className="muted">Your bag is empty. Browse grocery aisles to add items.</p> : null}
        {items.map((item) => (
          <div className="cart-line card" key={item.lineKey} style={{ marginBottom: 10 }}>
            <img src={item.imageUrl || '/logo.png'} alt="" />
            <div>
              <strong>{item.title}</strong>
              <div className="muted">{item.unit || '1 pc'}</div>
              <div className="price">{formatMoney(item.unitPrice)}</div>
            </div>
            <div className="row">
              <button className="btn ghost" type="button" onClick={() => setQty(item.lineKey, item.quantity - 1)}>−</button>
              <strong>{item.quantity}</strong>
              <button className="btn ghost" type="button" onClick={() => setQty(item.lineKey, item.quantity + 1)}>+</button>
            </div>
          </div>
        ))}
      </section>
      <aside className="card" style={{ padding: 18, height: 'fit-content' }}>
        <h3>Bill</h3>
        <p>Subtotal {formatMoney(subtotal)}</p>
        {promo?.discountTotal ? <p>Discount −{formatMoney(promo.discountTotal)}</p> : null}
        <p><strong>To pay {formatMoney(total)}</strong></p>
        {promo?.couponMessage ? <p className="notice">{promo.couponMessage}</p> : null}
        <form className="form" onSubmit={applyCoupon}>
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" />
          <button className="btn ghost" type="submit">Apply coupon</button>
        </form>
        <button
          className="btn"
          type="button"
          disabled={!items.length}
          onClick={() => navigate(isLoggedIn(user) ? '/checkout' : '/login?next=/checkout')}
        >
          Checkout
        </button>
        <p><Link to="/">Continue shopping</Link></p>
      </aside>
    </main>
  );
}
