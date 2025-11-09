import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { doc, setDoc, getDocs, collection, query } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { LogOut, ArrowLeft, Settings, Save, Wallet } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import BottomNavigation from "@/components/BottomNavigation";

const Profile = () => {
  const [user, loadingAuth] = useAuthState(auth);
  const navigate = useNavigate();

  // User data from Firestore
  const userRef = user ? doc(db, 'users', user.uid) : null;
  const [userData, loadingUser] = useDocumentData(userRef);
  
  const [monthlyBudget, setMonthlyBudget] = useState("");

  useEffect(() => {
    if (!loadingAuth && !user) {
      navigate("/auth");
    } 
    if (userData) {
        setMonthlyBudget(userData.monthlyBudget?.toString() || "");
    }
  }, [user, loadingAuth, navigate, userData]);

  const handleSaveSettings = async () => {
    if (!userRef) return;
    const budgetValue = parseFloat(monthlyBudget);
    if (isNaN(budgetValue) || budgetValue < 0) {
        toast.error("Por favor, insira um valor de orçamento válido.");
        return;
    }
    try {
        await setDoc(userRef, { 
            monthlyBudget: budgetValue,
            displayName: user?.displayName, // Ensure other data is not overwritten
            email: user?.email,
            photoURL: user?.photoURL,
         }, { merge: true });
        toast.success("Configurações salvas com sucesso!");
    } catch (error) {
        console.error("Erro ao salvar configurações:", error);
        toast.error("Não foi possível salvar as configurações.");
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

  if (loadingAuth || loadingUser) {
    return <div className="min-h-screen flex items-center justify-center"><p>Carregando perfil...</p></div>;
  }

  if (!user) return null;

  const displayName = user.displayName || "Usuário";
  const email = user.email || "";
  const photoURL = user.photoURL || "";
  const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-24">
      <div className="glass sticky top-0 z-10 border-b border-border/50 backdrop-blur-lg">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="rounded-full"><ArrowLeft className="w-5 h-5" /></Button>
          <h1 className="text-xl font-bold">Meu Perfil</h1>
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <Card className="glass border-border/50 p-6 shadow-md">
          <div className="flex flex-col items-center text-center space-y-4">
            <Avatar className="w-24 h-24 border-4 border-primary/20">
              <AvatarImage src={photoURL} alt={displayName} />
              <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{displayName}</h2>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>
        </Card>

        <Card className="glass border-border/50 p-6 shadow-md">
            <h2 className="text-lg font-semibold mb-4 flex items-center"><Settings className="w-5 h-5 mr-2"/>Configurações</h2>
            <div className="space-y-4">
                <div>
                    <label htmlFor="monthlyBudget" className="block text-sm font-medium text-muted-foreground mb-2">Orçamento Mensal</label>
                    <div className="relative">
                        <Wallet className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                        <Input 
                            id="monthlyBudget"
                            type="number"
                            value={monthlyBudget}
                            onChange={(e) => setMonthlyBudget(e.target.value)}
                            placeholder="Ex: 500.00"
                            className="pl-9"
                        />
                    </div>
                </div>
                <Button onClick={handleSaveSettings} className="w-full"><Save className="w-4 h-4 mr-2"/>Salvar</Button>
            </div>
        </Card>

        <Card className="glass border-border/50 p-6 shadow-md">
          <Button onClick={handleLogout} variant="destructive" className="w-full"><LogOut className="w-5 h-5 mr-2" />Sair da Conta</Button>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Profile;
