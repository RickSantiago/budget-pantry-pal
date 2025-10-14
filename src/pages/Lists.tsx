import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Bell, BarChart3, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import FloatingMenu from "@/components/FloatingMenu";
import ListItem from "@/components/ListItem";
import AddItemDialog from "@/components/AddItemDialog";
import CreateListDialog from "@/components/CreateListDialog";
import ListsOverview from "@/components/ListsOverview";
import { ShoppingList, ShoppingItem } from "@/types/shopping";

const LISTS_STORAGE_KEY = "shopping-lists";

const Lists = () => {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [currentListId, setCurrentListId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCreateListDialogOpen, setIsCreateListDialogOpen] = useState(false);

  // Load lists from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(LISTS_STORAGE_KEY);
    if (stored) {
      setLists(JSON.parse(stored));
    }
  }, []);

  // Save lists to localStorage
  useEffect(() => {
    if (lists.length > 0) {
      localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(lists));
    }
  }, [lists]);

  const currentList = lists.find(list => list.id === currentListId);

  const handleCreateList = (listData: { title: string; observation: string; date: string }) => {
    const newList: ShoppingList = {
      id: Date.now().toString(),
      ...listData,
      items: [],
    };
    setLists([newList, ...lists]);
    setCurrentListId(newList.id);
  };

  const handleToggleItem = (id: string) => {
    if (!currentList) return;
    
    const updatedLists = lists.map(list => {
      if (list.id === currentListId) {
        return {
          ...list,
          items: list.items.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
          ),
        };
      }
      return list;
    });
    setLists(updatedLists);
  };

  const handleAddItem = (itemData: Omit<ShoppingItem, 'id' | 'checked'>) => {
    if (!currentList) return;

    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      ...itemData,
      checked: false,
    };

    const updatedLists = lists.map(list => {
      if (list.id === currentListId) {
        return {
          ...list,
          items: [...list.items, newItem],
        };
      }
      return list;
    });
    setLists(updatedLists);
  };

  // If no list is selected, show overview
  if (!currentListId || !currentList) {
    return (
      <>
        <FloatingMenu />
        <ListsOverview
          lists={lists}
          onSelectList={setCurrentListId}
          onCreateNew={() => setIsCreateListDialogOpen(true)}
        />
        <CreateListDialog
          open={isCreateListDialogOpen}
          onOpenChange={setIsCreateListDialogOpen}
          onCreateList={handleCreateList}
        />
      </>
    );
  }

  const totalItems = currentList.items.length;
  const checkedItems = currentList.items.filter(item => item.checked).length;
  const totalPrice = currentList.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-24">
      <FloatingMenu />
      
      {/* Header */}
      <div className="glass sticky top-0 z-10 border-b border-border/50">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
              onClick={() => setCurrentListId(null)}
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold truncate">{currentList.title}</h1>
              {currentList.observation && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate">{currentList.observation}</p>
              )}
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                {checkedItems} de {totalItems} itens
              </p>
            </div>
            <div className="flex gap-1 sm:gap-2 flex-shrink-0">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 sm:h-10 sm:w-10 hidden sm:flex">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 sm:h-10 sm:w-10 hidden sm:flex">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 sm:h-10 sm:w-10 hidden md:flex">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>

          {/* Summary Card */}
          <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-border/50 shadow-md">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total estimado</p>
                <p className="text-lg sm:text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                  R$ {totalPrice.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs sm:text-sm text-muted-foreground">Progresso</p>
                <p className="text-base sm:text-lg font-semibold">
                  {totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-2 sm:space-y-3">
        {currentList.items.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">Nenhum item na lista ainda</p>
            <Button onClick={() => setIsAddDialogOpen(true)} variant="outline" className="glass text-sm">
              Adicionar primeiro item
            </Button>
          </div>
        ) : (
          currentList.items.map((item, index) => (
            <div
              key={item.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ListItem
                item={item}
                onToggle={handleToggleItem}
              />
            </div>
          ))
        )}
      </div>

      {/* Floating Add Button */}
      <Button
        onClick={() => setIsAddDialogOpen(true)}
        className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full gradient-primary shadow-glow hover:shadow-xl transition-all duration-300 animate-scale-in"
      >
        <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
      </Button>

      <AddItemDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddItem={handleAddItem}
      />
    </div>
  );
};

export default Lists;
