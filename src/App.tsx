import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation, Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Lists from "@/pages/Lists";
import Dashboard from "@/pages/Dashboard";
import Analytics from "@/pages/Analytics";
import NotFound from "@/pages/NotFound";

// Layout para rotas autenticadas
const ProtectedLayout = () => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      // Armazena a rota que o usuÃ¡rio tentou acessar para redirecionÃ¡-lo apÃ³s o login
      navigate("/auth", { state: { from: location } });
    } 
  }, [user, loading, navigate, location]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  // Se o usuÃ¡rio estiver autenticado, renderiza o conteÃºdo da rota filha
  return user ? <Outlet /> : null;
};

const App = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Index />} />

            {/* Rotas Protegidas */}
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/lists" element={<Lists />} />
              <Route path="/analytics" element={<Analytics />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
