import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, query, where, getDocs, writeBatch, doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from "@/lib/firebase";
import { ShoppingList, ShoppingItem } from "@/types/shopping";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, RotateCcw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import AppHeader from "@/components/AppHeader";
import BottomNavigation from "@/components/BottomNavigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConfirmationDialog from "@/components/ConfirmationDialog";

const Trash = () => {
  const [user, loading] = useAuthState(auth);
  const [deletedLists, setDeletedLists] = useState<ShoppingList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchDeletedLists = async () => {
      setIsLoading(true);
      try {
        const q = query(
          collection(db, "lists"),
          where("ownerId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        
        const lists: ShoppingList[] = [];
        for (const docSnap of snapshot.docs) {
          const listData = { ...docSnap.data(), id: docSnap.id } as ShoppingList;
          
          if (listData.deletedAt) {
            const itemsCollection = collection(db, 'lists', docSnap.id, 'items');
            const itemsSnapshot = await getDocs(itemsCollection);
            listData.items = itemsSnapshot.docs
              .map(itemDoc => ({ ...itemDoc.data(), id: itemDoc.id } as ShoppingItem))
              .filter(item => item.deletedAt);
            lists.push(listData);
          }
        }
        
        setDeletedLists(lists);
      } catch (error) {
        console.error("Error fetching deleted lists:", error);
        toast.error("Erro ao carregar lixeira");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeletedLists();
  }, [user, loading]);

  const handleRestoreList = async (listId: string) => {
    try {
      const batch = writeBatch(db);
      const listRef = doc(db, "lists", listId);
      batch.update(listRef, { deletedAt: null });
      
      const itemsCollection = collection(db, 'lists', listId, 'items');
      const itemsSnapshot = await getDocs(itemsCollection);
      itemsSnapshot.forEach(itemDoc => {
        batch.update(itemDoc.ref, { deletedAt: null });
      });
      
      await batch.commit();
      setDeletedLists(prev => prev.filter(l => l.id !== listId));
      toast.success("Lista restaurada com sucesso");
    } catch (error) {
      console.error("Error restoring list:", error);
      toast.error("Erro ao restaurar lista");
    }
  };

  const handlePermanentDeleteList = async (listId: string) => {
    try {
      const batch = writeBatch(db);
      const itemsCollection = collection(db, 'lists', listId, 'items');
      const itemsSnapshot = await getDocs(itemsCollection);
      itemsSnapshot.forEach(itemDoc => batch.delete(itemDoc.ref));
      
      const listRef = doc(db, "lists", listId);
      await batch.commit();
      await deleteDoc(listRef);
      
      setDeletedLists(prev => prev.filter(l => l.id !== listId));
      toast.success("Lista excluída permanentemente");
    } catch (error) {
      console.error("Error permanently deleting list:", error);
      toast.error("Erro ao excluir lista permanentemente");
    }
  };

  const handleRestoreItem = async (listId: string, itemId: string) => {
    try {
      const itemRef = doc(db, "lists", listId, "items", itemId);
      await writeBatch(db).update(itemRef, { deletedAt: null }).commit();
      
      setDeletedLists(prev => prev.map(list => {
        if (list.id === listId) {
          return {
            ...list,
            items: list.items?.filter(item => item.id !== itemId)
          };
        }
        return list;
      }));
      
      toast.success("Item restaurado com sucesso");
    } catch (error) {
      console.error("Error restoring item:", error);
      toast.error("Erro ao restaurar item");
    }
  };

  const handlePermanentDeleteItem = async (listId: string, itemId: string) => {
    try {
      const itemRef = doc(db, "lists", listId, "items", itemId);
      await deleteDoc(itemRef);
      
      setDeletedLists(prev => prev.map(list => {
        if (list.id === listId) {
          return {
            ...list,
            items: list.items?.filter(item => item.id !== itemId)
          };
        }
        return list;
      }));
      
      toast.success("Item excluído permanentemente");
    } catch (error) {
      console.error("Error permanently deleting item:", error);
      toast.error("Erro ao excluir item permanentemente");
    }
  };

  const handleEmptyTrash = async () => {
    try {
      for (const list of deletedLists) {
        await handlePermanentDeleteList(list.id);
      }
      toast.success("Lixeira esvaziada");
    } catch (error) {
      console.error("Error emptying trash:", error);
      toast.error("Erro ao esvaziar lixeira");
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  const deletedItems = deletedLists.flatMap(list => 
    (list.items || []).map(item => ({ ...item, listId: list.id, listTitle: list.title }))
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader title="Lixeira" />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            Items na lixeira serão mantidos por tempo indeterminado
          </p>
          {deletedLists.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmDialog({
                open: true,
                title: "Esvaziar Lixeira",
                description: "Tem certeza que deseja excluir permanentemente todos os items da lixeira? Esta ação não pode ser desfeita.",
                onConfirm: () => {
                  handleEmptyTrash();
                  setConfirmDialog({ ...confirmDialog, open: false });
                }
              })}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Esvaziar Lixeira
            </Button>
          )}
        </div>

        <Tabs defaultValue="lists" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="lists">Listas ({deletedLists.length})</TabsTrigger>
            <TabsTrigger value="items">Items ({deletedItems.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="lists" className="space-y-4 mt-6">
            {deletedLists.length === 0 ? (
              <Card className="glass border-border/50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Trash2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma lista na lixeira</p>
                </CardContent>
              </Card>
            ) : (
              deletedLists.map((list) => (
                <Card key={list.id} className="glass border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{list.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {list.items?.length || 0} items • Excluída em {new Date(list.deletedAt!).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestoreList(list.id)}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Restaurar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setConfirmDialog({
                            open: true,
                            title: "Excluir Permanentemente",
                            description: `Tem certeza que deseja excluir permanentemente a lista "${list.title}"? Esta ação não pode ser desfeita.`,
                            onConfirm: () => {
                              handlePermanentDeleteList(list.id);
                              setConfirmDialog({ ...confirmDialog, open: false });
                            }
                          })}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="items" className="space-y-4 mt-6">
            {deletedItems.length === 0 ? (
              <Card className="glass border-border/50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Trash2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum item na lixeira</p>
                </CardContent>
              </Card>
            ) : (
              deletedItems.map((item) => (
                <Card key={`${item.listId}-${item.id}`} className="glass border-border/50">
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Lista: {item.listTitle} • Excluído em {new Date(item.deletedAt!).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestoreItem(item.listId, item.id)}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Restaurar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setConfirmDialog({
                          open: true,
                          title: "Excluir Permanentemente",
                          description: `Tem certeza que deseja excluir permanentemente o item "${item.name}"? Esta ação não pode ser desfeita.`,
                          onConfirm: () => {
                            handlePermanentDeleteItem(item.listId, item.id);
                            setConfirmDialog({ ...confirmDialog, open: false });
                          }
                        })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
      <BottomNavigation />
      
      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
      />
    </div>
  );
};

export default Trash;
