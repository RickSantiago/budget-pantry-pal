import { useCallback } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, addDoc, setDoc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";
import { ShoppingList } from "@/types/shopping";

// Basic shared-list helper using Firestore
export function useSharedList() {
  const createSession = useCallback(async (list: ShoppingList) => {
    const colRef = collection(db, 'sharedLists');
    const docRef = await addDoc(colRef, { list, createdAt: new Date().toISOString() });
    return docRef.id;
  }, []);

  const updateSession = useCallback(async (sessionId: string, list: ShoppingList) => {
    const docRef = doc(db, 'sharedLists', sessionId);
    await setDoc(docRef, { list, updatedAt: new Date().toISOString() }, { merge: true });
  }, []);

  const subscribeSession = useCallback((sessionId: string, onUpdate: (list: ShoppingList) => void) => {
    const docRef = doc(db, 'sharedLists', sessionId);
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as { list?: ShoppingList } | undefined;
        if (data && data.list) onUpdate(data.list);
      }
    });
    return unsub;
  }, []);

  const getSessionOnce = useCallback(async (sessionId: string) => {
    const docRef = doc(db, 'sharedLists', sessionId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data()?.list as ShoppingList | null;
  }, []);

  return { createSession, updateSession, subscribeSession, getSessionOnce };
}
