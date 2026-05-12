/* ============================================
   VARIATION 1 — Minimal Classic
   Language switcher (HE/FR) at top-right
   Single-language at a time
   ============================================ */

const TEXT = {
  he: {
    flag: '🇮🇱',
    label: 'עברית',
    saveTheDate: 'שמרו את התאריך',
    nameA: 'שיראל',
    nameB: 'הלל',
    rsvpBtn: 'אישור הגעה',
    scroll: 'גלילה',
    invitedHeading: 'הוזמנתם בשמחה',
    invitedBlessing: 'קול ששון וקול שמחה\nקול חתן וקול כלה',
    invitedSub: 'בסיעתא דשמיא אנו שמחים להזמין אתכם\nלחופה ולשמחה של ילדינו',
    groomName: 'הלל',
    groomParents: ' של אריק ויעל ברוס',
    brideName: 'שיראל',
    brideParents: ' של סטיב וסנדרין אסוס',
    detailsKicker: 'פרטי האירוע',
    dateLabel: 'תאריך',
    placeLabel: 'מקום',
    timeLabel: 'שעה',
    dateMain: '09.08.2026',
    dateSub: 'יום ראשון · כ״ז באב',
    placeMain: 'גאיה',
    placeSub: 'חדרה',
    timeMain: '18:00',
    timeSub: 'קבלת פנים · חופה ב-19:00',
    countdownKicker: 'הספירה לאחור',
    days: 'ימים', hours: 'שעות', mins: 'דקות', secs: 'שניות',
    scheduleKicker: 'לוח זמנים',
    sched: [
    ['18:00', 'קבלת פנים', 'קוקטיילים, מטבל, מנגינות שקטות בגינה'],
    ['19:00', 'חופה', 'הטקס יתקיים תחת חופה בגינה'],
    ['20:30', 'ארוחה', 'ארוחה חגיגית עם תפריט שף וברכות'],
    ['22:00', 'ריקודים', 'DJ Sarko עד השעות הקטנות']],

    mapKicker: 'הוראות הגעה',
    venueName: 'גאיה',
    venueLine: 'אולם אירועים גאיה\nחדרה, ישראל',
    navWaze: 'ניווט עם Waze',
    navGoogle: 'ניווט עם Google Maps',
    galleryKicker: 'רגעים קטנים',
    rsvpKicker: 'אישור הגעה',
    rsvpDeadline: 'נשמח לקבל אישור הגעה עד 01.07.2026',
    fName: 'שם מלא', fPhone: 'טלפון', fAttend: 'הגעה',
    fYes: 'אגיע\nבשמחה', fNo: 'לא אוכל\nלהגיע',
    fGuests: 'מספר אורחים', fPref: 'העדפה',
    prefRegular: 'רגיל', prefVegan: 'טבעוני', prefKosher: 'חלק מחפוד',
    fNotes: 'הערה לכלה ולחתן', fNotesPh: 'ברכה, תזכורת, או סתם משהו חמוד...',
    fSubmit: 'שליחת אישור',
    thanks: 'תודה רבה!',
    thanksSub: 'קיבלנו את האישור שלכם. נתראה ב־09.08.2026',
    footerSign: 'באהבה — נתראה בקרוב'
  },
  fr: {
    flag: '🇫🇷',
    label: 'Français',
    saveTheDate: 'Save the Date',
    nameA: 'Shirel ',
    nameB: 'Hillel  ',
    rsvpBtn: 'Confirmer ma présence',
    scroll: 'Défiler',
    invitedHeading: 'Vous êtes invités',
    invitedBlessing: 'Houppa & Soirée',
    invitedSub: 'C’est avec une immense joie que nous\nvous invitons à la célébration du mariage\nde nos enfants',
    groomName: 'Hillel',
    groomParents: 'Erik et Yaël Bross',
    brideName: 'Shirel',
    brideParents: 'Steve et Sandrine Assous',
    detailsKicker: 'Les détails',
    dateLabel: 'Date',
    placeLabel: 'Lieu',
    timeLabel: 'Heure',
    dateMain: '09.08.2026',
    dateSub: 'Dimanche · 9 Août',
    placeMain: 'Gaïa',
    placeSub: 'Hadera, Israël',
    timeMain: '18:00',
    timeSub: 'Cocktail · Houppa à 19h00',
    countdownKicker: 'Le compte à rebours',
    days: 'Jours', hours: 'Heures', mins: 'Minutes', secs: 'Secondes',
    scheduleKicker: 'Le programme',
    sched: [
    ['18:00', 'Cocktail', 'Vin, amuse-bouches et musique douce dans le jardin'],
    ['19:00', 'Cérémonie', 'La houppa aura lieu dans le jardin intérieur'],
    ['20:30', 'Dîner', 'Dîner festif avec menu signé par le chef'],
    ['22:00', 'Soirée dansante', 'DJ Sarko jusqu\u2019au bout de la nuit']],

    mapKicker: 'L\u2019adresse',
    venueName: 'Gaïa',
    venueLine: 'Salle de réception Gaïa\nHadera, Israël',
    navWaze: 'Itinéraire avec Waze',
    navGoogle: 'Itinéraire avec Google Maps',
    galleryKicker: 'Souvenirs',
    rsvpKicker: 'RSVP',
    rsvpDeadline: 'Merci de confirmer avant le 01.07.2026',
    fName: 'Nom complet', fPhone: 'Téléphone', fAttend: 'Présence',
    fYes: 'Oui,\navec plaisir', fNo: 'Nous ne\npourrons pas',
    fGuests: 'Nombre d\u2019invités', fPref: 'Préférence',
    prefRegular: 'Standard', prefVegan: 'Végan', prefKosher: 'Casher Mehadrin',
    fNotes: 'Un mot doux pour les mariés', fNotesPh: 'Un vœu, un souvenir, ou juste un mot...',
    fSubmit: 'Envoyer',
    thanks: 'Merci infiniment !',
    thanksSub: 'Nous avons bien reçu votre réponse. À très bientôt — 09.08.2026',
    footerSign: ' à très bientôt...'
  }
};

/* ---------- Flag SVGs (no emoji deps) ---------- */
function FlagIL() {
  return (
    <svg viewBox="0 0 30 20" width="22" height="14" style={{ display: 'inline-block', verticalAlign: 'middle', borderRadius: 2, boxShadow: '0 0 0 1px rgba(0,0,0,0.15)' }}>
      <rect width="30" height="20" fill="#fff" />
      <rect y="2" width="30" height="2.4" fill="#0038B8" />
      <rect y="15.6" width="30" height="2.4" fill="#0038B8" />
      <g fill="none" stroke="#0038B8" strokeWidth="0.7">
        <polygon points="15,7.5 16.7,10.5 13.3,10.5" />
        <polygon points="15,12.5 13.3,9.5 16.7,9.5" />
      </g>
    </svg>);

}
function FlagFR() {
  return (
    <svg viewBox="0 0 30 20" width="22" height="14" style={{ display: 'inline-block', verticalAlign: 'middle', borderRadius: 2, boxShadow: '0 0 0 1px rgba(0,0,0,0.15)' }}>
      <rect width="10" height="20" fill="#0055A4" />
      <rect x="10" width="10" height="20" fill="#fff" />
      <rect x="20" width="10" height="20" fill="#EF4135" />
    </svg>);

}

/* ---------- Language Switcher (fixed, always right side) ---------- */
function LangSwitcher({ lang, setLang }) {
  return (
    <div dir="ltr" style={{
      position: 'fixed',
      top: 18,
      right: 18,
      display: 'flex',
      gap: 6,
      padding: 4,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: '1px solid var(--copper-light)',
      borderRadius: 999,
      zIndex: 100,
      boxShadow: '0 4px 16px rgba(107, 79, 46, 0.12)'
    }}>
      {[
      { code: 'he', flag: <FlagIL />, label: 'HE' },
      { code: 'fr', flag: <FlagFR />, label: 'FR' }].
      map(({ code, flag, label }) => {
        const active = lang === code;
        return (
          <button
            key={code}
            onClick={() => setLang(code)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              background: active ? 'var(--copper)' : 'transparent',
              color: active ? 'var(--cream)' : 'var(--ink)',
              fontFamily: 'var(--font-serif)',
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '0.18em',
              transition: 'all 0.3s'
            }}>
            
            {flag}
            <span>{label}</span>
          </button>);

      })}
    </div>);

}

/* ---------- Nav buttons (Waze + Google Maps) ---------- */
function NavButtons({ t }) {
  const wazeUrl = 'https://waze.com/ul?q=Gaia%20Hadera&navigate=yes';
  const gmapsUrl = 'https://www.google.com/maps/search/?api=1&query=Gaia+events+Hadera';
  const btnStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 20px',
    border: '1px solid var(--copper)',
    background: 'var(--cream)',
    color: 'var(--ink)',
    fontFamily: 'var(--font-serif)',
    fontSize: 14,
    fontWeight: 500,
    letterSpacing: '0.1em',
    textDecoration: 'none',
    transition: 'all 0.3s',
    cursor: 'pointer'
  };
  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 22 }}>
      <a href={wazeUrl} target="_blank" rel="noopener" style={{ ...btnStyle, borderRadius: "15px" }}
      onMouseEnter={(e) => {e.currentTarget.style.background = 'var(--copper)';e.currentTarget.style.color = 'var(--cream)';}}
      onMouseLeave={(e) => {e.currentTarget.style.background = 'var(--cream)';e.currentTarget.style.color = 'var(--ink)';}}>
        <img src="assets/waze.svg" alt="Waze" width="22" height="22" style={{ display: 'block' }} />
        <span>{t.navWaze}</span>
      </a>
      <a href={gmapsUrl} target="_blank" rel="noopener" style={{ ...btnStyle, borderRadius: "15px" }}
      onMouseEnter={(e) => {e.currentTarget.style.background = 'var(--copper)';e.currentTarget.style.color = 'var(--cream)';}}
      onMouseLeave={(e) => {e.currentTarget.style.background = 'var(--cream)';e.currentTarget.style.color = 'var(--ink)';}}>
        <img src="assets/google-map-icon.webp" alt="Google Maps" width="22" height="22" style={{ display: 'block' }} />
        <span>{t.navGoogle}</span>
      </a>
    </div>);

}

/* ---------- Map Block (localized) ---------- */
function MapBlockLocalized({ t }) {
  return (
    <div style={{
      border: '1px solid var(--line)',
      background: 'rgba(255,255,255,0.5)',
      padding: '32px 28px',
      textAlign: 'center', borderRadius: "15px"
    }}>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="var(--copper)" strokeWidth="1.2" style={{ margin: '0 auto 14px', display: 'block' }}>
        <path d="M24 6 C 16 6, 10 12, 10 20 C 10 30, 24 42, 24 42 C 24 42, 38 30, 38 20 C 38 12, 32 6, 24 6 Z" />
        <circle cx="24" cy="20" r="4" />
      </svg>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 500, color: 'var(--ink)' }}>{t.venueName}</div>
      <div style={{ marginTop: 14, fontSize: 16, color: 'var(--ink-soft)', fontWeight: 400, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
        {t.venueLine}
      </div>
      <NavButtons t={t} />
    </div>);

}

/* ---------- Localized Countdown ---------- */
function CountdownLocalized({ target, t }) {
  const tt = useCountdown(target);
  const cells = [
  { v: tt.days, l: t.days },
  { v: tt.hours, l: t.hours },
  { v: tt.mins, l: t.mins },
  { v: tt.secs, l: t.secs }];

  return (
    <div className="countdown-grid" dir="ltr">
      {cells.map((c, i) =>
      <div key={i} className="countdown-cell">
          <div className="countdown-num">{String(c.v).padStart(2, '0')}</div>
          <div className="countdown-label">{c.l}</div>
        </div>
      )}
    </div>);

}

/* ---------- Localized RSVP form ---------- */
function RSVPLocalized({ t }) {
  const [submitted, setSubmitted] = React.useState(false);
  const [data, setData] = React.useState({
    name: '', phone: '', attending: 'yes', guests: 1, pref: 'regular', notes: ''
  });
  const upd = (k) => (e) => setData((d) => ({ ...d, [k]: e.target.value }));
  const submit = (e) => {e.preventDefault();setSubmitted(true);};
  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontFamily: 'var(--font-script-display)', fontSize: 56, color: 'var(--copper)', lineHeight: 1 }}>{t.thanks}</div>
        <p style={{ marginTop: 18, color: 'var(--ink-soft)', fontSize: 15, fontWeight: 300 }}>{t.thanksSub}</p>
      </div>);

  }
  return (
    <form onSubmit={submit} style={{ maxWidth: 480, margin: '0 auto' }}>
      <div className="form-row">
        <input className="form-input" required value={data.name} onChange={upd('name')} placeholder={t.fName} />
      </div>
      <div className="form-row">
        <input className="form-input" type="tel" required value={data.phone} onChange={upd('phone')} placeholder={t.fPhone} />
      </div>
      <div className="form-row">
        <label className="form-label">{t.fAttend}</label>
        <div className="form-radio-group" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <label className="form-radio"><input type="radio" name="att" value="yes" checked={data.attending === 'yes'} onChange={upd('attending')} required /><span>{t.fYes}</span></label>
          <label className="form-radio"><input type="radio" name="att" value="no" checked={data.attending === 'no'} onChange={upd('attending')} required /><span>{t.fNo}</span></label>
        </div>
      </div>
      <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label className="form-label">{t.fGuests}</label>
          <input className="form-input" type="number" min="1" max="10" required value={data.guests} onChange={upd('guests')} />
        </div>
        <div>
          <label className="form-label">{t.fPref}</label>
          <select className="form-select" value={data.pref} onChange={upd('pref')}>
            <option value="regular">{t.prefRegular}</option>
            <option value="vegan">{t.prefVegan}</option>
            <option value="kosher">{t.prefKosher}</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <label className="form-label">{t.fNotes}</label>
        <textarea className="form-textarea" value={data.notes} onChange={upd('notes')} placeholder={t.fNotesPh} style={{ borderRadius: "15px" }} />
      </div>
      <div style={{ textAlign: 'center', marginTop: 28 }}>
        <button type="submit" className="btn btn-solid" style={{ borderRadius: "15px" }}>{t.fSubmit}</button>
      </div>
    </form>);

}

/* ---------- Schedule row (localized) ---------- */
function ScheduleLocalized({ rows }) {
  const icons = [Ic.glass, Ic.arch, Ic.plate, Ic.music];
  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      {rows.map((r, i) =>
      <ScheduleRow
        key={i}
        time={r[0]}
        title={r[1]}
        sub={r[2]}
        icon={icons[i]}
        last={i === rows.length - 1} />

      )}
    </div>);

}

/* ============================================
   MAIN
   ============================================ */
function Variation1() {
  const [lang, setLang] = React.useState('he');
  const t = TEXT[lang];
  const dir = lang === 'he' ? 'rtl' : 'ltr';

  useReveal();

  return (
    <div dir={dir} lang={lang} style={{
      background: 'var(--cream)',
      minHeight: '100%',
      position: 'relative',
      overflow: 'visible'
    }}>
      <SparkleField count={12} />
      <LangSwitcher lang={lang} setLang={setLang} />

      {/* HERO */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 32px 60px',
        position: 'relative',
        textAlign: 'center'
      }}>
        <div className="reveal delay-2" style={{
          fontFamily: lang === 'he' ? 'var(--font-serif)' : 'var(--font-script-display)',
          fontSize: lang === 'he' ? 'clamp(64px, 13vw, 150px)' : 'clamp(58px, 11vw, 130px)',
          lineHeight: 1.3,
          fontWeight: 400,
          letterSpacing: '0.02em',
          margin: '6px 0',
          color: 'inherit',
          overflow: 'visible'
        }}>
          <span className="gold-foil">{t.nameA}</span>
          <span style={{
            display: 'inline-block',
            margin: '0 24px',
            fontFamily: 'var(--font-script-display)',
            fontSize: '0.55em',
            color: 'var(--copper)',
            verticalAlign: 'middle'
          }}>&</span>
          <span className="gold-foil">{t.nameB}</span>
        </div>

        <div className="reveal delay-4" style={{ marginTop: 36, width: '100%', maxWidth: 480 }}>
          <OrnamentBotanic />
        </div>

        <div className="reveal delay-4" dir="ltr" style={{
          marginTop: 28,
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(18px, 2.2vw, 22px)',
          fontWeight: 500,
          color: 'var(--copper-deep)',
          letterSpacing: '0.18em'
        }}>
          <bdi>09</bdi> . <bdi>08</bdi> . <bdi>2026</bdi>
        </div>
        <div className="reveal delay-4" style={{
          marginTop: 8,
          fontFamily: lang === 'he' ? 'var(--font-serif)' : 'var(--font-latin-serif)',
          fontStyle: lang === 'he' ? 'normal' : 'italic',
          fontSize: 'clamp(16px, 1.8vw, 19px)',
          color: 'var(--ink-soft)',
          fontWeight: 400
        }}>
          {t.dateSub} · {t.placeMain}, {t.placeSub}
        </div>

        <div className="reveal delay-5" style={{ marginTop: 56 }}>
          <a href="#rsvp" className="btn btn-outline" style={{ borderRadius: "15px" }}>{t.rsvpBtn}</a>
        </div>

        <div style={{
          position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          fontFamily: 'var(--font-serif)', fontSize: 13, letterSpacing: '0.4em',
          color: 'var(--copper-deep)', fontWeight: 500
        }}>
          ↓ &nbsp; {t.scroll} &nbsp; ↓
        </div>
      </section>

      {/* INVITATION CARD */}
      <section style={{ padding: '120px 32px', background: 'var(--cream-deep)' }}>
        <div className="reveal" style={{
          maxWidth: 640,
          margin: '0 auto',
          textAlign: 'center',
          padding: '60px 48px 70px',
          background: 'var(--cream)',
          border: '1px solid var(--copper)',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute', top: -1, left: -1, right: -1, bottom: -1,
            border: '1px solid var(--copper)',
            transform: 'translate(8px, 8px)', pointerEvents: 'none',
            opacity: 0.3
          }} />

          {/* Monogram */}
          <OrnamentMonogram a="ש" b="ה" />

          {/* Blessing text */}
          <p style={{
            marginTop: 24,
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(18px, 2vw, 24px)',
            fontWeight: 400,
            lineHeight: 1.7,
            color: 'var(--copper-deep)',
            whiteSpace: 'pre-line',
          }}>
            {t.invitedBlessing}
          </p>

          <div style={{ margin: '28px auto', width: '55%' }}>
            <OrnamentSimple />
          </div>

          {/* Sub-text / blessing */}
          <p style={{
            fontFamily: lang === 'he' ? 'var(--font-serif)' : 'var(--font-latin-serif)',
            fontStyle: lang === 'he' ? 'normal' : 'italic',
            fontSize: 'clamp(15px, 1.6vw, 18px)',
            fontWeight: 400,
            lineHeight: 1.8,
            color: 'var(--ink-soft)',
            maxWidth: 460,
            margin: '0 auto',
            whiteSpace: 'pre-line',
          }}>
            {t.invitedSub}
          </p>

          {/* Names + Parents — two columns */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: 20,
            alignItems: 'center',
            marginTop: 40,
          }}>
            {/* Groom side (right in RTL) */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-script-display)',
                fontSize: 'clamp(38px, 5vw, 56px)',
                color: 'var(--copper-deep)',
                lineHeight: 1,
              }}>
                {lang === 'he' ? t.groomName : t.groomName}
              </div>
              <div style={{
                marginTop: 10,
                fontFamily: 'var(--font-serif)',
                fontSize: 14,
                fontWeight: 400,
                color: 'var(--ink-soft)',
                lineHeight: 1.5,
              }}>
                {t.groomParents}
              </div>
            </div>

            {/* Ampersand */}
            <div style={{
              fontFamily: 'var(--font-script-display)',
              fontSize: 32,
              color: 'var(--copper)',
            }}>&</div>

            {/* Bride side (left in RTL) */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-script-display)',
                fontSize: 'clamp(38px, 5vw, 56px)',
                color: 'var(--copper-deep)',
                lineHeight: 1,
              }}>
                {lang === 'he' ? t.brideName : t.brideName}
              </div>
              <div style={{
                marginTop: 10,
                fontFamily: 'var(--font-serif)',
                fontSize: 14,
                fontWeight: 400,
                color: 'var(--ink-soft)',
                lineHeight: 1.5,
              }}>
                {t.brideParents}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DETAILS GRID */}
      <section style={{ padding: '120px 32px' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 70 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(30px, 4vw, 42px)', fontWeight: 500, color: 'var(--ink)' }}>{t.detailsKicker}</h2>
        </div>

        <div className="invite-grid-3" style={{
          maxWidth: 880,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 0
        }}>
          {[
          { label: t.dateLabel, main: t.dateMain, sub: t.dateSub },
          { label: t.placeLabel, main: t.placeMain, sub: t.placeSub },
          { label: t.timeLabel, main: t.timeMain, sub: t.timeSub }].
          map((d, i) =>
          <div key={i} className={`reveal delay-${i + 1}`} style={{
            textAlign: 'center',
            padding: '40px 20px',
            borderInlineEnd: i < 2 ? '1px solid var(--line)' : 'none'
          }}>
              <div style={{ fontSize: 13, letterSpacing: '0.36em', color: 'var(--copper-deep)', textTransform: 'uppercase', fontWeight: 500, fontFamily: 'var(--font-serif)' }}>{d.label}</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 4vw, 34px)', fontWeight: 400, margin: '20px 0 10px', color: 'var(--ink)' }}>{d.main}</div>
              <div style={{ fontSize: 15, color: 'var(--ink-soft)', fontWeight: 400 }}>{d.sub}</div>
            </div>
          )}
        </div>
      </section>

      {/* COUNTDOWN */}
      <section style={{ padding: '90px 32px 110px', background: 'var(--cream-deep)', textAlign: 'center' }}>
        <div className="reveal">
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3vw, 34px)', fontWeight: 500, marginBottom: 36, color: 'var(--ink)' }}>{t.countdownKicker}</h3>
          <CountdownLocalized target={WEDDING_DATA.date} t={t} />
        </div>
      </section>

      {/* SCHEDULE */}
      <section style={{ padding: '120px 32px' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 50 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(30px, 4vw, 42px)', fontWeight: 500, color: 'var(--ink)' }}>{t.scheduleKicker}</h2>
        </div>
        <div className="reveal">
          <ScheduleLocalized rows={t.sched} />
        </div>
      </section>

      {/* MAP */}
      <section style={{ padding: '60px 32px 120px' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 40 }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 3.4vw, 36px)', fontWeight: 500, color: 'var(--ink)' }}>{t.mapKicker}</h3>
        </div>
        <div className="reveal" style={{ maxWidth: 460, margin: '0 auto' }}>
          <MapBlockLocalized t={t} />
        </div>
      </section>

      {/* GALLERY */}
      <section style={{ padding: '120px 32px', background: 'var(--cream-deep)' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 3.4vw, 36px)', fontWeight: 500, color: 'var(--ink)' }}>{t.galleryKicker}</h2>
        </div>
        <div className="reveal" style={{
          maxWidth: 980, margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'auto auto',
          gap: 16
        }}>
          <div style={{ gridRow: 'span 2' }}><PhotoPlaceholder ratio="3 / 4" label="01 · PORTRAIT" /></div>
          <div><PhotoPlaceholder ratio="4 / 3" label="02 · TOGETHER" /></div>
          <div><PhotoPlaceholder ratio="4 / 3" label="03 · MOMENT" /></div>
          <div><PhotoPlaceholder ratio="4 / 3" label="04 · DETAIL" /></div>
          <div><PhotoPlaceholder ratio="4 / 3" label="05 · SUNSET" /></div>
        </div>
      </section>

      {/* RSVP */}
      <section id="rsvp" style={{ padding: '120px 32px' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 50 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(30px, 4vw, 42px)', fontWeight: 500, color: 'var(--ink)' }}>{t.rsvpKicker}</h2>
          <p style={{ marginTop: 14, color: 'var(--ink-soft)', fontWeight: 400, fontSize: 16 }}>
            {t.rsvpDeadline}
          </p>
          <div style={{ marginTop: 28, maxWidth: 200, margin: '28px auto 0' }}>
            <OrnamentSimple />
          </div>
        </div>
        <div className="reveal">
          <RSVPLocalized t={t} />
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '60px 32px 80px', textAlign: 'center', background: 'var(--cream-deep)' }}>
        <div style={{ fontFamily: 'var(--font-script-display)', fontSize: 56, color: 'var(--copper)', lineHeight: 1 }}>
          Shirel & Hillel
        </div>
        <div dir="ltr" style={{ marginTop: 12, fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 300, letterSpacing: '0.18em' }}>
          <bdi>09</bdi> . <bdi>08</bdi> . <bdi>2026</bdi>
        </div>
        <div style={{ marginTop: 30, maxWidth: 320, margin: '30px auto 0' }}>
          <OrnamentSimple />
        </div>
        <div style={{
          marginTop: 24,
          fontFamily: lang === 'he' ? 'var(--font-serif)' : 'var(--font-latin-serif)',
          fontStyle: lang === 'he' ? 'normal' : 'italic',
          fontSize: 14, color: 'var(--ink-soft)'
        }}>
          {t.footerSign}
        </div>
      </footer>
    </div>);

}

window.Variation1 = Variation1;