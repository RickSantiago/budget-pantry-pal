import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import AppHeader from "@/components/AppHeader";
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
  Home,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ShoppingList } from "@/types/shopping";
import BottomNavigation from "@/components/BottomNavigation";

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
  const purchasedItems =
    currentList?.items.filter((item) => item.checked).length || 0;
  const purchasedPercentage =
    totalItems > 0 ? Math.round((purchasedItems / totalItems) * 100) : 0;
  // allowedUnits: unidade, caixa, pacote
  const allowedUnits = ["unidade", "caixa", "pacote"];
  const totalPrice =
    currentList?.items.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const unit = item.unit ? String(item.unit).toLowerCase() : "";
      if (allowedUnits.includes(unit)) {
        return sum + price * item.quantity;
      } else {
        return sum + price;
      }
    }, 0) || 0;
  const expiringItems = 3; // Mock data

  const summaryCards = [
    {
      icon: ShoppingCart,
      title: "Itens Totais",
      value: totalItems,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: CheckCircle,
      title: "Itens Comprados",
      value: `${purchasedItems} (${purchasedPercentage}%)`,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Wallet,
      title: "Gasto Estimado",
      value: `R$ ${totalPrice.toFixed(2)}`,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      icon: AlertTriangle,
      title: "Próximos do Vencimento",
      value: expiringItems,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ];

  const alerts = [
    "🧃 O leite vence em 2 dias.",
    "🍚 O arroz está 10% mais caro no SuperX.",
    "💸 Você atingiu 80% do orçamento mensal.",
  ];

  const suggestions = ["Arroz", "Sabão Líquido", "Iogurte"];

  const quickActions = [
    { icon: ShoppingBag, text: "Ver Lista", action: () => navigate("/lists") },
    { icon: Plus, text: "Novo Item", action: () => navigate("/lists") },
    { icon: BarChart, text: "Ver Análises", action: () => {} },
    { icon: Bell, text: "Notificações", action: () => {} },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-24">
      <AppHeader
        title="Lista Inteligente"
        subtitle={currentList?.title || "Nenhuma lista"}
        rightNode={
          <>
            <Button
              variant="outline"
              size="icon"
              className="glass rounded-full h-9 w-9 sm:h-10 sm:w-10"
              onClick={() => navigate("/lists")}
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="glass rounded-full h-9 w-9 sm:h-10 sm:w-10"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </>
        }
      />

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 animate-fade-in">
          {summaryCards.map((card, index) => (
            <Card
              key={index}
              className="glass border-border/50 p-3 sm:p-4 hover:shadow-lg transition-all duration-300 animate-slide-up rounded-xl sm:rounded-2xl"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col items-center text-center space-y-1.5 sm:space-y-2">
                <div className={`${card.bgColor} p-2 sm:p-3 rounded-full`}>
                  <card.icon
                    className={`w-4 h-4 sm:w-6 sm:h-6 ${card.color}`}
                  />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {card.title}
                  </p>
                  <p className="text-sm sm:text-xl font-bold mt-0.5 sm:mt-1">
                    {card.value}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Current List Summary */}
        {currentList && (
          <Card className="glass border-border/50 p-4 sm:p-6 animate-scale-in rounded-xl sm:rounded-2xl">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <List className="w-4 h-4 sm:w-5 sm:h-5" />
              Resumo da Lista Atual
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <div className="flex justify-between text-xs sm:text-sm mb-2">
                  <span>Progresso</span>
                  <span className="font-semibold">{purchasedPercentage}%</span>
                </div>
                <Progress value={purchasedPercentage} className="h-2" />
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="glass rounded-full text-xs"
                  onClick={() => navigate("/lists")}
                >
                  <List className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Ver Lista
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="glass rounded-full text-xs"
                  onClick={() => navigate("/lists")}
                >
                  <PlusCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Adicionar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="glass rounded-full text-xs"
                >
                  <BarChart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Comparar
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Alerts and Suggestions Row */}
        <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
          {/* Alerts */}
          <Card className="glass border-border/50 p-4 sm:p-6 animate-slide-up rounded-xl sm:rounded-2xl">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              Notificações
            </h2>
            <div className="space-y-2 sm:space-y-3">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className="glass border border-border/50 p-2.5 sm:p-3 rounded-lg sm:rounded-xl text-xs sm:text-sm hover:shadow-md transition-all"
                >
                  {alert}
                </div>
              ))}
            </div>
          </Card>

          {/* AI Suggestions */}
          <Card className="glass border-border/50 p-4 sm:p-6 animate-slide-up rounded-xl sm:rounded-2xl">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              Sugestões de compras
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              Baseado no histórico ou itens recorrentes:
            </p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {suggestions.map((item, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="glass rounded-full text-xs"
                >
                  {item}
                </Button>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="glass border-border/50 p-4 sm:p-6 animate-scale-in rounded-xl sm:rounded-2xl">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="glass h-20 sm:h-24 flex-col gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl hover:shadow-lg transition-all"
                onClick={action.action}
              >
                <action.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-xs sm:text-sm">{action.text}</span>
              </Button>
            ))}
          </div>
        </Card>

        {/* Intelligence Tip */}
        <Card className="glass p-4 sm:p-6 gradient-primary animate-fade-in rounded-xl sm:rounded-2xl">
          <p className="text-primary-foreground font-medium text-center text-xs sm:text-base">
            💡 Você gastou 15% menos em carnes neste mês comparado a setembro.
          </p>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Dashboard;
