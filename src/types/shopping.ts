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
  observation?: string;
  date?: string;
  plannedBudget?: number;
  // backward-compatible owner fields — some files used `owner` and others `ownerId`
  owner?: string;
  ownerId?: string;
  // collaborators
  sharedWith?: string[];
  members?: string[];
  // optional convenience: some components may render a list of items embedded
  items?: ShoppingItem[];
  createdAt?: string;
}
