
import { useState, useEffect } from 'react';
import { db } from '../firebase'; // Assuming firebase.ts is in the src directory
import { collection, onSnapshot, addDoc, query, where, getDocs } from 'firebase/firestore';

const SUPERMARKETS_COLLECTION = 'supermarkets';

export const useSupermarkets = () => {
  const [supermarkets, setSupermarkets] = useState<string[]>([]);

  useEffect(() => {
    const q = query(collection(db, SUPERMARKETS_COLLECTION));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const supermarketsData: string[] = [];
      querySnapshot.forEach((doc) => {
        supermarketsData.push(doc.data().name);
      });
      setSupermarkets(supermarketsData);
    });

    return () => unsubscribe();
  }, []);

  const addSupermarket = async (name: string) => {
    if (!name.trim()) return;

    const normalized = name.trim();
    // Check if the supermarket already exists
    const q = query(collection(db, SUPERMARKETS_COLLECTION), where('name', '==', normalized));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      await addDoc(collection(db, SUPERMARKETS_COLLECTION), { name: normalized });
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
