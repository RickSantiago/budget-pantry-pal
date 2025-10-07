import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Bell, BarChart3 } from "lucide-react";
import FloatingMenu from "@/components/FloatingMenu";
import ListItem from "@/components/ListItem";
import AddItemDialog from "@/components/AddItemDialog";

// Mock data
const mockItems = [
  { id: "1", name: "Arroz", category: "Grãos e Cereais", quantity: 2, price: 25.90, checked: false },
  { id: "2", name: "Feijão", category: "Grãos e Cereais", quantity: 1, price: 8.50, checked: false },
  { id: "3", name: "Frango (peito)", category: "Carnes", quantity: 1, price: 15.99, checked: true },
  { id: "4", name: "Tomate", category: "Hortifrúti", quantity: 1, price: 6.50, checked: false },
  { id: "5", name: "Leite", category: "Laticínios", quantity: 2, price: 4.99, checked: false },
];

const Lists = () => {
  const [items, setItems] = useState(mockItems);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleToggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const handleAddItem = (item: any) => {
    const newItem = {
      id: Date.now().toString(),
      ...item,
      checked: false,
    };
    setItems([...items, newItem]);
  };

  const totalItems = items.length;
  const checkedItems = items.filter(item => item.checked).length;
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-24">
      <FloatingMenu />
      
      {/* Header */}
      <div className="glass sticky top-0 z-10 border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Lista Janeiro/2025</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {checkedItems} de {totalItems} itens no carrinho
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <BarChart3 className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Summary Card */}
          <div className="glass rounded-2xl p-4 border border-border/50 shadow-md">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total estimado</p>
                <p className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                  R$ {totalPrice.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Progresso</p>
                <p className="text-lg font-semibold">
                  {totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {items.map((item, index) => (
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
        ))}
      </div>

      {/* Floating Add Button */}
      <Button
        onClick={() => setIsAddDialogOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full gradient-primary shadow-glow hover:shadow-xl transition-all duration-300 animate-scale-in"
      >
        <Plus className="w-6 h-6" />
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
