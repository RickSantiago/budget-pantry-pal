import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, X as XIcon } from "lucide-react";

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#14b8a6", "#6366f1"];

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

interface PriceEvolutionChartProps {
    priceEvolutionData: any[];
    availableProducts: { key: string; label: string; color: string; }[];
}

export const PriceEvolutionChart = ({ priceEvolutionData, availableProducts }: PriceEvolutionChartProps) => {
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

    useEffect(() => {
        if (availableProducts.length > 0 && selectedProducts.length === 0) {
            setSelectedProducts(availableProducts.slice(0, 2).map(p => p.key));
        }
    }, [availableProducts]);

    const toggleProduct = (key: string) => {
        setSelectedProducts(prev => 
            prev.includes(key) 
                ? prev.filter(p => p !== key) 
                : [...prev, key]
        );
    };

    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp />Evolução de Preços</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex flex-wrap gap-2">
                    {availableProducts.map(product => (
                        <Badge 
                            key={product.key} 
                            variant={selectedProducts.includes(product.key) ? "default" : "outline"} 
                            className="cursor-pointer transition-all hover:scale-105" 
                            style={selectedProducts.includes(product.key) ? { backgroundColor: product.color, borderColor: product.color, color: 'white' } : {}}
                            onClick={() => toggleProduct(product.key)}
                        >
                            {product.label}
                            {selectedProducts.includes(product.key) && <XIcon className="w-3 h-3 ml-1.5" />}
                        </Badge>
                    ))}
                </div>
                {selectedProducts.length > 0 && priceEvolutionData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={priceEvolutionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                            <XAxis dataKey="time" stroke="hsl(var(--foreground))" fontSize={12} tick={{ fill: 'hsl(var(--foreground))' }} />
                            <YAxis stroke="hsl(var(--foreground))" fontSize={12} tick={{ fill: 'hsl(var(--foreground))' }} tickFormatter={(value) => `R$${Number(value).toFixed(2)}`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            {selectedProducts.map(key => {
                                const product = availableProducts.find(p => p.key === key);
                                return <Line key={key} type="monotone" dataKey={key} stroke={product?.color} strokeWidth={2.5} name={product?.label} dot={{ r: 4 }} activeDot={{ r: 7 }} connectNulls />;
                            })}
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        Selecione um produto para ver a evolução ou não há dados para o período.
                    </div>
                )}
            </CardContent>
        </Card>
    );
};