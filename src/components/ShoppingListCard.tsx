import { ShoppingList } from "@/types/shopping";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, ShoppingBag, Trash2, Share2, Pin, PinOff } from 'lucide-react';

interface ShoppingListCardProps {
  list: ShoppingList;
  onDelete: () => void;
  onShare: () => void;
  onTogglePin: () => void;
}

const ShoppingListCard = ({ list, onDelete, onShare, onTogglePin }: ShoppingListCardProps) => {
  const navigate = useNavigate();
  const itemCount = list.items?.length || 0;
  const sharedCount = list.sharedWith?.length || 0;

  const handleCardClick = (e: React.MouseEvent) => {
    // Stop propagation if the click was on a button
    if ((e.target as HTMLElement).closest('button')) {
      e.stopPropagation();
      return;
    }
    navigate(`/list/${list.id}`);
  };

  return (
    <Card 
      className={`flex flex-col justify-between transition-all hover:shadow-lg hover:-translate-y-1 glass-card cursor-pointer ${list.isPinned ? 'border-primary/50' : ''}`}
      onClick={handleCardClick}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-bold mb-1 truncate pr-2">{list.title}</CardTitle>
             <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={(e) => { e.stopPropagation(); onTogglePin(); }}>
                {list.isPinned 
                    ? <PinOff className="h-4 w-4 text-primary" /> 
                    : <Pin className="h-4 w-4 text-muted-foreground" />}
                <span className="sr-only">{list.isPinned ? 'Desafixar lista' : 'Afixar lista'}</span>
            </Button>
        </div>
        <CardDescription className="flex items-center text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 mr-1.5" />
          {new Date(list.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <div className="flex justify-between text-sm text-muted-foreground">
            <div className="flex items-center">
                <ShoppingBag className="h-4 w-4 mr-2" />
                <span>{itemCount} {itemCount === 1 ? 'item' : 'itens'}</span>
            </div>
            <div className="flex items-center font-semibold text-primary">
                <span>R$ {list.totalSpent?.toFixed(2) || '0.00'}</span>
            </div>
        </div>
        {list.plannedBudget && list.plannedBudget > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Orçamento</span>
              <span>R$ {list.plannedBudget.toFixed(2)}</span>
            </div>
            <Progress value={(list.totalSpent || 0) / list.plannedBudget * 100} />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-4">
        <div className="flex items-center text-sm">
            {sharedCount > 0 && (
              <div className="flex items-center text-muted-foreground">
                <Users className="h-4 w-4 mr-2" />
                <span>{sharedCount} {sharedCount === 1 ? 'pessoa' : 'pessoas'}</span>
              </div>
            )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); onShare(); }}>
            <Share2 className="h-4 w-4" />
            <span className="sr-only">Compartilhar</span>
          </Button>
          <Button variant="destructive" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Excluir</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ShoppingListCard;
