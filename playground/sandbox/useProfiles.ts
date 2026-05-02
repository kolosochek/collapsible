import { useCallback, useEffect, useRef, useState } from "react";
import { TProfilesStore, TSandboxConfig } from "./types";

const STORAGE_KEY = "collapsible-playground:profiles";
const SCHEMA_VERSION = 1 as const;

const emptyStore = (): TProfilesStore => ({
  schemaVersion: SCHEMA_VERSION,
  profiles: {},
});

const loadStore = (): { store: TProfilesStore; persistenceOk: boolean } => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { store: emptyStore(), persistenceOk: true };
    const parsed = JSON.parse(raw) as TProfilesStore;
    if (parsed.schemaVersion !== SCHEMA_VERSION) {
      return { store: emptyStore(), persistenceOk: true };
    }
    return { store: parsed, persistenceOk: true };
  } catch {
    return { store: emptyStore(), persistenceOk: false };
  }
};

const saveStore = (store: TProfilesStore): boolean => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
};

export type TUseProfiles = {
  list: () => string[];
  save: (name: string, config: TSandboxConfig) => void;
  load: (name: string) => TSandboxConfig | undefined;
  remove: (name: string) => void;
  exists: (name: string) => boolean;
  persistenceOk: boolean;
};

export const useProfiles = (): TUseProfiles => {
  const initial = useRef(loadStore());
  const [store, setStore] = useState<TProfilesStore>(initial.current.store);
  const [persistenceOk, setPersistenceOk] = useState(initial.current.persistenceOk);

  useEffect(() => {
    const ok = saveStore(store);
    if (!ok) setPersistenceOk(false);
  }, [store]);

  const list = useCallback(
    () => Object.keys(store.profiles).sort((a, b) => a.localeCompare(b)),
    [store]
  );

  const save = useCallback(
    (name: string, config: TSandboxConfig) => {
      setStore((prev) => ({
        ...prev,
        profiles: { ...prev.profiles, [name]: config },
      }));
    },
    []
  );

  const load = useCallback(
    (name: string): TSandboxConfig | undefined => {
      const entry = store.profiles[name];
      return entry ? { ...entry, heightConfig: { ...entry.heightConfig } } : undefined;
    },
    [store]
  );

  const remove = useCallback((name: string) => {
    setStore((prev) => {
      const next = { ...prev.profiles };
      delete next[name];
      return { ...prev, profiles: next };
    });
  }, []);

  const exists = useCallback((name: string) => name in store.profiles, [store]);

  return { list, save, load, remove, exists, persistenceOk };
};
