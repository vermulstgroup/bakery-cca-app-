/**
 * Seed demo data for CCA Bakery Monday presentation
 *
 * Creates 5 days of data for 3 bakeries:
 * - Morulem: PROFITABLE (high sales, good margins)
 * - Matany: BREAK-EVEN (sales roughly equal costs)
 * - Katakwi: LOSS (low sales, higher expenses)
 */

import { createClient } from '@supabase/supabase-js';
import { format, subDays, startOfWeek, addDays } from 'date-fns';

const supabaseUrl = 'https://hpedebpcqmczebhzupsl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwZWRlYnBjcW1jemViaHp1cHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4Mzg2NjgsImV4cCI6MjA4MjQxNDY2OH0.85oXRGm9aylsPxU-xpR2p6Zvom2ZL11xZ0XY0n3-kfc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Product margins from data.ts
const PRODUCTS = {
  'yeast-mandazi': { revenue: 9300, cost: 5200 },
  'daddies': { revenue: 10300, cost: 5700 },
  'italian-cookies': { revenue: 12500, cost: 7100 }
};

// Get current week dates (Mon-Sun)
const today = new Date();
const weekStart = startOfWeek(today, { weekStartsOn: 1 });

// Generate entries for bakery
function generateDailyEntry(bakeryId, date, profile) {
  const production = {};
  const sales = {};
  let totalProdValue = 0;
  let totalIngredientCost = 0;
  let totalSales = 0;

  // Generate production/sales for each product
  for (const [productId, margins] of Object.entries(PRODUCTS)) {
    const kgFlour = profile.flourKg[productId] + (Math.random() - 0.5) * 2; // Some variation
    const safeKg = Math.max(0, kgFlour);

    const prodValue = safeKg * margins.revenue;
    const ingredientCost = safeKg * margins.cost;

    // Sales = production * sell-through rate (varies by profile)
    const sellThrough = profile.sellThrough + (Math.random() - 0.5) * 0.1;
    const safeSellThrough = Math.min(1, Math.max(0.5, sellThrough));
    const saleAmount = Math.round(prodValue * safeSellThrough);

    production[productId] = {
      kgFlour: parseFloat(safeKg.toFixed(1)),
      productionValueUGX: Math.round(prodValue),
      ingredientCostUGX: Math.round(ingredientCost)
    };

    sales[productId] = saleAmount;

    totalProdValue += prodValue;
    totalIngredientCost += ingredientCost;
    totalSales += saleAmount;
  }

  // Profit includes deductions for replacements and bonuses
  const othersDeductions = profile.replacements + profile.bonuses;
  const profit = totalSales - totalIngredientCost - othersDeductions;
  const margin = totalSales > 0 ? (profit / totalSales) * 100 : 0;

  return {
    bakery_id: bakeryId,
    date: format(date, 'yyyy-MM-dd'),
    production,
    sales,
    others: { replacements: profile.replacements, bonuses: profile.bonuses, debts: 0 },
    totals: {
      productionValue: Math.round(totalProdValue),
      ingredientCost: Math.round(totalIngredientCost),
      salesTotal: Math.round(totalSales),
      profit: Math.round(profit),
      margin: parseFloat(margin.toFixed(1))
    },
    closing_stock: {},
    updated_at: new Date().toISOString()
  };
}

// Bakery profiles - Adjusted for demo variety
const profiles = {
  // MORULEM: PROFITABLE - High production, high sell-through, low overhead
  morulem: {
    flourKg: { 'yeast-mandazi': 12, 'daddies': 8, 'italian-cookies': 6 },
    sellThrough: 0.95, // 95% sell-through
    replacements: 5000,
    bonuses: 10000
  },
  // MATANY: BREAK-EVEN - Medium production, okay sell-through, moderate overhead
  matany: {
    flourKg: { 'yeast-mandazi': 7, 'daddies': 5, 'italian-cookies': 4 },
    sellThrough: 0.78, // 78% sell-through - some waste
    replacements: 18000,  // Slightly higher to hit break-even
    bonuses: 17000
  },
  // KATAKWI: LOSS - Low production, poor sell-through, very high overhead
  katakwi: {
    flourKg: { 'yeast-mandazi': 4, 'daddies': 2, 'italian-cookies': 1 },
    sellThrough: 0.50, // Only 50% sell-through - severe waste
    replacements: 55000,  // Very high replacements
    bonuses: 35000
  }
};

async function seedData() {
  console.log('🌱 Seeding demo data for CCA Bakery...\n');

  const entries = [];

  // Generate 5 days of data for each bakery (Mon-Fri of current week)
  for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
    const date = addDays(weekStart, dayOffset);

    for (const [bakeryId, profile] of Object.entries(profiles)) {
      const entry = generateDailyEntry(bakeryId, date, profile);
      entries.push(entry);
    }
  }

  console.log(`📊 Generated ${entries.length} entries for 3 bakeries (5 days each)\n`);

  // Delete existing entries for these bakeries this week
  const weekStartStr = format(weekStart, 'yyyy-MM-dd');
  const weekEndStr = format(addDays(weekStart, 6), 'yyyy-MM-dd');

  console.log('🗑️  Clearing existing data for this week...');

  for (const bakeryId of Object.keys(profiles)) {
    const { error: deleteError } = await supabase
      .from('daily_entries')
      .delete()
      .eq('bakery_id', bakeryId)
      .gte('date', weekStartStr)
      .lte('date', weekEndStr);

    if (deleteError) {
      console.error(`   Error deleting ${bakeryId}:`, deleteError.message);
    }
  }

  console.log('✅ Cleared\n');

  // Insert new entries
  console.log('💾 Inserting demo data...');

  const { data, error } = await supabase
    .from('daily_entries')
    .upsert(entries, { onConflict: 'bakery_id,date' });

  if (error) {
    console.error('❌ Error inserting data:', error.message);
    process.exit(1);
  }

  console.log('✅ Inserted successfully\n');

  // Summary
  console.log('📈 SUMMARY:');
  console.log('━'.repeat(50));

  for (const [bakeryId, profile] of Object.entries(profiles)) {
    const bakeryEntries = entries.filter(e => e.bakery_id === bakeryId);
    const totalProfit = bakeryEntries.reduce((sum, e) => sum + e.totals.profit, 0);
    const totalSales = bakeryEntries.reduce((sum, e) => sum + e.totals.salesTotal, 0);

    const status = totalProfit > 0 ? '🟢 PROFITABLE' : totalProfit < 0 ? '🔴 LOSS' : '🟡 BREAK-EVEN';

    console.log(`\n${bakeryId.toUpperCase()}: ${status}`);
    console.log(`   Sales: ${totalSales.toLocaleString()} UGX`);
    console.log(`   Profit: ${totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString()} UGX`);
  }

  console.log('\n' + '━'.repeat(50));
  console.log('✅ Demo data seeded successfully!');
  console.log('🚀 Ready for Monday presentation\n');
}

seedData().catch(console.error);
