import { 
  Wheat, 
  Beef, 
  Apple, 
  Milk, 
  Croissant, 
  Coffee, 
  Candy, 
  Snowflake, 
  UtensilsCrossed, 
  Sparkles, 
  Droplets, 
  IceCream2, 
  Droplet, 
  ShoppingBag,
  LucideIcon
} from "lucide-react";

export const categoryIcons: Record<string, LucideIcon> = {
  "Grãos e Cereais": Wheat,
  "Carnes": Beef,
  "Hortifrúti": Apple,
  "Laticínios": Milk,
  "Padaria e Massas": Croissant,
  "Bebidas": Coffee,
  "Doces e Snacks": Candy,
  "Congelados": Snowflake,
  "Molhos e Condimentos": UtensilsCrossed,
  "Limpeza": Sparkles,
  "Higiene": Droplets,
  "Frios": IceCream2,
  "Oleos e Gorduras": Droplet,
  "Outros": ShoppingBag,
};

export const getCategoryIcon = (category?: string): LucideIcon => {
  if (!category) return ShoppingBag;
  return categoryIcons[category] || ShoppingBag;
};
