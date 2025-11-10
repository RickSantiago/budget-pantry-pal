import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ShoppingCart, ArrowRight, Loader2, User, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import AppHeader from "@/components/AppHeader";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect } from "react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate("/lists");
    }
  }, [user, loading, navigate]);

  const handleAuthError = (error: any) => {
    setIsAuthenticating(false);
    let errorMessage = "Ocorreu um erro inesperado. Tente novamente.";

    switch (error.code) {
      case "auth/email-already-in-use":
        errorMessage = "Este e-mail já está cadastrado.";
        break;
      case "auth/invalid-email":
        errorMessage = "O formato do e-mail é inválido.";
        break;
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        errorMessage = "E-mail ou senha incorretos.";
        break;
      case "auth/weak-password":
        errorMessage = "A senha é muito fraca. Use pelo menos 6 caracteres.";
        break;
      case "auth/popup-closed-by-user":
        errorMessage = "O processo de login foi cancelado.";
        break;
      default:
        console.error("Authentication Error:", error);
    }
    toast.error(errorMessage);
  };
  
  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      toast.success(`Bem-vindo, ${result.user.displayName || result.user.email}!`);
      navigate("/lists");
    } catch (error) {
      handleAuthError(error);
    }
  };

  const handleAnonymousSignIn = async () => {
    setIsAuthenticating(true);
    try {
      await signInAnonymously(auth);
      toast.success("Bem-vindo! Você está navegando como convidado.");
      navigate("/lists");
    } catch (error) {
      handleAuthError(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!isLogin && !name.trim()) || !email.trim() || !password.trim()) {
        toast.error("Por favor, preencha todos os campos.");
        return;
    }

    setIsAuthenticating(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Login realizado com sucesso!");
      } else {
        if (password.length < 6) {
          throw { code: 'auth/weak-password' };
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        toast.success(`Conta criada com sucesso, bem-vindo ${name}!`);
      }
      navigate("/lists");
    } catch (error: any) {
      handleAuthError(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary mb-4 shadow-glow animate-pulse">
            <ShoppingCart className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 pb-24">
      {/* <AppHeader title="Market Match" hideThemeToggle /> */}

      <div className="w-full max-w-md mx-auto animate-fade-in py-8">
        <div className="text-center mb-6 sm:mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full gradient-primary mb-3 sm:mb-4 shadow-glow">
            <ShoppingCart className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Market Match
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
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="glass border-border/50 h-10 sm:h-11 text-sm"
                  required
                  disabled={isAuthenticating}
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
                disabled={isAuthenticating}
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2 relative">
              <Label htmlFor="password" className="text-sm">Senha</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass border-border/50 h-10 sm:h-11 text-sm pr-10"
                required
                disabled={isAuthenticating}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-7 h-8 w-8 text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>

            <Button
              type="submit"
              className="w-full gradient-primary border-none shadow-glow hover:shadow-lg transition-all duration-300 h-10 sm:h-11 text-sm sm:text-base"
              disabled={isAuthenticating}
            >
              {isAuthenticating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLogin ? "Entrar" : "Criar conta"}
              {!isAuthenticating && <ArrowRight className="ml-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />}
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
              disabled={isAuthenticating}
            >
              {isAuthenticating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.35 11.1h-9.18v2.96h5.26c-.23 1.34-1.21 2.48-2.58 3.18v2.64h4.18c2.45-2.24 3.87-5.6 3.87-9.44 0-.64-.06-1.26-.15-1.86z" fill="#4285F4"/><path d="M12.17 22c2.75 0 5.06-.9 6.75-2.45l-4.18-2.64c-1.16.78-2.65 1.24-4.06 1.24-3.12 0-5.77-2.1-6.71-4.95H1.22v3.11C2.93 19.92 7.24 22 12.17 22z" fill="#34A853"/><path d="M5.46 13.16A7.01 7.01 0 0112.17 7c1.05 0 2.05.25 2.95.71l2.2-2.2C16.92 4.17 14.66 3.5 12.17 3.5 7.24 3.5 2.93 5.58 1.22 8.89l4.24 3.27z" fill="#FBBC05"/><path d="M12.17 4.5c1.83 0 3.47.62 4.76 1.84l2.2-2.2C17.23 1.98 14.92 1 12.17 1 7.24 1 2.93 3.08 1.22 6.39l4.24 3.27C6.4 8.21 8.05 4.5 12.17 4.5z" fill="#EA4335"/></svg>}
              Entrar com o Google
            </Button>

            <Button
              type="button"
              onClick={handleAnonymousSignIn}
              variant="secondary"
              className="w-full glass border-border/50 hover:bg-secondary/60 h-10 sm:h-11 text-sm sm:text-base flex items-center justify-center gap-2"
              disabled={isAuthenticating}
            >
              {isAuthenticating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <User className="w-4 h-4" />}
              Entrar como Convidado
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setName("");
                  setEmail("");
                  setPassword("");
                }}
                className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
                disabled={isAuthenticating}
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
