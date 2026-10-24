import { Link } from 'react-router-dom';
import type { HomeSection } from '../api/types';
import { useShop } from '../store/shop';

function sectionImage(section: HomeSection) {
  return (
    section.imageUrl ||
    section.products.find((item) => item.imageUrl)?.imageUrl ||
    section.categories.find((item) => item.imageUrl)?.imageUrl ||
    '/logo.png'
  );
}

export function HomePage() {
  const banners = useShop((s) => s.banners);
  const sections = useShop((s) => s.sections);
  const top = banners[0];
  const rest = banners.slice(1);

  return (
    <main className="page">
      <div className="top-banner">
        {top?.imageUrl ? (
          <img src={top.imageUrl} alt={top.title || 'Swanand'} />
        ) : (
          <div className="banner-card" style={{ height: 320 }}>
            <h2>Swanand Online</h2>
            <p>Fresh grocery, delivered from your neighbourhood store.</p>
          </div>
        )}
        {top?.title ? <p className="banner-caption">{top.title}</p> : null}
      </div>

      {rest.length ? (
        <div className="banner-strip">
          {rest.map((banner) => (
            <div key={banner.id} className="banner-strip-item">
              {banner.imageUrl ? <img src={banner.imageUrl} alt={banner.title} /> : <strong>{banner.title}</strong>}
            </div>
          ))}
        </div>
      ) : null}

      <div className="section-title">
        <h2>Shop by section</h2>
      </div>
      <div className="section-grid">
        {sections.map((section) => (
          <Link key={section.id} className="section-card" to={`/section/${encodeURIComponent(section.id)}`}>
            <img src={sectionImage(section)} alt="" />
            <div>
              <h3>{section.title}</h3>
              <p className="muted">{section.description || 'View products'}</p>
            </div>
          </Link>
        ))}
      </div>
      {!sections.length ? <p className="notice">Loading sections…</p> : null}
    </main>
  );
}
