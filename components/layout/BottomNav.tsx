import React from 'react';
import { Home, Calendar, School, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

interface NavItemProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function NavItem({ active, icon, label, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex flex-col items-center flex-1 py-3 transition-all duration-300 relative",
        active ? "text-primary scale-110" : "text-gray-500 dark:text-gray-400 hover:text-gray-600"
      )}
    >
      {active && (
        <span className="absolute -top-1 w-1 h-1 bg-primary rounded-full animate-pulse" />
      )}
      {icon}
      <span className={cn(
        "text-[10px] mt-1 font-bold tracking-tight",
        active ? "opacity-100" : "opacity-70"
      )}>
        {label}
      </span>
    </button>
  );
}

interface BottomNavProps {
  currentView: string;
  setView: (view: string) => void;
}

export default function BottomNav({ currentView, setView }: BottomNavProps) {
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-6 left-0 right-0 mx-auto px-6 z-50">
      <nav aria-label="Main Navigation" className="glass rounded-[2rem] flex justify-around items-center py-2 px-4 shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
        <NavItem
          active={currentView === 'home'}
          icon={<Home size={20} />}
          label={t('nav.home')}
          onClick={() => setView('home')}
        />
        <NavItem
          active={currentView === 'schedule'}
          icon={<Calendar size={20} />}
          label={t('nav.schedule')}
          onClick={() => setView('schedule')}
        />
        <NavItem
          active={currentView === 'academy'}
          icon={<School size={20} />}
          label={t('nav.academy')}
          onClick={() => setView('academy')}
        />
        <NavItem
          active={currentView === 'settings'}
          icon={<Settings size={20} />}
          label={t('nav.settings')}
          onClick={() => setView('settings')}
        />
      </nav>
    </div>
  );
}
