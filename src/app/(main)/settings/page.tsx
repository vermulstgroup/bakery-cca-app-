"use client"

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ChevronRight, LogOut, Moon, Sun, AlertTriangle } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { BAKERIES, ROLES, LANGUAGES } from '@/lib/data';
import { useOnboarding } from '@/hooks/use-onboarding';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslation } from '@/hooks/use-translation';
import { ProductSelection } from './product-selection';
import { useGoals } from '@/hooks/use-goals';
import { useInventory } from '@/hooks/use-inventory';
import { useBakeryPin } from '@/hooks/use-bakery-pin';
import { Input } from '@/components/ui/input';
import { Target, Package, Lock, Unlock } from 'lucide-react';
import type { RoleId } from '@/lib/types';


export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { data: onboardingData, updateData, isLoaded } = useOnboarding();
  const { language, setLanguage, t } = useTranslation();
  const { goals, updateGoals, isLoaded: goalsLoaded } = useGoals(onboardingData.bakery);
  const { inventory, updateInventory, addStock, isLoaded: inventoryLoaded } = useInventory(onboardingData.bakery);
  const { isPinEnabled, setPin, removePin, isLoaded: pinLoaded } = useBakeryPin(onboardingData.bakery);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showClearDataDialog, setShowClearDataDialog] = useState(false);
  const [stockToAdd, setStockToAdd] = useState('');
  const [newPin, setNewPin] = useState('');

  // Clear only entry data (keeps settings)
  const handleClearEntryData = () => {
    if (typeof window !== 'undefined') {
      let count = 0;
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('biss-entry-') || key.startsWith('expenses-') || key.startsWith('draft-')) {
          localStorage.removeItem(key);
          count++;
        }
      });
      setShowClearDataDialog(false);
      // Could show a toast here
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      // Clear all local storage related to the app
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('onboarding') || key.startsWith('expenses-') || key.startsWith('daily_entry-')) {
          localStorage.removeItem(key);
        }
      });
      localStorage.removeItem('selectedLanguage');

      // Use replace to prevent user from going back to the authenticated state
      router.replace('/welcome');
    }
  }
  
  const handleBakeryChange = (bakeryId: string) => {
    updateData({ bakery: bakeryId });
  };

  const handleRoleChange = (roleId: RoleId) => {
    updateData({ role: roleId });
  };

  const bakeryName = useMemo(() => {
    if (isLoaded && onboardingData.bakery) {
      return BAKERIES.find(b => b.id === onboardingData.bakery)?.name || t('select_your_bakery');
    }
    return t('select_your_bakery');
  }, [isLoaded, onboardingData.bakery, t]);

  const roleName = useMemo(() => {
    if (isLoaded && onboardingData.role) {
      // Find role by matching id (e.g., 'bakery-manager' -> ROLES.BAKERY_MANAGER)
      const role = Object.values(ROLES).find(r => r.id === onboardingData.role);
      return role?.name || 'N/A';
    }
    return 'N/A';
  }, [isLoaded, onboardingData.role]);


  return (
    <div className="pb-8">
      <PageHeader title={t('settings')} showBackButton={false} />
      <div className="p-4 space-y-6">

        {!onboardingData.bakery && isLoaded && (
          <Card className="border-primary bg-primary/10">
              <CardHeader className="flex-row items-center gap-4 space-y-0">
                  <AlertTriangle className="text-primary"/>
                  <CardTitle>{t('select_bakery_first')}</CardTitle>
              </CardHeader>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>{t('bakery_info')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">{t('bakery')}</Label>
              <Select value={onboardingData.bakery || ''} onValueChange={handleBakeryChange} disabled={!isLoaded}>
                  <SelectTrigger className="w-[180px] min-h-[48px]">
                      <SelectValue placeholder={t('select_your_bakery')} />
                  </SelectTrigger>
                  <SelectContent>
                      {BAKERIES.map(b => (
                          <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
             <div className="flex items-center justify-between">
              <Label className="text-base">{t('role')}</Label>
              <Select value={onboardingData.role || ''} onValueChange={(value) => handleRoleChange(value as RoleId)} disabled={!isLoaded}>
                  <SelectTrigger className="w-[180px] min-h-[48px]">
                      <SelectValue placeholder={t('select_your_role')} />
                  </SelectTrigger>
                  <SelectContent>
                      {Object.values(ROLES).map(r => (
                          <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('preferences')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="language" className="text-base">
                {t('language')}
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[180px] min-h-[48px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="flex items-center gap-2 text-base">
                {theme === 'dark' ? <Moon /> : <Sun />}
                {t('dark_mode')}
              </Label>
              <Switch
                id="dark-mode"
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
          </CardContent>
        </Card>

        <ProductSelection />

        {/* Weekly Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Weekly Goals
            </CardTitle>
            <CardDescription>
              Set targets and get alerts when you're on track or falling behind
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="goals-enabled" className="text-base">
                Enable Goal Tracking
              </Label>
              <Switch
                id="goals-enabled"
                checked={goals.enabled}
                onCheckedChange={(checked) => updateGoals({ enabled: checked })}
                disabled={!goalsLoaded}
              />
            </div>
            {goals.enabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="profit-target">Weekly Profit Target (UGX)</Label>
                  <Input
                    id="profit-target"
                    type="number"
                    value={goals.weeklyProfitTarget}
                    onChange={(e) => updateGoals({ weeklyProfitTarget: parseInt(e.target.value) || 0 })}
                    className="min-h-[48px]"
                    disabled={!goalsLoaded}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="margin-target">Weekly Margin Target (%)</Label>
                  <Input
                    id="margin-target"
                    type="number"
                    min="0"
                    max="100"
                    value={goals.weeklyMarginTarget}
                    onChange={(e) => updateGoals({ weeklyMarginTarget: parseInt(e.target.value) || 0 })}
                    className="min-h-[48px]"
                    disabled={!goalsLoaded}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Flour Inventory */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Flour Inventory
            </CardTitle>
            <CardDescription>
              Track flour stock and get low-stock alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Current Stock</div>
              <div className="text-3xl font-bold">{inventory.currentStock.toFixed(1)} kg</div>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Add flour (kg)"
                value={stockToAdd}
                onChange={(e) => setStockToAdd(e.target.value)}
                className="min-h-[48px]"
                disabled={!inventoryLoaded}
              />
              <Button
                onClick={() => {
                  const amount = parseFloat(stockToAdd);
                  if (amount > 0) {
                    addStock(amount);
                    setStockToAdd('');
                  }
                }}
                disabled={!inventoryLoaded || !stockToAdd}
                className="min-h-[48px]"
              >
                Add Stock
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="low-stock-threshold">Low Stock Alert (kg)</Label>
              <Input
                id="low-stock-threshold"
                type="number"
                value={inventory.lowStockThreshold}
                onChange={(e) => updateInventory({ lowStockThreshold: parseFloat(e.target.value) || 0 })}
                className="min-h-[48px]"
                disabled={!inventoryLoaded}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => updateInventory({ currentStock: 0 })}
              disabled={!inventoryLoaded}
              className="w-full"
            >
              Reset Stock to Zero
            </Button>
          </CardContent>
        </Card>

        {/* PIN Protection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {pinLoaded && isPinEnabled ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
              PIN Protection
            </CardTitle>
            <CardDescription>
              Protect this bakery's data with a 4-digit PIN
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!pinLoaded ? (
              <div className="text-sm text-muted-foreground">Loading PIN settings...</div>
            ) : isPinEnabled ? (
              <>
                <div className="flex items-center gap-2 text-green-500">
                  <Lock className="h-4 w-4" />
                  <span className="text-sm">PIN protection is enabled</span>
                </div>
                <Button
                  variant="outline"
                  onClick={removePin}
                  className="w-full"
                >
                  Remove PIN
                </Button>
              </>
            ) : (
              <>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    placeholder="Enter 4-digit PIN"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="min-h-[48px]"
                  />
                  <Button
                    onClick={() => {
                      if (newPin.length === 4) {
                        setPin(newPin);
                        setNewPin('');
                      }
                    }}
                    disabled={newPin.length !== 4}
                    className="min-h-[48px]"
                  >
                    Set PIN
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Once set, you'll need to enter this PIN to access this bakery's data.
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('configuration')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" className="w-full justify-between h-14 text-base" onClick={() => router.push('/settings/edit-prices')}>
              {t('edit_selling_prices')}
              <ChevronRight />
            </Button>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>{t('about')}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm space-y-2">
                <div className="flex justify-between"><span>{t('app_version')}:</span> <span>1.0.0</span></div>
                <p>{t('made_for_biss')}</p>
            </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start text-orange-500 border-orange-500/30 hover:bg-orange-500/10"
              onClick={() => setShowClearDataDialog(true)}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Clear All Entry Data
            </Button>
            <p className="text-xs text-muted-foreground">
              Removes all saved entries and expenses but keeps your settings.
            </p>
          </CardContent>
        </Card>

        <Button variant="destructive" className="w-full" onClick={() => setShowLogoutDialog(true)}>
            <LogOut className="mr-2 h-4 w-4" />
            {t('log_out_reset')}
        </Button>

        {/* Clear Entry Data Dialog */}
        <AlertDialog open={showClearDataDialog} onOpenChange={setShowClearDataDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear All Entry Data?</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete all saved production entries, sales data, and expenses.
                Your settings and bakery selection will be kept. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearEntryData} className="bg-orange-500 text-white hover:bg-orange-600">
                Yes, clear all entries
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Logout Confirmation Dialog */}
        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will clear all your local data including saved entries, expenses, and settings.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Yes, log out and reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
