import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as PieIcon } from "lucide-react";

interface ChartData {
    name: string;
    value: number;
}

interface CategorySpendingChartProps {
    data: ChartData[];
}

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#14b8a6", "#6366f1"];

const CustomTooltip = ({ active, payload }: { active?: boolean, payload?: any[] }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass border border-border/50 rounded-lg p-3 shadow-lg bg-background/80 backdrop-blur-sm">
        <p className="text-sm font-semibold mb-2 text-foreground">{payload[0].name}</p>
        <p className="text-xs font-medium" style={{ color: payload[0].fill }}>
           Total Gasto: R$ {Number(payload[0].value).toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
           Percentual: {(payload[0].percent * 100).toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

export const CategorySpendingChart = ({ data }: CategorySpendingChartProps) => {
    const renderColorfulLegendText = (value: string, entry: any) => {
      const { color } = entry;
      const percent = (entry.payload.percent * 100).toFixed(1);
      return <span style={{ color, fontSize: '12px' }}>{value} ({percent}%)</span>;
    };

    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><PieIcon />Gastos por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
                {data.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="40%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                        >
                            {data.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none" />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          iconSize={10}
                          layout="vertical"
                          verticalAlign="middle"
                          align="right"
                          formatter={renderColorfulLegendText}
                        />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                    <div className="h-[350px] flex items-center justify-center text-muted-foreground">Nenhum item para analisar no período.</div>
                )}
            </CardContent>
        </Card>
    );
};