import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Item, Location } from '../types';
import { useFridge } from '../lib/useFridge';
import { ensurePermission } from '../lib/notifications';
import { statusOf } from '../lib/expiry';
import Compartment from '../components/Compartment';
import AddItemModal from '../components/AddItemModal';
import ItemSheet from '../components/ItemSheet';
import { colors, radius, spacing } from '../theme';

/** Kapalıyken bölmelerin gövdeyi paylaşma oranı — gerçek dolap oranına yakın. */
const CLOSED_FLEX = { freezer: 0.34, fridge: 0.66 } as const;

export default function FridgeScreen() {
  const insets = useSafeAreaInsets();
  const { ready, addItem, disposeItem, byLocation, stats } = useFridge();

  const [open, setOpen] = useState<Location | null>(null);
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<Item | undefined>();

  const progress = useRef(new Animated.Value(0)).current;
  // Kapanma animasyonu biterken hangi kapının döndüğünü bilmemiz gerekiyor.
  const [animating, setAnimating] = useState<Location | null>(null);

  useEffect(() => {
    // Ürün eklemeden önce izin isteyelim ki ilk bildirim kaçmasın.
    void ensurePermission();
  }, []);

  useEffect(() => {
    if (open) setAnimating(open);

    Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !open) setAnimating(null);
    });
  }, [open, progress]);

  const active = open ?? animating;

  const flexFor = (location: Location) =>
    progress.interpolate({
      inputRange: [0, 1],
      // Açılan bölme tüm gövdeyi kaplar, diğeri neredeyse sıfıra iner.
      outputRange: [CLOSED_FLEX[location], active === location ? 1 : 0.0001],
    });

  const fridgeItems = byLocation('fridge');
  const freezerItems = byLocation('freezer');

  const attention = useMemo(
    () => fridgeItems.filter((item) => statusOf(item) !== 'fresh').length,
    [fridgeItems],
  );

  if (!ready) {
    return (
      <View style={[styles.screen, styles.loading]}>
        <Text style={styles.loadingText}>Dolap açılıyor…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Buzdolabım</Text>
          <Text style={styles.subtitle}>
            {attention > 0
              ? `${attention} ürünün süresi yaklaşıyor`
              : `${fridgeItems.length + freezerItems.length} ürün takipte`}
          </Text>
        </View>
        {stats.total > 0 && (
          <View style={styles.wasteChip}>
            <Text style={styles.wasteValue}>%{stats.wasteRate}</Text>
            <Text style={styles.wasteLabel}>israf</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Compartment
          location="freezer"
          label="Dondurucu"
          items={freezerItems}
          isOpen={active === 'freezer'}
          progress={progress}
          flex={flexFor('freezer')}
          onToggle={(location) => setOpen((prev) => (prev === location ? null : location))}
          onItemPress={setSelected}
        />
        <View style={styles.divider} />
        <Compartment
          location="fridge"
          label="Buzdolabı"
          items={fridgeItems}
          isOpen={active === 'fridge'}
          progress={progress}
          flex={flexFor('fridge')}
          onToggle={(location) => setOpen((prev) => (prev === location ? null : location))}
          onItemPress={setSelected}
        />
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Pressable
          style={({ pressed }) => [styles.addButton, pressed && styles.addPressed]}
          onPress={() => setAdding(true)}
          accessibilityRole="button"
          accessibilityLabel="Ürün ekle"
        >
          <Text style={styles.addText}>+  Ürün Ekle</Text>
        </Pressable>
      </View>

      <AddItemModal visible={adding} onClose={() => setAdding(false)} onSubmit={addItem} />
      <ItemSheet
        item={selected}
        onClose={() => setSelected(undefined)}
        onDispose={disposeItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.backdrop, paddingHorizontal: spacing.md },
  loading: { alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: colors.textMuted, fontSize: 15 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  wasteChip: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  wasteValue: { fontSize: 16, fontWeight: '800', color: colors.text },
  wasteLabel: { fontSize: 10, color: colors.textMuted, textTransform: 'uppercase' },

  // Paslanmaz gövde: iki bölme, aralarında ince bir çelik şerit.
  body: {
    flex: 1,
    backgroundColor: colors.bodyBottom,
    borderRadius: radius.xl,
    padding: spacing.sm,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.bodyEdge,
  },
  divider: { height: 2, backgroundColor: colors.bodyEdge, borderRadius: 1 },

  footer: { paddingTop: spacing.md },
  addButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
  },
  addPressed: { backgroundColor: colors.accentDark },
  addText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
