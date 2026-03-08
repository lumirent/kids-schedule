import React, { useState } from 'react';
import { X, User, Palette, Clock, Trash2 } from 'lucide-react';
import { useScheduleStore, type Child } from '@/hooks/useScheduleStore';
import { COLOR_OPTIONS, COLOR_HEX, DAYS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useConfirm } from '@/hooks/use-confirm';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';

interface ChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingChild?: Child | null;
}

export default function ChildModal({ isOpen, onClose, editingChild }: ChildModalProps) {
  const { addChild, updateChild, removeChild } = useScheduleStore();
  const confirm = useConfirm();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: editingChild?.name || '',
    color: editingChild?.color || 'pink',
    schoolDismissalTimes: editingChild?.schoolDismissalTimes || {} as Record<string, string>
  });

  const [activeDismissalDay, setActiveDismissalDay] = useState(DAYS[1]); // 월요일

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingChild) {
      updateChild(editingChild.id, formData);
      toast({
        title: t('child.updateSuccess'),
        description: t('child.updateSuccessDesc', { name: formData.name }),
      });
    } else {
      addChild(formData);
      toast({
        title: t('child.addSuccess'),
        description: t('child.addSuccessDesc', { name: formData.name }),
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[200] flex items-end animate-in fade-in duration-200">
      <div className="w-full bg-background dark:bg-gray-900 rounded-t-[3rem] p-6 animate-in slide-in-from-bottom duration-500 max-h-[95%] overflow-y-auto shadow-2xl relative transition-colors">
        {/* Handle for sheet feel */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full" />

        <div className="flex justify-between items-center mb-8 pt-2">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight">
              {editingChild ? t('child.editTitle') : t('child.addTitle')}
            </h2>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">
              {t('child.profileSettings')}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-2xl">
            <X size={24} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 pb-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('child.nameLabel')}</label>
            <Input
              type="text"
              placeholder={t('child.namePlaceholder')}
              icon={<User size={18} />}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              autoFocus
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Clock size={14} /> {t('child.schoolDismissalTimeLabel')}
            </label>
            
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-3xl space-y-4 border border-gray-100 dark:border-gray-800">
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {DAYS.map(day => {
                  const hasTime = !!formData.schoolDismissalTimes?.[day];
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setActiveDismissalDay(day)}
                      className={cn(
                        "px-3 py-2 rounded-xl text-[10px] font-black transition-all shrink-0 border-2",
                        activeDismissalDay === day
                          ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                          : hasTime 
                            ? "bg-white dark:bg-gray-900 border-primary/30 text-primary dark:text-indigo-400"
                            : "bg-white dark:bg-gray-900 border-transparent text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400"
                      )}
                    >
                      {t(`schedule.days.${day}`)}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2 items-center animate-in fade-in slide-in-from-top-1 duration-300">
                <div className="flex-1">
                  <Input
                    type="time"
                    value={formData.schoolDismissalTimes?.[activeDismissalDay] || ''}
                    onChange={(e) => {
                      const newTimes = { ...formData.schoolDismissalTimes };
                      if (e.target.value) {
                        newTimes[activeDismissalDay] = e.target.value;
                      } else {
                        delete newTimes[activeDismissalDay];
                      }
                      setFormData({ ...formData, schoolDismissalTimes: newTimes });
                    }}
                    className="bg-white dark:bg-gray-900 border-none shadow-inner"
                  />
                </div>
                {formData.schoolDismissalTimes?.[activeDismissalDay] && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    type="button"
                    onClick={() => {
                      const newTimes = { ...formData.schoolDismissalTimes };
                      delete newTimes[activeDismissalDay];
                      setFormData({ ...formData, schoolDismissalTimes: newTimes });
                    }}
                    className="text-gray-400 hover:text-rose-500"
                  >
                    <Trash2 size={18} />
                  </Button>
                )}
              </div>
              <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold px-1 italic">
                * {t('child.schoolDismissalTimePlaceholder')}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Palette size={14} /> {t('child.colorLabel')}</label>
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-2 px-1">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c} type="button"
                  onClick={() => setFormData({ ...formData, color: c })}
                  className={cn(
                    "w-10 h-10 rounded-2xl shrink-0 border-4 transition-all duration-300",
                    formData.color === c
                      ? 'border-primary scale-110 shadow-lg rotate-3'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  )}
                  style={{ backgroundColor: COLOR_HEX[c as keyof typeof COLOR_HEX] }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            {editingChild && (
              <Button
                type="button"
                variant="danger"
                onClick={async () => {
                  const ok = await confirm({
                    title: t('child.deleteTitle'),
                    message: t('child.deleteConfirm'),
                    confirmText: t('common.delete'),
                    variant: "danger"
                  });
                  if (ok) {
                    removeChild(editingChild.id);
                    toast({
                      title: t('child.deleteSuccess'),
                      description: t('child.deleteSuccessDesc'),
                    });
                    onClose();
                  }
                }}
                className="flex-1 py-5 rounded-3xl font-black text-sm"
              >
                {t('common.delete').toUpperCase()}
              </Button>
            )}
            <button
              type="submit"
              className="flex-[2] py-5 bg-primary text-white rounded-3xl font-black text-sm shadow-xl shadow-primary/20 active:scale-95 transition-all"
            >
              {editingChild ? t('child.updateButton') : t('child.saveButton')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
