'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/app/providers';

export default function LoginPage() {
  const { lang, t, setLang } = useLang();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await signIn('credentials', { username, password, redirect: false });
    setLoading(false);
    if (res?.ok) router.push('/dashboard');
    else setError(t.invalidCredentials);
  };

  const inp: React.CSSProperties = { width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--line)', padding: '12px 2px', fontSize: 16, color: 'var(--ink)', outline: 'none', boxSizing: 'border-box' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: 11, letterSpacing: '0.2em', color: 'var(--ink-soft)', marginBottom: 8, textTransform: 'uppercase' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'var(--cream)' }}>
      <div style={{ width: '100%', maxWidth: 340 }}>
        {/* Lang toggle */}
        <div style={{ textAlign: 'right', marginBottom: 16 }}>
          <button onClick={() => setLang(lang === 'he' ? 'fr' : 'he')} style={{ background: 'transparent', border: '1px solid var(--line)', borderRadius: 999, padding: '4px 12px', fontSize: 12, cursor: 'pointer', color: 'var(--ink-soft)' }}>
            {lang === 'he' ? 'FR' : 'עב'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 44, color: 'var(--green)', lineHeight: 1.1, fontStyle: 'italic', fontWeight: 300 }}>
            {lang === 'he' ? 'שיראל & הלל' : 'Shirel & Hillel'}
          </div>
          <p style={{ fontSize: 11, letterSpacing: '0.3em', color: 'var(--ink-soft)', marginTop: 8, textTransform: 'uppercase' }}>
            {t.subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid var(--line)', borderRadius: 20, padding: '36px 32px', backdropFilter: 'blur(12px)' }}>
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#991B1B', marginBottom: 20 }}>
              {error}
            </div>
          )}
          <div style={{ marginBottom: 20 }}>
            <label style={lbl}>{t.username}</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required autoComplete="username" style={inp} />
          </div>
          <div style={{ marginBottom: 32 }}>
            <label style={lbl}>{t.password}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" style={inp} />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: loading ? 'var(--green-light)' : 'var(--green-deep)', color: '#fff', border: 'none', borderRadius: 999, fontSize: 14, letterSpacing: '0.14em', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background 0.3s' }}>
            {loading ? '...' : t.signIn}
          </button>
        </form>
      </div>
    </div>
  );
}
