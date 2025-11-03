// Card de lista com swipe/hover para mostrar ações
const ListCard = ({ list, onSelectList, onDeleteList }) => {
  const totalItems = list.items.length;
  const checkedItems = list.items.filter(item => item.checked).length;
  const allowedUnits = ["unidade", "caixa", "pacote"];
  const totalPrice = list.items.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const unit = item.unit ? String(item.unit).toLowerCase() : "";
    if (allowedUnits.includes(unit)) {
      return sum + price * item.quantity;
    } else {
      return sum + price;
    }
  }, 0);
  const [showActions, setShowActions] = useState(false);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  function handleTouchStart(e) {
    touchStartX.current = e.changedTouches[0].clientX;
  }
  function handleTouchEnd(e) {
    touchEndX.current = e.changedTouches[0].clientX;
    if (touchStartX.current !== null && touchEndX.current !== null) {
      if (touchStartX.current - touchEndX.current > 60) {
        setShowActions(true);
      } else {
        setShowActions(false);
      }
    }
  }
  return (
    <Card
      key={list.id}
      className={`glass border-border/50 p-3 sm:p-4 flex cursor-pointer hover:shadow-lg transition-all duration-300 animate-slide-up rounded-xl sm:rounded-2xl relative group`}
      style={{ animationDelay: `0ms` }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex-1 min-w-0" onClick={() => onSelectList(list.id)}>
        <h3 className="font-semibold text-base sm:text-lg mb-0.5 sm:mb-1 truncate">{list.title}</h3>
        {list.observation && (
          <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2 truncate">{list.observation}</p>
        )}
        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="font-semibold">Data da compra:</span>
            <span>{new Date(list.date).toLocaleDateString('pt-BR')}</span>
          </span>
          <span className="flex items-center gap-1">
            <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
            {checkedItems}/{totalItems}
          </span>
        </div>
        <div className="mt-1.5 sm:mt-2">
          <p className="text-base sm:text-md font-bold bg-clip-text">
            Gasto atual: R$ {totalPrice.toFixed(2)}
          </p>
        </div>
      </div>
      {/* Ações: editar/excluir, animadas */}
      <div
        className={`absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 items-end transition-all duration-300 ${showActions ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <Button variant="outline" size="icon" onClick={() => onSelectList(list.id)} title="Abrir">
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
        </Button>
        <Button variant="destructive" size="icon" onClick={() => onDeleteList(list.id)} title="Excluir lista">
          <X className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};
import { ShoppingList } from "@/types/shopping";
import { Card } from "@/components/ui/card";
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Calendar, ShoppingCart, X } from "lucide-react";

interface ListsOverviewProps {
  lists: ShoppingList[];
  onSelectList: (listId: string) => void;
  onCreateNew: () => void;
  onDeleteList: (listId: string) => void;
}

const ListsOverview = ({ lists, onSelectList, onCreateNew, onDeleteList }: ListsOverviewProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-24 px-3 sm:px-4 pt-4 sm:pt-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Listas de compras</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Gerencie todas as suas listas de compras</p>
        </div>

        <Button 
          onClick={onCreateNew}
          className="w-full mb-4 sm:mb-6 gradient-primary shadow-glow hover:shadow-xl transition-all duration-300 h-11 sm:h-12 text-sm sm:text-base rounded-xl sm:rounded-2xl"
        >
          + Nova Lista
        </Button>

        <div className="space-y-2 sm:space-y-3">
          {lists.map((list) => (
            <ListCard key={list.id} list={list} onSelectList={onSelectList} onDeleteList={onDeleteList} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListsOverview;
