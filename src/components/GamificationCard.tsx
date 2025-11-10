import { useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { ShoppingList, PantryItem } from "@/types/shopping";
import { User } from 'firebase/auth';
import { Award, List, ShieldCheck, ShoppingCart, Trophy } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GamificationCardProps {
  user: User;
  lists: ShoppingList[];
  pantryItems: PantryItem[];
  budgetHistory: any[]; // Simplified type
}

const GamificationCard = ({ user, lists, pantryItems, budgetHistory }: GamificationCardProps) => {

  const stats = useMemo(() => {
    const creationDate = user.metadata.creationTime ? new Date(user.metadata.creationTime) : new Date();
    const memberSince = format(creationDate, "dd 'de' MMM 'de' yyyy", { locale: ptBR });
    const daysAsMember = differenceInDays(new Date(), creationDate);

    const totalLists = lists.length;
    const totalPantryItems = pantryItems.length;

    const totalSpending = lists.reduce((total, list) => {
        const listTotal = (list.items || []).reduce((sum, item) => {
            const price = Number(item.price) || 0;
            const quantity = Number(item.quantity) || 1;
            return sum + (price * quantity);
        }, 0);
        return total + listTotal;
    }, 0);

    // Achievements Logic
    const achievements = [
        {
            name: "Membro Fundador",
            description: `No time desde ${format(creationDate, "MMM/yy")}`,
            unlocked: true, // Always unlocked
            icon: ShieldCheck
        },
        {
            name: "Planejador Iniciante",
            description: "Crie sua primeira lista de compras",
            unlocked: totalLists >= 1,
            icon: List
        },
        {
            name: "Mestre das Listas",
            description: "Crie mais de 10 listas",
            unlocked: totalLists >= 10,
            icon: Award
        },
        {
            name: "Guru da Despensa",
            description: "Adicione 20 itens à sua despensa",
            unlocked: totalPantryItems >= 20,
            icon: ShoppingCart
        },
        {
            name: "Mestre do Orçamento",
            description: "Defina seu primeiro orçamento mensal",
            unlocked: budgetHistory.length > 0,
            icon: Trophy
        },
    ];

    return { memberSince, totalLists, totalPantryItems, totalSpending, achievements };
  }, [user, lists, pantryItems, budgetHistory]);

  return (
    <Card className="glass border-border/50 p-6 shadow-md">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-500" />Suas Conquistas e Estatísticas
        </h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-center">
            <div className="glass border border-border/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Membro desde</p>
                <p className="text-sm font-bold">{stats.memberSince}</p>
            </div>
            <div className="glass border border-border/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Listas Criadas</p>
                <p className="text-sm font-bold">{stats.totalLists}</p>
            </div>
            <div className="glass border border-border/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Itens na Despensa</p>
                <p className="text-sm font-bold">{stats.totalPantryItems}</p>
            </div>
            <div className="glass border border-border/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Gasto Total (Aprox.)</p>
                <p className="text-sm font-bold">R$ {stats.totalSpending.toFixed(2)}</p>
            </div>
        </div>

        {/* Achievements */}
        <div>
            <h3 className="text-md font-semibold mb-3">Selos Desbloqueados</h3>
            <div className="space-y-3">
                {stats.achievements.map((ach, index) => (
                    <div 
                        key={index} 
                        className={`flex items-center p-3 rounded-lg transition-all duration-300 ${ach.unlocked ? 'glass border border-green-500/20 bg-green-500/10' : 'glass border-dashed border-border/50 opacity-50'}`}>
                        <ach.icon className={`w-6 h-6 mr-4 ${ach.unlocked ? 'text-green-500' : 'text-muted-foreground'}`}/>
                        <div>
                            <p className={`font-semibold ${ach.unlocked ? 'text-primary-foreground' : 'text-muted-foreground'}`}>{ach.name}</p>
                            <p className="text-xs text-muted-foreground">{ach.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </Card>
  );
};

export default GamificationCard;
