export type Location = 'fridge' | 'freezer';

export type ItemStatus = 'fresh' | 'warning' | 'expired';

/** Bir ürünün hayat döngüsündeki son durumu. */
export type Disposal = 'consumed' | 'trashed';

export type Item = {
  id: string;
  name: string;
  location: Location;
  /** Galeriden seçilen / çekilen fotoğrafın yerel URI'si. */
  photoUri?: string;
  /** ISO tarih — ürünün dolaba konduğu an. */
  addedAt: string;
  /** Kullanıcının onayladığı (ya da elle değiştirdiği) raf ömrü. */
  shelfLifeDays: number;
  /** Raf ömrü tahminden mi geldi, kullanıcı mı girdi? */
  shelfLifeSource: 'estimated' | 'manual';
  /** Planlanmış bildirimlerin id'leri — ürün silinince iptal edilir. */
  notificationIds?: string[];
};

/** Tüketilmiş/çöpe atılmış ürünler istatistik için burada birikir. */
export type ArchivedItem = Item & {
  disposal: Disposal;
  /** ISO tarih — "Tükettim"/"Çöpe attım" denildiği an. */
  disposedAt: string;
};

export type AppState = {
  items: Item[];
  archive: ArchivedItem[];
};
