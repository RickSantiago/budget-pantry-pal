
import { useCallback, useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, addDoc, setDoc, onSnapshot, getDoc, updateDoc, query, where } from "firebase/firestore";
import { ShoppingList } from "@/types/shopping";
import { useAuth } from "./useAuth";

export function useSharedList() {
  const { user } = useAuth();
  const [sharedLists, setSharedLists] = useState<ShoppingList[]>([]);

  // Effect to listen for lists shared with the current user
  useEffect(() => {
    if (!user?.uid) {
      setSharedLists([]);
      return;
    };

    const q = query(collection(db, 'sharedLists'), where('members', 'array-contains', user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listsData = snapshot.docs
        .map(doc => {
          const data = doc.data();
          const list = data.list; // The nested list object

          // If the document is malformed (no nested list), skip it
          if (!list) {
            console.warn("Skipping malformed shared list document:", doc.id);
            return null;
          }

          // Ensure the final object is valid and has an items array
          return {
            ...list,
            id: doc.id, // The shared session ID is the list ID
            items: list.items || [],
          } as ShoppingList;
        })
        .filter((list): list is ShoppingList => list !== null); // Filter out the nulls

      setSharedLists(listsData);
    });

    return () => unsubscribe();
  }, [user?.uid]);


  const createSession = useCallback(async (list: ShoppingList) => {
    const colRef = collection(db, 'sharedLists');
    // Ensure the list being shared has members, including the owner
    const members = Array.from(new Set([...(list.members || []), list.ownerId]));
    const docRef = await addDoc(colRef, { list, createdAt: new Date().toISOString(), members });
    return docRef.id;
  }, []);

  const updateSession = useCallback(async (sessionId: string, list: ShoppingList) => {
    const docRef = doc(db, 'sharedLists', sessionId);
    const members = Array.from(new Set([...(list.members || []), list.ownerId]));
    await setDoc(docRef, { list, updatedAt: new Date().toISOString(), members }, { merge: true });
  }, []);

  const getSession = useCallback(async (sessionId: string) => {
    const docRef = doc(db, 'sharedLists', sessionId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const list = data.list;
      if (!list) return null;

      return {
        ...list,
        id: docSnap.id,
        items: list.items || [],
      } as ShoppingList;
    }
    return null;
  }, []);
  
  const addMemberToSession = useCallback(async (sessionId: string, memberId: string) => {
    const session = await getSession(sessionId);
    if (session) {
      const updatedMembers = Array.from(new Set([...(session.members || []), memberId]));
      await updateSession(sessionId, { ...session, members: updatedMembers });
    }
  }, [getSession, updateSession]);


  return { createSession, updateSession, getSession, sharedLists, addMemberToSession };
}
