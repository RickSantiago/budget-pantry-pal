
import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from 'sonner';
import {
  Plus,
  Settings,
  ArrowLeft,
  User,
  X,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import BottomNavigation from '@/components/BottomNavigation';
import ListItem from '@/components/ListItem';
import AddItemDialog from '@/components/AddItemDialog';
import EditItemDialog from '@/components/EditItemDialog';
import CreateListDialog from '@/components/CreateListDialog';
import ListsOverview from '@/components/ListsOverview';
import ShareListDialog from '@/components/ShareListDialog';
import { ShoppingList, ShoppingItem } from '@/types/shopping';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AppHeader from '@/components/AppHeader';

const Lists = () => {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [currentListId, setCurrentListId] = useState<string | null>(null);
  const [items, setItems] = useState<ShoppingItem[]>([]);

  // UI State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [isCreateListDialogOpen, setIsCreateListDialogOpen] = useState(false);
  const [isEditListDialogOpen, setIsEditListDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedListForShare, setSelectedListForShare] = useState<string | null>(null);
  const [user] = useAuthState(auth);
  const [sortAZ, setSortAZ] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('Todos');
  const [showBudgetAlert, setShowBudgetAlert] = useState(true);

  // Fetch lists from Firestore
  useEffect(() => {
    const q = query(collection(db, 'lists'));
    const unsubscribe = onSnapshot(q, querySnapshot => {
      const listsData: ShoppingList[] = [];
      querySnapshot.forEach(doc => {
        listsData.push({ ...doc.data(), id: doc.id } as ShoppingList);
      });
      // If user is present, show only lists owned by or shared with the user
      let visible = listsData;
      if (user) {
        visible = listsData.filter(l =>
          (l.owner === user.uid) || (l.ownerId === user.uid) ||
          (Array.isArray(l.sharedWith) && l.sharedWith.includes(user.uid)) ||
          (Array.isArray(l.members) && l.members.includes(user.uid))
        );
      }
      setLists(visible);
    });
    return () => unsubscribe();
  }, [user]);

  // Fetch items for the current list from Firestore
  useEffect(() => {
    if (!currentListId) {
      setItems([]);
      return;
    }

    const itemsCollection = collection(db, 'lists', currentListId, 'items');
    const unsubscribe = onSnapshot(itemsCollection, querySnapshot => {
      const itemsData: ShoppingItem[] = [];
      querySnapshot.forEach(doc => {
        itemsData.push({ ...doc.data(), id: doc.id } as ShoppingItem);
      });
      setItems(itemsData);
    });

    return () => unsubscribe();
  }, [currentListId]);

  const currentList = lists.find(list => list.id === currentListId);

  const handleCreateList = async (listData: { title: string; observation: string; date: string; plannedBudget?: number }) => {
    const payload = {
      ...listData,
      owner: user ? user.uid : undefined,
      ownerId: user ? user.uid : undefined,
      sharedWith: [],
      members: [],
      createdAt: new Date().toISOString(),
    };
    const newListRef = await addDoc(collection(db, 'lists'), payload);
    setCurrentListId(newListRef.id);
  };

  const handleEditList = async (updatedData: { title: string; observation: string; date: string; plannedBudget?: number }) => {
    if (!currentListId) return;
    const listRef = doc(db, 'lists', currentListId);
    await updateDoc(listRef, updatedData);
    setIsEditListDialogOpen(false);
  };

  const handleDeleteList = async (listId: string) => {
    // Delete all items in the subcollection first
    const itemsCollection = collection(db, 'lists', listId, 'items');
    const itemsSnapshot = await getDocs(itemsCollection);
    const batch = writeBatch(db);
    itemsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Then delete the list itself
    await deleteDoc(doc(db, 'lists', listId));
  };


  const handleToggleItem = async (id: string) => {
    if (!currentListId) return;
    const item = items.find(i => i.id === id);
    if (item) {
      const itemRef = doc(db, 'lists', currentListId, 'items', id);
      await updateDoc(itemRef, { checked: !item.checked });
    }
  };

  const handleAddItem = async (itemData: Omit<ShoppingItem, 'id' | 'checked'>) => {
    if (!currentListId) return;
    await addDoc(collection(db, 'lists', currentListId, 'items'), {
      ...itemData,
      checked: false,
    });
  };

  const handleEditItem = async (updatedItem: ShoppingItem) => {
    if (!currentListId || !updatedItem.id) return;
    const itemRef = doc(db, 'lists', currentListId, 'items', updatedItem.id);
    // Avoid passing id and undefined fields to Firestore
    const { id, ...dataToUpdate } = updatedItem;
    await updateDoc(itemRef, dataToUpdate);
  };

  const handleOpenEditDialog = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      setEditingItem(item);
      setIsEditDialogOpen(true);
    }
  };

  if (!currentListId || !currentList) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-24'>
        <AppHeader
          title='Market Match'
          subtitle='Seu app de organização de compras'
          rightNode={
            <Button variant='outline' size='icon' className='glass rounded-full h-9 w-9 sm:h-10 sm:w-10'>
              <User className='w-4 h-4 sm:w-5 sm:h-5' />
            </Button>
          }
        />

        <div className='max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6'>
          <ListsOverview
            lists={lists}
            onSelectList={setCurrentListId}
            onCreateList={handleCreateList}
            onDeleteList={handleDeleteList}
            onEditList={(id) => {
              setCurrentListId(id);
              setIsEditListDialogOpen(true);
            }}
            currentListId={currentListId}
          />
          <CreateListDialog
            open={isCreateListDialogOpen}
            onOpenChange={setIsCreateListDialogOpen}
            onCreateList={handleCreateList}
          />
        </div>

        <BottomNavigation />
      </div>
    );
  }

  // Calculations now use the 'items' state
  const totalItems = items.length;
  const allowedUnits = ['unidade', 'caixa', 'pacote'];
  const checkedItemsValue = items.reduce((sum, item) => {
    if (!item.checked) return sum;
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 0;
    const unit = item.unit ? String(item.unit).toLowerCase() : '';
    if (allowedUnits.includes(unit)) {
      return sum + price * qty;
    }
    return sum + price;
  }, 0);
  const checkedItems = items.filter(item => item.checked).length;
  const totalPrice = items.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 0;
    const unit = item.unit ? String(item.unit).toLowerCase() : '';

    if (allowedUnits.includes(unit)) {
      return sum + price * qty;
    }

    return sum + price;
  }, 0);
  const plannedBudget = currentList.plannedBudget || 0;
  const budgetProgress = plannedBudget > 0 ? (totalPrice / plannedBudget) * 100 : 0;
  const isOverBudget = plannedBudget > 0 && totalPrice > plannedBudget;

  return (
    <div className='min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-24'>
      <div className='glass sticky top-0 z-10 border-b border-border/50 backdrop-blur-lg'>
        <div className='max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-5'>
          <div className='flex items-start justify-between gap-3 mb-4'>
            <div className='flex items-center gap-2 sm:gap-3 flex-1 min-w-0'>
              <Button
                variant='ghost'
                size='icon'
                className='glass rounded-full h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 hover:border-primary/30'
                onClick={() => setCurrentListId(null)}
              >
                <ArrowLeft className='w-4 h-4 sm:w-5 sm:h-5' />
              </Button>
              <div className='flex-1 min-w-0'>
                <h1 className='text-xl sm:text-2xl font-bold text-foreground truncate mb-0.5'>{currentList.title}</h1>
                {currentList.observation && (
                  <p className='text-xs sm:text-sm text-muted-foreground truncate'>{currentList.observation}</p>
                )}
              </div>
            </div>

            <div className='flex gap-2 flex-shrink-0'>
              <Button
                variant='outline'
                size='icon'
                className='glass rounded-full h-9 w-9 sm:h-10 sm:w-10 hover:border-primary/30'
                onClick={() => setIsEditListDialogOpen(true)}
                title='Editar lista'
              >
                <Settings className='w-4 h-4 sm:w-5 sm:h-5' />
              </Button>
              <Button
                variant='outline'
                size='icon'
                className='glass rounded-full h-9 w-9 sm:h-10 sm:w-10 transition-all duration-300'
                onClick={() => {
                  if (!currentListId) return toast.error('Abra uma lista antes de compartilhar');
                  setSelectedListForShare(currentListId);
                  setIsShareDialogOpen(true);
                }}
                title='Compartilhar lista'
              >
                <Users className='w-4 h-4 sm:w-5 sm:h-5' />
              </Button>
              <ThemeToggle />
            </div>
          </div>

          {isEditListDialogOpen && currentList && (
            <CreateListDialog
              open={isEditListDialogOpen}
              onOpenChange={setIsEditListDialogOpen}
              onCreateList={handleEditList}
              initialData={{
                title: currentList.title,
                observation: currentList.observation,
                date: currentList.date,
                plannedBudget: currentList.plannedBudget,
              }}
            />
          )}
          <div className='space-y-3'>
            <div className='flex items-center justify-between text-xs sm:text-sm text-muted-foreground'>
              <span>{checkedItems} de {totalItems} itens marcados</span>
              <span>{totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0}% completo</span>
            </div>
            <Progress value={totalItems > 0 ? (checkedItems / totalItems) * 100 : 0} className='h-2' />
          </div>

          {isOverBudget && showBudgetAlert && (
            <Alert className='glass border-destructive/50 bg-destructive/10 animate-fade-in'>
              <AlertTriangle className='h-4 w-4 text-destructive' />
              <AlertDescription className='flex items-center justify-between'>
                <span className='text-sm'>
                  Valor ultrapassou o planejado em R$ {(totalPrice - plannedBudget).toFixed(2)}
                </span>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-6 w-6 -mr-2'
                  onClick={() => setShowBudgetAlert(false)}
                >
                  <X className='h-4 w-4' />
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className='grid grid-cols-2 gap-3'>
            <div className='glass rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-border/50 shadow-md'>
              <p className='text-xs sm:text-sm text-muted-foreground mb-1'>Gasto Atual</p>
              <p className={`text-xl sm:text-3xl font-bold ${isOverBudget ? 'text-destructive' : 'text-success'}`}>
                R$ {totalPrice.toFixed(2)}
              </p>
              <p className='text-[10px] sm:text-xs text-muted-foreground mt-1'>
                Marcados: R$ {checkedItemsValue.toFixed(2)}
              </p>
            </div>

            {plannedBudget > 0 && (
              <div className='glass rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-border/50 shadow-md'>
                <p className='text-xs sm:text-sm text-muted-foreground mb-1'>Planejado</p>
                <p className='text-xl sm:text-3xl font-bold text-foreground'>
                  R$ {plannedBudget.toFixed(2)}
                </p>
                <div className='mt-2'>
                  <div className='flex justify-between text-[10px] sm:text-xs text-muted-foreground mb-1'>
                    <span>Orçamento</span>
                    <span>{budgetProgress.toFixed(0)}%</span>
                  </div>
                  <Progress
                    value={Math.min(budgetProgress, 100)}
                    className={`h-1.5 ${isOverBudget ? '[&>div]:bg-destructive' : ''}`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6'>
        <div className='flex flex-wrap gap-2 mb-2 items-center justify-between'>
          <div className='flex gap-2 items-center'>
            <span className='text-sm text-muted-foreground'>Filtrar:</span>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className='glass border-border/50 rounded-lg px-2 py-1 text-sm text-foreground bg-background'
            >
              <option value='Todos'>Todos</option>
              {[...new Set(items.map(i => i.category).filter(Boolean))].map(cat => (
                <option key={cat} value={cat!}>{cat}</option>
              ))}
            </select>
          </div>
          <Button
            variant={sortAZ ? 'default' : 'outline'}
            size='sm'
            className='rounded-full'
            onClick={() => setSortAZ((v) => !v)}
          >
            {sortAZ ? 'Ordenar por padrão' : 'Ordenar A-Z'}
          </Button>
        </div>
        <div className='space-y-2 sm:space-y-3'>
          {items.length === 0 ? (
            <div className='text-center py-8 sm:py-12'>
              <p className='text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4'>Nenhum item na lista ainda</p>
              <Button onClick={() => setIsAddDialogOpen(true)} variant='outline' className='glass text-sm'>
                Adicionar primeiro item
              </Button>
            </div>
          ) : (
            [...items]
              .filter(item => categoryFilter === 'Todos' || item.category === categoryFilter)
              .sort((a, b) => {
                if (a.checked !== b.checked) return a.checked ? 1 : -1;
                if (sortAZ) {
                  return a.name.localeCompare(b.name, 'pt-BR');
                }
                return 0;
              })
              .map((item, index) => (
                <div
                  key={item.id}
                  className='animate-slide-up'
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ListItem
                    item={item}
                    onToggle={handleToggleItem}
                    onEdit={handleOpenEditDialog}
                  />
                </div>
              ))
          )}
        </div>
      </div>

      <Button
        onClick={() => setIsAddDialogOpen(true)}
        className='fixed bottom-20 sm:bottom-24 right-4 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-glow hover:shadow-xl transition-all duration-300 animate-scale-in'
      >
        <Plus className='w-5 h-5 sm:w-6 sm:h-6' />
      </Button>

      <BottomNavigation />

      <AddItemDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddItem={handleAddItem}
        listTitle={currentList.title}
      />

      <EditItemDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onEditItem={handleEditItem}
        item={editingItem}
        listTitle={currentList.title}
      />

      <ShareListDialog
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        listId={selectedListForShare}
      />
    </div>
  );
};

export default Lists;
