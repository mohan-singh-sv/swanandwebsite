import { useEffect, useState, type FormEvent } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { brand } from '../config';
import { isLoggedIn, useShop } from '../store/shop';

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const onHome = location.pathname === '/';
  const [q, setQ] = useState('');
  const restore = useShop((s) => s.restore);
  const bootstrap = useShop((s) => s.bootstrap);
  const announcements = useShop((s) => s.announcements);
  const collections = useShop((s) => s.collections);
  const items = useShop((s) => s.items);
  const user = useShop((s) => s.user);
  const loggedIn = isLoggedIn(user);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    restore();
    bootstrap().catch(() => undefined);
  }, [bootstrap, restore]);

  function onSearch(event: FormEvent) {
    event.preventDefault();
    const query = q.trim();
    if (query) navigate(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <>
      {announcements[0]?.title ? <div className="announce">{announcements[0].title}</div> : null}
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="brand">
            <img src={brand.logo} alt={brand.name} />
            <span>
              {brand.name}
              <div className="muted" style={{ fontSize: 12, fontWeight: 700 }}>
                {brand.tagline}
              </div>
            </span>
          </Link>
          <form className="search" onSubmit={onSearch}>
            <span>🔎</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search grocery, atta, milk, snacks…" />
          </form>
          <Link className="btn ghost" to="/cart">
            Cart{count ? <span className="badge">{count}</span> : null}
          </Link>
          {loggedIn ? (
            <Link className="btn lime" to="/orders">
              {user?.name?.split(' ')[0] || 'Account'}
            </Link>
          ) : (
            <Link className="btn" to="/login">
              Log in
            </Link>
          )}
        </div>
      </header>
      {!onHome && collections.length ? (
        <nav className="page" style={{ paddingTop: 12, paddingBottom: 0 }}>
          <div className="cats">
            {collections.map((item) => (
              <NavLink key={item.id || item.handle} to={`/collection/${item.handle}`} className="cat">
                {item.imageUrl ? <img src={item.imageUrl} alt="" /> : <div style={{ height: 72 }} />}
                {item.title}
              </NavLink>
            ))}
          </div>
        </nav>
      ) : null}
      <Outlet />
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <img src={brand.logo} alt="" style={{ width: 72, borderRadius: 16, background: '#fff' }} />
            <h3>{brand.name}</h3>
            <p>{brand.tagline}</p>
            <p>Grocery delivered from Swanand stores. Same APIs as the mobile app.</p>
          </div>
          <div>
            <strong>Shop</strong>
            {collections.slice(0, 8).map((item) => (
              <Link key={item.handle} to={`/collection/${item.handle}`}>
                {item.title}
              </Link>
            ))}
          </div>
          <div>
            <strong>Help</strong>
            <Link to="/faqs">FAQs</Link>
            <Link to="/locations">Store locations</Link>
            <Link to="/contact">Contact us</Link>
            <Link to="/orders">My orders</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
