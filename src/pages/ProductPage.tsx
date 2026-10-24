import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { websiteApi } from '../api/website';
import type { Product } from '../api/types';
import { useShop } from '../store/shop';
import { formatMoney } from '../utils/money';

export function ProductPage() {
  const { slug = '' } = useParams();
  const assetBaseUrl = useShop((s) => s.assetBaseUrl);
  const addProduct = useShop((s) => s.addProduct);
  const [product, setProduct] = useState<Product | null>(null);
  const [offers, setOffers] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    websiteApi
      .product(slug, assetBaseUrl)
      .then((item) => {
        setProduct(item);
        websiteApi.productOffers(slug).then(setOffers).catch(() => undefined);
      })
      .catch((err) => setError(err.message || 'Product not found'));
  }, [assetBaseUrl, slug]);

  if (error) return <main className="page"><p className="error">{error}</p></main>;
  if (!product) return <main className="page">Loading…</main>;

  return (
    <main className="page product-hero">
      <img src={product.imageUrl || '/logo.png'} alt={product.title} />
      <div>
        <p className="muted">{product.category || product.tag || 'Grocery'}</p>
        <h1>{product.title}</h1>
        <p>{product.description}</p>
        <p>
          <span className="price" style={{ fontSize: 28 }}>{formatMoney(product.price)}</span>
          {product.compareAtPrice ? <span className="compare">{formatMoney(product.compareAtPrice)}</span> : null}
        </p>
        <p className="muted">{product.unit || '1 pc'} · {product.inStock ? 'In stock' : 'Out of stock'}</p>
        {offers ? <pre className="notice" style={{ whiteSpace: 'pre-wrap' }}>{typeof offers === 'string' ? offers : JSON.stringify(offers, null, 2).slice(0, 400)}</pre> : null}
        <button className="btn" type="button" onClick={() => addProduct(product)} disabled={!product.inStock}>
          Add to cart
        </button>
      </div>
    </main>
  );
}
