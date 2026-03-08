import React from 'react';
import { Bus, ArrowRight, Clock, UserPlus, Plus } from 'lucide-react';
import { useScheduleStore } from '@/hooks/useScheduleStore';
import { COLOR_MAP, SELECTED_COLOR_MAP } from '@/lib/constants';
import { timeToMinutes, cn, getScheduleColor } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { type Schedule } from '@/hooks/useScheduleStore';

type TimelineItem = (Schedule & { type: 'academy' }) | {
  id: string;
  childId: string;
  academyId: string;
  day: string;
  start: string;
  end: string;
  type: 'dismissal';
};

interface HomeViewProps {
  setView?: (view: string) => void;
  onAddChild?: () => void;
}

export default function HomeView({ setView, onAddChild }: HomeViewProps) {
  const { schedules, academies, children, selectedChildId, setSelectedChildId, isViewerMode } = useScheduleStore();
  const { t } = useTranslation();
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const dateString = React.useMemo(() => {
    if (!mounted) return '';
    return new Date().toLocaleDateString(t('home.locale'), { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      weekday: 'short' 
    });
  }, [mounted, t]);

  const filteredSchedules = selectedChildId === 'all' 
    ? schedules 
    : schedules.filter(s => s.childId === selectedChildId);

  // Get actual today's day from DAYS array in constants.ts
  const currentDay = React.useMemo(() => {
    if (!mounted) return '';
    const dayIndex = new Date().getDay(); // 0 (Sun) to 6 (Sat)
    return ['일', '월', '화', '수', '목', '금', '토'][dayIndex];
  }, [mounted]);

  const todaysSchedule = React.useMemo(() => {
    const schedulesWithDismissal: TimelineItem[] = filteredSchedules.filter(s => s.day === currentDay).map(s => ({ ...s, type: 'academy' }));
    
    // Add school dismissal as virtual events
    const activeChildren = selectedChildId === 'all' 
      ? children 
      : children.filter(c => c.id === selectedChildId);
      
    activeChildren.forEach(child => {
      const dismissalTime = child.schoolDismissalTimes?.[currentDay];
      if (dismissalTime) {
        schedulesWithDismissal.push({
          id: `dismissal-${child.id}`,
          childId: child.id,
          academyId: '',
          day: currentDay,
          start: dismissalTime,
          end: dismissalTime,
          type: 'dismissal'
        });
      }
    });

    return schedulesWithDismissal.sort((a, b) => {
      const timeA = timeToMinutes(a.type === 'dismissal' ? a.start : (a.shuttleIn || a.start)) || 0;
      const timeB = timeToMinutes(b.type === 'dismissal' ? b.start : (b.shuttleIn || b.start)) || 0;
      return timeA - timeB;
    });
  }, [filteredSchedules, currentDay, children, selectedChildId]);

  if (children.length === 0 && !isViewerMode) {
    return (
      <div className="p-6 space-y-8 animate-slide-up flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner">
          <UserPlus size={40} className="text-indigo-500 dark:text-indigo-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight">{t('home.noChildrenTitle')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium max-w-[240px]">
            {t('home.noChildrenDesc')}
          </p>
        </div>
        <div className="flex flex-col w-full gap-3 mt-8">
          <button 
            onClick={() => onAddChild?.()}
            className="w-full py-4 bg-primary text-white rounded-[2rem] font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} /> {t('home.registerNow')}
          </button>
          <button 
            onClick={() => setView?.('settings')}
            className="w-full py-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-800 rounded-[2rem] font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            {t('home.goToSettings')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-slide-up">
      {/* Mesh Gradient Hero Card */}
      <div className="relative p-8 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-200 dark:shadow-none transition-all group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 dark:from-indigo-900 dark:via-indigo-800 dark:to-purple-900" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full -ml-20 -mb-20 blur-2xl" />
        
        <div className="relative z-10 space-y-6">
          <div className="space-y-1">
            <p className="text-white/90 text-[10px] font-black uppercase tracking-[0.2em]">{dateString}</p>
            <h2 className="text-3xl font-black text-white leading-tight tracking-tight">
              {todaysSchedule.length > 0 ? (
                t('home.todaySchedules', { count: todaysSchedule.length })
              ) : (
                t('home.noSchedulesToday')
              )}
            </h2>
          </div>
          
          <div className="flex -space-x-3">
            {children.map(c => (
               <div key={c.id} className={cn(
                 "w-11 h-11 rounded-2xl border-[3px] border-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg transition-transform hover:-translate-y-1",
                 COLOR_MAP[c.color as keyof typeof COLOR_MAP].split(' ')[0]
               )}>
                 <span className="text-sm font-black uppercase">{c.name[0]}</span>
               </div>
            ))}
          </div>
        </div>
      </div>

      {/* Child Filter */}
      <div 
        className="flex gap-2 overflow-x-auto no-scrollbar py-1"
        role="group" 
        aria-label={t('home.childFilter')}
      >
        <button 
          onClick={() => setSelectedChildId('all')} 
          aria-pressed={selectedChildId === 'all'}
          className={cn(
            "px-6 py-3.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all min-h-[44px]",
            selectedChildId === 'all' 
              ? 'bg-primary text-white shadow-lg shadow-primary/20' 
              : 'bg-white dark:bg-gray-900 border border-border dark:border-gray-800 text-gray-500 dark:text-gray-400'
          )}
        >
          {t('common.all')}
        </button>
        {children.map(c => (
          <button 
            key={c.id} 
            onClick={() => setSelectedChildId(c.id)} 
            aria-pressed={selectedChildId === c.id}
            className={cn(
              "px-6 py-3.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all min-h-[44px]",
              selectedChildId === c.id 
                ? `${SELECTED_COLOR_MAP[c.color as keyof typeof SELECTED_COLOR_MAP]} shadow-lg` 
                : 'bg-white dark:bg-gray-900 border border-border dark:border-gray-800 text-gray-500 dark:text-gray-400'
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Reminders */}
      <section className="space-y-4" aria-labelledby="reminders-heading">
        <div className="flex justify-between items-center px-1">
          <h3 id="reminders-heading" className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{t('home.paymentReminder')}</h3>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar py-1">
          {(() => {
            const today = new Date().getDate();
            const upcoming = academies
              .filter(a => a.paymentDay)
              .map(a => {
                const pDay = parseInt(a.paymentDay);
                let dDay = pDay - today;
                if (dDay < 0) {
                  const lastDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
                  dDay = (lastDayOfMonth - today) + pDay;
                }
                return { ...a, dDay };
              })
              .sort((a, b) => a.dDay - b.dDay)
              .filter(a => a.dDay <= 7);

            if (upcoming.length === 0) return (
              <div className="w-full py-8 bg-muted/50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-border dark:border-gray-800 flex items-center justify-center">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">{t('home.noUpcomingPayments')}</p>
              </div>
            );

            return upcoming.map(a => (
              <div key={a.id} className="min-w-[160px] bg-white dark:bg-gray-900 p-4 rounded-[2rem] border border-border dark:border-gray-800 shadow-sm shrink-0 hover:shadow-md transition-all">
                <span className={cn(
                  "text-[10px] font-black px-2 py-1 rounded-xl uppercase tracking-tighter", 
                  a.dDay === 0 
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-200 dark:shadow-none" 
                    : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                )}>
                  {a.dDay === 0 ? t('home.dueToday') : t('common.in', { days: a.dDay })}
                </span>
                <p className="text-sm font-black text-gray-800 dark:text-gray-100 mt-3 truncate">{a.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">{a.price.toLocaleString()}{t('academy.price')}</p>
                  <ArrowRight size={12} className="text-gray-300" />
                </div>
              </div>
            ));
          })()}
        </div>
      </section>

      {/* Timeline */}
      <section className="space-y-6" aria-labelledby="timeline-heading">
        <h3 id="timeline-heading" className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest px-1">{t('home.todayTimeline')}</h3>

        <div className="space-y-2 relative">
          {todaysSchedule.length > 0 ? todaysSchedule.map((s, idx) => {
            const academy = academies.find(a => a.id === s.academyId);
            const child = children.find(c => c.id === s.childId);
            if (!child) return null;

            const isFiltered = selectedChildId !== 'all';
            const isDismissal = s.type === 'dismissal';
            
            const colorClass = isDismissal 
              ? "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
              : getScheduleColor(child.color, academy?.color || 'indigo', isFiltered);
            
            const displayTime = s.type === 'dismissal' ? s.start : (s.shuttleIn || s.start);

            return (
              <div key={s.id} className="flex gap-6 group animate-slide-up" style={{ animationDelay: `${(idx + 1) * 0.1}s` }}>
                <div className="flex flex-col items-center w-12 shrink-0">
                  <div className={cn(
                    "text-[10px] font-black px-2 py-1.5 rounded-xl transition-colors",
                    isDismissal 
                      ? "text-slate-500 bg-slate-100 dark:bg-slate-800"
                      : "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30"
                  )}>{displayTime}</div>
                  <div className="w-[2px] flex-1 bg-gradient-to-b from-indigo-100 to-transparent dark:from-indigo-900/30 dark:to-transparent my-2 group-last:hidden" />
                </div>
                
                <div className={cn(
                  "flex-1 p-5 rounded-[2rem] border shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 relative overflow-hidden",
                  colorClass
                )}>
                  {/* Child color indicator for multiple children */}
                  {children.length > 1 && (
                    <div 
                      className={cn(
                        "absolute top-0 left-0 bottom-0 w-1.5",
                        SELECTED_COLOR_MAP[child.color as keyof typeof SELECTED_COLOR_MAP].split(' ')[0]
                      )} 
                    />
                  )}
                  <div className={cn("relative z-10", children.length > 1 ? "pl-2" : "")}>
                    <span className={cn(
                      "text-[10px] font-black px-2.5 py-1 rounded-full mb-2 inline-block bg-white/60 dark:bg-black/20 uppercase tracking-tight"
                    )}>
                      {child.name}
                    </span>
                    <h4 className="font-black text-lg tracking-tight leading-tight">
                      {isDismissal ? t('child.schoolDismissalTimeLabel') : academy?.name}
                    </h4>
                    
                    {!isDismissal && (
                      <div className="mt-1 text-[11px] font-bold opacity-80 flex items-center gap-1.5">
                        <Clock size={12} />
                        <span>{s.start} - {s.end}</span>
                      </div>
                    )}
                    
                    {!isDismissal && (s.shuttleIn || s.shuttleOut) && (
                      <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex flex-wrap gap-4">
                        {s.shuttleIn && (
                          <div className="text-[11px] font-bold flex items-center gap-1.5 opacity-70">
                            <Bus size={12} className="text-amber-600 dark:text-amber-400" /> 
                            <span><span className="opacity-60 font-medium">{t('home.shuttleIn')}</span> {s.shuttleIn}</span>
                          </div>
                        )}
                        {s.shuttleOut && (
                          <div className="text-[11px] font-bold flex items-center gap-1.5 opacity-70">
                            <Bus size={12} className="text-emerald-600 dark:text-emerald-400" /> 
                            <span><span className="opacity-60 font-medium">{t('home.shuttleOut')}</span> {s.shuttleOut}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Subtle background decoration */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 dark:bg-black/5 rounded-full -mr-12 -mt-12 blur-2xl" />
                </div>
              </div>
            )
          }) : (
            <div className="bg-white dark:bg-gray-900 border-2 border-dashed border-border dark:border-gray-800 rounded-[2.5rem] py-16 text-center transition-colors">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-black uppercase tracking-[0.2em]">{t('home.allClearToday')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
