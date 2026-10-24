import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { websiteApi } from '../api/website';
import type { CheckoutField, PaymentMethodOption } from '../api/types';
import { env } from '../config';
import { cartPayable, isLoggedIn, useShop } from '../store/shop';
import { formatMoney } from '../utils/money';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const user = useShop((s) => s.user);
  const items = useShop((s) => s.items);
  const promo = useShop((s) => s.promo);
  const placeOrder = useShop((s) => s.placeOrder);
  const [address, setAddress] = useState(user?.address || '');
  const [payment, setPayment] = useState('cod');
  const [methods, setMethods] = useState<PaymentMethodOption[]>([]);
  const [fields, setFields] = useState<CheckoutField[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const total = cartPayable(items, promo);

  useEffect(() => {
    if (!isLoggedIn(user)) navigate('/login?next=/checkout');
  }, [navigate, user]);

  useEffect(() => {
    websiteApi.settings().then((settings) => {
      setMethods(settings.paymentMethods.length ? settings.paymentMethods : [{ id: 'cod', label: 'Cash on Delivery', kind: 'cod' }]);
    }).catch(() => undefined);
    websiteApi.checkoutFields().then(setFields).catch(() => undefined);
  }, []);

  async function submit(event: FormEvent, paymentId?: string) {
    event.preventDefault();
    if (!address.trim()) {
      setError('Enter a delivery address');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const id = await placeOrder({
        address,
        payment,
        paymentId,
        checkoutFields: fields.map((field) => ({ fieldKey: field.fieldKey, value: answers[field.fieldKey] || '' })).filter((item) => item.value),
      });
      navigate(`/orders/${id}`);
    } catch (err: any) {
      setError(err.message || 'Could not place order');
    } finally {
      setBusy(false);
    }
  }

  async function pay(event: FormEvent) {
    event.preventDefault();
    const selected = methods.find((item) => item.id === payment);
    if (selected?.kind !== 'razorpay') return submit(event);
    const key = env.razorpayKeyId;
    if (!key) {
      setError('Razorpay key is missing');
      return;
    }
    if (!window.Razorpay) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Could not load Razorpay'));
        document.body.appendChild(script);
      });
    }
    const rzp = new window.Razorpay!({
      key,
      amount: Math.round(total * 100),
      currency: 'INR',
      name: 'Swanand Online',
      description: 'Grocery order',
      handler: (response: any) => submit(event, response.razorpay_payment_id),
    });
    rzp.open();
  }

  return (
    <main className="page split">
      <form className="form card" style={{ padding: 20 }} onSubmit={pay}>
        <h1>Checkout</h1>
        <label>
          Delivery address
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} required />
        </label>
        {fields.map((field) => (
          <label key={field.fieldKey}>
            {field.name}
            {field.options.length ? (
              <select value={answers[field.fieldKey] || ''} onChange={(e) => setAnswers((c) => ({ ...c, [field.fieldKey]: e.target.value }))}>
                <option value="">Select</option>
                {field.options.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            ) : (
              <input value={answers[field.fieldKey] || ''} onChange={(e) => setAnswers((c) => ({ ...c, [field.fieldKey]: e.target.value }))} placeholder={field.placeholder} />
            )}
          </label>
        ))}
        <div>
          {methods.map((method) => (
            <label key={method.id} className="row">
              <input type="radio" name="pay" checked={payment === method.id} onChange={() => setPayment(method.id)} />
              {method.label}
            </label>
          ))}
        </div>
        {error ? <p className="error">{error}</p> : null}
        <button className="btn" type="submit" disabled={busy || !items.length}>
          {busy ? 'Placing…' : `Place order · ${formatMoney(total)}`}
        </button>
      </form>
      <aside className="card" style={{ padding: 18 }}>
        <h3>{items.length} items</h3>
        {items.map((item) => (
          <p key={item.lineKey}>
            {item.title} × {item.quantity}
          </p>
        ))}
      </aside>
    </main>
  );
}
