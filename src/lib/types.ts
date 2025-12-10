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
};
