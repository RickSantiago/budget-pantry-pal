import { ShoppingList } from "@/types/shopping";
import { Card } from "@/components/ui/card";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, ShoppingCart, Trash2, Edit3, PlusCircle, Users, DollarSign, CheckCircle2 } from "lucide-react";
import CreateListDialog from "./CreateListDialog";
import { Badge } from "@/components/ui/badge";

interface ListCardProps {
  list: ShoppingList;
  onSelectList: (id: string) => void;
  onDeleteList: (id: string) => void;
  onEditList: (id: string) => void;
}

const ListCard: React.FC<ListCardProps> = ({ list, onSelectList, onDeleteList, onEditList }) => {
  if (!list) {
    return null;
  }

  const { title = "Lista sem título", date, plannedBudget, observation, sharedWith } = list;
  const items = Array.isArray(list.items) ? list.items : [];
  const totalItems = items.length;
  const purchasedItems = items.filter(item => item.checked).length;
  const progressPercentage = totalItems > 0 ? Math.round((purchasedItems / totalItems) * 100) : 0;
  const isShared = sharedWith && sharedWith.length > 0;
  const isCompleted = totalItems > 0 && purchasedItems === totalItems;

  return (
    <Card 
      className="group glass border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-scale-in overflow-hidden rounded-xl sm:rounded-2xl"
      onClick={() => onSelectList(list.id)}
    >
      <div className="p-4 sm:p-5 cursor-pointer">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg sm:text-xl font-bold truncate">{title}</h3>
              {isCompleted && (
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Concluída
                </Badge>
              )}
            </div>
            {observation && (
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{observation}</p>
            )}
          </div>
          {isShared && (
            <Badge variant="secondary" className="flex-shrink-0 text-xs">
              <Users className="w-3 h-3 mr-1" />
              Compartilhada
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="glass rounded-lg p-2.5 border border-border/30">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="text-xs">Itens</span>
            </div>
            <p className="text-base sm:text-lg font-bold">
              {purchasedItems} / {totalItems}
            </p>
            <div className="mt-1.5 bg-muted/30 rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {plannedBudget && (
            <div className="glass rounded-lg p-2.5 border border-border/30">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="w-3.5 h-3.5" />
                <span className="text-xs">Orçamento</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-primary">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plannedBudget)}
              </p>
            </div>
          )}
        </div>

        {date && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <Calendar className="w-3 h-3" />
            <span>{new Date(date).toLocaleDateString('pt-BR', { dateStyle: 'long' })}</span>
          </div>
        )}

        <div className="flex gap-2 pt-3 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 glass text-xs sm:text-sm"
            onClick={(e) => {
              e.stopPropagation();
              onEditList(list.id);
            }}
          >
            <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="glass text-xs sm:text-sm"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteList(list.id);
            }}
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
            Excluir
          </Button>
        </div>
      </div>
    </Card>
  );
};


interface ListsOverviewProps {
  lists: ShoppingList[];
  onCreateList: (listData: { title: string; observation: string; date: string; plannedBudget?: number }) => void;
  onSelectList: (id:string) => void;
  onDeleteList: (id: string) => void;
  onEditList: (id: string) => void;
  currentListId: string | null;
}

const ListsOverview: React.FC<ListsOverviewProps> = ({ lists, onCreateList, onSelectList, onDeleteList, onEditList, currentListId }) => {
  const [isNewListDialogOpen, setIsNewListDialogOpen] = useState(false);

  const otherLists = lists.filter(list => list && list.id !== currentListId);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Minhas Listas</h1>
          <p className="text-sm text-muted-foreground">
            {otherLists.length} {otherLists.length === 1 ? 'lista' : 'listas'} disponíveis
          </p>
        </div>
        <Button 
          onClick={() => setIsNewListDialogOpen(true)}
          size="lg"
          className="shadow-glow hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
        >
          <PlusCircle className="mr-2 h-5 w-5" /> Nova Lista
        </Button>
      </div>

      <CreateListDialog 
        open={isNewListDialogOpen}
        onOpenChange={setIsNewListDialogOpen}
        onCreateList={onCreateList}
      />

      {otherLists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {otherLists.map((list, index) => (
            list && (
              <div
                key={list.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ListCard 
                  list={list} 
                  onSelectList={onSelectList} 
                  onDeleteList={onDeleteList}
                  onEditList={onEditList}
                />
              </div>
            )
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4 glass border-2 border-dashed border-border/50 rounded-2xl animate-scale-in">
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-base font-medium text-muted-foreground mb-1">Nenhuma lista criada ainda</p>
          <p className="text-sm text-muted-foreground">Clique em "Nova Lista" para começar a organizar suas compras</p>
        </div>
      )}
    </div>
  );
};

export default ListsOverview;
