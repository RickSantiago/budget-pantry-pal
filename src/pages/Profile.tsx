// Forcing a re-render to break cache - v3
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, functions } from "@/lib/firebase";
import { httpsCallable } from 'firebase/functions';
import { signOut, updateProfile } from "firebase/auth";
import { doc, setDoc, addDoc, collection, query, orderBy, serverTimestamp, where, getDocs, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { LogOut, ArrowLeft, Settings, Save, Wallet, User as UserIcon, Camera } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import BottomNavigation from "@/components/BottomNavigation";
import { Label } from "@/components/ui/label";
import { ShoppingList, PantryItem } from "@/types/shopping";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import GamificationCard from "@/components/GamificationCard";
import NotificationSettingsCard from "@/components/NotificationSettingsCard";
import DataManagementCard from "@/components/DataManagementCard";
import ConfirmationDialog from "@/components/ConfirmationDialog";

import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';
import AvatarPickerDialog, { avatarSeeds } from "@/components/AvatarPickerDialog";

const Profile = () => {
  const [user, loadingAuth] = useAuthState(auth);
  const navigate = useNavigate();

  // States
  const [allLists, setAllLists] = useState<ShoppingList[]>([]);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [budgetHistory, setBudgetHistory] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [name, setName] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAvatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    expiryNotifications: true,
    budgetAlerts: true,
    weeklySummary: false,
  });
  const [currentAvatar, setCurrentAvatar] = useState(""); // << CORREÇÃO: Estado local para o avatar

  useEffect(() => {
    if (!user) {
      setIsLoadingData(false);
      if (!loadingAuth) navigate("/auth");
      return;
    }

    // Sincronizar estados com o objeto user
    setName(user.displayName || "");
    setCurrentAvatar(user.photoURL || ""); // << CORREÇÃO: Inicializa o estado do avatar

    const fetchAllData = async () => {
      setIsLoadingData(true);
      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        if (userData?.notificationSettings) {
          setNotificationSettings(userData.notificationSettings);
        }

        const ownerQuery = query(collection(db, 'lists'), where('ownerId', '==', user.uid));
        const sharedQuery = query(collection(db, 'lists'), where('sharedWith', 'array-contains', user.email));
        const [ownerSnapshot, sharedSnapshot, pantrySnapshot, budgetHistorySnapshot] = await Promise.all([
          getDocs(ownerQuery),
          getDocs(sharedQuery),
          getDocs(query(collection(db, `users/${user.uid}/pantry`))),
          getDocs(query(collection(db, `users/${user.uid}/budgetHistory`), orderBy("createdAt", "desc")))
        ]);

        const fetchedLists: ShoppingList[] = [];
        const listIds = new Set<string>();
        const processDoc = (doc: any) => {
          if (listIds.has(doc.id)) return;
          listIds.add(doc.id);
          fetchedLists.push({ ...doc.data(), id: doc.id } as ShoppingList);
        };
        ownerSnapshot.docs.forEach(processDoc);
        sharedSnapshot.docs.forEach(processDoc);
        setAllLists(fetchedLists);

        setPantryItems(pantrySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as PantryItem)));

        const fetchedBudgetHistory = budgetHistorySnapshot.docs.map(doc => doc.data());
        setBudgetHistory(fetchedBudgetHistory);

        if (fetchedBudgetHistory.length > 0) {
          setMonthlyBudget(fetchedBudgetHistory[0].budget.toString());
        }

      } catch (error) {
        console.error("Erro crítico ao buscar dados para o perfil:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchAllData();
  }, [user, loadingAuth, navigate]);

  const handleAvatarSelect = async (seed: string) => {
    if (!user) return;
    try {
      await updateProfile(user, { photoURL: seed });
      setCurrentAvatar(seed); // << CORREÇÃO: Atualiza o estado local para re-renderização imediata
      toast.success("Avatar atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar avatar:", error);
      toast.error(`Não foi possível atualizar o avatar.`);
    }
  }

  const handleNotificationSettingsChange = async (newSettings: any) => {
    if (!user) return;
    setNotificationSettings(newSettings);
    const userRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userRef, { notificationSettings: newSettings }, { merge: true });
      toast.success("Preferências de notificação salvas!");
    } catch (error) {
      toast.error("Erro ao salvar as preferências.");
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      if (user.displayName !== name) {
        await updateProfile(user, { displayName: name });
      }

      const budgetValue = parseFloat(monthlyBudget);
      const latestBudget = budgetHistory[0]?.budget;
      if ((!isNaN(budgetValue) && budgetValue > 0) && latestBudget !== budgetValue) {
        const budgetHistoryCollection = collection(db, `users/${user.uid}/budgetHistory`);
        await addDoc(budgetHistoryCollection, { budget: budgetValue, createdAt: serverTimestamp() });
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { monthlyBudget: budgetValue }, { merge: true });
      }

      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    if (!user) return;
    const dataToExport = {
      userInfo: { uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL, createdAt: user.metadata.creationTime },
      lists: allLists,
      pantry: pantryItems,
      budgetHistory: budgetHistory,
      notificationSettings: notificationSettings,
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `meu-mercado-dados-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success("Seus dados estão sendo baixados!")
  };

  const handleDeleteAccount = async () => {
    const deleteUserAccount = httpsCallable(functions, 'deleteUserAccount');
    try {
      await deleteUserAccount();
      toast.success("Sua conta foi excluída. Sentiremos sua falta!");
      signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Erro ao excluir a conta:", error);
      toast.error("Erro ao excluir conta. Tente fazer logout e login novamente.");
    }
    setDeleteConfirmOpen(false);
  };

  const loading = loadingAuth || isLoadingData;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size={32} /><p className='ml-4'>Carregando perfil...</p></div>;
  }

  if (!user) return null;

  const getAvatarUrl = () => {
    const photo = currentAvatar; // << CORREÇÃO: Usa o estado local como fonte da verdade
    if (photo && avatarSeeds.includes(photo)) {
      const avatarSvg = createAvatar(adventurer, {
        seed: photo,
        size: 96,
        backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf']
      }).toString();
      return `data:image/svg+xml,${encodeURIComponent(avatarSvg)}`;
    }
    return photo || "";
  };

  const photoURL = getAvatarUrl();
  const initials = (name || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
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
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-primary/20">
                  <AvatarImage src={photoURL} alt={name} />
                  <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">{initials}</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="icon" className="absolute bottom-0 right-0 rounded-full w-8 h-8 bg-background/80 backdrop-blur-sm" onClick={() => setAvatarPickerOpen(true)}>
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </Card>

          <GamificationCard user={user} lists={allLists} pantryItems={pantryItems} budgetHistory={budgetHistory} />

          <Card className="glass border-border/50 p-6 shadow-md">
            <h2 className="text-lg font-semibold mb-4 flex items-center"><Settings className="w-5 h-5 mr-2" />Configurações Gerais</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="displayName" className="block text-sm font-medium text-muted-foreground mb-2">Nome de Exibição</Label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input id="displayName" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" className="pl-9" disabled={isSaving} />
                </div>
              </div>
              <div>
                <Label htmlFor="monthlyBudget" className="block text-sm font-medium text-muted-foreground mb-2">Orçamento Mensal</Label>
                <div className="relative">
                  <Wallet className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input id="monthlyBudget" type="number" value={monthlyBudget} onChange={(e) => setMonthlyBudget(e.target.value)} placeholder="Ex: 500.00" className="pl-9" disabled={isSaving} />
                </div>
              </div>
              <Button onClick={handleSaveSettings} className="w-full" disabled={isSaving}>
                {isSaving ? <Save className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar Alterações
              </Button>
            </div>
          </Card>

          <NotificationSettingsCard settings={notificationSettings} onSettingsChange={handleNotificationSettingsChange} />

          <DataManagementCard onExport={handleExportData} onDelete={() => setDeleteConfirmOpen(true)} />

          <Card className="glass border-border/50 p-4 shadow-md">
            <Button onClick={() => signOut(auth)} variant="ghost" className="w-full text-muted-foreground"><LogOut className="w-4 h-4 mr-2" />Sair da Conta</Button>
          </Card>

        </div>

        <BottomNavigation />
      </div>

      <AvatarPickerDialog open={isAvatarPickerOpen} onOpenChange={setAvatarPickerOpen} onAvatarSelect={handleAvatarSelect} />
      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDeleteAccount}
        title="Você tem certeza absoluta?"
        description="Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta e removerá seus dados de nossos servidores."
      />
    </>
  );
};

export default Profile;
