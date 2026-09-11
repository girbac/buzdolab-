import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState, ArchivedItem, Disposal, Item, Location } from '../types';
import { loadState, saveState } from './storage';
import { cancelForItem, scheduleForItem } from './notifications';
import { byUrgency } from './expiry';

export type NewItem = Omit<Item, 'id' | 'addedAt' | 'notificationIds'>;

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useFridge() {
  const [state, setState] = useState<AppState>({ items: [], archive: [] });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadState().then((loaded) => {
      if (cancelled) return;
      setState(loaded);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // İlk yükleme bitmeden yazmıyoruz, yoksa boş state kaydı gerçek veriyi ezer.
  useEffect(() => {
    if (ready) void saveState(state);
  }, [ready, state]);

  const addItem = useCallback(async (draft: NewItem) => {
    const item: Item = { ...draft, id: makeId(), addedAt: new Date().toISOString() };
    const notificationIds = await scheduleForItem(item);
    setState((prev) => ({
      ...prev,
      items: [...prev.items, { ...item, notificationIds }],
    }));
  }, []);

  /** "Tükettim" / "Çöpe attım" — ürünü raftan alıp arşive taşır. */
  const disposeItem = useCallback(async (id: string, disposal: Disposal) => {
    let target: Item | undefined;
    setState((prev) => {
      target = prev.items.find((candidate) => candidate.id === id);
      if (!target) return prev;

      const archived: ArchivedItem = {
        ...target,
        disposal,
        disposedAt: new Date().toISOString(),
      };
      return {
        items: prev.items.filter((candidate) => candidate.id !== id),
        archive: [archived, ...prev.archive],
      };
    });

    if (target) await cancelForItem(target);
  }, []);

  const byLocation = useCallback(
    (location: Location) => state.items.filter((item) => item.location === location).sort(byUrgency),
    [state.items],
  );

  const stats = useMemo(() => {
    const consumed = state.archive.filter((entry) => entry.disposal === 'consumed').length;
    const trashed = state.archive.filter((entry) => entry.disposal === 'trashed').length;
    const total = consumed + trashed;
    return {
      consumed,
      trashed,
      total,
      wasteRate: total ? Math.round((trashed / total) * 100) : 0,
    };
  }, [state.archive]);

  return { ready, items: state.items, archive: state.archive, addItem, disposeItem, byLocation, stats };
}
