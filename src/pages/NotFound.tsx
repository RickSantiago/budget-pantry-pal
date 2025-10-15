import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Home, ShoppingCart, BarChart, Bell, Settings, User, AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-24">
      {/* Header */}
      <div className="glass border-b border-border/50 sticky top-0 z-10 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">
                Página não encontrada
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate">
                Erro 404
              </p>
            </div>
            <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
              <ThemeToggle />
              <Button 
                variant="outline" 
                size="icon"
                className="glass rounded-full h-9 w-9 sm:h-10 sm:w-10"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Card className="glass border-border/50 p-8 sm:p-12 animate-scale-in rounded-xl sm:rounded-2xl text-center">
          <div className="flex flex-col items-center space-y-4 sm:space-y-6">
            <div className="bg-error/10 p-4 sm:p-6 rounded-full">
              <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-error" />
            </div>
            <div>
              <h2 className="text-4xl sm:text-6xl font-bold text-foreground mb-2">404</h2>
              <p className="text-lg sm:text-xl text-muted-foreground">
                Oops! Página não encontrada
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                A página que você está procurando não existe.
              </p>
            </div>
            <Button 
              onClick={() => navigate("/dashboard")}
              className="rounded-full px-6 sm:px-8"
            >
              <Home className="w-4 h-4 mr-2" />
              Voltar para o início
            </Button>
          </div>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 z-20">
        <Card className="glass border-border/50 shadow-glow rounded-2xl sm:rounded-3xl overflow-hidden">
          <div className="flex items-center justify-around p-1.5 sm:p-2">
            {[
              { icon: BarChart, text: "Gráficos", path: "/analytics" },
              { icon: ShoppingCart, text: "Lista", path: "/lists" },
              { icon: Home, text: "Home", path: "/dashboard" },
              { icon: Bell, text: "Avisos", path: "/dashboard" },
              { icon: Settings, text: "Config", path: "/dashboard" }
            ].map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className="flex-col h-auto py-1.5 sm:py-2 px-2 sm:px-4 gap-0.5 sm:gap-1 rounded-xl sm:rounded-2xl hover:bg-primary/10"
                onClick={() => navigate(item.path)}
              >
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-[10px] sm:text-xs">{item.text}</span>
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
