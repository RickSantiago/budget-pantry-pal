import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, updateDoc, collection, onSnapshot, addDoc, deleteDoc, deleteField } from 'firebase/firestore';
import { ShoppingList, ShoppingItem } from '@/types/shopping';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Check, Plus, Repeat2, MapPin, Calendar, Pencil, Trash2 } from 'lucide-react';
import { getCategoryIcon } from '@/utils/categoryIcons';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EditItemDialog from '@/components/EditItemDialog';

const categories = [
  "Grãos e Cereais",
  "Carnes",
  "Hortifrúti",
  "Laticínios",
  "Padaria e Massas",
  "Bebidas",
  "Doces e Snacks",
  "Congelados",
  "Molhos e Condimentos",
  "Limpeza",
  "Higiene",
  "Frios",
  "Oleos e Gorduras",
  "Outros"
];

const getCategoryColor = (category?: string): string => {
  const colors: Record<string, string> = {
    "Grãos e Cereais": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    "Carnes": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    "Hortifrúti": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    "Laticínios": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    "Padaria e Massas": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    "Bebidas": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
    "Doces e Snacks": "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
    "Congelados": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    "Molhos e Condimentos": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    "Limpeza": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    "Higiene": "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
    "Frios": "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400",
    "Oleos e Gorduras": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  };
  return colors[category || ""] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
};

const SharedListView = () => {
  const { listId } = useParams<{ listId: string }>();
  const [user, loadingUser] = useAuthState(auth);
  const [list, setList] = useState<ShoppingList | null>(null);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemSupermarket, setNewItemSupermarket] = useState('');
  const [newItemExpiryDate, setNewItemExpiryDate] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState('unidade');
  const [newItemIsRecurring, setNewItemIsRecurring] = useState(false);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ShoppingItem | null>(null);

  const isOwner = user && list?.ownerId === user.uid;
  const isCollaborator = user && Array.isArray(list?.sharedWith) && list.sharedWith.includes(user.email || '');

  useEffect(() => {
    const loadList = async () => {
      if (!listId || loadingUser) return;

      try {
        const listDoc = await getDoc(doc(db, 'lists', listId));

        if (!listDoc.exists()) {
          setError('Lista não encontrada');
          setLoading(false);
          return;
        }

        const listData = { ...listDoc.data(), id: listDoc.id } as ShoppingList;

        const isOwner = user && listData.ownerId === user.uid;
        const isCollaborator = user && Array.isArray(listData.sharedWith) && listData.sharedWith.includes(user.email || '');

        if (!listData.isPublic && !isOwner && !isCollaborator) {
          setError('Esta lista é privada e você não tem permissão para acessá-la.');
          setLoading(false);
          return;
        }

        setList(listData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading shared list:', err);
        setError('Erro ao carregar lista');
        setLoading(false);
      }
    };

    if (!loadingUser) {
        loadList();
    }
  }, [listId, user, loadingUser]);

  useEffect(() => {
    if (!listId || !list) return;

    const itemsCollection = collection(db, 'lists', listId, 'items');
    const unsubscribe = onSnapshot(itemsCollection, (snapshot) => {
      const itemsData: ShoppingItem[] = [];
      snapshot.forEach((doc) => {
        itemsData.push({ ...doc.data(), id: doc.id } as ShoppingItem);
      });
      setItems(itemsData);
    });

    return () => unsubscribe();
  }, [listId, list]);

  const handleToggleItem = async (itemId: string) => {
    if (!listId) return;

    const item = items.find(i => i.id === itemId);
    if (!item) return;

    try {
      const itemRef = doc(db, 'lists', listId, 'items', itemId);
      await updateDoc(itemRef, { checked: !item.checked });
      toast.success(item.checked ? 'Item desmarcado' : 'Item marcado');
    } catch (err) {
      console.error('Error toggling item:', err);
      toast.error('Erro ao atualizar item');
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listId || !newItemName.trim()) {
      toast.error('Digite o nome do produto');
      return;
    }

    const newItem: any = {
        name: newItemName.trim(),
        quantity: newItemQuantity,
        unit: newItemUnit,
        checked: false,
        isRecurring: newItemIsRecurring,
    };

    if (newItemPrice) {
        newItem.price = parseFloat(newItemPrice);
    } else {
        newItem.price = deleteField();
    }
    if (newItemSupermarket) {
        newItem.supermarket = newItemSupermarket;
    } else {
        newItem.supermarket = deleteField();
    }
    if (newItemExpiryDate) {
        newItem.expiryDate = newItemExpiryDate;
    } else {
        newItem.expiryDate = deleteField();
    }
    if (newItemCategory) {
        newItem.category = newItemCategory;
    } else {
        newItem.category = deleteField();
    }

    try {
      await addDoc(collection(db, 'lists', listId, 'items'), newItem);

      setNewItemName('');
      setNewItemPrice('');
      setNewItemSupermarket('');
      setNewItemExpiryDate('');
      setNewItemCategory('');
      setNewItemQuantity(1);
      setNewItemUnit('unidade');
      setNewItemIsRecurring(false);
      setIsAddDialogOpen(false);
      toast.success('Item adicionado com sucesso!');
    } catch (err) {
      console.error('Error adding item:', err);
      toast.error('Erro ao adicionar item');
    }
  };
  
  const handleOpenEditDialog = (item: ShoppingItem) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };
  
  const handleOpenDeleteDialog = (item: ShoppingItem) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteItem = async () => {
    if (!listId || !itemToDelete) return;

    try {
      const itemRef = doc(db, 'lists', listId, 'items', itemToDelete.id);
      await deleteDoc(itemRef);
      toast.success(`"${itemToDelete.name}" foi removido.`);
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Error deleting item:', err);
      toast.error('Erro ao remover item.');
    }
  };

  const handleEditItem = async (updatedItem: ShoppingItem) => {
    if (!listId || !updatedItem.id) return;
    const itemRef = doc(db, 'lists', listId, 'items', updatedItem.id);
    
    const { id, ...dataToUpdate } = updatedItem;

    const dataForFirebase: { [key: string]: any } = {};
    for (const key in dataToUpdate) {
        const value = (dataToUpdate as any)[key];
        if (value === undefined) {
            dataForFirebase[key] = deleteField();
        } else {
            dataForFirebase[key] = value;
        }
    }

    try {
        await updateDoc(itemRef, dataForFirebase);
        toast.success(`"${updatedItem.name}" foi atualizado.`);
        setIsEditDialogOpen(false);
    } catch (err) {
        console.error("Error updating item:", err);
        toast.error("Erro ao atualizar item.");
    }
  };


  if (loading || loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <p className="text-lg">Carregando lista compartilhada...</p>
      </div>
    );
  }

  if (error || !list) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="text-center space-y-4">
          <p className="text-lg text-destructive">{error || 'Lista não encontrada'}</p>
          <Button onClick={() => window.location.href = '/'}>
            Voltar para o início
          </Button>
        </div>
      </div>
    );
  }

  const totalItems = items.length;
  const checkedItems = items.filter(i => i.checked).length;
  const allowedUnits = ['unidade', 'caixa', 'pacote'];
  const totalPrice = items.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 0;
    const unit = item.unit ? String(item.unit).toLowerCase() : '';

    if (allowedUnits.includes(unit)) {
      return sum + price * qty;
    }

    return sum + price;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-24">
      <div className="glass sticky top-0 z-10 border-b border-border/50 backdrop-blur-lg">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <Alert className="mb-4 glass border-primary/30 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-xs sm:text-sm">
              Você está vendo uma lista compartilhada. Suas alterações são salvas e sincronizadas para todos.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold">{list.title}</h1>
              {list.observation && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{list.observation}</p>
              )}
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                {checkedItems} de {totalItems} itens marcados
              </p>
            </div>

            <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-border/50 shadow-md space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Gasto Total</p>
                  <p className="text-lg sm:text-2xl font-bold text-primary">
                    R$ {totalPrice.toFixed(2)}
                  </p>
                </div>
                {list.plannedBudget && (
                  <div className="text-right">
                    <p className="text-xs sm:text-sm text-muted-foreground">Planejado</p>
                    <p className="text-base sm:text-lg font-semibold">
                      R$ {list.plannedBudget.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progresso</span>
                  <span>{totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0}%</span>
                </div>
                <Progress value={totalItems > 0 ? (checkedItems / totalItems) * 100 : 0} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="space-y-2 sm:space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm sm:text-base text-muted-foreground mb-4">Nenhum item na lista</p>
              {(isOwner || isCollaborator) && (
                  <Button onClick={() => setIsAddDialogOpen(true)} variant="outline" className="glass">
                    Adicionar primeiro item
                  </Button>
              )}
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className={`glass rounded-2xl border transition-all duration-300 p-4 overflow-hidden ${
                  item.checked ? 'opacity-60 border-border/30' : 'border-border/50 hover:border-border/80 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleItem(item.id)}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mt-0.5 flex items-center justify-center transition-all ${
                      item.checked
                        ? 'bg-primary border-primary'
                        : 'border-muted-foreground/30 hover:border-primary'
                    }`}
                    disabled={!isOwner && !isCollaborator}
                  >
                    {item.checked && <Check className="w-4 h-4 text-primary-foreground" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-bold text-base ${item.checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {item.name}
                      </h3>
                      {item.category && (() => {
                        const Icon = getCategoryIcon(item.category);
                        return <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />;
                      })()}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.category && (
                        <Badge className={`text-xs font-medium ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </Badge>
                      )}
                      {item.isRecurring && (
                        <Badge variant="secondary" className="text-xs font-medium bg-primary/10 text-primary dark:bg-primary/20">
                          <Repeat2 className="w-3 h-3 mr-1" />
                          Recorrente
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-col gap-1 text-xs text-muted-foreground mt-2">
                      {item.supermarket && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{item.supermarket}</span>
                        </div>
                      )}
                      {item.quantity && item.unit && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Qtd:</span>
                          <span>{item.quantity} {item.unit}</span>
                        </div>
                      )}
                      {item.expiryDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Val: {new Date(item.expiryDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    {item.price && (
                        <div className="text-right flex-shrink-0">
                        {(() => {
                            const allowedUnits = ['unidade', 'caixa', 'pacote'];
                            const price = Number(item.price) || 0;
                            const quantity = Number(item.quantity) || 1;
                            const unit = String(item.unit || '').toLowerCase();
                            const total = allowedUnits.includes(unit) ? price * quantity : price;
                            
                            return (
                            <>
                                <p className="font-bold text-lg text-success">
                                R$ {total.toFixed(2)}
                                </p>
                                {allowedUnits.includes(unit) && quantity > 1 && (
                                <p className="text-xs text-muted-foreground">
                                    {quantity}x R$ {price.toFixed(2)}
                                </p>
                                )}
                            </>
                            );
                        })()}
                        </div>
                    )}
                    {(isOwner || isCollaborator) && (
                        <div className='flex items-center'>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditDialog(item)}>
                              <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleOpenDeleteDialog(item)}>
                              <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {(isOwner || isCollaborator) && (
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="fixed bottom-6 right-4 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-glow hover:shadow-xl transition-all duration-300 animate-scale-in"
          >
            <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="glass border-border/50 shadow-xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Adicionar Item</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">{list.title}</p>
          </DialogHeader>

          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">Nome do produto *</Label>
              <Input
                id="name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Ex: Leite integral"
                className="glass border-border/50 h-11"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm font-semibold">Quantidade</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setNewItemQuantity(Math.max(1, newItemQuantity - 1))}
                    className="glass border-border/50 h-10 w-10"
                  >
                    -
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
                    className="glass border-border/50 text-center h-10"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setNewItemQuantity(newItemQuantity + 1)}
                    className="glass border-border/50 h-10 w-10"
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit" className="text-sm font-semibold">Unidade</Label>
                <Select value={newItemUnit} onValueChange={setNewItemUnit}>
                  <SelectTrigger className="glass border-border/50 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass border-border/50">
                    <SelectItem value="unidade">Unidade</SelectItem>
                    <SelectItem value="kg">Kg</SelectItem>
                    <SelectItem value="g">Gramas</SelectItem>
                    <SelectItem value="l">Litro</SelectItem>
                    <SelectItem value="ml">ML</SelectItem>
                    <SelectItem value="caixa">Caixa</SelectItem>
                    <SelectItem value="pacote">Pacote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-semibold">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                placeholder="0.00"
                className="glass border-border/50 h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria (opcional)</Label>
              <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                <SelectTrigger className="glass border-border/50">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent className="glass border-border/50">
                  {categories.map((cat) => {
                    const Icon = getCategoryIcon(cat);
                    return (
                      <SelectItem key={cat} value={cat}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span>{cat}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supermarket">Supermercado (opcional)</Label>
              <Input
                id="supermarket"
                value={newItemSupermarket}
                onChange={(e) => setNewItemSupermarket(e.target.value)}
                placeholder="Ex: Carrefour"
                className="glass border-border/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">Validade (opcional)</Label>
              <Input
                id="expiryDate"
                type="date"
                value={newItemExpiryDate}
                onChange={(e) => setNewItemExpiryDate(e.target.value)}
                className="glass border-border/50"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRecurring"
                checked={newItemIsRecurring}
                onCheckedChange={(checked) => setNewItemIsRecurring(checked as boolean)}
              />
              <Label htmlFor="isRecurring" className="cursor-pointer text-sm">
                Item de compra recorrente
              </Label>
            </div>

            <Alert className="glass border-blue-200 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/10">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-xs text-blue-900 dark:text-blue-300">
                O item será adicionado à lista em tempo real e todos verão a atualização instantaneamente.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 gradient-primary border-none shadow-glow hover:shadow-lg transition-all duration-300"
              >
                Adicionar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {list && (
        <EditItemDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onEditItem={handleEditItem}
            item={editingItem}
            listTitle={list.title}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso removerá permanentemente o item
              "{itemToDelete?.name}" da sua lista.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem}>Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SharedListView;
