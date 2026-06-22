import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { api, useApp } from "../context/AppContext.jsx";

function readLocal(key, seed) {
  try {
    return JSON.parse(localStorage.getItem(key)) || seed;
  } catch {
    return seed;
  }
}

function writeLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function useCollection(resource, seed) {
  const { token } = useApp();
  const storageKey = `studytrack_${resource}`;
  const [items, setItems] = useState(() => readLocal(storageKey, seed));
  const [loading, setLoading] = useState(false);
  const isDemo = !token || token === "demo-token";

  useEffect(() => {
    let active = true;
    async function load() {
      if (isDemo) {
        const localItems = readLocal(storageKey, seed);
        setItems(localItems);
        writeLocal(storageKey, localItems);
        return;
      }
      setLoading(true);
      try {
        const { data } = await api.get(`/${resource}`);
        if (active) {
          setItems(data);
          writeLocal(storageKey, data);
        }
      } catch {
        if (active) setItems(readLocal(storageKey, seed));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [resource, storageKey, isDemo]);

  function commit(next) {
    setItems(next);
    writeLocal(storageKey, next);
  }

  async function create(payload) {
    const optimistic = { ...payload, id: crypto.randomUUID(), _id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    if (isDemo) {
      commit([optimistic, ...items]);
      return optimistic;
    }
    try {
      const { data } = await api.post(`/${resource}`, payload);
      commit([data, ...items]);
      return data;
    } catch {
      commit([optimistic, ...items]);
      toast.error("Server unavailable. Saved locally for now.");
      return optimistic;
    }
  }

  async function update(id, patch) {
    const next = items.map((item) => ((item._id || item.id) === id ? { ...item, ...patch } : item));
    commit(next);
    if (!isDemo) {
      try {
        await api.patch(`/${resource}/${id}`, patch);
      } catch {
        toast.error("Could not sync update yet.");
      }
    }
  }

  async function remove(id) {
    const next = items.filter((item) => (item._id || item.id) !== id);
    commit(next);
    if (!isDemo) {
      try {
        await api.delete(`/${resource}/${id}`);
      } catch {
        toast.error("Could not sync delete yet.");
      }
    }
  }

  return useMemo(() => ({ items, loading, create, update, remove, isDemo }), [items, loading, isDemo]);
}
