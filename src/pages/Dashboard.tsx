import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  ShoppingCart, 
  CheckCircle, 
  Wallet, 
  AlertTriangle,
  List,
  PlusCircle,
  BarChart,
  Plus,
  User,
  ShoppingBag,
  Bell,
  Settings,
  Home
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ShoppingList } from "@/types/shopping";

const Dashboard = () => {
  const navigate = useNavigate();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [currentList, setCurrentList] = useState<ShoppingList | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("shopping-lists");
    if (stored) {
      const parsedLists = JSON.parse(stored);
      setLists(parsedLists);
      if (parsedLists.length > 0) {
        setCurrentList(parsedLists[0]);
      }
    }
  }, []);

  const totalItems = currentList?.items.length || 0;
  const purchasedItems = currentList?.items.filter(item => item.checked).length || 0;
  const purchasedPercentage = totalItems > 0 ? Math.round((purchasedItems / totalItems) * 100) : 0;
  const totalPrice = currentList?.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const expiringItems = 3; // Mock data

  const summaryCards = [
    {
      icon: ShoppingCart,
      title: "Itens Totais",
      value: totalItems,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      icon: CheckCircle,
      title: "Itens Comprados",
      value: `${purchasedItems} (${purchasedPercentage}%)`,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Wallet,
      title: "Gasto Estimado",
      value: `R$ ${totalPrice.toFixed(2)}`,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10"
    },
    {
      icon: AlertTriangle,
      title: "Próximos do Vencimento",
      value: expiringItems,
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    }
  ];

  const alerts = [
    "🧃 O leite vence em 2 dias.",
    "🍚 O arroz está 10% mais caro no SuperX.",
    "💸 Você atingiu 80% do orçamento mensal."
  ];

  const suggestions = ["Arroz", "Sabão Líquido", "Iogurte"];

  const quickActions = [
    { icon: ShoppingBag, text: "Ver Lista", action: () => navigate("/lists") },
    { icon: Plus, text: "Novo Item", action: () => navigate("/lists") },
    { icon: BarChart, text: "Ver Análises", action: () => {} },
    { icon: Bell, text: "Notificações", action: () => {} }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-24">
      {/* Header */}
      <div className="glass border-b border-border/50 sticky top-0 z-10 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                Lista de Compras Inteligente
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Lista Atual: {currentList?.title || "Nenhuma lista"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon"
                className="glass rounded-full"
                onClick={() => navigate("/lists")}
              >
                <Plus className="w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className="glass rounded-full"
              >
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
          {summaryCards.map((card, index) => (
            <Card 
              key={index}
              className="glass border-border/50 p-4 hover:shadow-lg transition-all duration-300 animate-slide-up rounded-2xl"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={`${card.bgColor} p-3 rounded-full`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{card.title}</p>
                  <p className="text-xl font-bold mt-1">{card.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Current List Summary */}
        {currentList && (
          <Card className="glass border-border/50 p-6 animate-scale-in rounded-2xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <List className="w-5 h-5" />
              Resumo da Lista Atual
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progresso</span>
                  <span className="font-semibold">{purchasedPercentage}%</span>
                </div>
                <Progress value={purchasedPercentage} className="h-2" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="glass rounded-full"
                  onClick={() => navigate("/lists")}
                >
                  <List className="w-4 h-4 mr-2" />
                  Ver Lista Completa
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="glass rounded-full"
                  onClick={() => navigate("/lists")}
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Adicionar Item
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="glass rounded-full"
                >
                  <BarChart className="w-4 h-4 mr-2" />
                  Comparar Mercados
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Alerts and Suggestions Row */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Alerts */}
          <Card className="glass border-border/50 p-6 animate-slide-up rounded-2xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificações Recentes
            </h2>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div 
                  key={index}
                  className="glass border border-border/50 p-3 rounded-xl text-sm hover:shadow-md transition-all"
                >
                  {alert}
                </div>
              ))}
            </div>
          </Card>

          {/* AI Suggestions */}
          <Card className="glass border-border/50 p-6 animate-slide-up rounded-2xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              Sugestões Inteligentes
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Baseado no histórico de consumo:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((item, index) => (
                <Button 
                  key={index}
                  variant="outline"
                  size="sm"
                  className="glass rounded-full"
                >
                  {item}
                </Button>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="glass border-border/50 p-6 animate-scale-in rounded-2xl">
          <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="glass h-24 flex-col gap-2 rounded-2xl hover:shadow-lg transition-all"
                onClick={action.action}
              >
                <action.icon className="w-6 h-6" />
                <span className="text-sm">{action.text}</span>
              </Button>
            ))}
          </div>
        </Card>

        {/* Intelligence Tip */}
        <Card className="glass border-border/50 p-6 gradient-primary animate-fade-in rounded-2xl">
          <p className="text-primary-foreground font-medium text-center">
            💡 Você gastou 15% menos em carnes neste mês comparado a setembro.
          </p>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-4 left-4 right-4 z-20">
        <Card className="glass border-border/50 shadow-glow rounded-3xl overflow-hidden">
          <div className="flex items-center justify-around p-2">
            {[
              { icon: Home, text: "Dashboard", path: "/dashboard" },
              { icon: ShoppingCart, text: "Lista", path: "/lists" },
              { icon: BarChart, text: "Análises", path: "/dashboard" },
              { icon: Bell, text: "Alertas", path: "/dashboard" },
              { icon: Settings, text: "Config", path: "/dashboard" }
            ].map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className="flex-col h-auto py-2 px-4 gap-1 rounded-2xl hover:bg-primary/10"
                onClick={() => navigate(item.path)}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.text}</span>
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
