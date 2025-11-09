import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface ChartData {
    name: string;
    planned: number;
    spent: number;
}

interface PlannedVsSpentChartProps {
    data: ChartData[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean, payload?: any[], label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass border border-border/50 rounded-lg p-3 shadow-lg bg-background/80 backdrop-blur-sm">
        <p className="text-sm font-semibold mb-2 text-foreground">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs font-medium" style={{ color: entry.color }}>
            {entry.name}: R$ {Number(entry.value).toFixed(2)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const PlannedVsSpentChart = ({ data }: PlannedVsSpentChartProps) => {
    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart3 />Planejado vs. Gasto por Lista</CardTitle>
            </CardHeader>
            <CardContent>
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                        <RechartsBar data={data} margin={{ top: 20, right: 10, left: -20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                            <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} tick={{ fill: 'hsl(var(--foreground))' }} angle={-35} textAnchor="end" interval={0} />
                            <YAxis stroke="hsl(var(--foreground))" fontSize={12} tick={{ fill: 'hsl(var(--foreground))' }} tickFormatter={(value) => `R$${value}`} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--primary) / 0.1)' }} />
                            <Legend wrapperStyle={{ paddingTop: '70px' }}/>
                            <Bar dataKey="planned" name="Planejado" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]}>
                               <LabelList dataKey="planned" position="top" formatter={(value: number) => `R$${value.toFixed(2)}`} className="text-xs fill-muted-foreground" />
                            </Bar>
                            <Bar dataKey="spent" name="Gasto Real" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                                <LabelList dataKey="spent" position="top" formatter={(value: number) => `R$${value.toFixed(2)}`} className="text-xs fill-primary" />
                            </Bar>
                        </RechartsBar>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-[350px] flex items-center justify-center text-muted-foreground">Sem dados de lista para analisar.</div>
                )}
            </CardContent>
        </Card>
    );
};