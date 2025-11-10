import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from "@/components/ui/card";
import { getCategoryStyle } from '@/utils/categoryMetadata';
import { Progress } from "@/components/ui/progress";

interface CategoryChartProps {
  data: { name: string; value: number }[];
}

const CategoryChart = ({ data }: CategoryChartProps) => {

  const totalSpending = useMemo(() => {
    return data.reduce((sum, item) => sum + item.value, 0);
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-muted-foreground">Nenhum gasto registrado para este mês ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map(({ name, value }) => {
        const { icon: Icon, color } = getCategoryStyle(name);
        const percentage = totalSpending > 0 ? (value / totalSpending) * 100 : 0;

        return (
          <div key={name} className="space-y-2 animate-fade-in">
            <div className="flex items-center justify-between text-sm">
                <div className={`flex items-center gap-2 font-medium ${color}`}>
                    <Icon className="w-4 h-4" />
                    <span>{name}</span>
                </div>
                <span className='font-semibold'>R$ {value.toFixed(2)}</span>
            </div>
            <Progress value={percentage} className={`h-2 ${color.replace('text-', 'bg-')}`} />
          </div>
        );
      })}
    </div>
  );
};

export default CategoryChart;
