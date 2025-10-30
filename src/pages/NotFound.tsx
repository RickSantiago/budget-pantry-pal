import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AppHeader from "@/components/AppHeader";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Home,
  ShoppingCart,
  BarChart,
  Bell,
  Settings,
  User,
  AlertCircle,
} from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-24">
      <AppHeader
        title="Página não encontrada"
        subtitle="Erro 404"
        rightNode={
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="icon" className="glass rounded-full h-9 w-9 sm:h-10 sm:w-10">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        }
      />

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Card className="glass border-border/50 p-8 sm:p-12 animate-scale-in rounded-xl sm:rounded-2xl text-center">
          <div className="flex flex-col items-center space-y-4 sm:space-y-6">
            <div className="bg-error/10 p-4 sm:p-6 rounded-full">
              <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-error" />
            </div>
            <div>
              <h2 className="text-4xl sm:text-6xl font-bold text-foreground mb-2">
                404
              </h2>
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
      <BottomNavigation />
    </div>
  );
};

export default NotFound;
