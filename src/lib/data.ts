import type { Product, Bakery, ExpenseCategory, UserRole } from './types';

// Key products with full profitability data (from Maarten's reference table)
export const PRODUCTS: Product[] = [
  {
    id: 'yeast-mandazi',
    name: 'Yeast Mandazi',
    emoji: '🥯',
    defaultPrice: 500,
    category: 'mandazi',
    revenuePerKgFlour: 9300,
    costPerKgFlour: 5200,
    color: '#f59e0b'  // amber
  },
  {
    id: 'daddies',
    name: 'Daddies',
    emoji: '🍩',
    defaultPrice: 800,
    category: 'pastry',
    revenuePerKgFlour: 10300,
    costPerKgFlour: 5700,
    color: '#ec4899'  // pink
  },
  {
    id: 'italian-cookies',
    name: 'Italian Cookies',
    emoji: '🍪',
    defaultPrice: 600,
    category: 'cookies',
    revenuePerKgFlour: 12500,
    costPerKgFlour: 7100,
    color: '#8b5cf6'  // purple
  }
];

// Bakeries with manager names
export const BAKERIES: Bakery[] = [
  { id: 'morulem', name: 'Morulem', region: 'Moroto', manager: 'Flavia' },
  { id: 'matany', name: 'Matany', region: 'Moroto', manager: 'Yona' },
  { id: 'katakwi', name: 'Katakwi', region: 'Teso', manager: 'Peter' },
  { id: 'amudat', name: 'Amudat', region: 'Amudat', manager: 'Grace' },
  { id: 'kaabong', name: 'Kaabong', region: 'Kaabong', manager: 'David' }
];

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 'ingredients', name: 'Ingredients', emoji: '🛒', quickAmounts: [100000, 250000, 500000] },
  { id: 'salaries', name: 'Salaries', emoji: '👷', quickAmounts: [50000, 100000, 200000] },
  { id: 'fuel', name: 'Fuel', emoji: '⛽', quickAmounts: [20000, 50000, 100000] },
  { id: 'breakfast_lunch', name: 'Breakfast/Lunch', emoji: '🍽️', quickAmounts: [10000, 25000, 50000] },
  { id: 'firewood', name: 'Firewood', emoji: '🪵', quickAmounts: [20000, 50000, 100000] },
  { id: 'packaging', name: 'Packaging', emoji: '📦', quickAmounts: [10000, 25000, 50000] },
  { id: 'gas_electricity', name: 'Gas/Electricity', emoji: '💡', quickAmounts: [20000, 50000, 100000] },
  { id: 'loan_rent', name: 'Loan/Rent', emoji: '🏠', quickAmounts: [50000, 100000, 200000] },
  { id: 'other', name: 'Other', emoji: '📋', quickAmounts: [10000, 25000, 50000] }
];

// 3-role system
export const ROLES: { [key: string]: UserRole } = {
  BAKERY_MANAGER: {
    id: 'bakery-manager',
    name: 'Bakery Manager',
    description: 'Enter daily production and sales data',
    icon: '👨‍🍳',
    color: '#f59e0b',  // amber
    permissions: {
      canView: ['own_bakery'],
      canEdit: ['own_bakery'],
      features: ['daily_entry', 'summary', 'history']
    }
  },
  STRATEGIC_MANAGER: {
    id: 'strategic-manager',
    name: 'Strategic Manager',
    description: 'View 12-week reports and analytics',
    icon: '📊',
    color: '#60a5fa',  // blue
    permissions: {
      canView: ['own_bakery'],
      canEdit: [],
      features: ['strategic_dashboard', 'trends', 'export']
    }
  },
  SUPERVISOR: {
    id: 'supervisor',
    name: 'Supervisor',
    description: 'Monitor all bakeries (read-only)',
    icon: '👁️',
    color: '#a78bfa',  // purple
    permissions: {
      canView: ['all_bakeries'],
      canEdit: [],
      features: ['supervisor_dashboard', 'alerts']
    }
  }
};

export const LANGUAGES = [
  { name: 'English', code: 'en' },
  { name: 'Karamojong', code: 'kj' },
  { name: 'Acholi', code: 'ach' },
  { name: 'Teso', code: 'tes' },
  { name: 'Luganda', code: 'lg' },
];

// Helper to get product by ID
export const getProductById = (id: string): Product | undefined => {
  return PRODUCTS.find(p => p.id === id);
};

// Helper to get bakery by ID
export const getBakeryById = (id: string): Bakery | undefined => {
  return BAKERIES.find(b => b.id === id);
};

// Calculate profit margin for a product
export const getProductMargin = (product: Product): number => {
  return product.revenuePerKgFlour - product.costPerKgFlour;
};

// Calculate margin percentage for a product
export const getProductMarginPercent = (product: Product): number => {
  return Math.round(((product.revenuePerKgFlour - product.costPerKgFlour) / product.revenuePerKgFlour) * 100);
};
