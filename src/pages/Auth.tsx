import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Temporary implementation without backend
    if (isLogin) {
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    } else {
      if (!name || !email || !password) {
        toast.error("Por favor, preencha todos os campos");
        return;
      }
      toast.success("Cadastro realizado com sucesso!");
      navigate("/dashboard");
    }
  };

  const handleGuestAccess = () => {
    localStorage.setItem("guest-mode", "true");
    toast.success("Acesso como convidado");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="w-full max-w-md animate-fade-in">
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
            {!isLogin && (
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="name" className="text-sm">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="glass border-border/50 h-10 sm:h-11 text-sm"
                  required={!isLogin}
                />
              </div>
            )}

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
              onClick={handleGuestAccess}
              variant="outline"
              className="w-full glass border-border/50 hover:bg-primary/5 h-10 sm:h-11 text-sm sm:text-base"
            >
              Entrar como convidado
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
