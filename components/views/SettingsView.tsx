import React, { useRef } from 'react';
import { Calendar, ChevronRight, Plus, Edit2, Download, Upload, Link, Moon, Sun, Monitor, Languages } from 'lucide-react';
import { useScheduleStore, type Child } from '@/hooks/useScheduleStore';
import { useConfigStore, type Language } from '@/hooks/useConfigStore';
import { COLOR_MAP } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { encodeData } from '@/lib/sharing';
import { useToast } from '@/hooks/use-toast';
import { useConfirm } from '@/hooks/use-confirm';
import { useTranslation } from '@/hooks/useTranslation';

interface SettingsViewProps {
  onEditChild?: (child: Child) => void;
  onAddChild?: () => void;
}

export default function SettingsView({ onEditChild, onAddChild }: SettingsViewProps) {
  const { showSunday, setShowSunday, children, academies, schedules, resetAll, importData, isViewerMode } = useScheduleStore();
  const { theme, setTheme, language, setLanguage } = useConfigStore();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const confirm = useConfirm();

  const handleEditChild = (child: Child) => {
    if (isViewerMode) return;
    onEditChild?.(child);
  };

  const handleAddChild = () => {
    if (isViewerMode) return;
    onAddChild?.();
  };

  const handleShare = () => {
    const data = { children, academies, schedules };
    const encoded = encodeData(data);
    const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
    
    if (navigator.share) {
      navigator.share({
        title: t('settings.shareTitle'),
        text: t('settings.shareText'),
        url: url,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url).then(() => {
        toast({
          title: t('settings.shareToastTitle'),
          description: t('settings.shareToastDesc'),
        });
      });
    }
  };

  const handleExport = () => {
    const data = { children, academies, schedules };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kids-schedule-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const ok = await confirm({
          title: t('settings.importTitle'),
          message: t('settings.importConfirm'),
          confirmText: t('common.confirm'),
          variant: "danger"
        });
        
        if (ok) {
          importData(json);
          toast({
            title: t('settings.importSuccess'),
            description: t('settings.importSuccessDesc'),
          });
        }
      } catch {
        toast({
          title: t('settings.importError'),
          description: t('settings.importErrorDesc'),
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    const ok = await confirm({
      title: t('settings.resetTitle'),
      message: t('settings.resetConfirm'),
      confirmText: t('common.reset'),
      variant: "danger"
    });
    
    if (ok) {
      resetAll();
      toast({
        title: t('settings.resetSuccess'),
        description: t('settings.resetSuccessDesc'),
      });
    }
  };

  return (
    <div className="p-6 space-y-8 pb-10">
      <section>
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 px-1 flex justify-between items-center">
          {t('settings.childManagement')}
          {!isViewerMode && (
            <button 
              onClick={handleAddChild}
              className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-bold lowercase"
            >
              <Plus size={14} /> {t('common.add')}
            </button>
          )}
        </h3>
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 divide-y dark:divide-gray-800 overflow-hidden shadow-sm">
          {children.length > 0 ? children.map(child => (
            <div key={child.id} className="p-4 flex justify-between items-center group">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm",
                  COLOR_MAP[child.color as keyof typeof COLOR_MAP].split(' ')[0]
                )}>
                  <span className="text-xs font-black uppercase">{child.name[0]}</span>
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-800 dark:text-gray-100">{child.name}</p>
                  {child.schoolDismissalTimes && Object.keys(child.schoolDismissalTimes).length > 0 && (
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                      {t('child.schoolDismissalTimeLabel')}: {Object.keys(child.schoolDismissalTimes).length}{t('academy.count')} 설정됨
                    </p>
                  )}
                </div>
              </div>
              {!isViewerMode && (
                <button 
                  onClick={() => handleEditChild(child)}
                  className="p-2 text-gray-300 dark:text-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <Edit2 size={16} />
                </button>
              )}
            </div>
          )) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
              {t('settings.noChildren')}
            </div>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 px-1">{t('settings.basicSettings')}</h3>
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 divide-y dark:divide-gray-800 overflow-hidden shadow-sm">
          <div className="p-5 flex justify-between items-center group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                <Calendar size={20} />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-800 dark:text-gray-100">{t('settings.showSunday')}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{t('settings.showSundayDesc')}</p>
              </div>
            </div>
            <button 
              onClick={() => setShowSunday(!showSunday)} 
              disabled={isViewerMode}
              className={cn(
                "w-12 h-6 rounded-full p-1 transition-all flex items-center",
                showSunday ? 'bg-indigo-600 justify-end' : 'bg-gray-200 dark:bg-gray-700 justify-start',
                isViewerMode && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                {theme === 'light' ? <Sun size={20} /> : theme === 'dark' ? <Moon size={20} /> : <Monitor size={20} />}
              </div>
              <div>
                <p className="font-bold text-sm text-gray-800 dark:text-gray-100">{t('settings.theme')}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{t('settings.themeDesc')}</p>
              </div>
            </div>
            <div className="flex p-1 bg-gray-50 dark:bg-gray-800 rounded-xl gap-1">
              {(['light', 'dark', 'system'] as const).map((t_key) => (
                <button
                  key={t_key}
                  onClick={() => setTheme(t_key)}
                  className={cn(
                    "flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all capitalize",
                    theme === t_key 
                      ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-sm" 
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-600"
                  )}
                >
                  {t_key === 'system' ? t('settings.themeAuto') : t_key === 'light' ? t('settings.themeLight') : t_key === 'dark' ? t('settings.themeDark') : t_key}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                <Languages size={20} />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-800 dark:text-gray-100">{t('settings.language')}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{t('settings.languageDesc')}</p>
              </div>
            </div>
            <div className="flex p-1 bg-gray-50 dark:bg-gray-800 rounded-xl gap-1">
              {([
                { id: 'ko', label: '한국어' },
                { id: 'en', label: 'English' },
                { id: 'ja', label: '日本語' },
                { id: 'zh', label: '中文' }
              ] as const).map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id as Language)}
                  className={cn(
                    "flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all",
                    language === lang.id 
                      ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-sm" 
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-600"
                  )}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
          
          {!isViewerMode && (
            <div 
              onClick={handleShare}
              className="p-5 flex justify-between items-center group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                  <Link size={20} />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-800 dark:text-gray-100">{t('settings.shareUrl')}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{t('settings.shareUrlDesc')}</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-300 dark:text-gray-600" />
            </div>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 px-1">{t('settings.academyStats')}</h3>
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">{t('settings.totalSum')}</p>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {academies.reduce((acc, curr) => acc + curr.price, 0).toLocaleString()}{t('academy.price')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">{t('settings.registeredAcademies')}</p>
              <p className="font-bold text-gray-800 dark:text-gray-200">{academies.length}{t('academy.count')}</p>
            </div>
          </div>
          
          <div className="space-y-3 pt-2">
            {children.map(child => {
              const childAcademies = academies.filter(a => 
                schedules.some(s => s.childId === child.id && s.academyId === a.id)
              );
              const childTotal = childAcademies.reduce((acc, curr) => acc + curr.price, 0);
              if (childTotal === 0) return null;
              
              return (
                <div key={child.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-600 dark:text-gray-500 dark:text-gray-400">{child.name}</span>
                    <span className="text-gray-800 dark:text-gray-200">{childTotal.toLocaleString()}{t('academy.price')}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-500", COLOR_MAP[child.color as keyof typeof COLOR_MAP].split(' ')[0])}
                      style={{ width: `${(childTotal / academies.reduce((acc, curr) => acc + curr.price, 0)) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 px-1">{t('settings.dataManagement')}</h3>
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <div className="flex flex-col gap-3">
            {!isViewerMode && (
              <>
                <button 
                  onClick={handleExport}
                  className="w-full py-4 text-xs font-bold bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Download size={14} /> {t('settings.backup')}
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 text-xs font-bold bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Upload size={14} /> {t('settings.restore')}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".json" 
                  onChange={handleImport} 
                />
                <button 
                  onClick={handleReset}
                  className="w-full py-4 text-xs font-bold bg-rose-50 dark:bg-rose-950/20 rounded-2xl text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all active:scale-95"
                >
                  {t('settings.resetAll')}
                </button>
              </>
            )}
            {isViewerMode && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
                {t('settings.viewerModeNotice')}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="text-center py-4">
        <p className="text-[9px] text-gray-300 dark:text-gray-700 font-bold uppercase tracking-[0.2em]">Build 2026.03.08-Alpha</p>
      </div>
    </div>
  );
}
