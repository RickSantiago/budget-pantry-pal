import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import AppHeader from "@/components/AppHeader";
import { auth, googleProvider } from "@/firebase";
import { signInWithPopup } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, loading, authError] = useAuthState(auth);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log("Google sign in successful, user:", user);
      toast.success(`Bem-vindo, ${user.displayName || user.email}!`);
      navigate("/lists");
    } catch (error) {
      console.error("Error during Google sign in:", error);
      toast.error("Erro ao fazer login com o Google");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic for email/password auth
    // For now, let's just navigate to dashboard on any submission
    navigate("/dashboard");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 pb-24">
      <AppHeader title="Lista Inteligente" hideThemeToggle />

      <div className="w-full max-w-md mx-auto animate-fade-in py-8">
        <div className="text-center mb-6 sm:mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full gradient-primary mb-3 sm:mb-4 shadow-glow">
            <ShoppingCart className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Lista Inteligente
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1.5 sm:mt-2">
            Organize suas compras de forma inteligente
          </p>
        </div>

        <Card className="glass border-none shadow-lg p-5 sm:p-8 animate-scale-in rounded-xl sm:rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="email" className="text-sm">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass border-border/50 h-10 sm:h-11 text-sm"
                required
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="password" className="text-sm">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass border-border/50 h-10 sm:h-11 text-sm"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full gradient-primary border-none shadow-glow hover:shadow-lg transition-all duration-300 h-10 sm:h-11 text-sm sm:text-base"
            >
              {isLogin ? "Entrar" : "Criar conta"}
              <ArrowRight className="ml-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          </form>

          <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full glass border-border/50 hover:bg-primary/5 h-10 sm:h-11 text-sm sm:text-base flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.35 11.1h-9.18v2.96h5.26c-.23 1.34-1.21 2.48-2.58 3.18v2.64h4.18c2.45-2.24 3.87-5.6 3.87-9.44 0-.64-.06-1.26-.15-1.86z" fill="#4285F4"/><path d="M12.17 22c2.75 0 5.06-.9 6.75-2.45l-4.18-2.64c-1.16.78-2.65 1.24-4.06 1.24-3.12 0-5.77-2.1-6.71-4.95H1.22v3.11C2.93 19.92 7.24 22 12.17 22z" fill="#34A853"/><path d="M5.46 13.16A7.01 7.01 0 0112.17 7c1.05 0 2.05.25 2.95.71l2.2-2.2C16.92 4.17 14.66 3.5 12.17 3.5 7.24 3.5 2.93 5.58 1.22 8.89l4.24 3.27z" fill="#FBBC05"/><path d="M12.17 4.5c1.83 0 3.47.62 4.76 1.84l2.2-2.2C17.23 1.98 14.92 1 12.17 1 7.24 1 2.93 3.08 1.22 6.39l4.24 3.27C6.4 8.21 8.05 4.5 12.17 4.5z" fill="#EA4335"/></svg>
              Entrar com o Google
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isLogin ? "Não tem conta? " : "Já tem conta? "}
                <span className="font-semibold text-primary">
                  {isLogin ? "Cadastre-se" : "Faça login"}
                </span>
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
