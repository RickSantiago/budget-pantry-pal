import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, X as XIcon } from "lucide-react";

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
    productsByCategory: Record<string, { key: string; label: string; color: string; }[]>;
    availableCategoriesForPriceChart: string[];
}

export const PriceEvolutionChart = ({ priceEvolutionData, productsByCategory, availableCategoriesForPriceChart }: PriceEvolutionChartProps) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [availableProducts, setAvailableProducts] = useState<{ key: string; label: string; color: string; }[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

    useEffect(() => {
        if (availableCategoriesForPriceChart.length > 0 && !selectedCategory) {
            setSelectedCategory(availableCategoriesForPriceChart[0]);
        }
    }, [availableCategoriesForPriceChart, selectedCategory]);

    useEffect(() => {
        if (selectedCategory && productsByCategory[selectedCategory]) {
            const products = productsByCategory[selectedCategory];
            setAvailableProducts(products);
            setSelectedProducts(products.slice(0, 2).map(p => p.key));
        } else {
            setAvailableProducts([]);
            setSelectedProducts([]);
        }
    }, [selectedCategory, productsByCategory]);

    const toggleProduct = (key: string) => {
        setSelectedProducts(prev => 
            prev.includes(key) 
                ? prev.filter(p => p !== key) 
                : [...prev, key]
        );
    };

    const allProductDetails = Object.values(productsByCategory).flat();

    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp />Evolução de Preços</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Filtrar por Categoria:</label>
                    <select
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                        className="rounded px-3 py-2 text-sm glass w-full sm:w-auto"
                    >
                        {availableCategoriesForPriceChart.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

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
                                const product = allProductDetails.find(p => p.key === key);
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
