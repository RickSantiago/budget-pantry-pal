
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, query, getDocs } from 'firebase/firestore';

const SUPERMARKETS_COLLECTION = 'supermarkets';

export const useSupermarkets = () => {
  const [supermarkets, setSupermarkets] = useState<string[]>([]);

  useEffect(() => {
    const q = query(collection(db, SUPERMARKETS_COLLECTION));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const uniqueSupermarkets = new Map<string, string>();
      querySnapshot.forEach((doc) => {
        const name = doc.data().name as string;
        const normalizedName = name.toLowerCase();
        if (!uniqueSupermarkets.has(normalizedName)) {
          uniqueSupermarkets.set(normalizedName, name);
        }
      });
      setSupermarkets(Array.from(uniqueSupermarkets.values()));
    });

    return () => unsubscribe();
  }, []);

  const addSupermarket = async (name: string) => {
    if (!name.trim()) return;

    const normalizedNewName = name.trim().toLowerCase();
    
    const q = query(collection(db, SUPERMARKETS_COLLECTION));
    const querySnapshot = await getDocs(q);
    
    const existingSupermarket = querySnapshot.docs.find(doc => doc.data().name.toLowerCase() === normalizedNewName);

    if (!existingSupermarket) {
      await addDoc(collection(db, SUPERMARKETS_COLLECTION), { name: name.trim() });
    }
  };

  const searchSupermarkets = (query: string): string[] => {
    if (!query) return [];
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
