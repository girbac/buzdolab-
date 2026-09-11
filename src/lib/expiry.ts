import { Item, ItemStatus } from '../types';

export const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Uyarı bildiriminin, son kullanma tarihinden kaç gün önce atılacağı. */
export const WARNING_LEAD_DAYS = 2;

/** Ürünün son kullanma anı = eklenme tarihi + raf ömrü. */
export function expiryDate(item: Item): Date {
  return new Date(new Date(item.addedAt).getTime() + item.shelfLifeDays * MS_PER_DAY);
}

/**
 * Bugünden son kullanma tarihine kalan tam gün sayısı.
 * Negatif değer "süresi X gün önce geçti" anlamına gelir.
 */
export function daysLeft(item: Item, now: Date = new Date()): number {
  return Math.ceil((expiryDate(item).getTime() - now.getTime()) / MS_PER_DAY);
}

/**
 * Görsel durum kodlaması. Eşik, sabit gün sayısı yerine raf ömrünün oranı:
 * 21 günlük yumurtayla 2 günlük tavuk aynı anda sararmasın diye.
 */
export function statusOf(item: Item, now: Date = new Date()): ItemStatus {
  const left = daysLeft(item, now);
  if (left <= 0) return 'expired';

  const warningThreshold = Math.max(1, Math.round(item.shelfLifeDays * 0.25));
  return left <= warningThreshold ? 'warning' : 'fresh';
}

/** Raf sıralaması: en acil olan en üstte. */
export function byUrgency(a: Item, b: Item): number {
  return expiryDate(a).getTime() - expiryDate(b).getTime();
}

export function describeRemaining(item: Item, now: Date = new Date()): string {
  const left = daysLeft(item, now);
  if (left > 1) return `${left} gün kaldı`;
  if (left === 1) return 'Son gün';
  if (left === 0) return 'Bugün doluyor';
  return `${Math.abs(left)} gün geçti`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
