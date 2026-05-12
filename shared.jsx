/* ===========================================================
   Shared components — used across all 3 wedding variations
   =========================================================== */

const WEDDING_DATA = {
  brideName: 'שיראל',
  groomName: 'הלל',
  brideNameFr: 'Shirel',
  groomNameFr: 'Hillel',
  date: new Date('2026-08-09T18:00:00+03:00'),
  dateHe: 'יום ראשון, ט״ו באב התשפ״ו',
  dateLatin: '9 Août 2026',
  dateShort: '09 . 08 . 2026',
  venue: 'גאיה',
  venueLine2: 'חדרה',
  venueLatin: 'Gaïa, Hadera',
  reception: '18:00',
  chuppah: '19:00',
  address: 'גאיה אירועים, חדרה',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Gaia+events+Hadera',
};

/* ---------- Reveal-on-scroll observer ---------- */
function useReveal() {
  React.useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  });
}

/* ---------- Countdown ---------- */
function useCountdown(target) {
  const [t, setT] = React.useState(() => diff(target));
  React.useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);
  return t;
}
function diff(target) {
  const ms = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return { days, hours, mins, secs };
}

function Countdown({ target }) {
  const t = useCountdown(target);
  const cells = [
    { v: t.days, l: 'ימים' },
    { v: t.hours, l: 'שעות' },
    { v: t.mins, l: 'דקות' },
    { v: t.secs, l: 'שניות' },
  ];
  return (
    <div className="countdown-grid">
      {cells.map((c, i) => (
        <div key={i} className="countdown-cell">
          <div className="countdown-num">{String(c.v).padStart(2,'0')}</div>
          <div className="countdown-label">{c.l}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Floating petals ---------- */
function PetalField({ count = 14, kind = 'petal' }) {
  const items = React.useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 18,
      duration: 18 + Math.random() * 22,
      size: 14 + Math.random() * 22,
      drift: (Math.random() - 0.5) * 220 + 'px',
      rot: Math.random() * 360,
    }));
  }, [count]);
  return (
    <div className="petal-field">
      {items.map(p => (
        <div
          key={p.id}
          className="petal"
          style={{
            left: p.left + '%',
            width: p.size, height: p.size,
            animationDelay: -p.delay + 's',
            animationDuration: p.duration + 's',
            '--drift': p.drift,
            transform: `rotate(${p.rot}deg)`,
          }}
        >
          {kind === 'petal' ? <PetalSVG /> : <LeafSVG />}
        </div>
      ))}
    </div>
  );
}

function PetalSVG() {
  return (
    <svg viewBox="0 0 40 40" width="100%" height="100%" style={{ display: 'block' }}>
      <defs>
        <radialGradient id="pg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#F4DCA8" stopOpacity="0.95"/>
          <stop offset="60%" stopColor="#D4B68A" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#B08D5C" stopOpacity="0.5"/>
        </radialGradient>
      </defs>
      <path d="M20 4 C 28 12, 32 20, 20 36 C 8 20, 12 12, 20 4 Z" fill="url(#pg)" stroke="#8C6E42" strokeOpacity="0.4" strokeWidth="0.5"/>
    </svg>
  );
}

function LeafSVG() {
  return (
    <svg viewBox="0 0 40 40" width="100%" height="100%" style={{ display: 'block' }}>
      <path d="M6 34 C 10 14, 24 6, 34 6 C 34 18, 24 32, 6 34 Z" fill="#B08D5C" fillOpacity="0.55" stroke="#8C6E42" strokeOpacity="0.5" strokeWidth="0.6"/>
      <path d="M8 32 C 16 22, 26 12, 33 7" stroke="#8C6E42" strokeOpacity="0.55" strokeWidth="0.6" fill="none"/>
    </svg>
  );
}

/* ---------- Sparkles ---------- */
function SparkleField({ count = 18 }) {
  const items = React.useMemo(() =>
    Array.from({length: count}).map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      dur: 2 + Math.random() * 3,
      size: 3 + Math.random() * 4,
    })), [count]);
  return (
    <>
      {items.map(s => (
        <div key={s.id} className="sparkle" style={{
          top: s.top + '%', left: s.left + '%',
          width: s.size, height: s.size,
          animationDelay: s.delay + 's',
          animationDuration: s.dur + 's',
        }} />
      ))}
    </>
  );
}

/* ---------- Ornament dividers ---------- */
function OrnamentSimple() {
  return (
    <div className="ornament-divider">
      <span className="line"></span>
      <svg width="38" height="14" viewBox="0 0 38 14" fill="none">
        <circle cx="19" cy="7" r="2.4" fill="currentColor"/>
        <circle cx="6" cy="7" r="1" fill="currentColor"/>
        <circle cx="32" cy="7" r="1" fill="currentColor"/>
      </svg>
      <span className="line"></span>
    </div>
  );
}

function OrnamentBotanic() {
  return (
    <div className="ornament-divider">
      <span className="line"></span>
      <svg width="64" height="22" viewBox="0 0 64 22" fill="none" stroke="currentColor" strokeWidth="0.9">
        <path d="M2 11 C 14 11, 22 4, 32 11 C 42 18, 50 11, 62 11"/>
        <path d="M22 7 C 24 4, 26 4, 28 7" />
        <path d="M36 15 C 38 18, 40 18, 42 15" />
        <circle cx="32" cy="11" r="1.6" fill="currentColor"/>
      </svg>
      <span className="line"></span>
    </div>
  );
}

function OrnamentMonogram({ a = 'ש', b = 'ה' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <svg width="120" height="84" viewBox="0 0 120 84" fill="none" stroke="var(--copper)" strokeWidth="0.8">
        <ellipse cx="60" cy="42" rx="54" ry="34" />
        <ellipse cx="60" cy="42" rx="48" ry="29" strokeOpacity="0.45"/>
        <text x="42" y="52" fontFamily="var(--font-serif)" fontSize="30" fill="var(--copper-deep)" stroke="none" fontWeight="300" textAnchor="middle">{a}</text>
        <text x="60" y="52" fontFamily="var(--font-serif)" fontSize="22" fill="var(--copper)" stroke="none">&</text>
        <text x="78" y="52" fontFamily="var(--font-serif)" fontSize="30" fill="var(--copper-deep)" stroke="none" fontWeight="300" textAnchor="middle">{b}</text>
      </svg>
    </div>
  );
}

/* ---------- RSVP Form ---------- */
function RSVPForm({ accentLabel = 'שלחו אישור הגעה' }) {
  const [submitted, setSubmitted] = React.useState(false);
  const [data, setData] = React.useState({
    name: '', phone: '', attending: 'yes', guests: 1, pref: 'regular', notes: '',
  });
  const upd = (k) => (e) => setData(d => ({ ...d, [k]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };
  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontFamily: 'var(--font-script-display)', fontSize: 56, color: 'var(--copper)', lineHeight: 1 }}>Merci</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, marginTop: 12, color: 'var(--ink)' }}>תודה רבה!</div>
        <p style={{ marginTop: 12, color: 'var(--ink-soft)', fontSize: 15, fontWeight: 300 }}>
          קיבלנו את האישור שלכם. נתראה ב־09.08.2026 ❦
        </p>
      </div>
    );
  }
  return (
    <form onSubmit={submit} style={{ maxWidth: 480, margin: '0 auto' }}>
      <div className="form-row">
        <label className="form-label">שם מלא · Nom complet</label>
        <input className="form-input" required value={data.name} onChange={upd('name')} placeholder="שם פרטי ומשפחה" />
      </div>
      <div className="form-row">
        <label className="form-label">טלפון · Téléphone</label>
        <input className="form-input" type="tel" required value={data.phone} onChange={upd('phone')} placeholder="050-0000000" />
      </div>
      <div className="form-row">
        <label className="form-label">הגעה · Présence</label>
        <div className="form-radio-group">
          <label className="form-radio"><input type="radio" name="att" value="yes" checked={data.attending==='yes'} onChange={upd('attending')} /> כן, נגיע בשמחה</label>
          <label className="form-radio"><input type="radio" name="att" value="no" checked={data.attending==='no'} onChange={upd('attending')} /> לא נוכל להגיע</label>
          <label className="form-radio"><input type="radio" name="att" value="maybe" checked={data.attending==='maybe'} onChange={upd('attending')} /> עדיין לא בטוחים</label>
        </div>
      </div>
      <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label className="form-label">מספר אורחים</label>
          <input className="form-input" type="number" min="0" max="10" value={data.guests} onChange={upd('guests')} />
        </div>
        <div>
          <label className="form-label">העדפה תזונתית</label>
          <select className="form-select" value={data.pref} onChange={upd('pref')}>
            <option value="regular">רגיל / חלק מהפוד</option>
            <option value="vegetarian">צמחוני</option>
            <option value="vegan">טבעוני</option>
            <option value="kosher">חלק מהפוד מהדרין</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <label className="form-label">הערה לכלה ולחתן · Mot doux</label>
        <textarea className="form-textarea" value={data.notes} onChange={upd('notes')} placeholder="ברכה, תזכורת, או סתם משהו חמוד..." />
      </div>
      <div style={{ textAlign: 'center', marginTop: 28 }}>
        <button type="submit" className="btn btn-solid">{accentLabel}</button>
      </div>
    </form>
  );
}

/* ---------- Photo placeholder ---------- */
function PhotoPlaceholder({ ratio = '3 / 4', label = 'PHOTO' }) {
  return (
    <div className="photo-placeholder" style={{ aspectRatio: ratio, width: '100%' }}>
      {label}
    </div>
  );
}

/* ---------- Map block ---------- */
function MapBlock() {
  return (
    <div style={{
      border: '1px solid var(--line)',
      background: 'rgba(255,255,255,0.5)',
      padding: '32px 28px',
      textAlign: 'center',
    }}>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="var(--copper)" strokeWidth="1.2" style={{ margin: '0 auto 14px', display: 'block' }}>
        <path d="M24 6 C 16 6, 10 12, 10 20 C 10 30, 24 42, 24 42 C 24 42, 38 30, 38 20 C 38 12, 32 6, 24 6 Z"/>
        <circle cx="24" cy="20" r="4"/>
      </svg>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 400 }}>{WEDDING_DATA.venue}</div>
      <div style={{ fontFamily: 'var(--font-latin-serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--ink-soft)', marginTop: 4 }}>
        {WEDDING_DATA.venueLatin}
      </div>
      <div style={{ marginTop: 14, fontSize: 14, color: 'var(--ink-soft)', fontWeight: 300, lineHeight: 1.7 }}>
        אולם אירועים גאיה<br/>
        חדרה, ישראל
      </div>
      <a href={WEDDING_DATA.mapsUrl} target="_blank" rel="noopener" className="btn btn-outline" style={{ marginTop: 22, fontSize: 13, padding: '12px 28px' }}>
        ניווט בגוגל מפות
      </a>
    </div>
  );
}

/* ---------- Schedule item ---------- */
function ScheduleRow({ time, title, sub, icon, last }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '90px 1fr',
      gap: 24,
      padding: '24px 0',
      borderBottom: last ? 'none' : '1px solid var(--line)',
      alignItems: 'flex-start',
    }}>
      <div style={{ textAlign: 'left', direction: 'ltr', fontFamily: 'var(--font-serif)' }}>
        <div style={{ fontSize: 30, fontWeight: 500, color: 'var(--copper-deep)', letterSpacing: '0.04em' }}>{time}</div>
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {icon}
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 500, color: 'var(--ink)' }}>{title}</div>
        </div>
        {sub && <div style={{ marginTop: 8, color: 'var(--ink-soft)', fontWeight: 400, fontSize: 15, lineHeight: 1.6 }}>{sub}</div>}
      </div>
    </div>
  );
}

/* ---------- Icons for schedule ---------- */
const Ic = {
  glass: <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="var(--copper)" strokeWidth="0.9"><path d="M6 4 L 16 4 L 14 11 C 14 13, 12 13.5, 11 13.5 C 10 13.5, 8 13, 8 11 Z"/><path d="M11 13.5 L 11 18"/><path d="M8 18 L 14 18"/></svg>,
  arch:  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="var(--copper)" strokeWidth="0.9"><path d="M3 19 L 3 11 C 3 6, 7 3, 11 3 C 15 3, 19 6, 19 11 L 19 19"/><path d="M11 3 L 11 19"/></svg>,
  plate: <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="var(--copper)" strokeWidth="0.9"><circle cx="11" cy="11" r="8"/><circle cx="11" cy="11" r="5"/></svg>,
  music: <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="var(--copper)" strokeWidth="0.9"><circle cx="6" cy="16" r="2.5"/><circle cx="16" cy="14" r="2.5"/><path d="M8.5 16 L 8.5 5 L 18.5 4 L 18.5 14"/></svg>,
};

/* ---------- Export to scope ---------- */
Object.assign(window, {
  WEDDING_DATA, useReveal, useCountdown, Countdown,
  PetalField, PetalSVG, LeafSVG, SparkleField,
  OrnamentSimple, OrnamentBotanic, OrnamentMonogram,
  RSVPForm, PhotoPlaceholder, MapBlock, ScheduleRow, Ic,
});
