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
  totalSpent?: number;
  // backward-compatible owner fields — some files used `owner` and others `ownerId`
  owner?: string;
  ownerId?: string;
  // collaborators
  sharedWith?: string[];
  members?: string[];
  // public sharing
  isPublic?: boolean;
  // optional convenience: some components may render a list of items embedded
  items?: ShoppingItem[];
  createdAt?: string;
}

export interface PantryItem {
  id: string; // Firestore document ID
  name: string;
  category?: string;
  quantity?: number;
  unit?: string;
  price?: number; // Price at the time of purchase
  supermarket?: string;
  purchaseDate: string; // Date the item was added to the pantry
  expiryDate: string;   // Expiry date is mandatory for pantry items
  ownerId: string; // To identify the owner of the item
}
