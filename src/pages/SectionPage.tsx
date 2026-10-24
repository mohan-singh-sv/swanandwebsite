import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Product } from '../api/types';
import { websiteApi } from '../api/website';
import { ProductCard } from '../components/ProductCard';
import { useShop } from '../store/shop';

function handleFrom(url?: string) {
  if (!url) return '';
  const match = url.match(/collections?\/([^/?#]+)/i) || url.match(/collection\/([^/?#]+)/i);
  if (match?.[1]) return decodeURIComponent(match[1]);
  if (!/^https?:/i.test(url) && !url.includes('/')) return url;
  return '';
}

export function SectionPage() {
  const { id = '' } = useParams();
  const sections = useShop((s) => s.sections);
  const assetBaseUrl = useShop((s) => s.assetBaseUrl);
  const section = sections.find((item) => item.id === id);
  const [products, setProducts] = useState<Product[]>(section?.products || []);
  const [tab, setTab] = useState('All');
  const [error, setError] = useState('');

  useEffect(() => {
    setProducts(section?.products || []);
    setTab('All');
    setError('');
    if (!section) return;
    if (section.products.length) return;
    const handle = handleFrom(section.viewAllUrl) || handleFrom(section.linkUrl) || section.categories[0]?.handle;
    if (!handle) return;
    websiteApi
      .collection(handle, assetBaseUrl)
      .then((data) => setProducts(data.products))
      .catch((err) => setError(err.message || 'Could not load products'));
  }, [assetBaseUrl, section]);

  const tabs = useMemo(() => {
    const extra = new Set<string>();
    products.forEach((item) => {
      if (item.tag) extra.add(item.tag);
      if (item.category) extra.add(item.category);
    });
    section?.categories.forEach((item) => extra.add(item.title));
    return ['All', ...Array.from(extra)];
  }, [products, section]);

  const visible =
    tab === 'All'
      ? products
      : products.filter((item) => [item.tag, item.category].some((value) => (value || '').toLowerCase() === tab.toLowerCase()));

  if (!sections.length) {
    return <main className="page">Loading…</main>;
  }

  if (!section) {
    return (
      <main className="page">
        <p className="muted">Section not found. <Link to="/">Back home</Link></p>
      </main>
    );
  }

  return (
    <main className="page">
      <p className="muted">
        <Link to="/">Home</Link> / {section.title}
      </p>
      <h1>{section.title}</h1>
      {section.description ? <p className="muted">{section.description}</p> : null}

      {section.categories.length ? (
        <div className="cats" style={{ margin: '12px 0 8px' }}>
          {section.categories.map((cat) => (
            <Link key={cat.handle} className="cat" to={`/collection/${cat.handle}`}>
              {cat.imageUrl ? <img src={cat.imageUrl} alt="" /> : null}
              {cat.title}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="cats" style={{ margin: '16px 0' }}>
        {tabs.map((item) => (
          <button
            key={item}
            className="cat"
            type="button"
            onClick={() => setTab(item)}
            style={tab === item ? { background: '#ffe9a8' } : undefined}
          >
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
      {!visible.length && !error ? <p className="muted">No products in this section yet.</p> : null}
    </main>
  );
}
