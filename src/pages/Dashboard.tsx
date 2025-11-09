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
  PieChart as PieChartIcon,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { ShoppingList, PantryItem, ShoppingItem } from "@/types/shopping";
import BottomNavigation from "@/components/BottomNavigation";
import CategoryChart from "@/components/CategoryChart";

// Firebase and hooks
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection, useDocumentData } from "react-firebase-hooks/firestore";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { differenceInDays, parseISO, startOfMonth } from "date-fns";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, loadingAuth] = useAuthState(auth);

  // --- Data Fetching from Firestore ---
  const [listsSnapshot, loadingLists] = useCollection(
    user ? query(collection(db, `users/${user.uid}/lists`), orderBy("createdAt", "desc")) : null
  );
  const [pantrySnapshot, loadingPantry] = useCollection(
    user ? collection(db, `users/${user.uid}/pantry`) : null
  );
  const [userData, loadingUser] = useDocumentData(user ? doc(db, 'users', user.uid) : null);

  // --- Data Processing ---
  const {
    totalItemsInAllLists,
    purchasedItemsInAllLists,
    purchasedPercentage,
    expiringItems,
    alerts,
    suggestions,
    categorySpending,
    totalMonthlySpending,
    monthlyBudget
  } = useMemo(() => {
    const lists: ShoppingList[] = listsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShoppingList)) || [];
    
    const allItems = lists.flatMap(list => list.items);
    const totalItemsInAllLists = allItems.length;
    const purchasedItemsInAllLists = allItems.filter(item => item.checked).length;
    const purchasedPercentage = totalItemsInAllLists > 0 ? Math.round((purchasedItemsInAllLists / totalItemsInAllLists) * 100) : 0;
    
    const calculateItemPrice = (item: ShoppingItem) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 1;
      const unit = (item.unit || '').toLowerCase();
      const allowedUnits = ['unidade', 'caixa', 'pacote', 'un', 'cx', 'pct'];
      return allowedUnits.includes(unit) ? price * quantity : price;
    };

    const pantryItems: PantryItem[] = pantrySnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as PantryItem)) || [];
    
    const expiringItems = pantryItems.filter(item => {
      const daysUntilExpiry = differenceInDays(parseISO(item.expiryDate), new Date());
      return daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
    }).length;

    const alerts: string[] = [];
    const soonestExpiringItem = pantryItems
      .filter(item => differenceInDays(parseISO(item.expiryDate), new Date()) >= 0)
      .sort((a, b) => parseISO(a.expiryDate).getTime() - parseISO(b.expiryDate).getTime())[0];

    if (soonestExpiringItem) {
      const days = differenceInDays(parseISO(soonestExpiringItem.expiryDate), new Date());
      alerts.push(`- ${soonestExpiringItem.name} vence ${days === 0 ? 'hoje' : `em ${days} dia(s)`}.`);
    }

    const firstDayOfMonth = startOfMonth(new Date());
    let totalMonthlySpending = 0;
    const categorySpendingMap: { [key: string]: number } = {};

    lists.forEach(list => {
        const listTimestamp = list.createdAt as any;
        const listDate = listTimestamp?.toDate ? listTimestamp.toDate() : new Date(listTimestamp);
        if (listDate >= firstDayOfMonth) {
            list.items.forEach(item => {
                if (item.checked) {
                    const itemPrice = calculateItemPrice(item);
                    totalMonthlySpending += itemPrice;
                    const category = item.category || "Outros";
                    categorySpendingMap[category] = (categorySpendingMap[category] || 0) + itemPrice;
                }
            });
        }
    });

    const monthlyBudget = userData?.monthlyBudget || 0;
    if (monthlyBudget > 0 && totalMonthlySpending > monthlyBudget * 0.8) {
        const percentageSpent = (totalMonthlySpending / monthlyBudget) * 100;
        alerts.push(`- Você já utilizou ${percentageSpent.toFixed(0)}% do seu orçamento mensal.`);
    }

    const categorySpending = Object.keys(categorySpendingMap).map(name => ({ name, value: categorySpendingMap[name] })).sort((a, b) => b.value - a.value);

    if (alerts.length === 0) {
      alerts.push("Nenhuma notificação importante no momento.");
    }
    
    const recurringItems = lists.flatMap(list => list.items).filter(item => item.isRecurring && !item.checked);
    const suggestions = [...new Set(recurringItems.map(item => item.name))];

    return { totalItemsInAllLists, purchasedItemsInAllLists, purchasedPercentage, expiringItems, alerts, suggestions, categorySpending, totalMonthlySpending, monthlyBudget };

  }, [listsSnapshot, pantrySnapshot, userData]);
  
  const summaryCards = [
    { icon: List, title: "Itens nas Listas", value: totalItemsInAllLists, color: "text-green-500", bgColor: "bg-green-500/10" },
    { icon: CheckCircle, title: "Itens Comprados", value: `${purchasedItemsInAllLists} (${purchasedPercentage}%)`, color: "text-blue-500", bgColor: "bg-blue-500/10" },
    { icon: Wallet, title: "Gasto Total (Mês)", value: `R$ ${totalMonthlySpending.toFixed(2)}`, color: "text-amber-500", bgColor: "bg-amber-500/10" },
    { icon: AlertTriangle, title: "Próximos do Venc.", value: expiringItems, color: "text-red-500", bgColor: "bg-red-500/10", action: () => navigate('/pantry') },
  ];

  const quickActions = [
    { icon: ShoppingBag, text: "Ver Listas", action: () => navigate("/lists") },
    { icon: ShoppingCart, text: "Ver Despensa", action: () => navigate("/pantry") },
    { icon: BarChart, text: "Análises", action: () => navigate('/analytics') },
    { icon: User, text: "Perfil", action: () => navigate('/profile') },
  ];

  const budgetSpentPercentage = monthlyBudget > 0 ? (totalMonthlySpending / monthlyBudget) * 100 : 0;

  if (loadingAuth || loadingLists || loadingPantry || loadingUser) {
    return <div className="flex items-center justify-center h-screen bg-background"><p>Carregando seu dashboard...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-24">
      <AppHeader title="Meu Dashboard" subtitle={`Resumo de ${new Date().toLocaleDateString('pt-BR', { month: 'long' })}`}/>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 animate-fade-in">
          {summaryCards.map((card, index) => (
            <Card
              key={index}
              onClick={card.action}
              className={`glass border-border/50 p-3 sm:p-4 transition-all duration-300 animate-slide-up rounded-xl sm:rounded-2xl ${card.action ? 'cursor-pointer hover:shadow-lg' : ''}`}>
              <div className="flex flex-col items-center text-center space-y-1.5 sm:space-y-2">
                <div className={`${card.bgColor} p-2 sm:p-3 rounded-full`}><card.icon className={`w-4 h-4 sm:w-6 sm:h-6 ${card.color}`} /></div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{card.title}</p>
                  <p className="text-sm sm:text-xl font-bold mt-0.5 sm:mt-1">{card.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {monthlyBudget > 0 && (
            <Card className="glass border-border/50 p-4 sm:p-6 animate-scale-in rounded-xl sm:rounded-2xl">
                <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                    Controle de Orçamento Mensal
                </h2>
                <div>
                    <div className="flex justify-between text-xs sm:text-sm mb-2">
                        <span>Gasto: <span className="font-bold">R$ {totalMonthlySpending.toFixed(2)}</span></span>
                        <span className="text-muted-foreground">Meta: R$ {monthlyBudget.toFixed(2)}</span>
                    </div>
                    <Progress value={budgetSpentPercentage} className="h-2" />
                </div>
            </Card>
        )}

        <Card className="glass border-border/50 p-4 sm:p-6 animate-scale-in rounded-xl sm:rounded-2xl">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                Gastos por Categoria (Mês Atual)
            </h2>
            <CategoryChart data={categorySpending} />
        </Card>

        <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
          <Card className="glass border-border/50 p-4 sm:p-6 animate-slide-up rounded-xl sm:rounded-2xl">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2"><Bell className="w-4 h-4 sm:w-5 sm:h-5" />Notificações</h2>
            <div className="space-y-2 sm:space-y-3">
              {alerts.map((alert, index) => (<div key={index} className="glass border border-border/50 p-2.5 sm:p-3 rounded-lg sm:rounded-xl text-xs sm:text-sm hover:shadow-md transition-all">{alert}</div>))}
            </div>
          </Card>

          <Card className="glass border-border/50 p-4 sm:p-6 animate-slide-up rounded-xl sm:rounded-2xl">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2"><PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />Sugestões de compras</h2>
            {suggestions.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {suggestions.map((item, index) => (<Button key={index} variant="outline" size="sm" className="glass rounded-full text-xs">{item}</Button>))}
              </div>
            ) : <p className="text-xs sm:text-sm text-muted-foreground">Nenhuma sugestão. Marque itens como recorrentes para vê-los aqui!</p>}
          </Card>
        </div>

        <Card className="glass border-border/50 p-4 sm:p-6 animate-scale-in rounded-xl sm:rounded-2xl">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            {quickActions.map((action, index) => (<Button key={index} variant="outline" className="glass h-20 sm:h-24 flex-col gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl hover:shadow-lg transition-all" onClick={action.action}><action.icon className="w-5 h-5 sm:w-6 sm:h-6" /><span className="text-xs sm:text-sm">{action.text}</span></Button>))}
          </div>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Dashboard;
