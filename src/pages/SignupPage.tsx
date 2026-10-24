import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { websiteApi } from '../api/website';
import { brand } from '../config';
import { useShop } from '../store/shop';

export function SignupPage() {
  const navigate = useNavigate();
  const completeSignup = useShop((s) => s.completeSignup);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function sendOtp(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await websiteApi.sendOtp(email.trim().toLowerCase(), name);
    } catch (err: any) {
      setError(err.message || 'Could not send OTP');
    } finally {
      setBusy(false);
    }
  }

  async function verifyAndRegister(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const verified = await websiteApi.verifyOtp(email.trim().toLowerCase(), code);
      const verificationToken = verified?.token || verified?.verificationToken || verified?.data?.token || code;
      setToken(verificationToken);
      await completeSignup({
        name,
        email: email.trim().toLowerCase(),
        phone,
        password,
        verificationToken: verificationToken || token,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Could not create account');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page">
      <form className="form card" style={{ padding: 24, margin: '0 auto' }} onSubmit={token || code ? verifyAndRegister : sendOtp}>
        <img src={brand.logo} alt="" style={{ width: 96, margin: '0 auto', borderRadius: 24 }} />
        <h1>Create account</h1>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Mobile number" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required minLength={6} />
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="OTP from email" />
        {error ? <p className="error">{error}</p> : null}
        <button className="btn" type="submit" disabled={busy}>
          {code ? 'Verify & register' : 'Send OTP'}
        </button>
      </form>
    </main>
  );
}
