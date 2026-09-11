import { Location } from '../types';

/**
 * Ürün adına göre ortalama bozulma süresi tahmini (gün).
 *
 * Brief'teki açık sorulardan biri buydu: şimdilik sabit, elle bakımı yapılan
 * bir tablo kullanıyoruz. İleride sunucudan gelen bir veri setiyle ya da
 * kullanıcı düzeltmelerinden öğrenen bir modelle değiştirilebilir —
 * `estimateShelfLife` imzası aynı kaldığı sürece çağıran taraf etkilenmez.
 */
type ShelfLifeEntry = {
  /** Küçük harfe indirgenmiş, Türkçe karakterleri sadeleştirilmiş anahtar kelimeler. */
  keywords: string[];
  fridge: number;
  freezer: number;
};

const TABLE: ShelfLifeEntry[] = [
  // Et & tavuk & balık
  { keywords: ['tavuk', 'pilic', 'but', 'gogus', 'kanat'], fridge: 2, freezer: 270 },
  { keywords: ['kiyma', 'kiymasi'], fridge: 2, freezer: 120 },
  { keywords: ['dana', 'kuzu', 'biftek', 'kusbasi', 'et'], fridge: 4, freezer: 300 },
  { keywords: ['balik', 'somon', 'hamsi', 'levrek', 'cipura', 'ton'], fridge: 2, freezer: 180 },
  { keywords: ['sucuk', 'salam', 'sosis', 'pastirma', 'jambon'], fridge: 14, freezer: 60 },

  // Süt ürünleri
  { keywords: ['sut'], fridge: 7, freezer: 90 },
  { keywords: ['yogurt', 'ayran', 'kefir'], fridge: 14, freezer: 30 },
  { keywords: ['peynir', 'kasar', 'lor', 'labne'], fridge: 21, freezer: 180 },
  { keywords: ['tereyagi', 'tereyag', 'margarin'], fridge: 30, freezer: 270 },
  { keywords: ['krema', 'kaymak'], fridge: 7, freezer: 60 },
  { keywords: ['yumurta'], fridge: 21, freezer: 0 },

  // Sebze & meyve
  { keywords: ['marul', 'roka', 'ispanak', 'maydanoz', 'dereotu', 'nane', 'salata'], fridge: 5, freezer: 240 },
  { keywords: ['domates', 'salatalik', 'biber', 'patlican', 'kabak'], fridge: 7, freezer: 240 },
  { keywords: ['brokoli', 'karnabahar', 'lahana', 'pirasa'], fridge: 10, freezer: 300 },
  { keywords: ['havuc', 'pancar', 'turp'], fridge: 21, freezer: 300 },
  { keywords: ['patates', 'sogan', 'sarimsak'], fridge: 30, freezer: 300 },
  { keywords: ['elma', 'armut'], fridge: 21, freezer: 240 },
  { keywords: ['muz', 'seftali', 'kayisi', 'erik', 'incir'], fridge: 5, freezer: 240 },
  { keywords: ['cilek', 'ahududu', 'bogurtlen', 'yaban', 'uzum', 'kiraz'], fridge: 4, freezer: 300 },
  { keywords: ['portakal', 'mandalina', 'limon', 'greyfurt'], fridge: 21, freezer: 120 },

  // Hazır & pişmiş
  { keywords: ['yemek', 'corba', 'pilav', 'makarna', 'artik', 'dun'], fridge: 3, freezer: 90 },
  { keywords: ['ekmek', 'pide', 'lavas', 'simit', 'poyraz'], fridge: 5, freezer: 90 },
  { keywords: ['hamur', 'boerek', 'borek', 'mantı', 'manti'], fridge: 3, freezer: 180 },
  { keywords: ['pasta', 'kek', 'tatli', 'baklava'], fridge: 4, freezer: 60 },
  { keywords: ['dondurma'], fridge: 0, freezer: 120 },

  // Diğer
  { keywords: ['zeytin', 'tursu', 'recel', 'sos', 'ketcap', 'mayonez', 'hardal'], fridge: 60, freezer: 0 },
  { keywords: ['meyve suyu', 'suyu', 'icecek', 'kola', 'gazoz'], fridge: 14, freezer: 0 },
];

/** Buzdolabı/dondurucu için, tanınmayan ürünlerde kullanılan varsayılan süre. */
export const DEFAULT_SHELF_LIFE: Record<Location, number> = {
  fridge: 7,
  freezer: 180,
};

/** "Tavuk Göğsü" -> "tavuk gogusu". Türkçe karakterler ASCII'ye indirgenir. */
export function normalize(text: string): string {
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export type Estimate = {
  days: number;
  /** Eşleşen tablo satırı bulunduysa true — arayüzde "tahmin" rozeti göstermek için. */
  matched: boolean;
};

/**
 * Ürün adından ortalama bozulma süresini tahmin eder.
 * En uzun (dolayısıyla en spesifik) anahtar kelime eşleşmesi kazanır:
 * "ton balığı" hem "ton" hem "balik" ile eşleşirse daha uzun olan seçilir.
 */
export function estimateShelfLife(name: string, location: Location): Estimate {
  const haystack = normalize(name);
  if (!haystack) return { days: DEFAULT_SHELF_LIFE[location], matched: false };

  let best: { entry: ShelfLifeEntry; length: number } | undefined;

  for (const entry of TABLE) {
    for (const keyword of entry.keywords) {
      if (!haystack.includes(keyword)) continue;
      if (!best || keyword.length > best.length) best = { entry, length: keyword.length };
    }
  }

  // Tabloda 0 yazan kombinasyonlar "burada saklanmaz" demek (ör. dondurucuda
  // yumurta); böyle bir durumda tahmin yerine varsayılana düşüyoruz.
  const days = best?.entry[location] ?? 0;
  if (!days) return { days: DEFAULT_SHELF_LIFE[location], matched: false };

  return { days, matched: true };
}
