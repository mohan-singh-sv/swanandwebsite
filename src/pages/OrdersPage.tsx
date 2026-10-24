import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { websiteApi } from '../api/website';
import type { WebsiteOrder } from '../api/types';
import { isLoggedIn, useShop } from '../store/shop';
import { formatMoney } from '../utils/money';

export function OrdersPage() {
  const navigate = useNavigate();
  const user = useShop((s) => s.user);
  const logout = useShop((s) => s.logout);
  const assetBaseUrl = useShop((s) => s.assetBaseUrl);
  const [orders, setOrders] = useState<WebsiteOrder[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn(user)) {
      navigate('/login?next=/orders');
      return;
    }
    websiteApi
      .orders(user!.customerId, user!.token, assetBaseUrl)
      .then(setOrders)
      .catch((err) => setError(err.message || 'Could not load orders'));
  }, [assetBaseUrl, navigate, user]);

  return (
    <main className="page">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1>My orders</h1>
        <button className="btn ghost" type="button" onClick={() => { logout(); navigate('/'); }}>Log out</button>
      </div>
      {error ? <p className="error">{error}</p> : null}
      {orders.map((order) => (
        <Link key={order.id} className="card cart-line" style={{ marginBottom: 12 }} to={`/orders/${order.id}`}>
          <div>
            <strong>{order.invoiceNo || order.id}</strong>
            <div className="muted">{order.status} · {order.createdAt}</div>
          </div>
          <div className="price">{formatMoney(order.total)}</div>
        </Link>
      ))}
      {!orders.length && !error ? <p className="muted">No orders yet.</p> : null}
    </main>
  );
}
