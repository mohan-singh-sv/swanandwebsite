import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { brand } from '../config';
import { useShop } from '../store/shop';

export function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const login = useShop((s) => s.login);
  const skipLogin = useShop((s) => s.skipLogin);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email.trim().toLowerCase(), password);
      navigate(params.get('next') || '/');
    } catch (err: any) {
      setError(err.message || 'Could not log in');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page">
      <form className="form card" style={{ padding: 24, margin: '0 auto' }} onSubmit={onSubmit}>
        <img src={brand.logo} alt="" style={{ width: 96, margin: '0 auto', borderRadius: 24 }} />
        <h1>Log in</h1>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required minLength={6} />
        {error ? <p className="error">{error}</p> : null}
        <button className="btn" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Log in'}</button>
        <Link to="/signup">Create account</Link>
        <button
          className="btn ghost"
          type="button"
          onClick={() => {
            skipLogin();
            navigate('/');
          }}
        >
          Skip, browse grocery
        </button>
      </form>
    </main>
  );
}
