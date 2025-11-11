import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Archive,
  Bell,
  PieChart as PieChartIcon,
  Target,
  TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { ShoppingList, PantryItem, ShoppingItem } from "@/types/shopping";
import BottomNavigation from "@/components/BottomNavigation";
import AddSuggestionToListDialog from "@/components/AddSuggestionToListDialog";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection, useDocumentData } from "react-firebase-hooks/firestore";
import { collection, query, where, getDocs, doc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { differenceInDays, parseISO } from "date-fns";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { BudgetEvolutionChart } from "@/components/charts/BudgetEvolutionChart";
import { Progress } from "@/components/ui/progress";
import { getCategoryStyle } from "@/utils/categoryMetadata";

// Criterious Date Parser: Handles timezone issues with date strings.
const getCorrectLocalDate = (dateSource: any): Date | null => {
    if (!dateSource) return null;

    let date: Date;

    if (typeof dateSource.toDate === 'function') {
        date = dateSource.toDate();
    } else if (typeof dateSource === 'string') {
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateSource)) {
            const [year, month, day] = dateSource.split('-').map(Number);
            date = new Date(year, month - 1, day, 12, 0, 0); 
        } else {
            date = parseISO(dateSource);
        }
    } else {
        return null;
    }

    if (date && !isNaN(date.getTime())) {
        return date;
    }

    return null;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, loadingAuth] = useAuthState(auth);
  
  const [isSuggestionDialogOpen, setSuggestionDialogOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<ShoppingItem | null>(null);
  const [allLists, setAllLists] = useState<ShoppingList[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Correct Data Fetching Logic
  useEffect(() => {
    if (!user) {
      setIsLoadingData(false);
      return;
    }

    const fetchAllData = async () => {
        setIsLoadingData(true);
        try {
            const ownerQuery = query(collection(db, 'lists'), where('ownerId', '==', user.uid));
            const sharedQuery = query(collection(db, 'lists'), where('sharedWith', 'array-contains', user.email));

            const [ownerSnapshot, sharedSnapshot] = await Promise.all([
                getDocs(ownerQuery),
                getDocs(sharedQuery)
            ]);

            const fetchedLists: ShoppingList[] = [];
            const listIds = new Set<string>();

            const processDoc = async (doc: any) => {
                if (listIds.has(doc.id)) return;
                listIds.add(doc.id);
                
                const listData = { ...doc.data(), id: doc.id } as ShoppingList;
                
                const itemsCollection = collection(db, 'lists', doc.id, 'items');
                const itemsSnapshot = await getDocs(itemsCollection);
                listData.items = itemsSnapshot.docs.map(itemDoc => ({ ...itemDoc.data(), id: itemDoc.id } as ShoppingItem));
                
                fetchedLists.push(listData);
            };

            for (const doc of ownerSnapshot.docs) await processDoc(doc);
            for (const doc of sharedSnapshot.docs) await processDoc(doc);

            setAllLists(fetchedLists);
        } catch (error) {
            console.error("Erro crítico ao buscar listas e itens:", error);
        } finally {
            setIsLoadingData(false);
        }
    };

    fetchAllData();
  }, [user]);

  const [pantrySnapshot, loadingPantry] = useCollection(
    user ? collection(db, `users/${user.uid}/pantry`) : null
  );
  const [userData, loadingUser] = useDocumentData(user ? doc(db, 'users', user.uid) : null);

  const {
    totalMonthlyItems,
    purchasedMonthlyItems,
    monthlyPurchasedPercentage,
    expiringItems,
    alerts,
    suggestions,
    categorySpending,
    totalMonthlySpending,
    monthlyBudget,
    currentMonthName,
    currentMonthShortName
  } = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const monthName = currentDate.toLocaleString('pt-BR', { month: 'long' });
    const capitalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    const monthlyLists = allLists.filter(list => {
      const listDate = getCorrectLocalDate(list.date) || getCorrectLocalDate(list.createdAt);
      return listDate ? listDate.getMonth() === currentMonth && listDate.getFullYear() === currentYear : false;
    });
    
    const monthlyItems: ShoppingItem[] = monthlyLists.flatMap(list => list.items || []);

    const { purchasedMonthlyItems, totalMonthlySpending, categorySpendingMap } = monthlyItems.reduce(
      (acc, item) => {
        if (item.checked) {
          acc.purchasedMonthlyItems++;

          const price = Number(item.price) || 0;
          const quantity = Number(item.quantity) || 1;
          const unit = String(item.unit || "").toLowerCase();
          const multipliableUnits = ['unidade', 'caixa', 'pacote', 'un', 'cx', 'pct'];
          
          const itemPrice = multipliableUnits.includes(unit) ? price * quantity : price;

          acc.totalMonthlySpending += itemPrice;
          const category = item.category || 'Outros';
          acc.categorySpendingMap[category] = (acc.categorySpendingMap[category] || 0) + itemPrice;
        }
        return acc;
      },
      { purchasedMonthlyItems: 0, totalMonthlySpending: 0, categorySpendingMap: {} as { [key: string]: number } }
    );

    const totalMonthlyItems = monthlyItems.length;
    const monthlyPurchasedPercentage = totalMonthlyItems > 0 ? Math.round((purchasedMonthlyItems / totalMonthlyItems) * 100) : 0;
    const categorySpending = Object.entries(categorySpendingMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

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

    const allTimeItems: ShoppingItem[] = allLists.flatMap(list => list.items ? list.items.map(item => ({...item, listCreatedAt: list.createdAt})) : []);
    const itemFrequency: { [name: string]: { count: number, item: ShoppingItem } } = {};
    allTimeItems.forEach(item => {
      if (!itemFrequency[item.name]) {
        itemFrequency[item.name] = { count: 0, item: item };
      }
      itemFrequency[item.name].count++;
    });

    const sortedPopularItems = Object.keys(itemFrequency).sort((a, b) => itemFrequency[b].count - itemFrequency[a].count);
    
    const suggestions: ShoppingItem[] = sortedPopularItems.slice(0, 5).map(itemName => itemFrequency[itemName].item);

    return {
      totalMonthlyItems,
      purchasedMonthlyItems,
      monthlyPurchasedPercentage,
      expiringItems,
      alerts,
      suggestions,
      categorySpending,
      totalMonthlySpending,
      monthlyBudget,
      currentMonthName: capitalizedMonthName,
      currentMonthShortName: capitalizedMonthName.substring(0, 3)
    };

  }, [allLists, pantrySnapshot, userData]);
  
  const handleAddSuggestion = (item: ShoppingItem) => {
    setSelectedSuggestion(item);
    setSuggestionDialogOpen(true);
  }

  const summaryCards = [
    { icon: List, title: `Itens (${currentMonthShortName})`, value: totalMonthlyItems, color: "text-green-500", bgColor: "bg-green-500/10" },
    { icon: CheckCircle, title: `Comprados (${currentMonthShortName})`, value: `${purchasedMonthlyItems} (${monthlyPurchasedPercentage}%)`, color: "text-blue-500", bgColor: "bg-blue-500/10" },
    { icon: Wallet, title: `Gasto (${currentMonthShortName})`, value: `R$ ${totalMonthlySpending.toFixed(2)}`, color: "text-amber-500", bgColor: "bg-amber-500/10" },
    { icon: AlertTriangle, title: "Próx. Vencimento", value: expiringItems, color: "text-red-500", bgColor: "bg-red-500/10", action: () => navigate('/pantry') },
  ];

  const quickActions = [
    { icon: List, text: "Ver Listas", action: () => navigate("/lists") },
    { icon: Archive, text: "Ver Despensa", action: () => navigate("/pantry") },
    { icon: BarChart, text: "Análises", action: () => navigate('/analytics') },
    { icon: User, text: "Perfil", action: () => navigate('/profile') },
  ];

  const budgetSpentPercentage = monthlyBudget > 0 ? (totalMonthlySpending / monthlyBudget) * 100 : 0;

  if (loadingAuth || isLoadingData || loadingPantry || loadingUser) {
    return <div className="flex items-center justify-center h-screen"><LoadingSpinner size={32} /> <p className='ml-4'>Carregando seu dashboard...</p></div>;
  }

  return (
    <div className="min-h-screen pb-24">
      <AppHeader title="Meu Dashboard" subtitle={`Resumo de ${currentMonthName}`}/>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 animate-fade-in">
          {summaryCards.map((card, index) => (
            <Card
              key={index}
              onClick={card.action}
              className={`glass p-3 sm:p-4 transition-all duration-300 animate-slide-up rounded-xl sm:rounded-2xl ${card.action ? 'cursor-pointer hover:shadow-lg' : ''}`}>
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
            <Card className="glass p-4 sm:p-6 animate-scale-in rounded-xl sm:rounded-2xl">
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

        <Card className="glass p-4 sm:p-6 animate-scale-in rounded-xl sm:rounded-2xl">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />Evolução do Orçamento Mensal</h2>
            <BudgetEvolutionChart />
        </Card>

        <Card className="glass p-4 sm:p-6 animate-scale-in rounded-xl sm:rounded-2xl">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                {`Gastos por Categoria (${currentMonthName})`}
            </h2>
            <div className="space-y-4">
                {categorySpending.length > 0 ? (
                    categorySpending.map((category) => {
                        const style = getCategoryStyle(category.name);
                        const Icon = style.icon;
                        const percentage = totalMonthlySpending > 0 ? (category.value / totalMonthlySpending) * 100 : 0;

                        return (
                            <div key={category.name} className="flex items-center gap-3 sm:gap-4">
                                <Icon className={`w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 ${style.color}`} />
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium">{category.name}</span>
                                        <span className="text-sm font-bold">R$ {category.value.toFixed(2)}</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2.5">
                                        <div className="h-2.5 rounded-full" style={{ width: `${percentage}%`, backgroundColor: style.bgColor }}></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Não há gastos registrados para este mês.</p>
                )}
            </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
          <Card className="glass p-4 sm:p-6 animate-slide-up rounded-xl sm:rounded-2xl">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2"><Bell className="w-4 h-4 sm:w-5 sm:h-5" />Notificações</h2>
            <div className="space-y-2 sm:space-y-3">
              {alerts.map((alert, index) => (<div key={index} className="glass p-2.5 sm:p-3 rounded-lg sm:rounded-xl text-xs sm:text-sm hover:shadow-md transition-all">{alert}</div>))}
            </div>
          </Card>

          <Card className="glass p-4 sm:p-6 animate-slide-up rounded-xl sm:rounded-2xl">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2"><PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />Sugestões de compras</h2>
            {suggestions.length > 0 ? (
              <div className="space-y-2">
                {suggestions.map((item, index) => (
                  <div key={index} className="flex items-center justify-between glass p-2 rounded-lg">
                    <span className="text-sm font-medium">{item.name}</span>
                    <Button size="sm" onClick={() => handleAddSuggestion(item)}><Plus className="w-4 h-4 mr-1"/>Add</Button>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">Suas sugestões aparecerão aqui conforme você usa o app.</p>}
          </Card>
        </div>

        <Card className="glass p-4 sm:p-6 animate-scale-in rounded-xl sm:rounded-2xl">
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
        lists={allLists}
      />

      <BottomNavigation />
    </div>
  );
};

export default Dashboard;
