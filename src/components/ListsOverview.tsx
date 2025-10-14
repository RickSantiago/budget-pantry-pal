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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-24 px-3 sm:px-4 pt-4 sm:pt-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Minhas Listas</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Gerenciador de listas de compras</p>
        </div>

        <Button 
          onClick={onCreateNew}
          className="w-full mb-4 sm:mb-6 gradient-primary shadow-glow hover:shadow-xl transition-all duration-300 h-11 sm:h-12 text-sm sm:text-base rounded-xl sm:rounded-2xl"
        >
          + Nova Lista
        </Button>

        <div className="space-y-2 sm:space-y-3">
          {lists.map((list, index) => {
            const totalItems = list.items.length;
            const checkedItems = list.items.filter(item => item.checked).length;
            const totalPrice = list.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            return (
              <Card
                key={list.id}
                onClick={() => onSelectList(list.id)}
                className="glass border-border/50 p-3 sm:p-4 cursor-pointer hover:shadow-lg transition-all duration-300 animate-slide-up rounded-xl sm:rounded-2xl"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg mb-0.5 sm:mb-1 truncate">{list.title}</h3>
                    {list.observation && (
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2 truncate">{list.observation}</p>
                    )}
                    <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">{new Date(list.date).toLocaleDateString('pt-BR')}</span>
                        <span className="sm:hidden">{new Date(list.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                        {checkedItems}/{totalItems}
                      </span>
                    </div>
                    <div className="mt-1.5 sm:mt-2">
                      <p className="text-base sm:text-lg font-bold gradient-primary bg-clip-text text-transparent">
                        R$ {totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground flex-shrink-0" />
                </div>
              </Card>
            );
          })}

          {lists.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">Nenhuma lista criada ainda</p>
              <Button onClick={onCreateNew} variant="outline" className="glass text-sm">
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
