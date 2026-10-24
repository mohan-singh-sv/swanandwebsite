import { Link } from 'react-router-dom';
import type { Product } from '../api/types';
import { lineForProduct, useShop } from '../store/shop';
import { formatMoney } from '../utils/money';

export function ProductCard({ product }: { product: Product }) {
  const items = useShop((s) => s.items);
  const addProduct = useShop((s) => s.addProduct);
  const setQty = useShop((s) => s.setQty);
  const line = lineForProduct(items, product.slug);
  const off =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : 0;

  return (
    <article className="product">
      <Link to={`/product/${product.slug}`}>
        <img src={product.imageUrl || '/logo.png'} alt={product.title} />
        {off ? <span className="badge" style={{ position: 'absolute', top: 16, left: 16 }}>-{off}%</span> : null}
        <h3>{product.title}</h3>
        <div className="muted">{product.unit || '1 pc'}</div>
        <div>
          <span className="price">{formatMoney(product.price)}</span>
          {product.compareAtPrice ? <span className="compare">{formatMoney(product.compareAtPrice)}</span> : null}
        </div>
      </Link>
      {line ? (
        <div className="stepper">
          <button type="button" onClick={() => setQty(line.lineKey, line.quantity - 1)}>−</button>
          <span>{line.quantity}</span>
          <button type="button" onClick={() => setQty(line.lineKey, line.quantity + 1)}>+</button>
        </div>
      ) : (
        <button type="button" className="plus" onClick={() => addProduct(product)}>
          +
        </button>
      )}
    </article>
  );
}
