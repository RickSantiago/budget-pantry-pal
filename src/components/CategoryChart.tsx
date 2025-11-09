import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getCategoryColor } from '@/utils/categoryColors';

interface CategoryChartProps {
  data: { name: string; value: number }[];
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, payload }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Only show label if percent is large enough to avoid clutter
  if (percent * 100 < 5) {
    return null;
  }

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/80 backdrop-blur-sm border border-border/50 p-2 rounded-lg shadow-lg">
        <p className="font-bold">{`${payload[0].name}`}</p>
        <p className="text-sm text-primary">{`R$ ${payload[0].value.toFixed(2)}`}</p>
      </div>
    );
  }

  return null;
};


const CategoryChart = ({ data }: CategoryChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
        <p>Não há dados de gastos para exibir.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={80}
          innerRadius={60} // This makes it a Donut Chart
          fill="#8884d8"
          dataKey="value"
          paddingAngle={5}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name, true)} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryChart;
