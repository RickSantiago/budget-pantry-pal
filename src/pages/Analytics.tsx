import { useState, useEffect, useMemo } from "react";
import AppHeader from "@/components/AppHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { ShoppingList, ShoppingItem } from "@/types/shopping";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, query, where, getDocs } from 'firebase/firestore';
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { CategorySpendingChart } from "@/components/charts/CategorySpendingChart";
import { SupermarketSpendingChart } from "@/components/charts/SupermarketSpendingChart";
import { PriceEvolutionChart } from "@/components/charts/PriceEvolutionChart";
import { AnalyticsInfoCards } from "@/components/charts/AnalyticsInfoCards";
import { PlannedVsSpentChart } from "@/components/charts/PlannedVsSpentChart";

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#14b8a6", "#6366f1"];

const calculateItemTotal = (item: ShoppingItem): number => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 1;
    const unit = String(item.unit || "").toLowerCase();
    const multipliableUnits = ['unidade', 'caixa', 'pacote', 'un', 'cx', 'pct'];
    return multipliableUnits.includes(unit) ? price * quantity : price;
};

const parseLocal = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
};

const parseCurrency = (value: string | number | undefined): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const numberString = value
            .replace(/R\$\s?/, '')
            .replace(/\./g, '')
            .replace(/,/, '.');
        const parsed = parseFloat(numberString);
        return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
};

const getMonthYearLabel = (date: Date) => date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '');

const Analytics = () => {
  const [user, authLoading] = useAuthState(auth);
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all'); // '30d', '90d', 'year', 'all'

  useEffect(() => {
    const fetchLists = async () => {
      if (!user) { setLoading(false); return; }
      setLoading(true);
      try {
        const ownerListsQuery = query(collection(db, 'lists'), where('ownerId', '==', user.uid));
        const sharedListsQuery = query(collection(db, 'lists'), where('sharedWith', 'array-contains', user.email));
        const [ownerSnapshot, sharedSnapshot] = await Promise.all([getDocs(ownerListsQuery), getDocs(sharedListsQuery)]);
        
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
        }

        for (const doc of ownerSnapshot.docs) await processDoc(doc);
        for (const doc of sharedSnapshot.docs) await processDoc(doc);

        setLists(fetchedLists.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } catch (error) {
        console.error("Error fetching lists and items: ", error);
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading) fetchLists();
  }, [user, authLoading]);


  const chartData = useMemo(() => {
    const now = new Date();
    const filteredLists = lists.filter(list => {
        const listDate = new Date(list.date);
        if (period === '30d') return (now.getTime() - listDate.getTime()) / (1000 * 3600 * 24) <= 30;
        if (period === '90d') return (now.getTime() - listDate.getTime()) / (1000 * 3600 * 24) <= 90;
        if (period === 'year') return listDate.getFullYear() === now.getFullYear();
        return true; // 'all'
    });

    const allItems = filteredLists.flatMap(list => list.items);

    // Planned vs Spent
    const plannedVsSpentData = filteredLists.map(list => ({
        name: list.title.length > 12 ? `${list.title.substring(0, 10)}...` : list.title,
        planned: parseCurrency(list.plannedBudget),
        spent: list.items.reduce((sum, item) => sum + calculateItemTotal(item), 0)
    })).reverse();

    // Category & Supermarket Data
    const categoryData = Object.entries(allItems.reduce((acc, item) => { const cat = item.category || 'Outros'; acc[cat] = (acc[cat] || 0) + calculateItemTotal(item); return acc; }, {} as Record<string, number>)).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
    const supermarketData = Object.entries(allItems.reduce((acc, item) => { const market = item.supermarket || 'Não informado'; acc[market] = (acc[market] || 0) + calculateItemTotal(item); return acc; }, {} as Record<string, number>)).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

    // --- Info Cards Data ---
    const topSpendingItems = [...allItems].sort((a, b) => calculateItemTotal(b) - calculateItemTotal(a)).slice(0, 5).map(item => ({ name: item.name, totalCost: calculateItemTotal(item) }));
    
    const recurringItemsByName = new Map<string, ShoppingItem>();
    allItems.filter(item => item.isRecurring).forEach(item => {
        const nameKey = item.name.toLowerCase();
        const existingItem = recurringItemsByName.get(nameKey);
        if (!existingItem) {
            recurringItemsByName.set(nameKey, item);
        } else {
            if (item.expiryDate && !existingItem.expiryDate) {
                recurringItemsByName.set(nameKey, item);
            } else if (item.expiryDate && existingItem.expiryDate) {
                if (parseLocal(item.expiryDate).getTime() < parseLocal(existingItem.expiryDate).getTime()) {
                    recurringItemsByName.set(nameKey, item);
                }
            }
        }
    });
    const topRecurringItems = Array.from(recurringItemsByName.values()).sort((a, b) => {
        if (a.expiryDate && b.expiryDate) return parseLocal(a.expiryDate).getTime() - parseLocal(b.expiryDate).getTime();
        if (a.expiryDate) return -1;
        if (b.expiryDate) return 1;
        return 0;
    }).slice(0, 5);

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const expiringItems = allItems.filter(item => item.expiryDate).map(item => ({ ...item, diffDays: Math.ceil((parseLocal(item.expiryDate!).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) })).filter(item => item.diffDays >= 0).sort((a, b) => a.diffDays - b.diffDays).slice(0, 10);

    // Price Evolution Data
    const allItemsWithDate = filteredLists.flatMap(list => list.items.map(item => ({ ...item, listDate: list.date }))).filter(item => item.price > 0);
    const uniqueProductNames = Array.from(new Set(allItemsWithDate.map(item => item.name.toLowerCase())));
    const availableProducts = uniqueProductNames.map((name, index) => ({ key: name, label: name.charAt(0).toUpperCase() + name.slice(1), color: COLORS[index % COLORS.length] }));
    
    const timeGroupMap: Record<string, Record<string, { price: number; date: Date }>> = {};
    allItemsWithDate.forEach(item => {
        const date = parseLocal(item.listDate);
        const timeKey = getMonthYearLabel(date);
        if (!timeGroupMap[timeKey]) timeGroupMap[timeKey] = {};
        const productKey = item.name.toLowerCase();

        if (!timeGroupMap[timeKey][productKey] || date > timeGroupMap[timeKey][productKey].date) {
             timeGroupMap[timeKey][productKey] = { price: Number(item.price), date: date };
        }
    });

    const priceEvolutionData = Object.entries(timeGroupMap).map(([time, products]) => {
      const entry: Record<string, any> = { time };
      Object.entries(products).forEach(([productKey, data]) => {
        entry[productKey] = data.price;
      });
      return entry;
    }).sort((a, b) => {
        const dateA = new Date(a.time.replace(/([a-z]+)\/(\d+)/, (m, p1, p2) => `01/${p1}/20${p2}`));
        const dateB = new Date(b.time.replace(/([a-z]+)\/(\d+)/, (m, p1, p2) => `01/${p1}/20${p2}`));
        return dateA.getTime() - dateB.getTime();
    });

    return {
      plannedVsSpentData,
      categoryData,
      supermarketData,
      topSpendingItems,
      topRecurringItems,
      expiringItems,
      priceEvolutionData,
      availableProducts
    };
  }, [lists, period]);

  if (authLoading || loading) {
    return <div className="h-screen w-full flex items-center justify-center"><LoadingSpinner size={48} /></div>;
  }

  return (
    <div className="min-h-screen pb-24">
      <AppHeader title="Análises e Gráficos" subtitle="Visualize seus gastos e estatísticas" />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Filtrar por período:</label>
            <select 
              value={period}
              onChange={e => setPeriod(e.target.value)} 
              className="rounded px-3 py-2 text-sm glass w-full sm:w-auto"
            >
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
                <option value="year">Este Ano</option>
                <option value="all">Todo o período</option>
          </select>
        </div>

        {!user ? (
          <div className="text-center py-20"><h3 className="text-xl font-semibold">Você não está logado</h3><p className="text-muted-foreground text-sm mt-2">Faça login para ver suas análises.</p></div>
        ) : lists.length === 0 ? (
          <div className="text-center py-20"><h3 className="text-xl font-semibold">Nenhuma lista encontrada</h3><p className="text-muted-foreground text-sm mt-2">Crie listas e adicione itens para ver suas análises.</p></div>
        ) : (
          <div className="space-y-6">
            <PlannedVsSpentChart data={chartData.plannedVsSpentData} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CategorySpendingChart data={chartData.categoryData} />
                <SupermarketSpendingChart data={chartData.supermarketData} />
            </div>
            <AnalyticsInfoCards 
                topSpendingItems={chartData.topSpendingItems}
                topRecurringItems={chartData.topRecurringItems}
                expiringItems={chartData.expiringItems}
            />
            <PriceEvolutionChart 
                priceEvolutionData={chartData.priceEvolutionData}
                availableProducts={chartData.availableProducts}
            />
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Analytics;
