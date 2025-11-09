import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart, ShoppingCart, Home, User, LayoutGrid } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useRef } from "react";

const navigationItems = [
  { icon: BarChart, text: "Gráficos", path: "/analytics" },
  { icon: ShoppingCart, text: "Lista", path: "/lists" },
  { icon: Home, text: "Home", path: "/dashboard" },
  { icon: LayoutGrid, text: "Despensa", path: "/pantry" },
  { icon: User, text: "Perfil", path: "/profile" },
];

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const current = location.pathname;

  // Track active index to ensure animations trigger consistently for all items
  const [activeIndex, setActiveIndex] = useState(() =>
    navigationItems.findIndex((it) => current === it.path || (it.path !== "/" && current.startsWith(it.path)))
  );

  // timer ref for delayed navigation (so animations are visible)
  const navTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const idx = navigationItems.findIndex((it) => current === it.path || (it.path !== "/" && current.startsWith(it.path)));
    setActiveIndex(idx);

    return () => {
      if (navTimerRef.current) {
        window.clearTimeout(navTimerRef.current);
        navTimerRef.current = null;
      }
    };
  }, [current]);

  return (
    <div className="fixed bottom-2 sm:bottom-3 left-1/2 transform -translate-x-1/2 z-20">
      <Card className="glass border-border/50 shadow-glow rounded-2xl sm:rounded-[60px] overflow-hidden max-w-[420px] w-auto">
        <div className="flex items-center justify-center gap-0.5 sm:gap-1 p-3">
          {navigationItems.map((item, index) => {
            const isActive =
              current === item.path ||
              (item.path !== "/" && current.startsWith(item.path));

            const baseClass = `inline-flex items-center gap-1 sm:gap-2 transition-transform duration-300 ease-in-out transform rounded-3xl focus:outline-none will-change-transform`;
            const activeClass = `bg-primary text-white px-4 py-1.5 shadow-sm font-semibold scale-105`;
            const inactiveClass = `px-2 py-1.5 text-muted-foreground hover:bg-primary/5 scale-100`;

            const Icon = item.icon;

            const active = index === activeIndex;

            return (
              <Button
                key={index}
                variant="ghost"
                onClick={() => {
                  // trigger local animation immediately
                  setActiveIndex(index);
                  // delay navigation slightly so animation can run
                  if (navTimerRef.current) window.clearTimeout(navTimerRef.current);
                  navTimerRef.current = window.setTimeout(() => {
                    navigate(item.path);
                    navTimerRef.current = null;
                  }, 140);
                }}
                className={`${baseClass} ${active ? activeClass : inactiveClass}`}
              >
                <Icon
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 ${
                    active ? "text-white" : "text-muted-foreground"
                  }`}
                />

                <span
                  className={`overflow-hidden transition-[max-width,opacity,margin] duration-300 ease-in-out whitespace-nowrap text-sm sm:text-sm ${
                    active
                      ? "max-w-[5.5rem] opacity-100 ml-2"
                      : "max-w-0 opacity-0 ml-0"
                  }`}
                >
                  {item.text}
                </span>
              </Button>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default BottomNavigation;
