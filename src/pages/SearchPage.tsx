import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { websiteApi } from '../api/website';
import type { Product } from '../api/types';
import { ProductCard } from '../components/ProductCard';
import { useShop } from '../store/shop';

export function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const assetBaseUrl = useShop((s) => s.assetBaseUrl);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!q) return;
    websiteApi
      .search(q, assetBaseUrl)
      .then(setProducts)
      .catch((err) => setError(err.message || 'Search failed'));
  }, [assetBaseUrl, q]);

  return (
    <main className="page">
      <h1>Search “{q}”</h1>
      {error ? <p className="error">{error}</p> : null}
      <div className="grid">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
      {!products.length && !error ? <p className="muted">No matching grocery items.</p> : null}
    </main>
  );
}
