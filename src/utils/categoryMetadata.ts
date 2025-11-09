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
    color: string; // Tailwind CSS color class
  }
  
  const categoryMetadata: Record<Category, CategoryMetadata> = {
    "Hortifrúti": { icon: Carrot, color: "text-emerald-500" },
    "Carnes": { icon: Beef, color: "text-red-500" },
    "Laticínios": { icon: Milk, color: "text-blue-300" },
    "Frios": { icon: Slice, color: "text-yellow-400" },
    "Grãos e Cereais": { icon: Wheat, color: "text-amber-600" },
    "Padaria e Massas": { icon: Sandwich, color: "text-orange-400" },
    "Bebidas": { icon: CupSoda, color: "text-sky-500" },
    "Doces e Snacks": { icon: Cookie, color: "text-pink-400" },
    "Congelados": { icon: Snowflake, color: "text-cyan-400" },
    "Molhos e Condimentos": { icon: CookingPot, color: "text-rose-500" },
    "Óleos e Gorduras": { icon: Droplets, color: "text-yellow-600" },
    "Limpeza": { icon: SprayCan, color: "text-lime-500" },
    "Higiene": { icon: Sparkles, color: "text-indigo-400" },
    "Outros": { icon: Package, color: "text-slate-500" },
  };
  
  export const getCategoryStyle = (category: string): CategoryMetadata => {
    // Ensure the category is one of the defined types, otherwise return 'Outros'
    const validCategory = categories.includes(category as Category) ? category as Category : 'Outros';
    return categoryMetadata[validCategory];
  };