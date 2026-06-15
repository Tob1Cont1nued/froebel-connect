import { describe, it, expect } from 'vitest';
import { absenceRowToItem } from './useAbsences';

const BASE_ROW = {
  id: 'abc-123',
  child_id: 'child-456',
  from_date: '2026-06-16',
  to_date: '2026-06-20',
  reason: 'Urlaub',
  note: 'Familienreise',
  status: 'pending',
  children: { name: 'Lena Müller', emoji: '🌻', photo_url: null },
};

describe('absenceRowToItem', () => {
  it('maps all standard fields correctly', () => {
    const item = absenceRowToItem(BASE_ROW);
    expect(item.id).toBe('abc-123');
    expect(item.childId).toBe('child-456');
    expect(item.reason).toBe('Urlaub');
    expect(item.note).toBe('Familienreise');
    expect(item.status).toBe('pending');
  });

  it('parses from_date as Date object', () => {
    const item = absenceRowToItem(BASE_ROW);
    expect(item.from).toBeInstanceOf(Date);
    expect(item.from.getFullYear()).toBe(2026);
  });

  it('parses to_date as Date object', () => {
    const item = absenceRowToItem(BASE_ROW);
    expect(item.to).toBeInstanceOf(Date);
    expect(item.to.getFullYear()).toBe(2026);
  });

  it('maps children.name to childName', () => {
    const item = absenceRowToItem(BASE_ROW);
    expect(item.childName).toBe('Lena Müller');
  });

  it('maps children.emoji to childEmoji', () => {
    const item = absenceRowToItem(BASE_ROW);
    expect(item.childEmoji).toBe('🌻');
  });

  it('maps children.photo_url to childPhotoUrl', () => {
    const item = absenceRowToItem(BASE_ROW);
    expect(item.childPhotoUrl).toBeNull();
  });

  it('sets childName to null when children is undefined', () => {
    const row = { ...BASE_ROW, children: undefined };
    const item = absenceRowToItem(row);
    expect(item.childName).toBeNull();
    expect(item.childEmoji).toBeNull();
    expect(item.childPhotoUrl).toBeNull();
  });

  it('sets childName to null when children is null', () => {
    const row = { ...BASE_ROW, children: null };
    const item = absenceRowToItem(row);
    expect(item.childName).toBeNull();
  });

  it('preserves null note', () => {
    const row = { ...BASE_ROW, note: null };
    expect(absenceRowToItem(row).note).toBeNull();
  });

  it('maps status "confirmed" correctly', () => {
    const row = { ...BASE_ROW, status: 'confirmed' };
    expect(absenceRowToItem(row).status).toBe('confirmed');
  });
});
