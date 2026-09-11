import React, { useMemo } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Item, Location } from '../types';
import { statusOf } from '../lib/expiry';
import ItemCard from './ItemCard';
import { colors, radius, spacing } from '../theme';

const ITEMS_PER_SHELF = 2;

type Props = {
  location: Location;
  label: string;
  items: Item[];
  isOpen: boolean;
  /** 0 = kapalı, 1 = tamamen açık. Kapı açılma animasyonunu sürer. */
  progress: Animated.Value;
  flex: Animated.AnimatedInterpolation<number>;
  onToggle: (location: Location) => void;
  onItemPress: (item: Item) => void;
};

/** Ürünleri sabit sayıda rafa sıkıştırmıyoruz: kaç ürün varsa o kadar raf oluşuyor. */
function toShelves(items: Item[]): Item[][] {
  const shelves: Item[][] = [];
  for (let index = 0; index < items.length; index += ITEMS_PER_SHELF) {
    shelves.push(items.slice(index, index + ITEMS_PER_SHELF));
  }
  return shelves;
}

export default function Compartment({
  location,
  label,
  items,
  isOpen,
  progress,
  flex,
  onToggle,
  onItemPress,
}: Props) {
  const shelves = useMemo(() => toShelves(items), [items]);

  const expiringCount = useMemo(
    () =>
      location === 'fridge'
        ? items.filter((item) => statusOf(item) !== 'fresh').length
        : 0,
    [items, location],
  );

  const rotateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', isOpen ? '-108deg' : '0deg'],
  });

  return (
    <Animated.View style={[styles.compartment, { flex }]}>
      <View style={styles.interior}>
        {items.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>{location === 'freezer' ? '🧊' : '🥬'}</Text>
            <Text style={styles.emptyText}>Burası boş</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.shelves}
            showsVerticalScrollIndicator={false}
            // Kapı kapalıyken içerideki listenin dokunuşları yakalaması anlamsız.
            scrollEnabled={isOpen}
          >
            {shelves.map((shelf, index) => (
              <View key={index} style={styles.shelf}>
                <View style={styles.shelfRow}>
                  {shelf.map((item) => (
                    <ItemCard key={item.id} item={item} onPress={onItemPress} />
                  ))}
                  {/* Yarım dolu rafın kartları ortalanmasın diye boşluk dolgusu. */}
                  {shelf.length < ITEMS_PER_SHELF && <View style={{ flex: shelf.length }} />}
                </View>
                <View style={styles.shelfBar} />
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      <Animated.View
        style={[
          styles.door,
          {
            transform: [{ perspective: 1400 }, { rotateY }],
            transformOrigin: 'left center',
          },
        ]}
        pointerEvents={isOpen ? 'none' : 'auto'}
      >
        <Pressable
          style={styles.doorFace}
          onPress={() => onToggle(location)}
          accessibilityRole="button"
          accessibilityLabel={`${label} kapağını aç, ${items.length} ürün`}
        >
          <View style={styles.doorLabelBlock}>
            <Text style={styles.doorLabel}>{label}</Text>
            <Text style={styles.doorCount}>
              {items.length > 0 ? `${items.length} ürün` : 'Boş'}
            </Text>
            {expiringCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{expiringCount} ürün dikkat istiyor</Text>
              </View>
            )}
          </View>
          <View style={styles.handle} />
        </Pressable>
      </Animated.View>

      {isOpen && (
        <Pressable
          style={styles.closeButton}
          onPress={() => onToggle(location)}
          accessibilityRole="button"
          accessibilityLabel={`${label} kapağını kapat`}
        >
          <Text style={styles.closeText}>Kapat</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  compartment: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.interior,
    borderWidth: 2,
    borderColor: colors.bodyEdge,
  },
  interior: { flex: 1, backgroundColor: colors.interior },
  shelves: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  shelf: { marginBottom: spacing.md },
  shelfRow: { flexDirection: 'row', gap: spacing.sm },
  shelfBar: {
    height: 4,
    marginTop: spacing.sm,
    borderRadius: 2,
    backgroundColor: colors.shelf,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  emptyIcon: { fontSize: 40, opacity: 0.5 },
  emptyText: { color: colors.textOnDarkMuted, fontSize: 14 },

  door: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.doorTop,
  },
  doorFace: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.bodyEdge,
    backgroundColor: colors.doorTop,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  doorLabelBlock: { flex: 1, gap: spacing.xs },
  doorLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.5,
  },
  doorCount: { fontSize: 13, color: colors.textMuted },
  badge: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    backgroundColor: 'rgba(232,163,61,0.16)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  badgeText: { fontSize: 11, color: '#9a6612', fontWeight: '600' },
  handle: {
    width: 10,
    height: '58%',
    borderRadius: 5,
    backgroundColor: colors.handle,
  },

  closeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.lg,
  },
  closeText: { color: colors.textOnDark, fontSize: 12, fontWeight: '600' },
});
