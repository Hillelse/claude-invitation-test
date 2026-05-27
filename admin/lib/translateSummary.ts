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
