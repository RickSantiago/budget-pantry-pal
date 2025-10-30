export interface ShoppingItem {
  id: string;
  name: string;
  category?: string;
  quantity?: number;
  unit?: string;
  price?: number;
  checked: boolean;
  supermarket?: string;
  expiryDate?: string;
  isRecurring?: boolean;
}

export interface ShoppingList {
  id: string;
  title: string;
  observation: string;
  date: string;
  plannedBudget?: number;
  items: ShoppingItem[];
}
