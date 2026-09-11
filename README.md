# Buzdolabı Takip

Buzdolabına ve dondurucuya ne koyduğunu, ne kadar süredir orada durduğunu takip eden
mobil uygulama. Ana ekran gerçek bir buzdolabı gibi görünür: üstte dondurucu, altta
buzdolabı; bölmeye dokununca kapak açılır ve raflar görünür.

Kavram dokümanı: [`docs/brief.md`](docs/brief.md)

## Durum

MVP çalışıyor. Brief'teki şu davranışlar kurulu:

- Buzdolabı görünümlü ana ekran, açılır kapaklı iki bölme
- Sonsuz raf — ürün sayısı arttıkça raf eklenir, sabit raf sayısı yok
- Ürün ekleme: fotoğraf (kamera/galeri) → ad → konum → otomatik süre tahmini (elle değiştirilebilir)
- Görsel durum kodlaması: 🟢 taze / 🟡 dikkat / 🔴 süresi geçmiş
- Bildirimler **yalnızca buzdolabı** ürünleri için: süre dolmadan 2 gün önce + süre dolduğunda
- Ürün yaşam döngüsü: "Tükettim" / "Çöpe attım" → arşiv + israf oranı

## Teknoloji

React Native + Expo SDK 57, TypeScript. Tek kod tabanı, iOS + Android.
Veri cihazda tutulur (AsyncStorage) — şimdilik sunucu yok.

## Çalıştırma

```bash
npm install
npm start          # Expo Go ile QR okut
npm run android    # Android emülatör / cihaz
npm run ios        # iOS simülatör (macOS gerekir)
```

Bildirimler ve kamera gerçek cihazda test edilmeli; simülatörde kamera yok.

```bash
npm test           # Jest — tahmin ve süre mantığı testleri
npm run typecheck  # tsc --noEmit
```

## Kod düzeni

```
App.tsx                       uygulama girişi
src/types.ts                  Item / ArchivedItem / Location tipleri
src/theme.ts                  renk ve ölçü sabitleri
src/data/shelfLife.ts         ürün adı → ortalama bozulma süresi tablosu
src/lib/expiry.ts             kalan gün, durum rengi, sıralama
src/lib/notifications.ts      bildirim planlama (sadece buzdolabı)
src/lib/storage.ts            AsyncStorage okuma/yazma
src/lib/useFridge.ts          uygulama state'i (ekle / tüket / çöpe at)
src/components/Compartment.tsx  bir bölme: kapak animasyonu + raflar
src/components/ItemCard.tsx     raftaki ürün kartı
src/components/AddItemModal.tsx ürün ekleme akışı
src/components/ItemSheet.tsx    ürün detayı + yaşam döngüsü aksiyonları
src/screens/FridgeScreen.tsx    ana ekran
```

## Verilen kararlar

Brief'te açık bırakılan sorular için MVP'de seçilenler — hepsi tek noktadan değiştirilebilir:

| Soru | MVP kararı | Nerede |
|---|---|---|
| Bildirim kaç gün önce? | Sabit 2 gün önce + süre dolduğunda | `WARNING_LEAD_DAYS`, `src/lib/expiry.ts` |
| Sarı uyarı eşiği? | Sabit gün değil, raf ömrünün son %25'i (en az 1 gün) | `statusOf`, `src/lib/expiry.ts` |
| Bozulma süresi verisi? | Elle bakımı yapılan sabit tablo | `src/data/shelfLife.ts` |
| Barkod tarama? | Yok — fotoğraf + manuel giriş | — |
| İstatistik/gamification? | Sadece israf oranı rozeti; detaylı ekran v2'ye | `stats`, `src/lib/useFridge.ts` |

Sarı eşiğin orana bağlanması bilinçli: sabit "2 gün kala sarar" kuralı 21 günlük
yumurtayla 2 günlük tavuğu aynı anda uyarır, ikisi de yanlış hissettirir.

## Sonraki adımlar

- Bozulma süresi tablosunu genişletmek veya sunucudan beslemek
- İsraf istatistikleri ekranı (en çok çöpe giden ürünler, aylık grafik)
- Barkod tarama ile otomatik ürün adı
- Çoklu cihaz senkronizasyonu (hesap + sunucu)
