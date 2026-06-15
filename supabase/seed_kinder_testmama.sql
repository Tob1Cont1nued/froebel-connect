-- ============================================================
-- FRÖBEL.connect – Zwei Kinder für Testmama Müller
-- Ausführen im Supabase SQL-Editor
-- ============================================================

DO $$
DECLARE
  v_parent_id  UUID;
  v_kita_id    UUID;
  v_kind1_id   UUID;
  v_kind2_id   UUID;
BEGIN

  -- Elternteil-Profil holen
  SELECT id, kita_id INTO v_parent_id, v_kita_id
  FROM profiles
  WHERE email = 'elternteil@froebel-muenster.de'
  LIMIT 1;

  IF v_parent_id IS NULL THEN
    RAISE EXCEPTION 'Profil elternteil@froebel-muenster.de nicht gefunden – bitte zuerst seed_testaccounts.sql ausführen';
  END IF;

  -- Kind 1
  INSERT INTO children (name, age, emoji, kita_id)
  VALUES ('Lena Müller', 4, '🌻', v_kita_id)
  RETURNING id INTO v_kind1_id;

  INSERT INTO parent_children (parent_id, child_id)
  VALUES (v_parent_id, v_kind1_id);

  -- Kind 2
  INSERT INTO children (name, age, emoji, kita_id)
  VALUES ('Max Müller', 3, '🚀', v_kita_id)
  RETURNING id INTO v_kind2_id;

  INSERT INTO parent_children (parent_id, child_id)
  VALUES (v_parent_id, v_kind2_id);

  RAISE NOTICE '✓ Lena Müller (%) und Max Müller (%) angelegt und Testmama zugeordnet.', v_kind1_id, v_kind2_id;

END $$;
