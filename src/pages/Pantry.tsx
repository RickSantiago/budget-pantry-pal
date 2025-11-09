import React, { useState } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { PantryItem } from '@/types/shopping';
import PantryListItem from '@/components/PantryListItem';
import AddItemToPantryDialog from '@/components/AddItemToPantryDialog';
import EditPantryItemDialog from '@/components/EditPantryItemDialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { parseISO } from 'date-fns';
import BottomNavigation from '@/components/BottomNavigation';

const Pantry = () => {
  const [user] = useAuthState(auth);
  const pantryRef = collection(db, `users/${user?.uid}/pantry`);
  const [pantryItems, loading, error] = useCollection(pantryRef);
  
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);

  const handleAddItem = async (item: Omit<PantryItem, 'id' | 'ownerId' | 'purchaseDate'>) => {
    if (!user) return;
    const newItem: Omit<PantryItem, 'id'> = {
      ...item,
      purchaseDate: new Date().toISOString(),
      ownerId: user.uid,
      expiryDate: (item.expiryDate as unknown as Date).toISOString(),
    };
    await addDoc(pantryRef, newItem);
  };

  const handleEdit = (item: PantryItem) => {
    setEditingItem(item);
    setEditDialogOpen(true);
  };

  const handleConfirmEdit = async (itemId: string, itemData: Partial<PantryItem>) => {
    if (!user) return;
    const itemRef = doc(db, `users/${user.uid}/pantry`, itemId);
    const updatedData = {
        ...itemData,
        expiryDate: (itemData.expiryDate as unknown as Date).toISOString(),
    };
    await updateDoc(itemRef, updatedData);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, `users/${user.uid}/pantry`, id));
  };

  const handleConsume = async (id: string) => {
    handleDelete(id);
  };
  
  const typedPantryItems = pantryItems?.docs.map(doc => ({ id: doc.id, ...doc.data() } as PantryItem));

  const sortedItems = typedPantryItems?.sort((a, b) => parseISO(a.expiryDate).getTime() - parseISO(b.expiryDate).getTime());

  return (
    <div className="container mx-auto p-4 pb-20">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Minha Despensa</h1>
        <Button onClick={() => setAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item
        </Button>
      </div>
      
      {loading && <p>Carregando itens da despensa...</p>}
      {error && <p className="text-red-500">Erro ao carregar itens: {error.message}</p>}
      
      {!loading && pantryItems?.empty && (
        <div className="text-center py-10">
          <p className="text-lg text-muted-foreground">Sua despensa está vazia.</p>
          <p className="text-sm">Adicione itens da sua lista de compras ou manualmente.</p>
        </div>
      )}

      <div className="space-y-4">
        {sortedItems?.map(item => (
          <PantryListItem
            key={item.id}
            item={item}
            onConsume={handleConsume}
            onEdit={() => handleEdit(item)}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <AddItemToPantryDialog
        isOpen={isAddDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onConfirm={handleAddItem}
      />

      <EditPantryItemDialog
        item={editingItem}
        isOpen={isEditDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onConfirm={handleConfirmEdit}
      />
      <BottomNavigation />
    </div>
  );
};

export default Pantry;
