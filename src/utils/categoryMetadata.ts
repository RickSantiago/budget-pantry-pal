import {
    Wheat,
    Beef,
    Carrot,
    Milk,
    Sandwich,
    CupSoda,
    Cookie,
    Snowflake,
    CookingPot,
    SprayCan,
    Sparkles,
    Slice,
    Droplets,
    Package,
    LucideIcon
  } from 'lucide-react';
  
  export const categories = [
    "Hortifrúti",
    "Carnes",
    "Laticínios",
    "Frios",
    "Grãos e Cereais",
    "Padaria e Massas",
    "Bebidas",
    "Doces e Snacks",
    "Congelados",
    "Molhos e Condimentos",
    "Óleos e Gorduras",
    "Limpeza",
    "Higiene",
    "Outros"
  ] as const;
  
  type Category = typeof categories[number];
  
  interface CategoryMetadata {
    icon: LucideIcon;
    color: string; // Tailwind CSS color class for text
    bgColor: string; // Hex color code for background
  }
  
  const categoryMetadata: Record<Category, CategoryMetadata> = {
    "Hortifrúti": { icon: Carrot, color: "text-emerald-500", bgColor: "#10b981" },
    "Carnes": { icon: Beef, color: "text-red-500", bgColor: "#ef4444" },
    "Laticínios": { icon: Milk, color: "text-blue-300", bgColor: "#93c5fd" },
    "Frios": { icon: Slice, color: "text-yellow-400", bgColor: "#facc15" },
    "Grãos e Cereais": { icon: Wheat, color: "text-amber-600", bgColor: "#d97706" },
    "Padaria e Massas": { icon: Sandwich, color: "text-orange-400", bgColor: "#fb923c" },
    "Bebidas": { icon: CupSoda, color: "text-sky-500", bgColor: "#0ea5e9" },
    "Doces e Snacks": { icon: Cookie, color: "text-pink-400", bgColor: "#f472b6" },
    "Congelados": { icon: Snowflake, color: "text-cyan-400", bgColor: "#22d3ee" },
    "Molhos e Condimentos": { icon: CookingPot, color: "text-rose-500", bgColor: "#f43f5e" },
    "Óleos e Gorduras": { icon: Droplets, color: "text-yellow-600", bgColor: "#ca8a04" },
    "Limpeza": { icon: SprayCan, color: "text-lime-500", bgColor: "#84cc16" },
    "Higiene": { icon: Sparkles, color: "text-indigo-400", bgColor: "#818cf8" },
    "Outros": { icon: Package, color: "text-slate-500", bgColor: "#64748b" },
  };
  
  export const getCategoryStyle = (category: string): CategoryMetadata => {
    // Ensure the category is one of the defined types, otherwise return 'Outros'
    const validCategory = categories.includes(category as Category) ? category as Category : 'Outros';
    return categoryMetadata[validCategory];
  };