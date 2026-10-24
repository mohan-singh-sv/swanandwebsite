import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { websiteApi } from '../api/website';
import type { Collection, Product } from '../api/types';
import { ProductCard } from '../components/ProductCard';
import { useShop } from '../store/shop';

export function CollectionPage() {
  const { handle = '' } = useParams();
  const assetBaseUrl = useShop((s) => s.assetBaseUrl);
  const [tab, setTab] = useState('All');
  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    websiteApi
      .collection(handle, assetBaseUrl)
      .then((data) => {
        setCollection(data.collection);
        setProducts(data.products);
        setTab('All');
      })
      .catch((err) => setError(err.message || 'Could not load this aisle'));
  }, [assetBaseUrl, handle]);

  const tabs = ['All', ...((collection?.tabs || []).filter((item) => item && item !== 'All'))];
  const visible =
    tab === 'All' ? products : products.filter((item) => (item.tag || item.category || '').toLowerCase() === tab.toLowerCase());

  return (
    <main className="page">
      <h1>{collection?.title || 'Collection'}</h1>
      {collection?.description ? <p className="muted">{collection.description}</p> : null}
      <div className="cats" style={{ margin: '16px 0' }}>
        {tabs.map((item) => (
          <button key={item} className="cat" type="button" onClick={() => setTab(item)} style={tab === item ? { background: '#ffe9a8' } : undefined}>
            {item}
          </button>
        ))}
      </div>
      {error ? <p className="error">{error}</p> : null}
      <div className="grid">
        {visible.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </main>
  );
}
