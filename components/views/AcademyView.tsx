import React from 'react';
import { School, Phone, CreditCard, Plus, Edit2, User } from 'lucide-react';
import { useScheduleStore, type Academy } from '@/hooks/useScheduleStore';
import { COLOR_MAP } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

interface AcademyViewProps {
  onAdd: () => void;
  onEdit: (academy: Academy) => void;
}

export default function AcademyView({ onAdd, onEdit }: AcademyViewProps) {
  const { academies } = useScheduleStore();
  const { t } = useTranslation();

  return (
    <div className="p-6 space-y-8 animate-slide-up">
      <div className="flex justify-between items-end px-1">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight transition-colors">{t('academy.title')}</h3>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest transition-colors">{t('academy.subtitle')}</p>
        </div>
        <div className="bg-secondary dark:bg-indigo-900/20 px-3 py-1.5 rounded-xl border border-primary/10 transition-colors">
          <span className="text-[10px] font-black text-primary uppercase tracking-tighter">
            {t('academy.savedCount', { count: academies.length })}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {academies.map((a, idx) => (
          <div 
            key={a.id} 
            className="group bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] border border-border dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className="flex justify-between items-start relative z-10">
              <div className="flex gap-5 items-center">
                <div className={cn(
                  "w-16 h-16 rounded-3xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 duration-500",
                  COLOR_MAP[a.color as keyof typeof COLOR_MAP]
                )}>
                  <School size={32} />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-black text-xl text-gray-800 dark:text-gray-100 leading-none transition-colors">{a.name}</h4>
                  <div className="flex flex-wrap gap-3">
                    {a.teachers.map((teacher, tIdx) => (
                      <div key={tIdx} className="space-y-1">
                        <div className="flex items-center gap-1 bg-muted dark:bg-gray-800 px-2 py-0.5 rounded-lg border border-border dark:border-gray-700 transition-colors">
                          <User size={10} className="text-gray-500 dark:text-gray-400" />
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">{teacher.name}</span>
                        </div>
                        {teacher.contact && (
                          <a href={`tel:${teacher.contact}`} className="flex items-center gap-1 text-[9px] text-primary dark:text-indigo-400 font-black ml-1 hover:underline transition-all">
                            <Phone size={8} /> {teacher.contact}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => onEdit(a)} 
                className="w-10 h-10 rounded-2xl bg-muted dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-indigo-400 hover:bg-primary/10 transition-all active:scale-90"
              >
                <Edit2 size={18} />
              </button>
            </div>
            
            <div className="flex gap-3 mt-6 pt-6 border-t border-border dark:border-gray-800 relative z-10 transition-colors">
              <a href={`tel:${a.contact}`} className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 py-3.5 rounded-2xl text-xs font-black text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all">
                <Phone size={14} /> {t('common.call')}
              </a>
              <div className="flex-1 flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-800 py-3.5 rounded-2xl text-xs font-black text-gray-500 dark:text-gray-400 transition-colors">
                <CreditCard size={14} /> {a.price.toLocaleString()}{t('academy.price')}
              </div>
            </div>
            
            {a.paymentDay && (
              <div className="mt-3 px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center gap-3 border border-amber-100/50 dark:border-amber-900/30 transition-colors">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></div>
                <p className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wide">{t('academy.monthlyBilling', { day: a.paymentDay })}</p>
              </div>
            )}

            {/* Background design element */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gray-50 dark:bg-white/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          </div>
        ))}
        
        <button 
          onClick={onAdd} 
          className="w-full py-10 border-2 border-dashed border-border dark:border-gray-800 rounded-[2.5rem] text-gray-500 dark:text-gray-400 dark:text-gray-600 font-black flex flex-col items-center justify-center gap-3 hover:bg-white dark:hover:bg-gray-900/50 hover:border-primary/30 dark:hover:border-primary/20 hover:text-primary transition-all duration-300 group"
        >
          <div className="w-14 h-14 rounded-full bg-muted dark:bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            <Plus size={28} />
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em]">{t('academy.addNew')}</span>
        </button>
      </div>
    </div>
  );
}
