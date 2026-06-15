# Invitation Message

The default WhatsApp invitation message sent to guests. `{name}` is replaced with
each guest's name automatically. Lives in code at `admin/lib/whatsapp.ts`
(`DEFAULT_TEMPLATES`).

## Hebrew (he)

```
{name} !
בשעה טובה אנו מזמינים אתכם לחגוג את חתונתנו 🤍
את כל פרטי היום הגדול ואישורי הגעה תוכלו למצוא בקישור למטה:
https://shirel-hillel-project.vercel.app/
נשמח לחלוק אתכם את הרגע היקר הזה ✨
נשמח לראותכם!
שיראל והלל 🤍
```

## French (fr)

```
{name} !
C'est avec une immense joie et une grande reconnaissance envers Hachem que nous vous invitons à célébrer notre mariage 🤍
Vous trouverez tous les details du jour J sur le lien ci-dessous :
https://shirel-hillel-project.vercel.app/
Nous serons heureux de partager ce précieux moment avec vous ✨
Hâte de vous retrouver pour faire la fête !
Shirel & Hillel 🤍
```

---

**Note:** Emojis (🤍 ✨) render correctly only when the broadcast is sent from a
**phone**. WhatsApp Desktop on Windows corrupts emojis pre-filled via the wa.me
link into ◆ on send — a WhatsApp client bug, not fixable in code.
