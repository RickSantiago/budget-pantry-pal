import { ResponsiveContainer, BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

interface ChartData {
    name: string;
    value: number;
}

interface SupermarketSpendingChartProps {
    data: ChartData[];
}

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#14b8a6", "#6366f1"];

const CustomTooltip = ({ active, payload, label }: { active?: boolean, payload?: any[], label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass border border-border/50 rounded-lg p-3 shadow-lg bg-background/80 backdrop-blur-sm">
        <p className="text-sm font-semibold mb-2 text-foreground">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs font-medium" style={{ color: entry.fill }}>
            {entry.name}: R$ {Number(entry.value).toFixed(2)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const SupermarketSpendingChart = ({ data }: SupermarketSpendingChartProps) => {
    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShoppingCart />Gastos por Supermercado</CardTitle>
            </CardHeader>
            <CardContent>
                 {data.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <RechartsBar data={data} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis type="number" stroke="hsl(var(--foreground))" fontSize={12} tick={{ fill: 'hsl(var(--foreground))' }} tickFormatter={(value) => `R$${value}`} />
                        <YAxis type="category" dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} tick={{ fill: 'hsl(var(--foreground))' }} width={80} interval={0} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--primary) / 0.1)' }} />
                        <Bar dataKey="value" name="Total Gasto" radius={[0, 4, 4, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </RechartsBar>
                  </ResponsiveContainer>
                ) : (
                    <div className="h-[350px] flex items-center justify-center text-muted-foreground">Sem dados de supermercado para o período.</div>
                )}
            </CardContent>
        </Card>
    );
};