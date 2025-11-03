
import { ShoppingList } from "@/types/shopping";
import { Card } from "@/components/ui/card";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Calendar, ShoppingCart, X, PlusCircle, Users } from "lucide-react";
import CreateListDialog from "./CreateListDialog";

interface ListCardProps {
  list: ShoppingList;
  onSelectList: (id: string) => void;
  onDeleteList: (id: string) => void;
}

const ListCard: React.FC<ListCardProps> = ({ list, onSelectList, onDeleteList }) => {
  // FINAL DEFENSE: If list is somehow null or undefined, render nothing.
  if (!list) {
    return null;
  }

  // Safe access to properties with default fallbacks.
  const { title = "Lista sem título", items = [], date, plannedBudget, ownerId, sharedWith } = list;
  const totalItems = items.length;
  const purchasedItems = items.filter(item => item.checked).length;
  
  const [showActions, setShowActions] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const isShared = sharedWith && sharedWith.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setShowActions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [cardRef]);

  return (
    <Card 
      ref={cardRef} 
      className="p-3 sm:p-4 rounded-lg relative overflow-hidden cursor-pointer hover:bg-muted/50"
      onClick={() => setShowActions(!showActions)}
    >
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <p className="text-base sm:text-lg font-semibold leading-tight pr-10">{title}</p>
          {isShared && <div title="Lista compartilhada"><Users className="w-4 h-4 text-muted-foreground" /></div>}
        </div>
        <div className="flex items-center text-xs sm:text-sm text-muted-foreground gap-4">
          <div className="flex items-center gap-1.5" title="Itens">
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{purchasedItems} / {totalItems}</span>
          </div>
          {date && (
            <div className="flex items-center gap-1.5" title="Data">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        {plannedBudget && (
          <div className="text-xs sm:text-sm text-green-600 font-medium">
            Orçamento: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plannedBudget)}
          </div>
        )}
      </div>
      <div
        className={`absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 items-end transition-all duration-300 ${showActions ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <Button variant="outline" size="icon" onClick={(e) => { e.stopPropagation(); onSelectList(list.id); }} title="Abrir">
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
        </Button>
        <Button variant="destructive" size="icon" onClick={(e) => { e.stopPropagation(); onDeleteList(list.id); }} title="Excluir lista">
          <X className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};


interface ListsOverviewProps {
  lists: ShoppingList[];
  onCreateList: (listData: { title: string; observation: string; date: string; plannedBudget?: number }) => void;
  onSelectList: (id:string) => void;
  onDeleteList: (id: string) => void;
  currentListId: string | null;
}

const ListsOverview: React.FC<ListsOverviewProps> = ({ lists, onCreateList, onSelectList, onDeleteList, currentListId }) => {
  const [isNewListDialogOpen, setIsNewListDialogOpen] = useState(false);

  // Filter out the currently selected list from the overview
  const otherLists = lists.filter(list => list && list.id !== currentListId);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Minhas Listas</h1>
        <Button onClick={() => setIsNewListDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Nova Lista
        </Button>
      </div>

      <CreateListDialog 
        open={isNewListDialogOpen}
        onOpenChange={setIsNewListDialogOpen}
        onCreateList={onCreateList}
      />

      {otherLists.length > 0 ? (
        <div className="space-y-2 sm:space-y-3">
          {otherLists.map((list) => (
            // Add a guard here as well, just in case.
            list && <ListCard key={list.id} list={list} onSelectList={onSelectList} onDeleteList={onDeleteList} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Você ainda não tem outras listas.</p>
          <p className="text-sm text-muted-foreground">Clique em "Nova Lista" para começar.</p>
        </div>
      )}
    </div>
  );
};

export default ListsOverview;
