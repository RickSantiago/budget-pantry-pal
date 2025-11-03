import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, onSnapshot } from 'firebase/firestore';
import { ShoppingList, ShoppingItem } from '@/types/shopping';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const SharedListView = () => {
  const { listId } = useParams<{ listId: string }>();
  const [list, setList] = useState<ShoppingList | null>(null);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadList = async () => {
      if (!listId) return;
      
      try {
        const listDoc = await getDoc(doc(db, 'lists', listId));
        
        if (!listDoc.exists()) {
          setError('Lista não encontrada');
          setLoading(false);
          return;
        }

        const listData = { ...listDoc.data(), id: listDoc.id } as ShoppingList;
        
        // Check if list is public
        if (!listData.isPublic) {
          setError('Esta lista não está disponível publicamente');
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

    loadList();
  }, [listId]);

  // Load items in a separate effect with realtime updates
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
      
      setItems(prev => prev.map(i => 
        i.id === itemId ? { ...i, checked: !i.checked } : i
      ));
      
      toast.success(item.checked ? 'Item desmarcado' : 'Item marcado');
    } catch (err) {
      console.error('Error toggling item:', err);
      toast.error('Erro ao atualizar item');
    }
  };

  if (loading) {
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
  const totalPrice = items.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 1;
    return sum + (price * qty);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-8">
      <div className="glass sticky top-0 z-10 border-b border-border/50 backdrop-blur-lg">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Alert className="mb-4 glass border-primary/50">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Você está visualizando uma lista compartilhada. Você pode marcar itens mas não pode editá-los ou deletá-los.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold">{list.title}</h1>
              {list.observation && (
                <p className="text-sm text-muted-foreground mt-1">{list.observation}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {checkedItems} de {totalItems} itens
              </p>
            </div>

            <div className="glass rounded-xl p-4 border border-border/50 shadow-md space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-primary">
                    R$ {totalPrice.toFixed(2)}
                  </p>
                </div>
                {list.plannedBudget && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Planejado</p>
                    <p className="text-lg font-semibold">
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

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum item na lista</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className={`glass rounded-lg p-4 border border-border/50 transition-all ${
                  item.checked ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleItem(item.id)}
                    className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                      item.checked
                        ? 'bg-primary border-primary'
                        : 'border-muted-foreground/30 hover:border-primary'
                    }`}
                  >
                    {item.checked && <Check className="w-4 h-4 text-primary-foreground" />}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${item.checked ? 'line-through' : ''}`}>
                      {item.name}
                    </p>
                    <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                      {item.category && <span>{item.category}</span>}
                      {item.quantity && item.unit && (
                        <span>{item.quantity} {item.unit}</span>
                      )}
                    </div>
                  </div>

                  {item.price && (
                    <div className="text-right">
                      <p className="font-semibold text-primary">
                        R$ {item.price.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SharedListView;
