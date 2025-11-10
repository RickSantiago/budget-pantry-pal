import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";
import { EmailAuthProvider, linkWithCredential, updateProfile, AuthError } from "firebase/auth";
import { Loader2 } from "lucide-react";

interface LinkAnonymousAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LinkAnonymousAccountDialog = ({ open, onOpenChange }: LinkAnonymousAccountDialogProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLinking, setIsLinking] = useState(false);

  const handleLinkAccount = async () => {
    if (!name || !email || !password) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }
    if (password.length < 6) {
        toast.error("A senha deve ter no mínimo 6 caracteres.");
        return;
    }

    setIsLinking(true);
    const user = auth.currentUser;
    if (!user) {
      toast.error("Nenhum usuário logado.");
      setIsLinking(false);
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(email, password);
      await linkWithCredential(user, credential);
      await updateProfile(user, { displayName: name });
      toast.success("Conta vinculada com sucesso! Agora você pode fazer login com seu e-mail e senha.");
      onOpenChange(false);
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = "Ocorreu um erro ao vincular a conta.";
      switch (authError.code) {
        case "auth/email-already-in-use":
          errorMessage = "Este e-mail já está em uso por outra conta.";
          break;
        case "auth/invalid-email":
          errorMessage = "O e-mail fornecido é inválido.";
          break;
        case "auth/weak-password":
          errorMessage = "A senha é muito fraca.";
          break;
        case "auth/requires-recent-login":
          errorMessage = "Esta operação é sensível e requer autenticação recente. Por favor, faça o login novamente.";
          break;
        default:
            console.error("Link account error:", authError);
      }
      toast.error(errorMessage);
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border/50 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Salvar Progresso</DialogTitle>
          <DialogDescription>
            Crie uma conta para salvar suas listas e acessá-las de qualquer dispositivo. É rápido e fácil!
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3 glass border-border/50"
              placeholder="Seu nome completo"
              disabled={isLinking}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3 glass border-border/50"
              placeholder="seu@email.com"
              disabled={isLinking}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="col-span-3 glass border-border/50"
              placeholder="Mínimo 6 caracteres"
              disabled={isLinking}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleLinkAccount} 
            className="w-full gradient-primary border-none shadow-glow hover:shadow-lg transition-all duration-300"
            disabled={isLinking}
          >
            {isLinking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar e Criar Conta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LinkAnonymousAccountDialog;
