import { useState, useEffect } from "react";

const SUPERMARKETS_KEY = "shopping-list-supermarkets";

export const useSupermarkets = () => {
  const [supermarkets, setSupermarkets] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(SUPERMARKETS_KEY);
    if (stored) {
      setSupermarkets(JSON.parse(stored));
    }
  }, []);

  const addSupermarket = (name: string) => {
    if (!name.trim()) return;
    
    const normalized = name.trim();
    if (!supermarkets.includes(normalized)) {
      const updated = [...supermarkets, normalized];
      setSupermarkets(updated);
      localStorage.setItem(SUPERMARKETS_KEY, JSON.stringify(updated));
    }
  };

  const searchSupermarkets = (query: string): string[] => {
    if (!query) return supermarkets;
    return supermarkets.filter(s => 
      s.toLowerCase().includes(query.toLowerCase())
    );
  };

  return {
    supermarkets,
    addSupermarket,
    searchSupermarkets,
  };
};
