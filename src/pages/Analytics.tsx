import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AppHeader from "@/components/AppHeader";
import BottomNavigation from "@/components/BottomNavigation";
import {
  Home,
  ShoppingCart,
  BarChart,
  Bell,
  Settings,
  User,
  AlertTriangle,
  CheckCircle,
  X
} from "lucide-react";
import { ShoppingList, ShoppingItem } from "@/types/shopping";
import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const Analytics = () => {
  const navigate = useNavigate();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [expiringItems, setExpiringItems] = useState<(ShoppingItem & { checked: boolean })[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>(["arroz", "feijao"]);

  useEffect(() => {
    const stored = localStorage.getItem("shopping-lists");
    if (stored) {
      const parsedLists = JSON.parse(stored);
      setLists(parsedLists);
    }

    // Mock expiring items (adapt as needed)
    const mockExpiring: (ShoppingItem & { checked: boolean })[] = [
      { id: "1", name: "Leite", category: "Laticínios", quantity: 2, unit: "l", price: 4.5, supermarket: "SuperX", checked: false },
      { id: "2", name: "Iogurte", category: "Laticínios", quantity: 6, unit: "un", price: 3.2, supermarket: "Mercado Y", checked: false },
      { id: "3", name: "Queijo", category: "Laticínios", quantity: 1, unit: "kg", price: 15.0, supermarket: "SuperX", checked: false },
    ];
    setExpiringItems(mockExpiring);
  }, []);

  // Gastos por Lista
  // allowedUnits: unidade, caixa, pacote
  const allowedUnits = ["unidade", "caixa", "pacote"];
  const listExpensesData = lists.map(list => ({
    name: list.title.substring(0, 15),
    total: list.items.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const unit = item.unit ? String(item.unit).toLowerCase() : "";
      if (allowedUnits.includes(unit)) {
        return sum + price * item.quantity;
      } else {
        return sum + price;
      }
    }, 0)
  }));

  // Gastos por Supermercado
  const supermarketExpenses: Record<string, number> = {};
  lists.forEach(list => {
    list.items.forEach(item => {
      if (item.supermarket) {
        const price = Number(item.price) || 0;
        const unit = item.unit ? String(item.unit).toLowerCase() : "";
        if (allowedUnits.includes(unit)) {
          supermarketExpenses[item.supermarket] = (supermarketExpenses[item.supermarket] || 0) + price * item.quantity;
        } else {
          supermarketExpenses[item.supermarket] = (supermarketExpenses[item.supermarket] || 0) + price;
        }
      }
    });
  });
  const supermarketData = Object.entries(supermarketExpenses).map(([name, value]) => ({ name, value }));

  // Evolução de Preço (real)
  // Agrupa os preços dos produtos por mês das listas cadastradas
  function getMonthName(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR', { month: 'short' });
  }
  const productKeys = ["arroz", "feijao", "leite", "cafe", "acucar"];
  const monthProductMap: Record<string, Record<string, number[]>> = {};
  lists.forEach(list => {
    const month = getMonthName(list.date);
    if (!monthProductMap[month]) monthProductMap[month] = {};
    list.items.forEach(item => {
      const key = productKeys.find(k => item.name.toLowerCase().includes(k));
      if (key) {
        if (!monthProductMap[month][key]) monthProductMap[month][key] = [];
        monthProductMap[month][key].push(Number(item.price));
      }
    });
  });
  const allPriceEvolutionData = Object.entries(monthProductMap).map(([mes, products]) => {
  const entry: Record<string, number | string | undefined> = { mes };
    productKeys.forEach(key => {
      entry[key] = products[key]?.length
        ? (products[key].reduce((a, b) => a + b, 0) / products[key].length)
        : undefined;
    });
    return entry;
  });

  const availableProducts = [
    { key: "arroz", label: "Arroz", color: "hsl(var(--primary))" },
    { key: "feijao", label: "Feijão", color: "hsl(var(--secondary))" },
    { key: "leite", label: "Leite", color: "hsl(var(--accent))" },
    { key: "cafe", label: "Café", color: "hsl(var(--success))" },
    { key: "acucar", label: "Açúcar", color: "hsl(var(--warning))" }
  ];

  const toggleProduct = (productKey: string) => {
    setSelectedProducts(prev => 
      prev.includes(productKey) ? prev.filter(p => p !== productKey) : [...prev, productKey]
    );
  };

  // Planejado vs Gasto com filtro por mês
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  // Usa a data de referência da compra para o filtro de mês
  const months = Array.from(new Set(lists.map(list => getMonthName(list.date))));
  const filteredLists = selectedMonth
    ? lists.filter(list => getMonthName(list.date) === selectedMonth)
    : lists;
  const budgetData = [
    { name: "Planejado", value: filteredLists.reduce((sum, list) => sum + (list.plannedBudget || 0), 0) },
    { name: "Gasto", value: filteredLists.reduce((sum, list) => sum + list.items.reduce((s, i) => s + (i.price * i.quantity), 0), 0) }
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--warning))'];

  // Custom Tooltip Component
  interface TooltipProps { active?: boolean; payload?: unknown[]; label?: string; }
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass border border-border/50 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold mb-2">{label}</p>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: R$ {entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pieLabel = (entry: any) => `${entry.name} (${Math.round((entry.value / supermarketData.reduce((s, i) => s + i.value, 0)) * 100)}%)`;

  const handleToggleExpiring = (id: string) => {
    setExpiringItems(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item);
      return updated.sort((a, b) => (a.checked ? 1 : 0) - (b.checked ? 1 : 0));
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-24">
      <AppHeader
        title="Análises e Gráficos"
        subtitle="Visualize seus gastos e estatísticas"
        rightNode={
          <Button variant="outline" size="icon" className="glass rounded-full h-9 w-9 sm:h-10 sm:w-10">
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        }
      />
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Filtrar por mês:</label>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {months.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        {/* Gastos por Lista */}
        <Card className="glass border-border/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl animate-fade-in">
          <h2 className="text-base sm:text-lg font-semibold mb-4 text-foreground">💰 Gastos por Lista</h2>
          {listExpensesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBar data={listExpensesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={11} tick={{ fill: 'hsl(var(--foreground))' }} />
                <YAxis stroke="hsl(var(--foreground))" fontSize={11} tick={{ fill: 'hsl(var(--foreground))' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} label={{ position: 'top', fill: 'hsl(var(--foreground))', fontSize: 11 }} />
              </RechartsBar>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground"><p className="text-sm">Nenhuma lista criada ainda</p></div>
          )}
        </Card>

        <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
          {/* Gastos por Supermercado */}
          <Card className="glass border-border/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl animate-slide-up">
            <h2 className="text-base sm:text-lg font-semibold mb-4 text-foreground">🏪 Gastos por Supermercado</h2>
            {supermarketData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={supermarketData} cx="50%" cy="50%" labelLine={false} label={pieLabel} outerRadius={90} fill="hsl(var(--primary))" dataKey="value">
                    {supermarketData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground"><p className="text-sm">Nenhum dado disponível</p></div>
            )}
          </Card>

          {/* Planejado vs Gasto */}
          <Card className="glass border-border/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl animate-slide-up">
            <h2 className="text-base sm:text-lg font-semibold mb-4 text-foreground">💸 Planejado vs Gasto</h2>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBar data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={11} tick={{ fill: 'hsl(var(--foreground))' }} />
                <YAxis stroke="hsl(var(--foreground))" fontSize={11} tick={{ fill: 'hsl(var(--foreground))' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} label={{ position: 'top', fill: 'hsl(var(--foreground))', fontSize: 11 }} />
              </RechartsBar>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Evolução de Preço */}
        <Card className="glass border-border/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">📈 Evolução de Preço por Produto</h2>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {availableProducts.map(product => (
              <Badge key={product.key} variant={selectedProducts.includes(product.key) ? "default" : "outline"} className="cursor-pointer px-3 py-1.5 text-xs rounded-full transition-all hover:scale-105" style={selectedProducts.includes(product.key) ? { backgroundColor: product.color, borderColor: product.color, color: 'white' } : {}} onClick={() => toggleProduct(product.key)}>
                {product.label}
                {selectedProducts.includes(product.key) && <X className="w-3 h-3 ml-1 inline" />}
              </Badge>
            ))}
          </div>

          {selectedProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={allPriceEvolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="mes" stroke="hsl(var(--foreground))" fontSize={11} tick={{ fill: 'hsl(var(--foreground))' }} />
                <YAxis stroke="hsl(var(--foreground))" fontSize={11} tick={{ fill: 'hsl(var(--foreground))' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="line" />
                {selectedProducts.map(productKey => {
                  const product = availableProducts.find(p => p.key === productKey);
                  return <Line key={productKey} type="monotone" dataKey={productKey} stroke={product?.color} strokeWidth={3} name={product?.label} dot={{ fill: product?.color, r: 4 }} activeDot={{ r: 6 }} />;
                })}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground"><p className="text-sm">Selecione ao menos um produto para visualizar</p></div>
          )}
        </Card>

        {/* Itens Próximos do Vencimento */}
        <Card className="glass border-border/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl animate-scale-in">
          <h2 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2 text-foreground"><AlertTriangle className="w-5 h-5 text-warning" />⏰ Itens Próximos do Vencimento</h2>
          <div className="space-y-2 sm:space-y-3">
            {expiringItems.map((item) => (
              <div key={item.id} className={`glass border border-border/50 p-3 sm:p-4 rounded-xl transition-all hover:shadow-md ${item.checked ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 flex-shrink-0" onClick={() => handleToggleExpiring(item.id)}>
                      {item.checked ? <CheckCircle className="w-5 h-5 text-success" /> : <div className="w-5 h-5 border-2 border-muted-foreground rounded-full" />}
                    </Button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm sm:text-base font-medium truncate ${item.checked ? 'line-through' : ''}`}>{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.quantity}x • {item.supermarket}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm sm:text-base font-semibold text-warning">R$ {(item.price * item.quantity).toFixed(2)}</p>
                    {item.checked && <p className="text-xs text-success">Acabou</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Analytics;
