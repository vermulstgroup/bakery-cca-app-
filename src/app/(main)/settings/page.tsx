
"use client"

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ChevronRight, LogOut, Moon, Sun, AlertTriangle } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { BAKERIES, ROLES, LANGUAGES, PRODUCTS } from '@/lib/data';
import { useOnboarding } from '@/hooks/use-onboarding';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';
import { useMemo, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';


const ProductSelection = () => {
    const { t } = useTranslation();
    const { data, updateData, isLoaded } = useOnboarding();
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set(data.products || []));

    const toggleProduct = (productId: string) => {
        const newSelection = new Set(selectedProducts);
        if (newSelection.has(productId)) {
            newSelection.delete(productId);
        } else {
            newSelection.add(productId);
        }
        setSelectedProducts(newSelection);
        updateData({ products: Array.from(newSelection) });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('manage_active_products')}</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-64 pr-4">
                    <div className="space-y-4">
                        {PRODUCTS.map(product => (
                            <div key={product.id} className="flex items-center space-x-3">
                                <Checkbox
                                    id={`product-${product.id}`}
                                    checked={selectedProducts.has(product.id)}
                                    onCheckedChange={() => toggleProduct(product.id)}
                                />
                                <label
                                    htmlFor={`product-${product.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                                >
                                    <span className="text-xl">{product.emoji}</span>
                                    {product.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { data: onboardingData, updateData, isLoaded } = useOnboarding();
  const { language, setLanguage, t } = useTranslation();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('onboardingComplete');
      localStorage.removeItem('onboardingData_local');
      localStorage.removeItem('selectedLanguage');
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('expenses-') || key.startsWith('daily_entry-')) {
          localStorage.removeItem(key);
        }
      });
      router.replace('/welcome');
    }
  }
  
  const handleBakeryChange = (bakeryId: string) => {
    updateData({ bakery: bakeryId });
  };


  const bakeryName = useMemo(() => {
    if (isLoaded && onboardingData.bakery) {
      return BAKERIES.find(b => b.id === onboardingData.bakery)?.name || t('select_your_bakery');
    }
    return t('select_your_bakery');
  }, [isLoaded, onboardingData.bakery, t]);

  const roleName = useMemo(() => {
    if (isLoaded && onboardingData.role) {
      const role = ROLES[onboardingData.role.toUpperCase()];
      return role ? t(role.id) : 'N/A';
    }
    return 'N/A';
  }, [isLoaded, onboardingData.role, t]);


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
              <Select value={onboardingData.bakery || ''} onValueChange={handleBakeryChange}>
                  <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t('select_your_bakery')} />
                  </SelectTrigger>
                  <SelectContent>
                      {BAKERIES.map(b => (
                          <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
             <div className="flex justify-between items-center text-muted-foreground">
                <span className="text-base">{t('role')}:</span> 
                <span className="font-medium text-foreground">{roleName}</span>
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
                <SelectTrigger className="w-[180px]">
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

        <Button variant="destructive" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            {t('log_out_reset')}
        </Button>
      </div>
    </div>
  );
}
