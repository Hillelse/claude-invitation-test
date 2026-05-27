/**
 * Split a summary string into parts, wrapping `NUMBER→NUMBER` sequences
 * in isolated LTR spans to prevent RTL bidi reversal in Hebrew UI.
 * Returns an array of strings and JSX-compatible objects; use renderSummaryParts() in JSX.
 */
export type SummaryPart = { type: 'text'; value: string } | { type: 'ltr'; value: string };

export function splitSummaryParts(s: string): SummaryPart[] {
  const parts = s.split(/(\d[\d\s\-]*→[\d\s\-]*\d)/);
  return parts.map(p => (/→/.test(p) && /\d/.test(p) ? { type: 'ltr', value: p } : { type: 'text', value: p }));
}

export function translateSummary(s: string, dir: 'ltr' | 'rtl'): string {
  if (dir === 'rtl') return s;
  return s
    .replace('מילא טופס לראשונה', 'Rempli pour la 1ère fois')
    .replace('מילא טופס · אישר פרטים', 'Formulaire · Détails confirmés')
    .replace('מילא טופס', 'Formulaire rempli')
    .replace('אישר פרטים', 'Détails confirmés')
    .replace('אורחים:', 'Invités:')
    .replace('תפריט:', 'Repas:')
    .replace('הגעה:', 'Présence:')
    .replace('סטטוס:', 'Statut:')
    .replace('שם:', 'Nom:')
    .replace('טלפון:', 'Tél:')
    .replace('נוסף ידנית', 'Ajouté manuellement')
    .replace('יובא מקובץ', 'Importé depuis fichier')
    .replace('רשומה נוצרה', 'Entrée créée');
}
