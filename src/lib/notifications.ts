import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Item } from '../types';
import { expiryDate, MS_PER_DAY, WARNING_LEAD_DAYS } from './expiry';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let permissionGranted: boolean | undefined;

export async function ensurePermission(): Promise<boolean> {
  if (permissionGranted !== undefined) return permissionGranted;
  if (Platform.OS === 'web') {
    permissionGranted = false;
    return false;
  }

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('expiry', {
        name: 'Son kullanma hatırlatmaları',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    const status = existing.granted
      ? existing
      : await Notifications.requestPermissionsAsync();

    permissionGranted = status.granted;
  } catch {
    permissionGranted = false;
  }

  return permissionGranted;
}

async function scheduleAt(date: Date, title: string, body: string): Promise<string | undefined> {
  if (date.getTime() <= Date.now()) return undefined;

  try {
    return await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
        channelId: 'expiry',
      },
    });
  } catch {
    return undefined;
  }
}

/**
 * Ürün için bildirimleri planlar ve planlanan bildirim id'lerini döner.
 *
 * Brief gereği SADECE buzdolabı ürünleri için bildirim kurulur; dondurucudaki
 * ürünlerin bozulma riski pratikte yok, hatırlatma gürültü olur.
 */
export async function scheduleForItem(item: Item): Promise<string[]> {
  if (item.location !== 'fridge') return [];
  if (!(await ensurePermission())) return [];

  const expiry = expiryDate(item);
  const warningAt = new Date(expiry.getTime() - WARNING_LEAD_DAYS * MS_PER_DAY);

  const ids = await Promise.all([
    scheduleAt(
      warningAt,
      'Süresi yaklaşıyor',
      `${item.name} ${WARNING_LEAD_DAYS} gün sonra bozulabilir.`,
    ),
    scheduleAt(
      expiry,
      'Süresi doldu',
      `${item.name} için tahmini süre doldu. Kontrol etmek ister misin?`,
    ),
  ]);

  return ids.filter((id): id is string => Boolean(id));
}

export async function cancelForItem(item: Item): Promise<void> {
  for (const id of item.notificationIds ?? []) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {
      // Bildirim zaten düşmüş olabilir — sorun değil.
    }
  }
}
