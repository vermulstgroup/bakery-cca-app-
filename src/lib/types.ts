export type Product = {
  id: string;
  name: string;
  emoji: string;
  defaultPrice: number;
  category: string;
};

export type Bakery = {
  id: string;
  name: string;
  region: string;
};

export type ExpenseCategory = {
  id: string;
  name: string;
  emoji: string;
  quickAmounts: number[];
};

export type UserRole = {
  id: 'manager' | 'supervisor';
  name: string;
  description: string;
  icon: string;
  permissions: {
    canView: string[];
    canEdit: string[];
  }
};

export type OnboardingData = {
  bakery?: string;
  role?: 'manager' | 'supervisor';
  products?: string[];
  prices?: { [productId: string]: number };
  userId?: string;
};

export type DailyEntryData = {
  production: { [productId: string]: number };
  sales: { [productId: string]: number };
  damages: { [productId: string]: number };
};

export type DailyEntry = {
    date: string;
    quantities: DailyEntryData;
    bakeryId: string;
    closingStock?: { [productId: string]: number };
};

export type WeeklyExpense = {
    weekStartDate: string;
    expenses: { [categoryId: string]: number };
};

export type UserProfile = {
  userId: string;
  bakeryId: string;
  role: 'manager' | 'supervisor';
  products: string[];
  prices: { [productId: string]: number };
}
