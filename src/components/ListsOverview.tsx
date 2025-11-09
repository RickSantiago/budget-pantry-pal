import { ShoppingList } from "@/types/shopping";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ListsOverviewProps {
  lists: ShoppingList[];
  onSelectList: (id: string) => void;
  onCreateList: () => void;
  onDeleteList: (id: string) => void;
  onEditList: (id: string) => void;
  currentListId: string | null;
}

const ListsOverview = ({ lists, onSelectList, onCreateList, onDeleteList, onEditList, currentListId }: ListsOverviewProps) => {

  const sortedLists = [...lists].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Minhas Listas</h1>
                <p className="text-sm text-muted-foreground">Você tem {lists.length} listas de compras.</p>
            </div>
            <Button size="lg" onClick={onCreateList} className="shadow-glow hover:shadow-xl transition-all duration-300 w-full sm:w-auto">
                <Plus className="mr-2 h-5 w-5" /> Nova Lista
            </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {sortedLists.map(list => {
                const totalSpent = list.totalSpent || 0;
                const budget = list.plannedBudget || 0;
                const progress = budget > 0 ? (totalSpent / budget) * 100 : 0;
                const itemCount = list.items?.length || 0;

                return (
                    <Card 
                        key={list.id} 
                        onClick={() => onSelectList(list.id)} 
                        className={`cursor-pointer transition-all duration-300 hover:border-primary/60 hover:shadow-lg glass ${currentListId === list.id ? 'border-primary/80 shadow-xl' : 'border-border/50'}`}>
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start gap-2">
                                <CardTitle className="text-lg font-semibold tracking-tight truncate flex-1">{list.title}</CardTitle>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onEditList(list.id);}}><Edit className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/80 hover:text-destructive" onClick={(e) => { e.stopPropagation(); onDeleteList(list.id);}}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </div>
                            <CardDescription className="text-xs">{new Date(list.date).toLocaleDateString('pt-BR', {day: '2-digit', month: 'long', year: 'numeric'})}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Itens: <span className="font-semibold text-foreground">{itemCount}</span></span>
                                <span className="text-muted-foreground">Gasto: <span className="font-bold text-primary">R$ {totalSpent.toFixed(2)}</span></span>
                            </div>
                           {budget > 0 && (
                             <div className="space-y-1.5">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs text-muted-foreground">Orçamento</span>
                                    <span className={`text-xs font-medium ${totalSpent > budget ? 'text-destructive' : 'text-muted-foreground'}`}>R$ {totalSpent.toFixed(2)} / R$ {budget.toFixed(2)}</span>
                                </div>
                                <Progress value={progress} className={`h-1.5 ${totalSpent > budget ? '[&>div]:bg-destructive' : ''}`} />
                             </div>
                            )}
                             <Button variant="outline" className="w-full glass hover:bg-primary/10 border-primary/20 hover:border-primary/50">
                                Ver detalhes <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    </div>
  );
};

export default ListsOverview;
