"use client"

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ChevronRight, LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { BAKERIES, ROLES, LANGUAGES } from '@/lib/data';
import { useOnboarding } from '@/hooks/use-onboarding';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { data: onboardingData } = useOnboarding();
  const { language, setLanguage, t } = useTranslation();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('onboardingComplete');
      localStorage.removeItem('onboardingData');
      localStorage.removeItem('selectedLanguage');
      router.replace('/welcome');
    }
  }

  const bakeryName = BAKERIES.find(b => b.id === onboardingData.bakery)?.name || 'N/A';
  const roleName = ROLES[onboardingData.role?.toUpperCase() || 'MANAGER']?.name || 'N/A';

  return (
    <div className="pb-8">
      <PageHeader title={t('settings')} showBackButton={false} />
      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="language" className="text-base">
                Language
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
                Dark Mode
              </Label>
              <Switch
                id="dark-mode"
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bakery Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <div className="flex justify-between"><span>Bakery:</span> <span className="font-medium text-foreground">{bakeryName}</span></div>
            <div className="flex justify-between"><span>Role:</span> <span className="font-medium text-foreground">{roleName}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            <Button variant="ghost" className="w-full justify-between h-14 text-base" onClick={() => router.push('/select-products')}>
              Manage Active Products
              <ChevronRight />
            </Button>
            <Button variant="ghost" className="w-full justify-between h-14 text-base" onClick={() => router.push('/confirm-prices')}>
              Edit Selling Prices
              <ChevronRight />
            </Button>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm space-y-2">
                <div className="flex justify-between"><span>App Version:</span> <span>1.0.0</span></div>
                <p>Made for BISS Bakeries</p>
            </CardContent>
        </Card>

        <Button variant="destructive" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log Out & Reset
        </Button>
      </div>
    </div>
  );
}
