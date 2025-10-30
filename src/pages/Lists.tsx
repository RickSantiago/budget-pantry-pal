import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Bell, BarChart3, ArrowLeft, User, X, AlertTriangle } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import BottomNavigation from "@/components/BottomNavigation";
import ListItem from "@/components/ListItem";
import AddItemDialog from "@/components/AddItemDialog";
import EditItemDialog from "@/components/EditItemDialog";
import CreateListDialog from "@/components/CreateListDialog";
import ListsOverview from "@/components/ListsOverview";
import { ShoppingList, ShoppingItem } from "@/types/shopping";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AppHeader from "@/components/AppHeader";

const LISTS_STORAGE_KEY = "shopping-lists";

const Lists = () => {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [currentListId, setCurrentListId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [isCreateListDialogOpen, setIsCreateListDialogOpen] = useState(false);
  const [isEditListDialogOpen, setIsEditListDialogOpen] = useState(false);
  const [sortAZ, setSortAZ] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("Todos");
  const [showBudgetAlert, setShowBudgetAlert] = useState(true);

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

  const handleCreateList = (listData: { title: string; observation: string; date: string; plannedBudget?: number }) => {
    const newList: ShoppingList = {
      id: Date.now().toString(),
      ...listData,
      items: [],
    };
    setLists([newList, ...lists]);
    setCurrentListId(newList.id);
  };

  const handleEditList = (updatedData: { title: string; observation: string; date: string; plannedBudget?: number }) => {
    if (!currentList) return;
    const updatedLists = lists.map(list =>
      list.id === currentListId
        ? { ...list, ...updatedData }
        : list
    );
    setLists(updatedLists);
    localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(updatedLists));
    setIsEditListDialogOpen(false);
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
  localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(updatedLists));
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
  localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(updatedLists));
  };

  const handleEditItem = (updatedItem: ShoppingItem) => {
    if (!currentList) return;

    const updatedLists = lists.map(list => {
      if (list.id === currentListId) {
        return {
          ...list,
          items: list.items.map(item =>
            item.id === updatedItem.id ? updatedItem : item
          ),
        };
      }
      return list;
    });
  setLists(updatedLists);
  localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(updatedLists));
  };

  const handleOpenEditDialog = (itemId: string) => {
    if (!currentList) return;
    const item = currentList.items.find(i => i.id === itemId);
    if (item) {
      setEditingItem(item);
      setIsEditDialogOpen(true);
    }
  };

  // If no list is selected, show overview with new layout
  if (!currentListId || !currentList) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-24">
        {/* Header */}
     <AppHeader
        title="Market Match"
        subtitle="Seu app de organização de compras"
        rightNode={
          <Button variant="outline" size="icon" className="glass rounded-full h-9 w-9 sm:h-10 sm:w-10">
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        }
      />

        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <ListsOverview
            lists={lists}
            onSelectList={setCurrentListId}
            onCreateNew={() => setIsCreateListDialogOpen(true)}
            onDeleteList={(id) => {
              const updated = lists.filter(list => list.id !== id);
              setLists(updated);
              localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(updated));
            }}
          />
          <CreateListDialog
            open={isCreateListDialogOpen}
            onOpenChange={setIsCreateListDialogOpen}
            onCreateList={handleCreateList}
          />
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    );
  }

  const totalItems = currentList.items.length;
  // allowedUnits: unidade, caixa, pacote
  const allowedUnits = ["unidade", "caixa", "pacote"];
  // Calculate checked items value using same rule as totalPrice
  const checkedItemsValue = currentList.items.reduce((sum, item) => {
    if (!item.checked) return sum;
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 0;
    const unit = item.unit ? String(item.unit).toLowerCase() : "";
    if (allowedUnits.includes(unit)) {
      return sum + price * qty;
    }
    return sum + price;
  }, 0);
  const checkedItems = currentList.items.filter(item => item.checked).length;
  // (removido: duplicado)
  // Calculate total price:
  // - If unit is in allowedUnits (unidade/caixa/pacote): price * quantity
  // - Otherwise (e.g., g, kg, L): count only the price (do NOT multiply by quantity)
  const totalPrice = currentList.items.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 0;
    const unit = item.unit ? String(item.unit).toLowerCase() : "";

    if (allowedUnits.includes(unit)) {
      return sum + price * qty;
    }

    return sum + price;
  }, 0);
  const plannedBudget = currentList.plannedBudget || 0;
  const budgetProgress = plannedBudget > 0 ? (totalPrice / plannedBudget) * 100 : 0;
  const isOverBudget = plannedBudget > 0 && totalPrice > plannedBudget;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-24">
      {/* Header */}
      <div className="glass sticky top-0 z-10 border-b border-border/50 backdrop-blur-lg">
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
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
                onClick={() => setIsEditListDialogOpen(true)}
                title="Editar lista"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
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

          {/* Edit List Dialog */}
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
          {/* Budget Alert */}
          {isOverBudget && showBudgetAlert && (
            <Alert className="glass border-destructive/50 bg-destructive/10 mb-4">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-sm">
                  Valor ultrapassou o planejado em R$ {(totalPrice - plannedBudget).toFixed(2)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 -mr-2"
                  onClick={() => setShowBudgetAlert(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Summary Card */}
          <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-border/50 shadow-md space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Gasto Atual</p>
                <p className={`text-lg sm:text-2xl font-bold ${isOverBudget ? 'text-destructive' : 'text-primary'}`}>
                  R$ {totalPrice.toFixed(2)}
                </p>
              </div>
              {plannedBudget > 0 && (
                <div className="text-right">
                  <p className="text-xs sm:text-sm text-muted-foreground">Planejado</p>
                  <p className="text-base sm:text-lg font-semibold">
                    R$ {plannedBudget.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
            
            {plannedBudget > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Orçamento</span>
                  <span>{budgetProgress.toFixed(0)}%</span>
                </div>
                <Progress 
                  value={Math.min(budgetProgress, 100)} 
                  className={`h-2 ${isOverBudget ? '[&>div]:bg-destructive' : ''}`}
                />
              </div>
            )}

            <div className="pt-2 border-t border-border/50">
              <div className="flex justify-between items-center">
                <p className="text-xs sm:text-sm text-muted-foreground">Progresso de Itens</p>
                <p className="text-base sm:text-lg font-semibold">
                  {totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0}%
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Valor dos itens marcados: R$ {checkedItemsValue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtro de categoria, ordenação e Items List */}
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-wrap gap-2 mb-2 items-center justify-between">
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground">Filtrar:</span>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="glass border-border/50 rounded-lg px-2 py-1 text-sm"
            >
              <option value="Todos">Todos</option>
              {[...new Set(currentList.items.map(i => i.category).filter(Boolean))].map(cat => (
                <option key={cat} value={cat!}>{cat}</option>
              ))}
            </select>
          </div>
          <Button
            variant={sortAZ ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => setSortAZ((v) => !v)}
          >
            {sortAZ ? "Ordenar por padrão" : "Ordenar A-Z"}
          </Button>
        </div>
        <div className="space-y-2 sm:space-y-3">
          {currentList.items.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">Nenhum item na lista ainda</p>
              <Button onClick={() => setIsAddDialogOpen(true)} variant="outline" className="glass text-sm">
                Adicionar primeiro item
              </Button>
            </div>
          ) : (
            // Filtra por categoria, depois ordena: não marcados primeiro, depois marcados; se sortAZ, ordena A-Z dentro de cada grupo
            [...currentList.items]
              .filter(item => categoryFilter === "Todos" || item.category === categoryFilter)
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
                  className="animate-slide-up"
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

      {/* Floating Add Button */}
      <Button
        onClick={() => setIsAddDialogOpen(true)}
        className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-glow hover:shadow-xl transition-all duration-300 animate-scale-in"
      >
        <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
      </Button>

      {/* Bottom Navigation */}
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
    </div>
  );
};

export default Lists;
