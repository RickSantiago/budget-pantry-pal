import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppHeader from "@/components/AppHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { User, AlertTriangle, X, PieChart as PieIcon, BarChart3, TrendingUp, ShoppingCart, Repeat } from "lucide-react";
import { ShoppingList, ShoppingItem } from "@/types/shopping";
import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, LabelList } from "recharts";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, query, where, getDocs } from 'firebase/firestore';
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// --- HELPERS ---
const parseLocal = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12); // Use 12:00 to avoid timezone shifts
};
const getMonthYearLabel = (date: Date) => date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '');
const getWeekLabel = (date: Date) => {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const dayOfMonth = date.getDate();
    const weekNumber = Math.ceil((dayOfMonth + firstDayOfMonth) / 7);
    return `Sem ${weekNumber}`;
};

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

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#14b8a6", "#6366f1"];

// --- COMPONENT ---
const Analytics = () => {
  const [user, authLoading] = useAuthState(auth);
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

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

        setLists(fetchedLists);
      } catch (error) {
        console.error("Error fetching lists and items: ", error);
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading) fetchLists();
  }, [user, authLoading]);

  const monthYearOptions = useMemo(() => {
    if (lists.length === 0) return [];
    const uniqueMonths = Array.from(new Set(lists.map(list => getMonthYearLabel(parseLocal(list.date)))))
      .map(label => {
        const [monthStr, yearStr] = label.split('/');
        const monthIndex = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].indexOf(monthStr.toLowerCase());
        return { label, sortKey: `20${yearStr}-${String(monthIndex).padStart(2, '0')}` };
      });
    uniqueMonths.sort((a, b) => b.sortKey.localeCompare(a.sortKey));
    return uniqueMonths.map(m => m.label);
  }, [lists]);

  const chartData = useMemo(() => {
    const filtered = selectedMonth ? lists.filter(list => getMonthYearLabel(parseLocal(list.date)) === selectedMonth) : lists;
    const allItems = filtered.flatMap(list => list.items);

    const listExpenses = filtered.map(list => ({ name: list.title.length > 12 ? `${list.title.substring(0, 10)}...` : list.title, total: list.items.reduce((sum, item) => sum + ((Number(item.price) || 0) * (item.quantity || 1)), 0) }));
    const supermarket = Object.entries(allItems.reduce((acc, item) => { const market = item.supermarket || 'Não informado'; acc[market] = (acc[market] || 0) + ((Number(item.price) || 0) * (item.quantity || 1)); return acc; }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }));
    const category = Object.entries(allItems.reduce((acc, item) => { const category = item.category || 'Outros'; acc[category] = (acc[category] || 0) + ((Number(item.price) || 0) * (item.quantity || 1)); return acc; }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }));
    const topItems = allItems.map(item => ({ name: item.name, totalCost: (Number(item.price) || 0) * (item.quantity || 1) })).sort((a, b) => b.totalCost - a.totalCost).slice(0, 5);
    const topRecurring = allItems.filter(item => item.isRecurring && item.expiryDate).sort((a, b) => parseLocal(a.expiryDate!).getTime() - parseLocal(b.expiryDate!).getTime()).slice(0, 5);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiring = allItems.filter(item => item.expiryDate).map(item => ({ ...item, diffDays: Math.ceil((parseLocal(item.expiryDate!).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) })).filter(item => item.diffDays >= 0).sort((a, b) => a.diffDays - b.diffDays).slice(0, 5);

    // Dynamic Price Evolution
    const uniqueProductNames = Array.from(new Set(allItems.filter(item => item.price > 0).map(item => item.name.toLowerCase())));
    const availableProducts = uniqueProductNames.map((name, index) => ({ key: name, label: name.charAt(0).toUpperCase() + name.slice(1), color: COLORS[index % COLORS.length] }));
    const isMonthView = !selectedMonth;
    const timeGroupMap: Record<string, Record<string, number[]>> = {};
    filtered.forEach(list => {
      const date = parseLocal(list.date);
      const timeKey = isMonthView ? getMonthYearLabel(date) : getWeekLabel(date);
      if (!timeGroupMap[timeKey]) timeGroupMap[timeKey] = {};
      list.items.forEach(item => {
        const productKey = item.name.toLowerCase();
        if (uniqueProductNames.includes(productKey) && item.price) {
          if (!timeGroupMap[timeKey][productKey]) timeGroupMap[timeKey][productKey] = [];
          timeGroupMap[timeKey][productKey].push(Number(item.price));
        }
      });
    });
    const priceEvolution = Object.keys(timeGroupMap).map(timeKey => {
      const entry: Record<string, any> = { time: timeKey };
      uniqueProductNames.forEach(key => {
        const prices = timeGroupMap[timeKey][key];
        entry[key] = prices?.length ? (prices.reduce((a, b) => a + b, 0) / prices.length) : undefined;
      });
      return entry;
    }).sort((a,b) => {
      if (isMonthView) return 0;
      const weekA = parseInt(a.time.replace('Sem ', ''));
      const weekB = parseInt(b.time.replace('Sem ', ''));
      return weekA - weekB;
    });

    return {
      filteredLists: filtered,
      listExpensesData: listExpenses,
      supermarketData: supermarket,
      categoryData: category,
      allPriceEvolutionData: priceEvolution,
      availableProducts: availableProducts,
      topSpendingItems: topItems,
      topRecurringItems: topRecurring,
      expiringItems: expiring
    };
  }, [lists, selectedMonth]);

  useEffect(() => {
    if (chartData.availableProducts.length > 0 && selectedProducts.length === 0) {
        setSelectedProducts(chartData.availableProducts.slice(0, 2).map(p => p.key));
    }
  }, [chartData.availableProducts]);

  if (authLoading || loading) {
    return <div className="h-screen w-full flex items-center justify-center"><LoadingSpinner size={48} /></div>;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader title="Análises e Gráficos" subtitle="Visualize seus gastos e estatísticas" />
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Filtrar por período:</label>
          <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="border rounded px-3 py-2 text-sm bg-background glass">
            <option value="">Todos</option>
            {monthYearOptions.map(m => (<option key={m} value={m}>{m}</option>))}
          </select>
        </div>

        {!user ? (
          <div className="text-center py-20"><h3 className="text-xl font-semibold">Você não está logado</h3><p className="text-muted-foreground text-sm mt-2">Faça login para ver suas análises.</p></div>
        ) : lists.length === 0 ? (
          <div className="text-center py-20"><h3 className="text-xl font-semibold">Nenhuma lista encontrada</h3><p className="text-muted-foreground text-sm mt-2">Crie listas e adicione itens para ver suas análises.</p></div>
        ) : (
          <div className="space-y-6">
            {chartData.listExpensesData.length > 0 && <Card className="glass-card"><CardHeader><CardTitle className="flex items-center gap-2"><BarChart3/>Gastos por Lista</CardTitle></CardHeader><CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <RechartsBar data={chartData.listExpensesData} margin={{ top: 20, right: 10, left: -20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} tick={{ fill: 'hsl(var(--foreground))' }} angle={-35} textAnchor="end" interval={0} />
                  <YAxis stroke="hsl(var(--foreground))" fontSize={12} tick={{ fill: 'hsl(var(--foreground))' }} tickFormatter={(value) => `R$${value}`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--primary) / 0.1)' }} />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}><LabelList dataKey="total" position="top" formatter={(value: number) => `R$${value.toFixed(2)}`} className="text-xs fill-foreground" /></Bar>
                </RechartsBar>
              </ResponsiveContainer>
            </CardContent></Card>}

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass-card"><CardHeader><CardTitle className="flex items-center gap-2"><PieIcon />Gastos por Categoria</CardTitle></CardHeader><CardContent>
                {chartData.categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart><Pie data={chartData.categoryData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" label={(props) => `${props.name} (${(props.percent * 100).toFixed(0)}%)`}>{chartData.categoryData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none" />)}</Pie><Tooltip content={<CustomTooltip />} /></PieChart>
                  </ResponsiveContainer>
                ) : <div className="h-[300px] flex-center text-muted-foreground">Nenhum item categorizado.</div>}
              </CardContent></Card>
              
              <Card className="glass-card"><CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart />Gastos por Supermercado</CardTitle></CardHeader><CardContent>
                {chartData.supermarketData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                     <PieChart><Pie data={chartData.supermarketData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" label={(props) => `${props.name} (${(props.percent * 100).toFixed(0)}%)`}>{chartData.supermarketData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip content={<CustomTooltip />} /></PieChart>
                  </ResponsiveContainer>
                ) : <div className="h-[300px] flex-center text-muted-foreground">Sem dados de supermercado.</div>}
              </CardContent></Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                 <Card className="glass-card"><CardHeader><CardTitle className="flex items-center gap-2">🏆 Top 5 Produtos</CardTitle></CardHeader><CardContent className="space-y-3 pt-4">
                    {chartData.topSpendingItems.length > 0 ? chartData.topSpendingItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background/50"><span className="font-medium text-sm truncate pr-2">{item.name}</span><Badge variant="destructive" className="text-sm">R$ {item.totalCost.toFixed(2)}</Badge></div>
                    )) : <div className="h-[150px] flex-center text-muted-foreground">Sem itens para analisar.</div>}
                </CardContent></Card>
                <Card className="glass-card"><CardHeader><CardTitle className="flex items-center gap-2"><Repeat />Top 5 Recorrentes</CardTitle></CardHeader><CardContent className="space-y-3 pt-4">
                    {chartData.topRecurringItems.length > 0 ? chartData.topRecurringItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50"><span className="font-medium text-sm truncate pr-2">{item.name}</span><span className="text-sm text-muted-foreground">Val: {parseLocal(item.expiryDate!).toLocaleDateString('pt-BR')}</span></div>
                    )) : <div className="h-[150px] flex-center text-muted-foreground">Sem itens recorrentes com validade.</div>}
                </CardContent></Card>
            </div>

            <Card className="glass-card"><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp />Evolução de Preços</CardTitle></CardHeader><CardContent>
              <div className="mb-4 flex flex-wrap gap-2">
                {chartData.availableProducts.map(product => (
                  <Badge key={product.key} variant={selectedProducts.includes(product.key) ? "default" : "outline"} className="cursor-pointer transition-all hover:scale-105" style={selectedProducts.includes(product.key) ? { backgroundColor: product.color, borderColor: product.color, color: 'white' } : {}} onClick={() => setSelectedProducts(prev => prev.includes(product.key) ? prev.filter(p => p !== product.key) : [...prev, product.key])}>{product.label}{selectedProducts.includes(product.key) && <X className="w-3 h-3 ml-1.5" />}</Badge>
                ))}
              </div>
              {selectedProducts.length > 0 && chartData.allPriceEvolutionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.allPriceEvolutionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis dataKey="time" stroke="hsl(var(--foreground))" fontSize={12} tick={{ fill: 'hsl(var(--foreground))' }} />
                    <YAxis stroke="hsl(var(--foreground))" fontSize={12} tick={{ fill: 'hsl(var(--foreground))' }} tickFormatter={(value) => `R$${Number(value).toFixed(2)}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    {selectedProducts.map(key => {
                      const product = chartData.availableProducts.find(p => p.key === key);
                      return <Line key={key} type="monotone" dataKey={key} stroke={product?.color} strokeWidth={2.5} name={product?.label} dot={{ r: 4 }} activeDot={{ r: 7 }} connectNulls />;
                    })}
                  </LineChart>
                </ResponsiveContainer>
              ) : <div className="h-[300px] flex-center text-muted-foreground">Selecione um produto para ver a evolução ou não há dados para o período.</div>}
            </CardContent></Card>

            <Card className="glass-card border-amber-500/30"><CardHeader><CardTitle className="flex items-center gap-2 text-amber-500"><AlertTriangle />Itens Próximos do Vencimento</CardTitle></CardHeader><CardContent>
              {chartData.expiringItems.length > 0 ? (
                <div className="space-y-2">
                  {chartData.expiringItems.map(item => {
                    let colorClass = 'text-green-500';
                    if (item.diffDays <= 3) colorClass = 'text-red-500 font-bold';
                    else if (item.diffDays <= 7) colorClass = 'text-amber-500 font-semibold';
                    return (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50"><span className="font-medium text-sm truncate pr-2">{item.name}</span><span className={`text-sm ${colorClass}`}>{item.diffDays <= 0 ? 'Vence hoje!' : `Vence em ${item.diffDays} dias`}</span></div>
                    );
                  })}
                </div>
              ) : <div className="text-center py-10 text-muted-foreground">Nenhum item com data de validade para os próximos 20 dias.</div>}
            </CardContent></Card>
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Analytics;
