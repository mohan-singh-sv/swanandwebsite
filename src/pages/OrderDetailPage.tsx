import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { websiteApi } from '../api/website';
import type { WebsiteOrder } from '../api/types';
import { useShop } from '../store/shop';
import { formatMoney } from '../utils/money';

export function OrderDetailPage() {
  const { id = '' } = useParams();
  const user = useShop((s) => s.user);
  const assetBaseUrl = useShop((s) => s.assetBaseUrl);
  const [order, setOrder] = useState<WebsiteOrder | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.token) return;
    websiteApi
      .order(id, user.customerId, user.token, assetBaseUrl)
      .then(setOrder)
      .catch((err) => setError(err.message || 'Order not found'));
  }, [assetBaseUrl, id, user]);

  if (error) return <main className="page"><p className="error">{error}</p></main>;
  if (!order) return <main className="page">Loading…</main>;

  return (
    <main className="page">
      <h1>Order {order.invoiceNo || order.id}</h1>
      <p>{order.status} · {order.createdAt}</p>
      {order.lines.map((line) => (
        <div key={line.lineKey} className="cart-line card" style={{ marginBottom: 10 }}>
          <img src={line.imageUrl || '/logo.png'} alt="" />
          <div>
            <strong>{line.title}</strong>
            <div>Qty {line.quantity}</div>
          </div>
          <div className="price">{formatMoney(line.unitPrice * line.quantity)}</div>
        </div>
      ))}
      <h3>Total {formatMoney(order.total)}</h3>
    </main>
  );
}
