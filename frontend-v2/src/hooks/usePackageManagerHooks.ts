import { useState, useCallback, useEffect } from "react";

// 1. useProjects
import { fetchProjects as fetchProjectsService } from "../services/api";
export function useProjects() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProjectsService();
      setList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  return { list, loading, reload: load };
}

// 2. useResource
export function useResource<T>(
  fetchFn: (project: string) => Promise<T[]>,
  projectId: string | null,
  filterFn?: (item: T) => boolean
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      let data = await fetchFn(projectId);
      if (filterFn) data = data.filter(filterFn);
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, projectId, filterFn]);
  useEffect(() => {
    load();
  }, [load]);
  return { items, loading, reload: load };
}

// 3. useToggleList
export function useToggleList<T>(idFn: (item: T) => string) {
  const [selected, setSelected] = useState<T[]>([]);
  const toggle = useCallback(
    (item: T) => {
      setSelected((prev) => {
        const id = idFn(item);
        const exists = prev.some((x) => idFn(x) === id);
        return exists ? prev.filter((x) => idFn(x) !== id) : [...prev, item];
      });
    },
    [idFn]
  );
  const clear = useCallback(() => setSelected([]), []);
  return { selected, toggle, clear };
}

// 4. useChecker
export function useChecker<T>(
  idFn: (item: T) => string,
  checkFn: (item: T) => Promise<void>,
  onError: (msg: string) => void
) {
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const run = useCallback(
    async (item: T) => {
      const id = idFn(item);
      setBusy((b) => ({ ...b, [id]: true }));
      try {
        await checkFn(item);
      } catch (e: any) {
        onError(e.message || String(e));
      } finally {
        setBusy((b) => ({ ...b, [id]: false }));
      }
    },
    [idFn, checkFn, onError]
  );
  return { busy, run };
}
