import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  Home,
  ShoppingCart, 
  BarChart,
  Bell,
  Settings,
  User,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ShoppingList, ShoppingItem } from "@/types/shopping";
import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const Analytics = () => {
  const navigate = useNavigate();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [expiringItems, setExpiringItems] = useState<(ShoppingItem & { checked: boolean })[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("shopping-lists");
    if (stored) {
      const parsedLists = JSON.parse(stored);
      setLists(parsedLists);
      
      // Mock expiring items (você pode adaptar para pegar de verdade)
      const mockExpiring: (ShoppingItem & { checked: boolean })[] = [
        { id: "1", name: "Leite", category: "Laticínios", quantity: 2, price: 4.5, supermarket: "SuperX", checked: false },
        { id: "2", name: "Iogurte", category: "Laticínios", quantity: 6, price: 3.2, supermarket: "Mercado Y", checked: false },
        { id: "3", name: "Queijo", category: "Laticínios", quantity: 1, price: 15.0, supermarket: "SuperX", checked: false },
      ];
      setExpiringItems(mockExpiring);
    }
  }, []);

  // Gráfico: Gastos por Lista
  const listExpensesData = lists.map(list => ({
    name: list.title.substring(0, 15),
    total: list.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }));

  // Gráfico: Gastos por Supermercado
  const supermarketExpenses: Record<string, number> = {};
  lists.forEach(list => {
    list.items.forEach(item => {
      if (item.supermarket) {
        supermarketExpenses[item.supermarket] = (supermarketExpenses[item.supermarket] || 0) + (item.price * item.quantity);
      }
    });
  });
  const supermarketData = Object.entries(supermarketExpenses).map(([name, value]) => ({
    name,
    value
  }));

  // Gráfico: Evolução de Preço (mock)
  const priceEvolutionData = [
    { mes: "Jan", arroz: 4.5, feijao: 6.2 },
    { mes: "Fev", arroz: 4.8, feijao: 6.0 },
    { mes: "Mar", arroz: 5.0, feijao: 6.5 },
    { mes: "Abr", arroz: 4.9, feijao: 6.3 },
    { mes: "Mai", arroz: 5.2, feijao: 6.8 },
  ];

  // Gráfico: Planejado vs Gasto
  const budgetData = [
    { name: "Planejado", value: 500 },
    { name: "Gasto", value: lists.reduce((sum, list) => sum + list.items.reduce((s, i) => s + (i.price * i.quantity), 0), 0) }
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--warning))'];

  const handleToggleExpiring = (id: string) => {
    setExpiringItems(prev => {
      const updated = prev.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      );
      // Move checked items to the end
      return updated.sort((a, b) => (a.checked ? 1 : 0) - (b.checked ? 1 : 0));
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-24">
      {/* Header */}
      <div className="glass border-b border-border/50 sticky top-0 z-10 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">
                Análises e Gráficos
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate">
                Visualize seus gastos e estatísticas
              </p>
            </div>
            <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
              <ThemeToggle />
              <Button 
                variant="outline" 
                size="icon"
                className="glass rounded-full h-9 w-9 sm:h-10 sm:w-10"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Gastos por Lista */}
        <Card className="glass border-border/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl animate-fade-in">
          <h2 className="text-base sm:text-lg font-semibold mb-4">Gastos por Lista</h2>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsBar data={listExpensesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--surface))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </RechartsBar>
          </ResponsiveContainer>
        </Card>

        <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
          {/* Gastos por Supermercado */}
          <Card className="glass border-border/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl animate-slide-up">
            <h2 className="text-base sm:text-lg font-semibold mb-4">Gastos por Supermercado</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={supermarketData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: R$ ${entry.value.toFixed(2)}`}
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {supermarketData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--surface))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Planejado vs Gasto */}
          <Card className="glass border-border/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl animate-slide-up">
            <h2 className="text-base sm:text-lg font-semibold mb-4">Planejado vs Gasto</h2>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsBar data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--surface))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
              </RechartsBar>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Evolução de Preço */}
        <Card className="glass border-border/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl animate-fade-in">
          <h2 className="text-base sm:text-lg font-semibold mb-4">Evolução de Preço por Produto</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={priceEvolutionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--surface))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="arroz" stroke="hsl(var(--primary))" strokeWidth={2} />
              <Line type="monotone" dataKey="feijao" stroke="hsl(var(--secondary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Itens Próximos do Vencimento */}
        <Card className="glass border-border/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl animate-scale-in">
          <h2 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Itens Próximos do Vencimento
          </h2>
          <div className="space-y-2 sm:space-y-3">
            {expiringItems.map((item) => (
              <div 
                key={item.id}
                className={`glass border border-border/50 p-3 sm:p-4 rounded-xl transition-all hover:shadow-md ${
                  item.checked ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-8 w-8 flex-shrink-0"
                      onClick={() => handleToggleExpiring(item.id)}
                    >
                      {item.checked ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-muted-foreground rounded-full" />
                      )}
                    </Button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm sm:text-base font-medium truncate ${item.checked ? 'line-through' : ''}`}>
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity}x • {item.supermarket}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm sm:text-base font-semibold text-warning">
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </p>
                    {item.checked && (
                      <p className="text-xs text-success">Acabou</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 z-20">
        <Card className="glass border-border/50 shadow-glow rounded-2xl sm:rounded-3xl overflow-hidden">
          <div className="flex items-center justify-around p-1.5 sm:p-2">
            {[
              { icon: BarChart, text: "Gráficos", path: "/analytics" },
              { icon: ShoppingCart, text: "Lista", path: "/lists" },
              { icon: Home, text: "Home", path: "/dashboard" },
              { icon: Bell, text: "Avisos", path: "/dashboard" },
              { icon: Settings, text: "Config", path: "/dashboard" }
            ].map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className="flex-col h-auto py-1.5 sm:py-2 px-2 sm:px-4 gap-0.5 sm:gap-1 rounded-xl sm:rounded-2xl hover:bg-primary/10"
                onClick={() => navigate(item.path)}
              >
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-[10px] sm:text-xs">{item.text}</span>
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
