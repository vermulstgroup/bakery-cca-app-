"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BAKERIES } from '@/lib/data';
import { cn } from '@/lib/utils';
import { useOnboarding } from '@/hooks/use-onboarding';
import { format, startOfWeek, addDays, subWeeks, addWeeks, isToday, isSameDay } from 'date-fns';

export default function DateSelectPage() {
  const router = useRouter();
  const { data: onboardingData } = useOnboarding();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [entryStatus, setEntryStatus] = useState<{ [date: string]: boolean }>({});

  const currentBakery = BAKERIES.find(b => b.id === onboardingData.bakery);

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Load entry status for the week
  useEffect(() => {
    if (!onboardingData.bakery) return;

    const loadStatus = () => {
      const status: { [date: string]: boolean } = {};
      weekDays.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        // Check localStorage for entry data
        const stored = localStorage.getItem(`biss-entry-${onboardingData.bakery}-${dateStr}`);
        status[dateStr] = !!stored;
      });
      setEntryStatus(status);
    };
    loadStatus();
  }, [onboardingData.bakery, weekStart]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Store selected date and navigate to entry
    localStorage.setItem('biss-selected-date', format(date, 'yyyy-MM-dd'));
    router.push('/entry');
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setWeekStart(subWeeks(weekStart, 1));
    } else {
      setWeekStart(addWeeks(weekStart, 1));
    }
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setWeekStart(startOfWeek(today, { weekStartsOn: 1 }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="-ml-2 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-xl font-bold text-amber-400 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Date
          </h1>
          <p className="text-slate-400 text-sm">
            {currentBakery?.name || 'No bakery'} • Choose a date to enter data
          </p>
        </div>

        {/* Today Quick Button */}
        <Button
          onClick={goToToday}
          className="w-full mb-6 bg-amber-500 hover:bg-amber-600 text-white py-4 text-lg font-bold"
        >
          <Calendar className="h-5 w-5 mr-2" />
          Enter Today's Data ({format(new Date(), 'MMM d')})
        </Button>

        {/* Week Navigation */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 rounded-xl mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateWeek('prev')}
              className="text-slate-400 hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="text-center">
              <div className="font-bold text-white">
                {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d')}
              </div>
              <div className="text-sm text-slate-400">
                {format(weekStart, 'yyyy')}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateWeek('next')}
              className="text-slate-400 hover:text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Week Strip */}
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const hasData = entryStatus[dateStr];
              const isSelected = isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDateSelect(day)}
                  className={cn(
                    "flex flex-col items-center p-2 rounded-lg transition-all",
                    isSelected
                      ? 'bg-amber-500 text-white'
                      : isTodayDate
                      ? 'bg-slate-700 text-white ring-2 ring-amber-500/50'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  )}
                >
                  <span className="text-xs font-medium">
                    {format(day, 'EEE')}
                  </span>
                  <span className="text-lg font-bold">
                    {format(day, 'd')}
                  </span>
                  <div className="mt-1">
                    {hasData ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <div className="h-4 w-4 rounded-full bg-slate-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-400" />
              <span>Recorded</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-slate-600" />
              <span>Pending</span>
            </div>
          </div>
        </Card>

        {/* Recent Entries Summary */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 rounded-xl">
          <h3 className="font-bold text-white mb-3">This Week</h3>
          <div className="space-y-2">
            {weekDays.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const hasData = entryStatus[dateStr];
              const isTodayDate = isToday(day);

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDateSelect(day)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg transition-all",
                    isTodayDate ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-slate-800 hover:bg-slate-700'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      hasData ? 'bg-green-500' : 'bg-slate-500'
                    )} />
                    <span className="font-medium text-white">
                      {format(day, 'EEEE, MMM d')}
                    </span>
                    {isTodayDate && (
                      <span className="text-xs bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded">
                        Today
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {hasData ? (
                      <span className="text-sm text-green-400">Recorded</span>
                    ) : (
                      <span className="text-sm text-slate-500">Not entered</span>
                    )}
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-slate-500">
          Select a date to enter or view production data
        </div>
      </div>
    </div>
  );
}
