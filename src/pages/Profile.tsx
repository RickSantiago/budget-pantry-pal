import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from 'react-firebase-hooks/firestore';
import { auth, db } from "@/lib/firebase";
import { signOut, updateProfile } from "firebase/auth";
import { doc, setDoc, addDoc, collection, query, orderBy, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { LogOut, ArrowLeft, Settings, Save, Wallet, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import BottomNavigation from "@/components/BottomNavigation";
import { Label } from "@/components/ui/label";

const Profile = () => {
  const [user, loadingAuth] = useAuthState(auth);
  const navigate = useNavigate();

  const budgetHistoryRef = user ? collection(db, `users/${user.uid}/budgetHistory`) : null;
  const [budgetHistorySnapshot, loadingBudget] = useCollection(
      budgetHistoryRef ? query(budgetHistoryRef, orderBy("createdAt", "desc")) : null
  );
  
  const [name, setName] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loadingAuth && !user) {
      navigate("/auth");
    } 
    if (user) {
        setName(user.displayName || "");
    }
    if (budgetHistorySnapshot && !budgetHistorySnapshot.empty) {
        const latestBudget = budgetHistorySnapshot.docs[0].data().budget;
        setMonthlyBudget(latestBudget.toString());
    }
  }, [user, loadingAuth, navigate, budgetHistorySnapshot]);

  const handleSaveSettings = async () => {
    if (!user) return;
    setIsSaving(true);
    
    const budgetValue = parseFloat(monthlyBudget);
    if (isNaN(budgetValue) || budgetValue < 0) {
        toast.error("Por favor, insira um valor de orçamento válido.");
        setIsSaving(false);
        return;
    }
    
    try {
        // Update display name if changed
        if (user.displayName !== name) {
            await updateProfile(user, { displayName: name });
        }

        // Add new budget to history
        const budgetHistoryCollection = collection(db, `users/${user.uid}/budgetHistory`);
        await addDoc(budgetHistoryCollection, { 
            budget: budgetValue,
            createdAt: serverTimestamp()
        });

        // Also update the main user doc with the latest budget for easy access
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { monthlyBudget: budgetValue }, { merge: true });

        toast.success("Configurações salvas com sucesso!");
    } catch (error) {
        console.error("Erro ao salvar configurações:", error);
        toast.error("Não foi possível salvar as configurações.");
    } finally {
        setIsSaving(false);
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

  const loading = loadingAuth || loadingBudget;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Carregando perfil...</p></div>;
  }

  if (!user) return null;

  const photoURL = user.photoURL || "";
  const initials = (name || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

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
              <AvatarImage src={photoURL} alt={name} />
              <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </Card>

        <Card className="glass border-border/50 p-6 shadow-md">
            <h2 className="text-lg font-semibold mb-4 flex items-center"><Settings className="w-5 h-5 mr-2"/>Configurações</h2>
            <div className="space-y-4">
                 <div>
                    <Label htmlFor="displayName" className="block text-sm font-medium text-muted-foreground mb-2">Nome de Exibição</Label>
                    <div className="relative">
                        <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                        <Input 
                            id="displayName"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Seu nome"
                            className="pl-9"
                            disabled={isSaving}
                        />
                    </div>
                </div>
                <div>
                    <Label htmlFor="monthlyBudget" className="block text-sm font-medium text-muted-foreground mb-2">Orçamento Mensal</Label>
                    <div className="relative">
                        <Wallet className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                        <Input 
                            id="monthlyBudget"
                            type="number"
                            value={monthlyBudget}
                            onChange={(e) => setMonthlyBudget(e.target.value)}
                            placeholder="Ex: 500.00"
                            className="pl-9"
                            disabled={isSaving}
                        />
                    </div>
                </div>
                <Button onClick={handleSaveSettings} className="w-full" disabled={isSaving}>
                    {isSaving && <Save className="w-4 h-4 mr-2 animate-spin"/>}
                    {!isSaving && <Save className="w-4 h-4 mr-2"/>}
                    Salvar Alterações
                </Button>
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
