import { useEffect, useState } from 'react';
import { websiteApi } from '../api/website';
import type { StoreLocation } from '../api/types';
import { useShop } from '../store/shop';

export function LocationsPage() {
  const assetBaseUrl = useShop((s) => s.assetBaseUrl);
  const [items, setItems] = useState<StoreLocation[]>([]);
  useEffect(() => {
    websiteApi.locations(assetBaseUrl).then(setItems).catch(() => undefined);
  }, [assetBaseUrl]);
  return (
    <main className="page grid">
      {items.map((item) => (
        <article key={item.id} className="card" style={{ padding: 16 }}>
          {item.imageUrl ? <img src={item.imageUrl} alt="" style={{ height: 140, objectFit: 'cover', borderRadius: 12 }} /> : null}
          <h3>{item.name}</h3>
          <p>{item.address}</p>
          {item.phone ? <p>{item.phone}</p> : null}
          {item.mapUrl ? <a href={item.mapUrl} target="_blank" rel="noreferrer">Map</a> : null}
        </article>
      ))}
    </main>
  );
}
