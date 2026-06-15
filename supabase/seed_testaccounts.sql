-- ============================================================
-- FRÖBEL.connect – Testaccounts Kita Münster
-- Ausführen im Supabase SQL-Editor (Einmalig)
--
-- Legt an:
--   elternteil@froebel-muenster.de  (role: eltern)
--   fachkraft@froebel-muenster.de   (role: fachkraft)
--   leitung@froebel-muenster.de     (role: fachkraft, is_leitung: true)
--
-- Passwort für alle Accounts: Test1234!
-- ============================================================

DO $$
DECLARE
  v_kita_id        UUID;
  v_eltern_id      UUID := gen_random_uuid();
  v_fachkraft_id   UUID := gen_random_uuid();
  v_leitung_id     UUID := gen_random_uuid();
  v_instance_id    UUID := '00000000-0000-0000-0000-000000000000';
BEGIN

  -- ── 1. Kita Münster anlegen (falls noch nicht vorhanden) ──────────────────
  SELECT id INTO v_kita_id
  FROM kitas
  WHERE name ILIKE '%münster%'
  LIMIT 1;

  IF v_kita_id IS NULL THEN
    INSERT INTO kitas (name, city, address)
    VALUES ('FRÖBEL Kita Münster', 'Münster', 'Musterstraße 1, 48143 Münster')
    RETURNING id INTO v_kita_id;
    RAISE NOTICE 'Kita angelegt: %', v_kita_id;
  ELSE
    RAISE NOTICE 'Kita bereits vorhanden: %', v_kita_id;
  END IF;


  -- ── 2. Auth-User anlegen ──────────────────────────────────────────────────
  -- Der Trigger on_auth_user_created erstellt automatisch den Profil-Eintrag.
  -- raw_user_meta_data liefert Name und Rolle an den Trigger.

  -- Elternteil
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'elternteil@froebel-muenster.de') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role,
      email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      is_super_admin, confirmation_token, recovery_token,
      email_change_token_new, email_change
    ) VALUES (
      v_eltern_id, v_instance_id, 'authenticated', 'authenticated',
      'elternteil@froebel-muenster.de',
      crypt('Test1234!', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Testmama Müller","role":"eltern"}',
      false, '', '', '', ''
    );
  END IF;

  -- Fachkraft
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'fachkraft@froebel-muenster.de') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role,
      email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      is_super_admin, confirmation_token, recovery_token,
      email_change_token_new, email_change
    ) VALUES (
      v_fachkraft_id, v_instance_id, 'authenticated', 'authenticated',
      'fachkraft@froebel-muenster.de',
      crypt('Test1234!', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Testkollegin Schmidt","role":"fachkraft"}',
      false, '', '', '', ''
    );
  END IF;

  -- Leitung
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'leitung@froebel-muenster.de') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role,
      email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      is_super_admin, confirmation_token, recovery_token,
      email_change_token_new, email_change
    ) VALUES (
      v_leitung_id, v_instance_id, 'authenticated', 'authenticated',
      'leitung@froebel-muenster.de',
      crypt('Test1234!', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Testleiterin Weber","role":"fachkraft"}',
      false, '', '', '', ''
    );
  END IF;


  -- ── 3. Profile mit kita_id + is_leitung befüllen ─────────────────────────
  -- Kurze Pause damit der Trigger sicher gelaufen ist
  PERFORM pg_sleep(0.1);

  UPDATE profiles
  SET kita_id    = v_kita_id,
      is_leitung = false
  WHERE email = 'elternteil@froebel-muenster.de';

  UPDATE profiles
  SET kita_id    = v_kita_id,
      is_leitung = false
  WHERE email = 'fachkraft@froebel-muenster.de';

  UPDATE profiles
  SET kita_id    = v_kita_id,
      is_leitung = true
  WHERE email = 'leitung@froebel-muenster.de';


  RAISE NOTICE '✓ Alle 3 Testaccounts angelegt und Kita Münster (%) zugeordnet.', v_kita_id;
  RAISE NOTICE '  elternteil@froebel-muenster.de  → eltern';
  RAISE NOTICE '  fachkraft@froebel-muenster.de   → fachkraft';
  RAISE NOTICE '  leitung@froebel-muenster.de     → fachkraft + is_leitung';
  RAISE NOTICE '  Passwort: Test1234!';

END $$;
