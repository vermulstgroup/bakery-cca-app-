import type { Product, Bakery, ExpenseCategory, UserRole } from './types';

export const PRODUCTS: Product[] = [
  { id: 'yeast_mandazi', name: 'Yeast Mandazi', emoji: '🥯', defaultPrice: 500, category: 'mandazi' },
  { id: 'instant_mandazi', name: 'Instant Mandazi', emoji: '🥯', defaultPrice: 400, category: 'mandazi' },
  { id: 'doughnuts', name: 'Doughnuts', emoji: '🍩', defaultPrice: 1000, category: 'pastry' },
  { id: 'daddies', name: 'Daddies', emoji: '🥐', defaultPrice: 800, category: 'pastry' },
  { id: 'samosa', name: 'Samosa', emoji: '🥟', defaultPrice: 1000, category: 'savory' },
  { id: 'half_cake', name: 'Half Cake', emoji: '🍰', defaultPrice: 5000, category: 'cake' },
  { id: 'kamba_kamba', name: 'Kamba Kamba', emoji: '🥨', defaultPrice: 600, category: 'pastry' },
  { id: 'loaf_1kg', name: 'Loaf 1kg', emoji: '🍞', defaultPrice: 6000, category: 'bread' },
  { id: 'loaf_500g', name: 'Loaf 500g', emoji: '🍞', defaultPrice: 3500, category: 'bread' },
  { id: 'brown_bread_1kg', name: 'Brown Bread 1kg', emoji: '🍞', defaultPrice: 6500, category: 'bread' },
  { id: 'brown_bread_500g', name: 'Brown Bread 500g', emoji: '🍞', defaultPrice: 4000, category: 'bread' },
  { id: 'soft_sweet_buns', name: 'Soft Sweet Buns', emoji: '🧁', defaultPrice: 800, category: 'buns' },
  { id: 'lemon_scones', name: 'Lemon Scones', emoji: '🥮', defaultPrice: 800, category: 'scones' },
  { id: 'fruit_scones', name: 'Fruit Scones', emoji: '🥮', defaultPrice: 1000, category: 'scones' },
  { id: 'raspberry_cookies', name: 'Raspberry Cookies', emoji: '🍪', defaultPrice: 500, category: 'cookies' },
  { id: 'banana_cake', name: 'Banana Cake', emoji: '🍰', defaultPrice: 5000, category: 'cake' },
  { id: 'queen_cake', name: 'Queen Cake', emoji: '🎂', defaultPrice: 5000, category: 'cake' },
  { id: 'wedding_cake', name: 'Wedding Cake', emoji: '🎂', defaultPrice: 50000, category: 'cake' },
  { id: 'spatula_cookies', name: 'Spatula Cookies', emoji: '🍪', defaultPrice: 500, category: 'cookies' },
  { id: 'italian_cookies', name: 'Italian Cookies', emoji: '🍪', defaultPrice: 600, category: 'cookies' },
  { id: 'gnut_biscuit', name: 'Gnut Biscuit', emoji: '🥜', defaultPrice: 500, category: 'biscuits' },
  { id: 'muffin', name: 'Muffin', emoji: '🧁', defaultPrice: 1500, category: 'pastry' },
  { id: 'plain_biscuit', name: 'Plain Biscuit', emoji: '🍪', defaultPrice: 400, category: 'biscuits' },
  { id: 'spritz_cookies', name: 'Spritz Cookies', emoji: '🍪', defaultPrice: 500, category: 'cookies' },
  { id: 'sweet_rolls', name: 'Sweet Rolls', emoji: '🥐', defaultPrice: 1000, category: 'buns' },
  { id: 'chapati', name: 'Chapati', emoji: '🫓', defaultPrice: 1000, category: 'bread' },
  { id: 'carrot_cake', name: 'Carrot Cake', emoji: '🥕', defaultPrice: 5000, category: 'cake' },
  { id: 'plaited_bread', name: 'Plaited Bread', emoji: '🥖', defaultPrice: 7000, category: 'bread' }
];

export const BAKERIES: Bakery[] = [
  { id: 'morulem', name: 'Morulem', region: 'Moroto' },
  { id: 'matany', name: 'Matany', region: 'Moroto' },
  { id: 'katakwi', name: 'Katakwi', region: 'Teso' },
  { id: 'amudat', name: 'Amudat', region: 'Amudat' },
  { id: 'kaabong', name: 'Kaabong', region: 'Kaabong' }
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

export const ROLES: { [key: string]: UserRole } = {
  MANAGER: {
    id: 'manager',
    name: 'Manager',
    description: "Enter and edit your bakery's data",
    icon: '👤',
    permissions: {
      canView: ['own_bakery'],
      canEdit: ['own_bakery']
    }
  },
  SUPERVISOR: {
    id: 'supervisor',
    name: 'Supervisor',
    description: "View all bakeries (read-only)",
    icon: '👁️',
    permissions: {
      canView: ['all_bakeries'],
      canEdit: []
    }
  }
};

export const LANGUAGES = [
  { name: 'English', code: 'en' },
  { name: 'Karamojong', code: 'kj' },
  { name: 'Acholi', code: 'ach' },
  { name: 'Teso', code: 'tes' },
];
