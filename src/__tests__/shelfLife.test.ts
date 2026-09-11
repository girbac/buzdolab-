import { DEFAULT_SHELF_LIFE, estimateShelfLife, normalize } from '../data/shelfLife';

describe('normalize', () => {
  it('Türkçe karakterleri ve noktalamayı sadeleştirir', () => {
    expect(normalize('Tavuk Göğsü')).toBe('tavuk gogsu');
    expect(normalize('  Süt (1 lt)  ')).toBe('sut 1 lt');
    expect(normalize('IŞIK')).toBe('isik');
  });
});

describe('estimateShelfLife', () => {
  it('bilinen ürünü konumuna göre tahmin eder', () => {
    expect(estimateShelfLife('Süt', 'fridge')).toEqual({ days: 7, matched: true });
    expect(estimateShelfLife('Tavuk göğsü', 'fridge')).toEqual({ days: 2, matched: true });
    expect(estimateShelfLife('Tavuk göğsü', 'freezer')).toEqual({ days: 270, matched: true });
  });

  it('en uzun anahtar kelime eşleşmesini seçer', () => {
    // "kıyma" hem "kiyma" hem daha kısa "et" ile karışabilir; spesifik olan kazanmalı.
    expect(estimateShelfLife('Dana kıyma', 'fridge').days).toBe(2);
    expect(estimateShelfLife('Dana kuşbaşı', 'fridge').days).toBe(4);
  });

  it('tanımadığı üründe varsayılana düşer', () => {
    expect(estimateShelfLife('Zırıltı', 'fridge')).toEqual({
      days: DEFAULT_SHELF_LIFE.fridge,
      matched: false,
    });
  });

  it('boş isimde varsayılanı döner', () => {
    expect(estimateShelfLife('   ', 'freezer')).toEqual({
      days: DEFAULT_SHELF_LIFE.freezer,
      matched: false,
    });
  });

  it('o konumda saklanmayan ürün için tahmin uydurmaz', () => {
    // Tabloda dondurucu değeri 0 olan yumurta: "tahmin edildi" demek yanıltıcı olur.
    expect(estimateShelfLife('Yumurta', 'freezer')).toEqual({
      days: DEFAULT_SHELF_LIFE.freezer,
      matched: false,
    });
  });
});
