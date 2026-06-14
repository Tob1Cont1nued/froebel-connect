const PALETTE = [
  { bg: '#E3F2FD', color: '#1565C0' }, // Blau
  { bg: '#E8F5E9', color: '#2E7D32' }, // Grün
  { bg: '#F3E5F5', color: '#7B1FA2' }, // Lila
  { bg: '#FFF3E0', color: '#E65100' }, // Orange
  { bg: '#E0F2F1', color: '#00695C' }, // Teal
  { bg: '#FCE4EC', color: '#C2185B' }, // Pink
  { bg: '#E8EAF6', color: '#283593' }, // Indigo
  { bg: '#FFF8E1', color: '#F57F17' }, // Gelb
];

export function kitaColor(kitaId: string): { bg: string; color: string } {
  let hash = 0;
  for (let i = 0; i < kitaId.length; i++) {
    hash = (hash + kitaId.charCodeAt(i)) % PALETTE.length;
  }
  return PALETTE[hash];
}
