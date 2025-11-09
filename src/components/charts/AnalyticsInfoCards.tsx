import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Repeat, TrendingUp } from "lucide-react";
import { ShoppingItem } from "@/types/shopping";

interface AnalyticsInfoCardsProps {
    topSpendingItems: { name: string; totalCost: number; }[];
    topRecurringItems: ShoppingItem[];
    expiringItems: (ShoppingItem & { diffDays: number })[];
}

export const AnalyticsInfoCards = ({ topSpendingItems, topRecurringItems, expiringItems }: AnalyticsInfoCardsProps) => {
    const parseLocal = (dateStr: string): Date => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day, 12);
    };

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="glass-card">
                <CardHeader><CardTitle className="flex items-center gap-2">🏆 Top 5 Mais Caros</CardTitle></CardHeader>
                <CardContent className="space-y-3 pt-4">
                    {topSpendingItems.length > 0 ? topSpendingItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                            <span className="font-medium text-sm truncate pr-2">{item.name}</span>
                            <Badge variant="destructive" className="text-sm">R$ {item.totalCost.toFixed(2)}</Badge>
                        </div>
                    )) : <div className="h-[150px] flex items-center justify-center text-muted-foreground">Sem itens para analisar.</div>}
                </CardContent>
            </Card>

            <Card className="glass-card">
                <CardHeader><CardTitle className="flex items-center gap-2"><Repeat />Top 5 Recorrentes</CardTitle></CardHeader>
                <CardContent className="space-y-3 pt-4">
                    {topRecurringItems.length > 0 ? topRecurringItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                            <span className="font-medium text-sm truncate pr-2">{item.name}</span>
                             {item.expiryDate && <span className="text-sm text-muted-foreground">Val: {parseLocal(item.expiryDate!).toLocaleDateString('pt-BR')}</span>}
                        </div>
                    )) : <div className="h-[150px] flex items-center justify-center text-muted-foreground">Sem itens recorrentes.</div>}
                </CardContent>
            </Card>
            
            <Card className="glass-card border-amber-500/30">
                <CardHeader><CardTitle className="flex items-center gap-2 text-amber-500"><AlertTriangle />Próximos do Vencimento</CardTitle></CardHeader>
                <CardContent>
                {expiringItems.length > 0 ? (
                    <div className="space-y-2">
                    {expiringItems.map(item => {
                        let colorClass = 'text-green-500';
                        if (item.diffDays <= 3) colorClass = 'text-red-500 font-bold';
                        else if (item.diffDays <= 7) colorClass = 'text-amber-500 font-semibold';
                        return (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                            <span className="font-medium text-sm truncate pr-2">{item.name}</span>
                            <span className={`text-sm ${colorClass}`}>{item.diffDays <= 0 ? 'Vence hoje!' : `Vence em ${item.diffDays} dias`}</span>
                        </div>
                        );
                    })}
                    </div>
                ) : <div className="h-[150px] flex items-center justify-center text-muted-foreground">Nenhum item com data de validade próxima.</div>}
                </CardContent>
            </Card>
        </div>
    );
};