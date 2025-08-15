export enum Priority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum Category {
  KITCHEN = 'Kitchen',
  BATHROOM = 'Bathroom',
  BEDROOM = 'Bedroom',
  LIVING_ROOM = 'Living Room',
  DINING_ROOM = 'Dining Room',
  LAUNDRY = 'Laundry',
  OUTDOOR = 'Outdoor'
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUri?: string;
  productURL?: string;
  priority: Priority;
  quantity: number;
  quantityReceived: number;
  notes: string;
  category: Category;
  dateAdded: Date;
  isPurchased: boolean;
  purchasedBy?: string;
}

export interface FilterOptions {
  category?: Category;
  priority?: Priority;
  priceRange?: {
    min: number;
    max: number;
  };
  purchaseStatus?: 'all' | 'purchased' | 'unpurchased';
  searchQuery?: string;
}

export interface BudgetStats {
  totalItems: number;
  totalValue: number;
  receivedValue: number;
  remainingValue: number;
  completionPercentage: number;
}