import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from '../types';

const KEY = 'buzdolabi-takip/v1';

const EMPTY: AppState = { items: [], archive: [] };

export async function loadState(): Promise<AppState> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return EMPTY;

    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      archive: Array.isArray(parsed.archive) ? parsed.archive : [],
    };
  } catch {
    // Bozuk kayıt yüzünden uygulama açılmasın istemiyoruz; boş başla.
    return EMPTY;
  }
}

export async function saveState(state: AppState): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Disk yazılamıyorsa da arayüz çalışmaya devam etsin.
  }
}
