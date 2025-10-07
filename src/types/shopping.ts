export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  checked: boolean;
  supermarket?: string;
}

export interface ShoppingList {
  id: string;
  title: string;
  observation: string;
  date: string;
  items: ShoppingItem[];
}
