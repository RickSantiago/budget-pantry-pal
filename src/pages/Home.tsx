
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, query, where, getDocs, onSnapshot, Unsubscribe, doc, writeBatch } from 'firebase/firestore';
import { auth, db } from "@/lib/firebase";
import { ShoppingList, ShoppingItem } from "@/types/shopping";

import AppHeader from "@/components/AppHeader";
import BottomNavigation from "@/components/BottomNavigation";
import ShoppingListCard from "@/components/ShoppingListCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import DeleteListDialog from "@/components/DeleteListDialog";
import ShareListDialog from "@/components/ShareListDialog";

const Home = () => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [filteredLists, setFilteredLists] = useState<ShoppingList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);
  const [listToDelete, setListToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setIsLoading(false);
      return navigate('/welcome');
    }

    const fetchAndProcessLists = (snapshot: any, listType: 'owner' | 'shared') => {
      snapshot.docs.forEach(async (docSnapshot: any) => {
        const listData = { ...docSnapshot.data(), id: docSnapshot.id } as ShoppingList;
        
        const itemsCollection = collection(db, 'lists', docSnapshot.id, 'items');
        const itemsSnapshot = await getDocs(itemsCollection);
        listData.items = itemsSnapshot.docs.map(itemDoc => ({ ...itemDoc.data(), id: itemDoc.id } as ShoppingItem));

        const totalSpent = listData.items.reduce((sum, item) => sum + ((Number(item.price) || 0) * (item.quantity || 1)), 0);
        
        setLists(prevLists => {
          const existingList = prevLists.find(l => l.id === listData.id);
          if (existingList) {
            return prevLists.map(l => l.id === listData.id ? { ...listData, totalSpent } : l);
          } else {
            return [...prevLists, { ...listData, totalSpent }];
          }
        });
      });
    };

    const qOwner = query(collection(db, "lists"), where("ownerId", "==", user.uid));
    const qShared = query(collection(db, "lists"), where("sharedWith", "array-contains", user.email));

    const unsubOwner = onSnapshot(qOwner, (snapshot) => fetchAndProcessLists(snapshot, 'owner'));
    const unsubShared = onSnapshot(qShared, (snapshot) => fetchAndProcessLists(snapshot, 'shared'));

    setIsLoading(false);

    return () => {
      unsubOwner();
      unsubShared();
    };
  }, [user, loading, navigate]);

  useEffect(() => {
    const sorted = [...lists].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    setFilteredLists(
      sorted.filter(list =>
        list.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, lists]);

  const openDeleteDialog = (listId: string) => {
    setListToDelete(listId);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setListToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const handleDeleteList = async () => {
    if (!listToDelete) return;
    try {
      const batch = writeBatch(db);
      const itemsRef = collection(db, "lists", listToDelete, "items");
      const itemsSnapshot = await getDocs(itemsRef);
      itemsSnapshot.forEach(doc => batch.delete(doc.ref));
      const listRef = doc(db, "lists", listToDelete);
      batch.delete(listRef);
      await batch.commit();
      setLists(prev => prev.filter(l => l.id !== listToDelete));
      closeDeleteDialog();
    } catch (error) {
      console.error("Error deleting list:", error);
    }
  };

  const openShareDialog = (list: ShoppingList) => {
    setSelectedList(list);
    setIsShareDialogOpen(true);
  };

  const closeShareDialog = () => {
    setSelectedList(null);
    setIsShareDialogOpen(false);
  };

  const handleTogglePin = async (listId: string) => {
    const list = lists.find(l => l.id === listId);
    if (!list) return;
    try {
      const listRef = doc(db, "lists", listId);
      await writeBatch(db).update(listRef, { isPinned: !list.isPinned }).commit();
      setLists(prev => prev.map(l => l.id === listId ? { ...l, isPinned: !l.isPinned } : l));
    } catch (error) {
      console.error("Error pinning list:", error);
    }
  };

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center"><LoadingSpinner size={48} /></div>;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader title="Minhas Listas" />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar lista..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => navigate('/new-list')} className="w-full sm:w-auto">
            <PlusCircle className="h-5 w-5 mr-2" />
            Criar Nova Lista
          </Button>
        </div>

        {filteredLists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLists.map((list) => (
              <ShoppingListCard
                key={list.id}
                list={list}
                onDelete={() => openDeleteDialog(list.id)}
                onShare={() => openShareDialog(list)}
                onTogglePin={() => handleTogglePin(list.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-2xl font-semibold">Nenhuma lista encontrada</h3>
            <p className="text-muted-foreground mt-2">Que tal criar uma nova lista de compras?</p>
          </div>
        )}
      </main>
      <BottomNavigation />

      <DeleteListDialog 
        isOpen={isDeleteDialogOpen} 
        onClose={closeDeleteDialog} 
        onConfirm={handleDeleteList} 
      />

      <ShareListDialog 
        open={isShareDialogOpen} 
        onOpenChange={(open) => !open && closeShareDialog()}
        listId={selectedList?.id || null}
      />
    </div>
  );
};

export default Home;
