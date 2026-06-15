import type { Session } from '@supabase/supabase-js';

export const FAKE_PROFILE = {
  id:         'profile-user-1',
  name:       'Testkollegin Schmidt',
  email:      'fachkraft@froebel-muenster.de',
  role:       'fachkraft' as const,
  kita_id:    'kita-muenster-1',
  avatar:     null,
  avatar_url: null,
  is_leitung: false,
  created_at: '2026-01-01T00:00:00Z',
};

export const FAKE_LEITUNG_PROFILE = {
  ...FAKE_PROFILE,
  id:         'profile-leitung-1',
  name:       'Testleiterin Weber',
  email:      'leitung@froebel-muenster.de',
  is_leitung: true,
};

export const FAKE_ELTERN_PROFILE = {
  ...FAKE_PROFILE,
  id:         'profile-eltern-1',
  name:       'Testmama Müller',
  email:      'elternteil@froebel-muenster.de',
  role:       'eltern' as const,
  is_leitung: false,
};

export const FAKE_SESSION = {
  user: { id: FAKE_PROFILE.id, email: FAKE_PROFILE.email },
} as unknown as Session;

export const FAKE_ELTERN_SESSION = {
  user: { id: FAKE_ELTERN_PROFILE.id, email: FAKE_ELTERN_PROFILE.email },
} as unknown as Session;
