import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, ShoppingCart, DollarSign, Store, ArrowLeft, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import BottomNavigation from "@/components/BottomNavigation";

const Profile = () => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalLists: 0,
    totalItems: 0,
    totalSpent: 0,
    mostFrequentSupermarket: "N/A",
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      loadUserStats();
    }
  }, [user, loading, navigate]);

  const loadUserStats = async () => {
    if (!user) return;

    try {
      // Get all lists from user
      const listsQuery = query(
        collection(db, "lists"),
        where("userId", "==", user.uid)
      );
      const listsSnapshot = await getDocs(listsQuery);
      const totalLists = listsSnapshot.size;

      // Get all items and calculate stats
      let totalItems = 0;
      let totalSpent = 0;
      const supermarketCount: Record<string, number> = {};

      for (const listDoc of listsSnapshot.docs) {
        const itemsSnapshot = await getDocs(
          collection(db, "lists", listDoc.id, "items")
        );
        
        totalItems += itemsSnapshot.size;

        itemsSnapshot.forEach((itemDoc) => {
          const item = itemDoc.data();
          const price = Number(item.price) || 0;
          const quantity = Number(item.quantity) || 1;
          const unit = String(item.unit || "").toLowerCase();
          const allowedUnits = ['unidade', 'caixa', 'pacote', 'un', 'cx', 'pct'];

          if (allowedUnits.includes(unit)) {
            totalSpent += price * quantity;
          } else {
            totalSpent += price;
          }

          if (item.supermarket) {
            supermarketCount[item.supermarket] = (supermarketCount[item.supermarket] || 0) + 1;
          }
        });
      }

      // Find most frequent supermarket
      let mostFrequent = "N/A";
      let maxCount = 0;
      Object.entries(supermarketCount).forEach(([market, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mostFrequent = market;
        }
      });

      setStats({
        totalLists,
        totalItems,
        totalSpent,
        mostFrequentSupermarket: mostFrequent,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
      toast.error("Erro ao carregar estatísticas");
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logout realizado com sucesso!");
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Erro ao fazer logout");
    }
  };

  if (loading || loadingStats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <p className="text-lg text-foreground">Carregando perfil...</p>
      </div>
    );
  }

  if (!user) return null;

  const displayName = user.displayName || "Usuário";
  const email = user.email || "";
  const photoURL = user.photoURL || "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-24">
      {/* Header */}
      <div className="glass sticky top-0 z-10 border-b border-border/50 backdrop-blur-lg">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="rounded-full hover:bg-primary/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Meu Perfil</h1>
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Card */}
        <Card className="glass border-border/50 p-6 shadow-md animate-fade-in">
          <div className="flex flex-col items-center text-center space-y-4">
            <Avatar className="w-24 h-24 border-4 border-primary/20">
              <AvatarImage src={photoURL} alt={displayName} />
              <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{displayName}</h2>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 animate-slide-up">
          <Card className="glass border-border/50 p-4 shadow-md hover:shadow-lg transition-all">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ListChecks className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalLists}</p>
                <p className="text-xs text-muted-foreground">Listas Criadas</p>
              </div>
            </div>
          </Card>

          <Card className="glass border-border/50 p-4 shadow-md hover:shadow-lg transition-all">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalItems}</p>
                <p className="text-xs text-muted-foreground">Itens Adicionados</p>
              </div>
            </div>
          </Card>

          <Card className="glass border-border/50 p-4 shadow-md hover:shadow-lg transition-all">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  R$ {stats.totalSpent.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Gasto Total</p>
              </div>
            </div>
          </Card>

          <Card className="glass border-border/50 p-4 shadow-md hover:shadow-lg transition-all">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Store className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground truncate max-w-full">
                  {stats.mostFrequentSupermarket}
                </p>
                <p className="text-xs text-muted-foreground">Supermercado Favorito</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Actions */}
        <Card className="glass border-border/50 p-6 shadow-md space-y-4 animate-scale-in">
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sair da Conta
          </Button>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Profile;
