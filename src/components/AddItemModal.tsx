import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Location } from '../types';
import { NewItem } from '../lib/useFridge';
import { estimateShelfLife } from '../data/shelfLife';
import { colors, radius, spacing } from '../theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (item: NewItem) => void | Promise<void>;
};

const LOCATIONS: { value: Location; label: string; icon: string }[] = [
  { value: 'fridge', label: 'Buzdolabı', icon: '🥬' },
  { value: 'freezer', label: 'Dondurucu', icon: '🧊' },
];

export default function AddItemModal({ visible, onClose, onSubmit }: Props) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState<Location>('fridge');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  /** Kullanıcı süreyi elle değiştirdiyse tahmin artık üzerine yazmaz. */
  const [manualDays, setManualDays] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) return;
    setName('');
    setLocation('fridge');
    setPhotoUri(undefined);
    setManualDays(undefined);
    setSaving(false);
  }, [visible]);

  const estimate = useMemo(() => estimateShelfLife(name, location), [name, location]);
  const days = manualDays !== undefined ? Number(manualDays) || 0 : estimate.days;

  async function pickPhoto(source: 'camera' | 'library') {
    try {
      const permission =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'İzin gerekli',
          source === 'camera'
            ? 'Fotoğraf çekebilmek için kamera izni vermelisin.'
            : 'Galeriden seçebilmek için fotoğraf izni vermelisin.',
        );
        return;
      }

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({ quality: 0.5 })
          : await ImagePicker.launchImageLibraryAsync({ quality: 0.5 });

      if (!result.canceled) setPhotoUri(result.assets[0].uri);
    } catch {
      Alert.alert('Fotoğraf alınamadı', 'Lütfen tekrar dene.');
    }
  }

  async function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Ürün adı gerekli', 'Ne koyduğunu yazmadan kaydedemeyiz.');
      return;
    }
    if (days <= 0) {
      Alert.alert('Süre geçersiz', 'Bozulma süresi en az 1 gün olmalı.');
      return;
    }

    setSaving(true);
    await onSubmit({
      name: trimmed,
      location,
      photoUri,
      shelfLifeDays: days,
      shelfLifeSource: manualDays !== undefined ? 'manual' : 'estimated',
    });
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <Text style={styles.title}>Ürün Ekle</Text>

          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.body}>
            <Text style={styles.sectionLabel}>Fotoğraf</Text>
            {photoUri ? (
              <View style={styles.previewWrap}>
                <Image source={{ uri: photoUri }} style={styles.preview} />
                <Pressable style={styles.removePhoto} onPress={() => setPhotoUri(undefined)}>
                  <Text style={styles.removePhotoText}>Kaldır</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.photoRow}>
                <Pressable style={styles.photoButton} onPress={() => pickPhoto('camera')}>
                  <Text style={styles.photoIcon}>📷</Text>
                  <Text style={styles.photoLabel}>Fotoğraf çek</Text>
                </Pressable>
                <Pressable style={styles.photoButton} onPress={() => pickPhoto('library')}>
                  <Text style={styles.photoIcon}>🖼️</Text>
                  <Text style={styles.photoLabel}>Galeriden seç</Text>
                </Pressable>
              </View>
            )}

            <Text style={styles.sectionLabel}>Ürün adı</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn. Tavuk göğsü"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="sentences"
              returnKeyType="done"
            />

            <Text style={styles.sectionLabel}>Nereye koydun?</Text>
            <View style={styles.locationRow}>
              {LOCATIONS.map((option) => {
                const active = option.value === location;
                return (
                  <Pressable
                    key={option.value}
                    style={[styles.locationButton, active && styles.locationActive]}
                    onPress={() => setLocation(option.value)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={styles.photoIcon}>{option.icon}</Text>
                    <Text style={[styles.locationLabel, active && styles.locationLabelActive]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.sectionLabel}>Tahmini bozulma süresi</Text>
            <View style={styles.daysRow}>
              <TextInput
                style={[styles.input, styles.daysInput]}
                value={String(days)}
                onChangeText={setManualDays}
                keyboardType="number-pad"
                selectTextOnFocus
              />
              <Text style={styles.daysUnit}>gün</Text>
              {manualDays !== undefined && (
                <Pressable onPress={() => setManualDays(undefined)}>
                  <Text style={styles.resetLink}>Tahmine dön</Text>
                </Pressable>
              )}
            </View>
            <Text style={styles.hint}>
              {manualDays !== undefined
                ? 'Süreyi sen belirledin.'
                : estimate.matched
                  ? `"${name.trim()}" için ortalama süre tahmin edildi — değiştirebilirsin.`
                  : 'Bu ürünü tanıyamadık, varsayılan süreyi kullanıyoruz.'}
            </Text>

            {location === 'freezer' && (
              <Text style={styles.note}>
                Dondurucudaki ürünler için bildirim gönderilmez, sadece listede durur.
              </Text>
            )}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable style={[styles.action, styles.cancel]} onPress={onClose}>
              <Text style={styles.cancelText}>Vazgeç</Text>
            </Pressable>
            <Pressable
              style={[styles.action, styles.save, saving && styles.disabled]}
              onPress={handleSubmit}
              disabled={saving}
            >
              <Text style={styles.saveText}>{saving ? 'Kaydediliyor…' : 'Dolaba Koy'}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15,25,32,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.sm,
    maxHeight: '92%',
  },
  grabber: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  body: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  photoRow: { flexDirection: 'row', gap: spacing.sm },
  photoButton: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: '#f7fafb',
  },
  photoIcon: { fontSize: 22 },
  photoLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  previewWrap: { borderRadius: radius.md, overflow: 'hidden' },
  preview: { width: '100%', height: 170, backgroundColor: colors.border },
  removePhoto: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.lg,
  },
  removePhotoText: { color: colors.white, fontSize: 12, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
    backgroundColor: '#f7fafb',
  },
  locationRow: { flexDirection: 'row', gap: spacing.sm },
  locationButton: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: '#f7fafb',
  },
  locationActive: { borderColor: colors.accent, backgroundColor: 'rgba(47,143,214,0.08)' },
  locationLabel: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  locationLabelActive: { color: colors.accentDark },
  daysRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  daysInput: { width: 90, textAlign: 'center' },
  daysUnit: { fontSize: 15, color: colors.text, fontWeight: '600' },
  resetLink: { fontSize: 12, color: colors.accent, fontWeight: '600' },
  hint: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 17 },
  note: {
    marginTop: spacing.md,
    fontSize: 12,
    color: colors.accentDark,
    backgroundColor: 'rgba(47,143,214,0.08)',
    padding: spacing.md,
    borderRadius: radius.md,
    lineHeight: 17,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  action: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  cancel: { backgroundColor: '#eef2f4' },
  cancelText: { color: colors.textMuted, fontWeight: '700', fontSize: 15 },
  save: { backgroundColor: colors.accent },
  saveText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  disabled: { opacity: 0.6 },
});
