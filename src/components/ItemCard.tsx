import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Item } from '../types';
import { describeRemaining, statusOf } from '../lib/expiry';
import { colors, radius, spacing, statusColor } from '../theme';

type Props = {
  item: Item;
  onPress: (item: Item) => void;
};

export default function ItemCard({ item, onPress }: Props) {
  const status = statusOf(item);
  const isFrozen = item.location === 'freezer';

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => onPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${describeRemaining(item)}`}
    >
      <View style={styles.thumb}>
        {item.photoUri ? (
          <Image source={{ uri: item.photoUri }} style={styles.photo} />
        ) : (
          <Text style={styles.placeholder}>{isFrozen ? '🧊' : '🥗'}</Text>
        )}
        {/* Dondurucuda bildirim yok, o yüzden durum noktası da göstermiyoruz. */}
        {!isFrozen && <View style={[styles.dot, { backgroundColor: statusColor[status] }]} />}
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {item.name}
      </Text>
      <Text
        style={[styles.meta, !isFrozen && status === 'expired' && styles.metaExpired]}
        numberOfLines={1}
      >
        {isFrozen ? 'Dondurulmuş' : describeRemaining(item)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.interiorLight,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  pressed: { opacity: 0.7 },
  thumb: {
    aspectRatio: 1,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
  placeholder: { fontSize: 30 },
  dot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.interior,
  },
  name: {
    color: colors.textOnDark,
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  meta: { color: colors.textOnDarkMuted, fontSize: 11, marginTop: 2 },
  metaExpired: { color: colors.expired, fontWeight: '600' },
});
