export type Role = 'eltern' | 'fachkraft' | 'traeger';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
}

export interface Child {
  id: string;
  name: string;
  age: number;
  kita: string;
  emoji: string;
}

export interface Message {
  id: string;
  sender: string;
  text: string;
  time: Date;
  isMe: boolean;
}

export interface Conversation {
  id: string;
  from: string;
  fromRole: string;
  avatar: string;
  preview: string;
  lastMessage: Date;
  unread: number;
  messages: Message[];
}

export interface Appointment {
  id: string;
  title: string;
  date: Date;
  time?: string;
  type: 'event' | 'closure' | 'meeting' | 'info';
  description?: string;
}

export interface AbsenceEntry {
  id: string;
  from: Date;
  to: Date;
  reason: string;
  note?: string;
  status: 'pending' | 'confirmed';
}

export interface PortfolioEntry {
  id: string;
  emoji: string;
  title: string;
  description: string;
  date: Date;
}

export interface Document {
  id: string;
  title: string;
  category: string;
  date: Date;
  icon: string;
  size: string;
}

// --- Mock Users ---
export const mockUsers: Record<Role, User> = {
  eltern: { id: '1', name: 'Sandra Meier', email: 'sandra.meier@example.de', role: 'eltern', avatar: 'SM' },
  fachkraft: { id: '2', name: 'Stefanie Müller', email: 'stefanie.mueller@froebel.de', role: 'fachkraft', avatar: 'SM' },
  traeger: { id: '3', name: 'Thomas Becker', email: 'thomas.becker@froebel.de', role: 'traeger', avatar: 'TB' },
};

export const currentChild: Child = {
  id: '1',
  name: 'Emma',
  age: 4,
  kita: 'Kita Langebusch',
  emoji: '🌻',
};

// --- Conversations ---
export const conversations: Conversation[] = [
  {
    id: '1',
    from: 'Stefanie Müller',
    fromRole: 'Erzieherin',
    avatar: 'SM',
    preview: 'Emma hat heute beim Frühstück sehr wenig gegessen...',
    lastMessage: new Date('2026-06-12T08:30:00'),
    unread: 2,
    messages: [
      {
        id: '1',
        sender: 'Stefanie Müller',
        text: 'Hallo Sandra! Emma hat heute beim Frühstück sehr wenig gegessen. Bitte prüfen, ob alles in Ordnung ist.',
        time: new Date('2026-06-12T08:30:00'),
        isMe: false,
      },
      {
        id: '2',
        sender: 'Stefanie Müller',
        text: 'Beim Mittagessen hat sie dann wieder mehr gegessen 😊 Wollte euch nur kurz informieren.',
        time: new Date('2026-06-12T12:15:00'),
        isMe: false,
      },
    ],
  },
  {
    id: '2',
    from: 'Kita-Team Langebusch',
    fromRole: 'Allgemeine Mitteilungen',
    avatar: 'KL',
    preview: 'Sommerfest am 25. Juli! Bitte bis zum 20. Juli anmelden.',
    lastMessage: new Date('2026-06-10T14:00:00'),
    unread: 0,
    messages: [
      {
        id: '1',
        sender: 'Kita-Team',
        text: '🎉 Einladung zum Sommerfest! Am 25. Juli ab 15 Uhr starten wir gemeinsam. Bitte meldet euch bis zum 20. Juli über das digitale Formular an.',
        time: new Date('2026-06-10T14:00:00'),
        isMe: false,
      },
      {
        id: '2',
        sender: 'Ich',
        text: 'Super, wir kommen gerne! Sollen wir etwas mitbringen?',
        time: new Date('2026-06-10T16:30:00'),
        isMe: true,
      },
      {
        id: '3',
        sender: 'Kita-Team',
        text: 'Herzlichen Dank! Ihr könnt gerne einen Salat oder Kuchen mitbringen — freiwillig natürlich 😊',
        time: new Date('2026-06-10T17:00:00'),
        isMe: false,
      },
    ],
  },
  {
    id: '3',
    from: 'Jana Weber',
    fromRole: 'Erzieherin Sonnenblume',
    avatar: 'JW',
    preview: 'Emmas Elterngespräch: Termin bestätigt für 18. Juni.',
    lastMessage: new Date('2026-06-08T09:00:00'),
    unread: 0,
    messages: [
      {
        id: '1',
        sender: 'Jana Weber',
        text: 'Guten Morgen! Euer Termin zum Elterngespräch am 18. Juni um 14:30 Uhr ist bestätigt. Wir freuen uns auf euch!',
        time: new Date('2026-06-08T09:00:00'),
        isMe: false,
      },
    ],
  },
];

// --- Appointments ---
export const appointments: Appointment[] = [
  {
    id: '1',
    title: 'Elterngespräch – Emma',
    date: new Date('2026-06-18T14:30:00'),
    time: '14:30 Uhr',
    type: 'meeting',
    description: 'Entwicklungsgespräch mit Jana Weber, Kita Langebusch.',
  },
  {
    id: '2',
    title: 'Sommerfest 🎉',
    date: new Date('2026-07-25T15:00:00'),
    time: '15:00 Uhr',
    type: 'event',
    description: 'Das große Sommerfest für alle Familien der Kita Langebusch.',
  },
  {
    id: '3',
    title: 'Schließtag – Brückentag',
    date: new Date('2026-07-02'),
    type: 'closure',
    description: 'Die Kita bleibt ganztägig geschlossen.',
  },
  {
    id: '4',
    title: 'Projektwoche "Wasser"',
    date: new Date('2026-07-07'),
    time: 'Ganze Woche',
    type: 'info',
    description: 'Bitte wasserfeste Kleidung und Wechselklamotten einpacken.',
  },
  {
    id: '5',
    title: 'Ausflug Zoo Münster',
    date: new Date('2026-06-20T09:00:00'),
    time: '09:00 Uhr',
    type: 'event',
    description: 'Kita-Ausflug in den Zoo Münster. Bitte bis 8:45 Uhr da sein.',
  },
];

// --- Absences ---
export const absences: AbsenceEntry[] = [
  {
    id: '1',
    from: new Date('2026-06-02'),
    to: new Date('2026-06-03'),
    reason: 'Krankheit',
    note: 'Erkältung, Arzt aufgesucht.',
    status: 'confirmed',
  },
  {
    id: '2',
    from: new Date('2026-05-12'),
    to: new Date('2026-05-12'),
    reason: 'Arzttermin',
    status: 'confirmed',
  },
];

// --- Portfolio ---
export const portfolioEntries: PortfolioEntry[] = [
  {
    id: '1',
    emoji: '🎨',
    title: 'Kunstprojekt – Frühling',
    description: 'Emma hat ein wunderschönes Frühlingsbild mit Fingerfarben gestaltet.',
    date: new Date('2026-06-05'),
  },
  {
    id: '2',
    emoji: '🌱',
    title: 'Wir pflanzen Tomaten',
    description: 'Gartenarbeit in der Kita: jedes Kind hat eine eigene Tomatenpflanze.',
    date: new Date('2026-05-28'),
  },
  {
    id: '3',
    emoji: '🏃',
    title: 'Sporttag im Garten',
    description: 'Staffelläufe, Sackhüpfen und Zielwerfen – Emma war super dabei!',
    date: new Date('2026-05-20'),
  },
  {
    id: '4',
    emoji: '📚',
    title: 'Vorlesezeit',
    description: 'Wir haben gemeinsam „Die kleine Raupe Nimmersatt" gelesen.',
    date: new Date('2026-05-14'),
  },
  {
    id: '5',
    emoji: '🎭',
    title: 'Kasperle-Theater',
    description: 'Emma hat eine Figur selbst gebastelt und mitgespielt.',
    date: new Date('2026-05-07'),
  },
  {
    id: '6',
    emoji: '🧁',
    title: 'Backen für Ostern',
    description: 'Osterhasen-Kekse selbst gebacken und verziert.',
    date: new Date('2026-04-15'),
  },
];

// --- Documents ---
export const documents: Document[] = [
  { id: '1', title: 'Betreuungsvertrag 2025/2026', category: 'Verträge', date: new Date('2025-08-01'), icon: '📄', size: '245 KB' },
  { id: '2', title: 'Hygieneplan Kita Langebusch', category: 'Informationen', date: new Date('2026-01-15'), icon: '📋', size: '128 KB' },
  { id: '3', title: 'Speiseplan Juni 2026', category: 'Speiseplan', date: new Date('2026-06-01'), icon: '🍽️', size: '82 KB' },
  { id: '4', title: 'Elternbeitrags-Bescheid 2026', category: 'Finanzen', date: new Date('2026-01-01'), icon: '💶', size: '64 KB' },
  { id: '5', title: 'Eingewöhnungsplan Emma', category: 'Pädagogik', date: new Date('2024-09-01'), icon: '📝', size: '156 KB' },
];

// --- Team mock data ---
export const teamChildren = [
  { id: '1', name: 'Emma Meier', age: 4, present: true, emoji: '🌻' },
  { id: '2', name: 'Luca Schmidt', age: 3, present: true, emoji: '⭐' },
  { id: '3', name: 'Mia Hoffmann', age: 4, present: false, emoji: '🌈' },
  { id: '4', name: 'Noah Fischer', age: 3, present: true, emoji: '🚀' },
  { id: '5', name: 'Lena Wagner', age: 5, present: true, emoji: '🦋' },
  { id: '6', name: 'Felix Bauer', age: 4, present: false, emoji: '🐻' },
];

// --- Träger mock data ---
export const traegerStats = {
  einrichtungen: 240,
  kinder: 9600,
  fachkraefte: 1440,
  elternAktiv: 7200,
  nachrichtenHeute: 1847,
  abwesenheitenHeute: 234,
};

export const einrichtungen = [
  { id: '1', name: 'Kita Langebusch', city: 'Münster', children: 42, staff: 6, status: 'aktiv' },
  { id: '2', name: 'Kita Sonnenschein', city: 'Berlin', children: 38, staff: 5, status: 'aktiv' },
  { id: '3', name: 'Kita Regenbogen', city: 'Hamburg', children: 45, staff: 7, status: 'aktiv' },
  { id: '4', name: 'Kita Sternchen', city: 'München', children: 30, staff: 4, status: 'aktiv' },
  { id: '5', name: 'Kita Waldweg', city: 'Köln', children: 36, staff: 5, status: 'aktiv' },
];
