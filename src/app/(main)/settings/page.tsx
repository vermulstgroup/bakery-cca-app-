
"use client"

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
import { useTranslation } from '@/hooks/use-translation';
import { useMemo } from 'react';
import { ProductSelection } from './product-selection';


export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { data: onboardingData, updateData, isLoaded } = useOnboarding();
  const { language, setLanguage, t } = useTranslation();

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

  const handleRoleChange = (roleId: 'manager' | 'supervisor') => {
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
              <Select value={onboardingData.bakery || ''} onValueChange={handleBakeryChange} disabled={!isLoaded}>
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
             <div className="flex items-center justify-between">
              <Label className="text-base">{t('role')}</Label>
              <Select value={onboardingData.role || ''} onValueChange={(value) => handleRoleChange(value as 'manager' | 'supervisor')} disabled={!isLoaded}>
                  <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t('select_your_role')} />
                  </SelectTrigger>
                  <SelectContent>
                      {Object.values(ROLES).map(r => (
                          <SelectItem key={r.id} value={r.id}>{t(r.id)}</SelectItem>
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
