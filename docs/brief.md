# Buzdolabı Takip Uygulaması — Kavram Brief'i

## Problem
Kullanıcılar buzdolabı ve dondurucuya koydukları ürünleri unutuyor, bu yüzden çoğu ürün bozulup çöpe gidiyor. Amaç: kullanıcının ne koyduğunu ve ne kadar süredir orada olduğunu görsel/eğlenceli bir arayüzle takip etmesini sağlamak.

## Konsept
Uygulamanın ana ekranı gerçek bir buzdolabına benziyor:
- **Üst bölüm**: Dondurucu
- **Alt bölüm**: Buzdolabı
- Her bölüme tıklanınca kapı "açılıyor" ve içindeki ürünler görünüyor.

Raf sayısı sabit değil — kullanıcı istediği kadar ürün/raf ekleyebilir (sonsuz raf mantığı).

## Ürün Ekleme Akışı
1. "+ Ürün Ekle" butonu
2. Fotoğraf çekilir veya galeriden seçilir
3. Ürün adı girilir (örn. "Tavuk göğsü")
4. Konum seçilir: Dondurucu / Buzdolabı
5. Sistem, ürün adına göre ortalama bozulma süresini otomatik tahmin eder (örn. süt: ~7 gün, yumurta: ~21 gün) — kullanıcı isterse bu süreyi elle değiştirebilir
6. Ürün, eklendiği tarih ile birlikte ilgili bölüme kaydedilir

## Bildirim Mantığı
- **Sadece buzdolabı ürünleri için bildirim gönderilir.** Dondurucudaki ürünler için bildirim YOK (dondurulmuş ürünlerin bozulma riski neredeyse yok, bu yüzden hatırlatma gereksiz).
- Bildirim, ürünün ortalama bozulma süresine göre önceden tetiklenir (örn. "Tavuk göğsünün süresi 2 gün sonra doluyor").
- Süre dolduğunda ayrıca "süresi geçti" bildirimi de gönderilebilir.
- Kesin gün sayıları (kaç gün önce uyarılsın vb.) sonraki aşamada netleştirilecek.

## Görsel Durum Kodlaması (buzdolabı rafında)
- 🟢 Taze (süresinin çoğu kalmış)
- 🟡 Dikkat (süresi yaklaşıyor)
- 🔴 Süresi geçmiş

## Ürün Yaşam Döngüsü
Kullanıcı ürünü "Tükettim" veya "Çöpe attım" olarak işaretleyebilir. Bu veri zamanla şu tür istatistiklere dönüşebilir:
- En çok çöpe giden ürünler
- Aylık israf oranı
(Bunlar MVP sonrası özellik olarak düşünülebilir — motivasyon/gamification unsuru.)

## Hedef Platform
Mobil (iOS ve Android) — muhtemelen cross-platform bir framework (Flutter veya React Native) ile tek kod tabanından geliştirme mantıklı olur. Kesin teknoloji seçimi geliştirme aşamasında netleştirilecek.

## Proje Durumu
Şu an sadece **fikir/kavram aşamasında**. Bu doküman, sonraki adımda daha detaylı bir teknik/geliştirme brief'ine dönüştürülmek üzere bir başlangıç noktasıdır.

## Açık Sorular (ileride netleştirilecek)
- Bildirimler tam olarak kaç gün önceden gönderilsin? (Ürün türüne göre değişken mi olsun, sabit mi?)
- Ortalama bozulma süresi verisi nereden gelecek — sabit bir veritabanı mı, kullanıcı girdikçe öğrenen bir sistem mi?
- Barkod tarama ileride eklenecek mi, yoksa fotoğraf + manuel giriş yeterli mi kalacak?
- Gamification/istatistik özellikleri MVP'ye mi girecek, yoksa v2'ye mi bırakılacak?
