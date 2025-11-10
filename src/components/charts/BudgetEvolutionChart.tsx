
import { useMemo } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BudgetHistoryData {
    budget: number;
    createdAt: { seconds: number };
}

export const BudgetEvolutionChart = () => {
    const [user] = useAuthState(auth);

    const budgetHistoryRef = user ? collection(db, `users/${user.uid}/budgetHistory`) : null;
    const [budgetHistorySnapshot, loadingBudget] = useCollection(
        budgetHistoryRef ? query(budgetHistoryRef, orderBy("createdAt", "asc")) : null
    );

    const budgetChartData = useMemo(() => {
        if (!budgetHistorySnapshot) return [];
        return budgetHistorySnapshot.docs.map(doc => {
            const data = doc.data() as BudgetHistoryData;
            const date = new Date(data.createdAt.seconds * 1000);
            return {
                date: format(date, 'MMM/yy', { locale: ptBR }),
                Orçamento: data.budget,
            };
        });
    }, [budgetHistorySnapshot]);

    return (
        <Card className="glass border-border/50 shadow-md">
            <CardHeader>
                <CardTitle>Evolução do Orçamento Mensal</CardTitle>
            </CardHeader>
            <CardContent>
                {loadingBudget ? (
                    <div className="flex items-center justify-center h-72">
                        <p className="text-sm text-muted-foreground">Carregando dados do orçamento...</p>
                    </div>
                ) : budgetChartData.length > 1 ? (
                    <div className="w-full h-72">
                        <ResponsiveContainer>
                            <LineChart data={budgetChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border))" />
                                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <YAxis 
                                    stroke="hsl(var(--muted-foreground))" 
                                    fontSize={12} 
                                    tickFormatter={(value) => `R$${value}`} 
                                    domain={['dataMin - 100', 'dataMax + 100']}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        border: '1px solid hsl(var(--border))'
                                    }}
                                    labelClassName='font-bold'
                                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, "Orçamento"]}
                                />
                                <Legend wrapperStyle={{ fontSize: "14px" }} />
                                <Line 
                                    type="monotone" 
                                    dataKey="Orçamento" 
                                    stroke="var(--color-budget, hsl(var(--primary)))" 
                                    strokeWidth={2} 
                                    activeDot={{ r: 8 }} 
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-72">
                        <p className="text-sm text-center text-muted-foreground">
                        Ainda não há dados de evolução. <br/> O gráfico será gerado aqui a partir do seu segundo registro de orçamento.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
