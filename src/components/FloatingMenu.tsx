import { Home, List, BarChart3, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const menuItems = [
  { icon: Home, label: "Início", path: "/lists" },
  { icon: List, label: "Listas", path: "/lists" },
  { icon: BarChart3, label: "Análises", path: "/analytics" },
  { icon: Settings, label: "Configurações", path: "/settings" },
];

const FloatingMenu = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="glass rounded-3xl px-6 py-3 shadow-lg border border-border/50">
        <div className="flex items-center gap-8">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                  isActive 
                    ? "text-primary scale-110" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FloatingMenu;
