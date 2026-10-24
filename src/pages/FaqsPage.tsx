import { useEffect, useState } from 'react';
import { websiteApi } from '../api/website';
import type { FaqItem } from '../api/types';

export function FaqsPage() {
  const [items, setItems] = useState<FaqItem[]>([]);
  useEffect(() => {
    websiteApi.faqs().then(setItems).catch(() => undefined);
  }, []);
  return (
    <main className="page">
      <h1>FAQs</h1>
      {items.map((item) => (
        <details key={item.id} className="card" style={{ padding: 16, marginBottom: 10 }}>
          <summary><strong>{item.question}</strong></summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </main>
  );
}
