import { ShoppingList } from "@/types/shopping";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Calendar, ShoppingCart } from "lucide-react";

interface ListsOverviewProps {
  lists: ShoppingList[];
  onSelectList: (listId: string) => void;
  onCreateNew: () => void;
}

const ListsOverview = ({ lists, onSelectList, onCreateNew }: ListsOverviewProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-24 px-4 pt-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Minhas Listas</h1>
          <p className="text-muted-foreground">Gerenciador de listas de compras</p>
        </div>

        <Button 
          onClick={onCreateNew}
          className="w-full mb-6 gradient-primary shadow-glow hover:shadow-xl transition-all duration-300"
        >
          + Nova Lista
        </Button>

        <div className="space-y-3">
          {lists.map((list, index) => {
            const totalItems = list.items.length;
            const checkedItems = list.items.filter(item => item.checked).length;
            const totalPrice = list.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            return (
              <Card
                key={list.id}
                onClick={() => onSelectList(list.id)}
                className="glass border-border/50 p-4 cursor-pointer hover:shadow-lg transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{list.title}</h3>
                    {list.observation && (
                      <p className="text-sm text-muted-foreground mb-2">{list.observation}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(list.date).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <ShoppingCart className="w-4 h-4" />
                        {checkedItems}/{totalItems} itens
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="text-lg font-bold gradient-primary bg-clip-text text-transparent">
                        R$ {totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-muted-foreground" />
                </div>
              </Card>
            );
          })}

          {lists.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Nenhuma lista criada ainda</p>
              <Button onClick={onCreateNew} variant="outline" className="glass">
                Criar primeira lista
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListsOverview;
