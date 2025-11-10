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
import { useMemo, useState } from "react";
import { ShoppingList, PantryItem, ShoppingItem } from "@/types/shopping";
import BottomNavigation from "@/components/BottomNavigation";
import CategoryChart from "@/components/CategoryChart";
import AddSuggestionToListDialog from "@/components/AddSuggestionToListDialog";

// Firebase and hooks
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection, useDocumentData } from "react-firebase-hooks/firestore";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { differenceInDays, parseISO } from "date-fns";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, loadingAuth] = useAuthState(auth);
  
  // Dialog State
  const [isSuggestionDialogOpen, setSuggestionDialogOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<ShoppingItem | null>(null);

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
    allTimeLists,
    totalMonthlyItems,
    purchasedMonthlyItems,
    monthlyPurchasedPercentage,
    expiringItems,
    alerts,
    suggestions,
    categorySpending,
    totalMonthlySpending,
    monthlyBudget
  } = useMemo(() => {
    const allTimeLists: ShoppingList[] = listsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShoppingList)) || [];
    
    // --- Monthly Data Calculation (for Dashboard) ---
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const getDateFromSource = (dateSource: any): Date | null => {
      if (!dateSource) return null;
      // Handle Firestore Timestamp
      if (typeof dateSource.toDate === 'function') { 
        return dateSource.toDate();
      }
      // Handle ISO 8601 string
      if (typeof dateSource === 'string') {
        const parsedDate = parseISO(dateSource);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }
      return null;
    };

    const monthlyLists = allTimeLists.filter(list => {
      const listDate = getDateFromSource(list.date) || getDateFromSource(list.createdAt);
      return listDate ? listDate.getMonth() === currentMonth && listDate.getFullYear() === currentYear : false;
    });
    
    const monthlyItems: ShoppingItem[] = monthlyLists.flatMap(list => list.items);
    const totalMonthlyItems = monthlyItems.length;
    const purchasedMonthlyItems = monthlyItems.filter(item => item.checked).length;
    const monthlyPurchasedPercentage = totalMonthlyItems > 0 ? Math.round((purchasedMonthlyItems / totalMonthlyItems) * 100) : 0;
    
    const calculateItemPrice = (item: ShoppingItem) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 1;
      const unit = (item.unit || '').toLowerCase();
      const allowedUnits = ['unidade', 'caixa', 'pacote', 'un', 'cx', 'pct'];
      return allowedUnits.includes(unit) ? price * quantity : price;
    };

    let totalMonthlySpending = 0;
    const categorySpendingMap: { [key: string]: number } = {};

    monthlyLists.forEach(list => {
        list.items.forEach(item => {
            if (item.checked) {
                const itemPrice = calculateItemPrice(item);
                totalMonthlySpending += itemPrice;
                const category = item.category || "Outros";
                categorySpendingMap[category] = (categorySpendingMap[category] || 0) + itemPrice;
            }
        });
    });

    const categorySpending = Object.keys(categorySpendingMap).map(name => ({ name, value: categorySpendingMap[name] })).sort((a, b) => b.value - a.value);

    // --- Pantry & Alerts Calculation (Independent of Lists) ---
    const pantryItems: PantryItem[] = pantrySnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as PantryItem)) || [];
    
    const expiringItems = pantryItems.filter(item => {
      if (!item.expiryDate) return false;
      const daysUntilExpiry = differenceInDays(parseISO(item.expiryDate), new Date());
      return daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
    }).length;

    const alerts: string[] = [];
    const soonestExpiringItem = pantryItems
      .filter(item => item.expiryDate && differenceInDays(parseISO(item.expiryDate), new Date()) >= 0)
      .sort((a, b) => parseISO(a.expiryDate).getTime() - parseISO(b.expiryDate).getTime())[0];

    if (soonestExpiringItem) {
      const days = differenceInDays(parseISO(soonestExpiringItem.expiryDate), new Date());
      alerts.push(`- ${soonestExpiringItem.name} vence ${days === 0 ? 'hoje' : `em ${days} dia(s)`}.`);
    }

    const monthlyBudget = userData?.monthlyBudget || 0;
    if (monthlyBudget > 0 && totalMonthlySpending > monthlyBudget * 0.8 && totalMonthlySpending < monthlyBudget) {
        const percentageSpent = (totalMonthlySpending / monthlyBudget) * 100;
        alerts.push(`- Você já utilizou ${percentageSpent.toFixed(0)}% do seu orçamento mensal.`);
    } else if (totalMonthlySpending > monthlyBudget) {
        alerts.push(`- Você ultrapassou seu orçamento mensal em R$ ${(totalMonthlySpending - monthlyBudget).toFixed(2)}.`);
    }
    
    if (alerts.length === 0) {
      alerts.push("Nenhuma notificação importante no momento.");
    }

    // --- All-Time Data Calculation (for Suggestions) ---
    const allTimeItems: ShoppingItem[] = allTimeLists.flatMap(list => list.items.map(item => ({...item, listCreatedAt: list.createdAt})));
    const itemFrequency: { [name: string]: number } = {};
    allTimeItems.forEach(item => {
      itemFrequency[item.name] = (itemFrequency[item.name] || 0) + 1;
    });

    const sortedPopularItems = Object.keys(itemFrequency).sort((a, b) => itemFrequency[b] - itemFrequency[a]);
    
    const suggestions: ShoppingItem[] = sortedPopularItems.slice(0, 5).map(itemName => {
        const mostRecentVersion = allTimeItems
            .filter(item => item.name === itemName)
            .sort((a, b) => (b.listCreatedAt?.seconds || 0) - (a.listCreatedAt?.seconds || 0))[0];
        return mostRecentVersion;
    });

    return { allTimeLists, totalMonthlyItems, purchasedMonthlyItems, monthlyPurchasedPercentage, expiringItems, alerts, suggestions, categorySpending, totalMonthlySpending, monthlyBudget };

  }, [listsSnapshot, pantrySnapshot, userData]);
  
  const handleAddSuggestion = (item: ShoppingItem) => {
    setSelectedSuggestion(item);
    setSuggestionDialogOpen(true);
  }

  const summaryCards = [
    { icon: List, title: "Itens no Mês", value: totalMonthlyItems, color: "text-green-500", bgColor: "bg-green-500/10" },
    { icon: CheckCircle, title: "Comprados no Mês", value: `${purchasedMonthlyItems} (${monthlyPurchasedPercentage}%)`, color: "text-blue-500", bgColor: "bg-blue-500/10" },
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
                <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2"><Target className="w-4 h-4 sm:w-5 sm:h-5" />Controle de Orçamento Mensal</h2>
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
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2"><PieChartIcon className="w-4 h-4 sm:w-5 sm:h-5" />Gastos por Categoria (Mês Atual)</h2>
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
              <div className="space-y-2">
                {suggestions.map((item, index) => (
                  <div key={index} className="flex items-center justify-between glass border border-border/50 p-2 rounded-lg">
                    <span className="text-sm font-medium">{item.name}</span>
                    <Button size="sm" onClick={() => handleAddSuggestion(item)}><Plus className="w-4 h-4 mr-1"/>Add</Button>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs sm:text-sm text-muted-foreground">Suas sugestões aparecerão aqui conforme você usa o app.</p>}
          </Card>
        </div>

        <Card className="glass border-border/50 p-4 sm:p-6 animate-scale-in rounded-xl sm:rounded-2xl">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            {quickActions.map((action, index) => (<Button key={index} variant="outline" className="glass h-20 sm:h-24 flex-col gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl hover:shadow-lg transition-all" onClick={action.action}><action.icon className="w-5 h-5 sm:w-6 sm:h-6" /><span className="text-xs sm:text-sm">{action.text}</span></Button>))}
          </div>
        </Card>
      </div>
      
      <AddSuggestionToListDialog 
        isOpen={isSuggestionDialogOpen}
        onOpenChange={setSuggestionDialogOpen}
        suggestedItem={selectedSuggestion}
        lists={allTimeLists}
      />

      <BottomNavigation />
    </div>
  );
};

export default Dashboard;
