import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, Loader2, User, Eye, EyeOff, Mail, Lock, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import Particles from "@/components/ui/Particles";

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in p-4">
           <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-background/80 mb-4 shadow-lg animate-pulse">
            <ShoppingCart className="w-8 h-8 text-primary" />
          </div>
          <p className="text-lg font-semibold text-foreground/80">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        <Particles />
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <main className="w-full max-w-sm mx-auto animate-fade-in z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{isLogin ? "Bem-vindo!" : "Crie sua conta"}</h1>
          <p className="text-muted-foreground mt-2 text-sm">{isLogin ? "Faça login para continuar" : "Desbloqueie todos os recursos"}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background/80 h-12 pl-10 rounded-lg border-border/50 focus:border-primary"
                required
                disabled={isAuthenticating}
              />
            </div>
          )}
          <div className="relative">
             <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
             <Input
              id="email"
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background/80 h-12 pl-10 rounded-lg border-border/50 focus:border-primary"
              required
              disabled={isAuthenticating}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background/80 h-12 pl-10 pr-10 rounded-lg border-border/50 focus:border-primary"
              required
              disabled={isAuthenticating}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-muted-foreground hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </Button>
          </div>

          {isLogin && (
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                    <Checkbox id="remember-me" className="rounded-[4px] border-muted-foreground/50 data-[state=checked]:bg-foreground data-[state=checked]:text-background" />
                    <Label htmlFor="remember-me" className="text-sm font-normal text-muted-foreground">Lembrar de mim</Label>
                </div>
              <a href="#" className="text-sm font-medium text-foreground hover:underline">Esqueceu a senha?</a>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-foreground text-background font-semibold hover:bg-foreground/90 transition-all duration-300 h-12 rounded-lg text-base"
            disabled={isAuthenticating}
          >
            {isAuthenticating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {isLogin ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 border-t border-border/50"></div>
            <span className="text-xs uppercase text-muted-foreground">ou</span>
            <div className="flex-1 border-t border-border/50"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                onClick={handleGoogleSignIn}
                variant="outline"
                className="w-full bg-background/80 border-border/50 hover:bg-background/100 hover:text-foreground h-11 rounded-lg flex items-center justify-center gap-2"
                disabled={isAuthenticating}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.35 11.1h-9.18v2.96h5.26c-.23 1.34-1.21 2.48-2.58 3.18v2.64h4.18c2.45-2.24 3.87-5.6 3.87-9.44 0-.64-.06-1.26-.15-1.86z" fill="#4285F4"/><path d="M12.17 22c2.75 0 5.06-.9 6.75-2.45l-4.18-2.64c-1.16.78-2.65 1.24-4.06 1.24-3.12 0-5.77-2.1-6.71-4.95H1.22v3.11C2.93 19.92 7.24 22 12.17 22z" fill="#34A853"/><path d="M5.46 13.16A7.01 7.01 0 0112.17 7c1.05 0 2.05.25 2.95.71l2.2-2.2C16.92 4.17 14.66 3.5 12.17 3.5 7.24 3.5 2.93 5.58 1.22 8.89l4.24 3.27z" fill="#FBBC05"/><path d="M12.17 4.5c1.83 0 3.47.62 4.76 1.84l2.2-2.2C17.23 1.98 14.92 1 12.17 1 7.24 1 2.93 3.08 1.22 6.39l4.24 3.27C6.4 8.21 8.05 4.5 12.17 4.5z" fill="#EA4335"/></svg>
                Google
              </Button>

              <Button
                type="button"
                onClick={handleAnonymousSignIn}
                variant="outline"
                className="w-full bg-background/80 border-border/50 hover:bg-background/100 hover:text-foreground h-11 rounded-lg flex items-center justify-center gap-2"
                disabled={isAuthenticating}
              >
                <User className="w-5 h-5" />
                Convidado
              </Button>
          </div>

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setName("");
                setEmail("");
                setPassword("");
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              disabled={isAuthenticating}
            >
              {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
              <span className="font-semibold text-foreground">
                {isLogin ? "Cadastre-se" : "Faça login"}
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Auth;
