// Product type with profitability data
export type Product = {
  id: string;
  name: string;
  emoji: string;
  defaultPrice: number;
  category: string;
  // Profitability data per kg of flour
  revenuePerKgFlour: number;
  costPerKgFlour: number;
  color: string;
};

// Bakery with manager info
export type Bakery = {
  id: string;
  name: string;
  region: string;
  manager: string;
};

export type ExpenseCategory = {
  id: string;
  name: string;
  emoji: string;
  quickAmounts: number[];
};

// Role type IDs
export type RoleId = 'bakery-manager' | 'strategic-manager' | 'supervisor';

// Extended role type with features
export type UserRole = {
  id: RoleId;
  name: string;
  description: string;
  icon: string;
  color: string;
  permissions: {
    canView: string[];
    canEdit: string[];
    features: string[];
  };
};

// Onboarding data with new role type
export type OnboardingData = {
  bakery?: string;
  role?: RoleId;
  products?: string[];
  prices?: { [productId: string]: number };
  userId?: string;
};

// Legacy daily entry data (for backwards compatibility)
export type DailyEntryData = {
  production: { [productId: string]: number };
  sales: { [productId: string]: number };
  damages: { [productId: string]: number };
};

// Legacy daily entry (for backwards compatibility)
export type DailyEntryLegacy = {
  date: string;
  quantities: DailyEntryData;
  bakeryId: string;
  closingStock?: { [productId: string]: number };
};

// New production data structure (kg-flour based)
export type ProductionItem = {
  kgFlour: number;
  productionValueUGX: number;
  ingredientCostUGX: number;
};

// New daily entry structure
export type DailyEntry = {
  date: string;
  bakeryId: string;
  // New kg-flour based production (optional for backwards compat)
  production?: {
    [productId: string]: ProductionItem;
  };
  // Sales in UGX (optional for backwards compat)
  sales?: {
    [productId: string]: number;
  };
  // Calculated totals (optional for backwards compat)
  totals?: {
    productionValue: number;
    ingredientCost: number;
    salesTotal: number;
    profit: number;
    margin: number;
  };
  // Legacy support
  quantities?: DailyEntryData;
  closingStock?: { [productId: string]: number };
  // Metadata
  timestamp?: number;
};

export type WeeklyExpense = {
  weekStartDate: string;
  expenses: { [categoryId: string]: number };
};

export type UserProfile = {
  userId: string;
  bakeryId: string;
  role: RoleId;
  products: string[];
  prices: { [productId: string]: number };
};

// Bakery performance data for supervisor dashboard
export type BakeryPerformance = {
  bakeryId: string;
  bakeryName: string;
  manager: string;
  status: 'profitable' | 'loss' | 'breakeven' | 'nodata';
  weeklySales: number;
  weeklyProfit: number;
  margin: number;
  trend: 'up' | 'down' | 'flat';
};

// Weekly data for strategic dashboard
export type WeeklyData = {
  week: string;
  date: string;
  production: number;
  sales: number;
  costs: number;
  profit: number;
  margin: string;
};
