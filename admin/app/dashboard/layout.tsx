'use client';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLang } from '@/app/providers';
import HistoryLogPanel from '@/components/HistoryLogPanel';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { lang, t, setLang } = useLang();
  const router = useRouter();
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  if (status === 'loading' || !session) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)', color: 'var(--ink-soft)', fontSize: 13, letterSpacing: '0.2em' }}>{t.loading}</div>;
  }

  const navBtn: React.CSSProperties = { background: 'transparent', border: '1px solid var(--line)', borderRadius: 999, padding: '5px 13px', fontSize: 12, cursor: 'pointer', color: 'var(--ink-soft)', whiteSpace: 'nowrap' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(252,250,246,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--line)',
        padding: '0 20px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 60, gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: 'var(--green-deep)', fontStyle: 'italic', fontWeight: 400 }}>
            {t.brand}
          </span>
          <span style={{ fontSize: 10, letterSpacing: '0.22em', color: 'var(--ink-soft)', textTransform: 'uppercase', paddingLeft: 10, borderLeft: '1px solid var(--line)' }} className="nav-label">
            {t.subtitle}
          </span>
        </div>

        {/* Desktop */}
        <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Language toggle */}
          <button onClick={() => setLang(lang === 'he' ? 'fr' : 'he')} style={{ ...navBtn, fontWeight: 500, letterSpacing: '0.05em' }}>
            {lang === 'he' ? 'FR' : 'עב'}
          </button>
          <button onClick={() => setDark(d => !d)} style={navBtn}>{dark ? t.light : t.dark}</button>
          <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{session.user?.name}</span>
          <button onClick={() => signOut({ callbackUrl: '/login' })} style={navBtn}>{t.signOut}</button>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(o => !o)} className="nav-mobile" style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--ink-soft)', padding: 4 }}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {menuOpen && (
        <div className="nav-mobile" style={{ position: 'sticky', top: 60, zIndex: 49, background: 'rgba(252,250,246,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--line)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{session.user?.name}</span>
          <button onClick={() => { setLang(lang === 'he' ? 'fr' : 'he'); setMenuOpen(false); }} style={{ ...navBtn, textAlign: 'left', padding: '8px 16px', fontSize: 13 }}>
            {lang === 'he' ? '🇫🇷 Français' : '🇮🇱 עברית'}
          </button>
          <button onClick={() => { setDark(d => !d); setMenuOpen(false); }} style={{ ...navBtn, textAlign: 'left', padding: '8px 16px', fontSize: 13 }}>
            {dark ? t.light : t.dark}
          </button>
          <button onClick={() => signOut({ callbackUrl: '/login' })} style={{ ...navBtn, textAlign: 'left', padding: '8px 16px', fontSize: 13, color: '#B91C1C', borderColor: '#FECACA' }}>
            {t.signOut}
          </button>
        </div>
      )}

      <main style={{ padding: 'clamp(16px, 4vw, 40px)', paddingBottom: 96, fontFamily: 'var(--font-ui)' }}>{children}</main>
      <HistoryLogPanel />

      <style>{`
        @media (min-width: 640px) { .nav-desktop { display: flex !important; } .nav-mobile { display: none !important; } }
        @media (max-width: 639px) { .nav-desktop { display: none !important; } .nav-mobile { display: flex !important; } .nav-label { display: none; } }
        .dark body { background-color: #111A12 !important; color: #E8EDE8 !important; }
      `}</style>
    </div>
  );
}
