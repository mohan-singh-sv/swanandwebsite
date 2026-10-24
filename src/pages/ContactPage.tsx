import { useState, type FormEvent } from 'react';
import { websiteApi } from '../api/website';

export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      await websiteApi.contact({ name, email, phone, message });
      setDone(true);
    } catch (err: any) {
      setError(err.message || 'Could not send');
    }
  }

  return (
    <main className="page">
      <form className="form card" style={{ padding: 24 }} onSubmit={onSubmit}>
        <h1>Contact us</h1>
        {done ? <p className="notice">Thanks, we received your message.</p> : null}
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message" rows={5} required />
        {error ? <p className="error">{error}</p> : null}
        <button className="btn" type="submit">Send</button>
      </form>
    </main>
  );
}
