import { Item } from '../types';
import { byUrgency, daysLeft, describeRemaining, MS_PER_DAY, statusOf } from '../lib/expiry';

const NOW = new Date('2026-09-11T12:00:00.000Z');

function itemAddedDaysAgo(daysAgo: number, shelfLifeDays: number): Item {
  return {
    id: `x${daysAgo}`,
    name: 'Test',
    location: 'fridge',
    addedAt: new Date(NOW.getTime() - daysAgo * MS_PER_DAY).toISOString(),
    shelfLifeDays,
    shelfLifeSource: 'estimated',
  };
}

describe('daysLeft', () => {
  it('kalan günü sayar', () => {
    expect(daysLeft(itemAddedDaysAgo(2, 7), NOW)).toBe(5);
  });

  it('süresi geçmişte negatif döner', () => {
    expect(daysLeft(itemAddedDaysAgo(10, 7), NOW)).toBe(-3);
  });
});

describe('statusOf', () => {
  it('raf ömrünün çoğu dururken taze', () => {
    expect(statusOf(itemAddedDaysAgo(1, 21), NOW)).toBe('fresh');
  });

  it('eşik sabit gün değil, raf ömrünün oranı', () => {
    // 21 günlük yumurtada 5 gün kalması "dikkat"; 7 günlük sütte 5 gün kalması hâlâ taze.
    expect(statusOf(itemAddedDaysAgo(16, 21), NOW)).toBe('warning');
    expect(statusOf(itemAddedDaysAgo(2, 7), NOW)).toBe('fresh');
  });

  it('kısa ömürlü üründe bile en az 1 gün uyarı penceresi var', () => {
    expect(statusOf(itemAddedDaysAgo(1, 2), NOW)).toBe('warning');
  });

  it('süre dolunca kırmızı', () => {
    expect(statusOf(itemAddedDaysAgo(7, 7), NOW)).toBe('expired');
    expect(statusOf(itemAddedDaysAgo(9, 7), NOW)).toBe('expired');
  });
});

describe('describeRemaining', () => {
  it('kalan, son gün ve geçmiş durumlarını ayırır', () => {
    expect(describeRemaining(itemAddedDaysAgo(2, 7), NOW)).toBe('5 gün kaldı');
    expect(describeRemaining(itemAddedDaysAgo(6, 7), NOW)).toBe('Son gün');
    expect(describeRemaining(itemAddedDaysAgo(9, 7), NOW)).toBe('2 gün geçti');
  });
});

describe('byUrgency', () => {
  it('en acil ürünü başa alır', () => {
    const sorted = [itemAddedDaysAgo(1, 21), itemAddedDaysAgo(6, 7), itemAddedDaysAgo(0, 10)].sort(
      byUrgency,
    );
    expect(sorted.map((item) => item.shelfLifeDays)).toEqual([7, 10, 21]);
  });
});
