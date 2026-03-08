import React, { useState, useEffect } from 'react';
import { X, Bus, UserCircle, PlusCircle, MinusCircle, Phone, Calendar, CreditCard, Palette } from 'lucide-react';
import { useScheduleStore, type Schedule, type Academy, type Child } from '@/hooks/useScheduleStore';
import { DAYS, COLOR_OPTIONS, COLOR_HEX } from '@/lib/constants';
import { cn, formatPhone } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import ChildModal from '@/components/modals/ChildModal';
import { useTranslation } from '@/hooks/useTranslation';

import { useConfirm } from '@/hooks/use-confirm';
import { useToast } from '@/hooks/use-toast';

interface ModalSystemProps {
  type: 'schedule' | 'academy' | 'child' | null;
  onClose: () => void;
  editingData?: Schedule | Academy | Child | null;
}

export default function ModalSystem({ type, onClose, editingData }: ModalSystemProps) {
  const {
    children,
    academies,
    addSchedule,
    updateSchedule,
    removeSchedule,
    addAcademy,
    updateAcademy,
    removeAcademy,
    showSunday
  } = useScheduleStore();

  const confirm = useConfirm();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [scheduleForm, setScheduleForm] = useState<{
    childId: string;
    academyId: string;
    date: string;
    start: string;
    end: string;
    shuttleIn: string;
    shuttleOut: string;
    groupId: string | null;
    repeatType: 'none' | 'weekly' | 'monthly';
  }>({
    childId: '',
    academyId: '',
    date: new Date().toISOString().split('T')[0],
    start: '13:00',
    end: '14:00',
    shuttleIn: '',
    shuttleOut: '',
    groupId: null,
    repeatType: 'none'
  });

  const [academyForm, setAcademyForm] = useState({
    name: '',
    teachers: [{ name: '', contact: '' }],
    contact: '',
    price: '',
    paymentDay: '',
    color: 'rose'
  });

  useEffect(() => {
    if (type === 'schedule' && editingData) {
      const s = editingData as Schedule;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScheduleForm({
        childId: s.childId,
        academyId: s.academyId,
        date: s.date,
        start: s.start,
        end: s.end,
        shuttleIn: s.shuttleIn || '',
        shuttleOut: s.shuttleOut || '',
        groupId: s.groupId || null,
        repeatType: s.repeatType || 'none'
      });
    } else if (type === 'academy' && editingData) {
      const a = editingData as Academy;
      setAcademyForm({
        name: a.name,
        teachers: a.teachers?.length > 0 ? a.teachers : [{ name: '', contact: '' }],
        contact: a.contact,
        price: String(a.price),
        paymentDay: a.paymentDay,
        color: a.color
      });
    } else {
      setScheduleForm({
        childId: '', academyId: '', date: new Date().toISOString().split('T')[0],
        start: '13:00', end: '14:00', shuttleIn: '', shuttleOut: '',
        groupId: null, repeatType: 'none'
      });
      setAcademyForm({ name: '', teachers: [{ name: '', contact: '' }], contact: '', price: '', paymentDay: '', color: 'rose' });
    }
  }, [type, editingData]);

  if (!type) return null;

  if (type === 'child') {
    return (
      <ChildModal
        isOpen={true}
        onClose={onClose}
        editingChild={editingData as Child}
      />
    );
  }

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.childId || !scheduleForm.academyId) return;
    if (editingData) {
      updateSchedule((editingData as Schedule).id, scheduleForm);
      toast({
        title: t('modal.scheduleUpdateSuccess'),
        description: t('modal.scheduleUpdateDesc'),
      });
    } else {
      addSchedule(scheduleForm);
      toast({
        title: t('modal.scheduleAddSuccess'),
        description: t('modal.scheduleAddDesc'),
      });
    }
    onClose();
  };

  const handleSaveAcademy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!academyForm.name) return;

    const data = {
      name: academyForm.name,
      contact: academyForm.contact,
      price: Number(academyForm.price) || 0,
      paymentDay: academyForm.paymentDay,
      color: academyForm.color,
      teachers: academyForm.teachers.filter(teacher => teacher && typeof teacher.name === 'string' && teacher.name.trim() !== '')
    };

    if (type === 'academy' && editingData && 'id' in editingData && editingData.id) {
      updateAcademy(editingData.id, data);
      toast({
        title: t('modal.academyUpdateSuccess'),
        description: t('modal.academyUpdateDesc'),
      });
    } else {
      addAcademy(data);
      toast({
        title: t('modal.academyAddSuccess'),
        description: t('modal.academyAddDesc'),
      });
    }
    onClose();
  };

  const handleDelete = async () => {
    if (!editingData) return;
    const ok = await confirm({
      title: t('modal.deleteConfirmTitle'),
      message: t('modal.deleteConfirmMessage'),
      confirmText: t('common.delete'),
      variant: "danger"
    });

    if (!ok) return;

    if (type === 'schedule') {
      removeSchedule((editingData as Schedule).id);
      toast({
        title: t('modal.scheduleDeleteSuccess'),
        description: t('modal.scheduleDeleteDesc'),
      });
    } else {
      if (editingData.id) {
        removeAcademy((editingData as Academy).id!);
        toast({
          title: t('modal.academyDeleteSuccess'),
          description: t('modal.academyDeleteDesc'),
        });
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-200 flex items-end animate-in fade-in duration-200">
      <div className="w-full bg-background dark:bg-gray-900 rounded-t-[3rem] p-6 animate-in slide-in-from-bottom duration-500 max-h-[95%] overflow-y-auto shadow-2xl relative transition-colors">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full" />

        <div className="flex justify-between items-center mb-8 pt-2">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight">
              {editingData
                ? (type === 'schedule' ? t('modal.editSchedule') : t('modal.editAcademy'))
                : (type === 'schedule' ? t('modal.addSchedule') : t('modal.addAcademy'))}
            </h2>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">
              {t('modal.fillDetails')}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-2xl">
            <X size={24} />
          </Button>
        </div>

        {type === 'schedule' ? (
          <form onSubmit={handleSaveSchedule} className="space-y-6 pb-10">
            <div className="grid grid-cols-2 gap-3">
              <Select
                label={t('modal.childLabel')}
                value={scheduleForm.childId}
                onChange={(e) => setScheduleForm({ ...scheduleForm, childId: e.target.value })}
              >
                <option value="">{t('modal.childPlaceholder')}</option>
                {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              <Select
                label={t('modal.academyLabel')}
                value={scheduleForm.academyId}
                onChange={(e) => setScheduleForm({ ...scheduleForm, academyId: e.target.value })}
              >
                <option value="">{t('modal.academyPlaceholder')}</option>
                {academies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('modal.dateLabel') || '날짜'}</label>
              <Input
                type="date"
                value={scheduleForm.date}
                onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('modal.timeLabel')}</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black ml-1 uppercase">{t('modal.startLabel')}</p>
                  <Input type="time" value={scheduleForm.start} onChange={(e) => setScheduleForm({ ...scheduleForm, start: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black ml-1 uppercase">{t('modal.endLabel')}</p>
                  <Input type="time" value={scheduleForm.end} onChange={(e) => setScheduleForm({ ...scheduleForm, end: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Bus size={14} /> {t('modal.shuttleLabel')}</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-black ml-1 uppercase">{t('modal.shuttleInLabel')}</p>
                  <Input type="time" className="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30" value={scheduleForm.shuttleIn} onChange={(e) => setScheduleForm({ ...scheduleForm, shuttleIn: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black ml-1 uppercase">{t('modal.shuttleOutLabel')}</p>
                  <Input type="time" className="bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/30" value={scheduleForm.shuttleOut} onChange={(e) => setScheduleForm({ ...scheduleForm, shuttleOut: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              {editingData && (
                <Button type="button" variant="danger" onClick={handleDelete} className="flex-1 py-5 rounded-3xl">
                  {t('common.delete').toUpperCase()}
                </Button>
              )}
              <Button type="submit" className="flex-[2] py-5 rounded-3xl">
                {editingData ? t('modal.updateScheduleBtn') : t('modal.saveScheduleBtn')}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSaveAcademy} className="space-y-6 pb-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('modal.academyNameLabel')}</label>
              <Input type="text" placeholder={t('modal.academyNamePlaceholder')} value={academyForm.name} onChange={(e) => setAcademyForm({ ...academyForm, name: e.target.value })} />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 flex justify-between items-center">
                {t('modal.teacherLabel')}
                <button type="button" onClick={() => setAcademyForm({ ...academyForm, teachers: [...academyForm.teachers, { name: '', contact: '' }] })} className="text-primary flex items-center gap-1 font-black lowercase tracking-tight">
                  <PlusCircle size={14} /> {t('common.add')}
                </button>
              </label>
              <div className="space-y-4">
                {academyForm.teachers.map((teacher, index) => (
                  <div key={index} className="space-y-2 p-4 bg-muted/30 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                    <div className="flex gap-2">
                      <div className="flex-1 space-y-2">
                        <Input
                          type="text"
                          placeholder={t('modal.teacherNamePlaceholder')}
                          icon={<UserCircle size={18} />}
                          value={teacher.name}
                          onChange={(e) => {
                            const nextTeachers = [...academyForm.teachers];
                            nextTeachers[index] = { ...nextTeachers[index], name: e.target.value };
                            setAcademyForm({ ...academyForm, teachers: nextTeachers });
                          }}
                        />
                        <Input
                          type="tel"
                          placeholder={t('modal.contactPlaceholder')}
                          icon={<Phone size={18} />}
                          value={teacher.contact}
                          onChange={(e) => {
                            const nextTeachers = [...academyForm.teachers];
                            nextTeachers[index] = { ...nextTeachers[index], contact: formatPhone(e.target.value) };
                            setAcademyForm({ ...academyForm, teachers: nextTeachers });
                          }}
                        />
                      </div>
                      {academyForm.teachers.length > 1 && (
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => {
                            const nextTeachers = academyForm.teachers.filter((_, i) => i !== index);
                            setAcademyForm({ ...academyForm, teachers: nextTeachers });
                          }}
                          className="w-12 h-auto self-stretch rounded-2xl flex items-center justify-center p-0"
                        >
                          <MinusCircle size={20} />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('modal.academyContactLabel')}</label>
                <Input type="tel" placeholder="010-0000-0000" icon={<Phone size={16} />} value={academyForm.contact} onChange={(e) => setAcademyForm({ ...academyForm, contact: formatPhone(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 tracking-tighter">{t('modal.paymentDayLabel')}</label>
                <Input type="number" min="1" max="31" placeholder={t('modal.dayUnit')} icon={<Calendar size={16} />} value={academyForm.paymentDay} onChange={(e) => setAcademyForm({ ...academyForm, paymentDay: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('modal.priceLabel')}</label>
              <Input type="number" placeholder="0" icon={<CreditCard size={16} />} value={academyForm.price} onChange={(e) => setAcademyForm({ ...academyForm, price: e.target.value })} />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Palette size={14} /> {t('modal.colorLabel')}</label>
              <div className="flex gap-3 overflow-x-auto no-scrollbar py-2 px-1">
                {COLOR_OPTIONS.map(c => (
                  <button
                    key={c} type="button"
                    onClick={() => setAcademyForm({ ...academyForm, color: c })}
                    className={cn(
                      "w-10 h-10 rounded-2xl shrink-0 border-4 transition-all duration-300",
                      academyForm.color === c
                        ? 'border-primary scale-110 shadow-lg rotate-3'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    )}
                    style={{ backgroundColor: COLOR_HEX[c as keyof typeof COLOR_HEX] }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              {editingData && (
                <Button type="button" variant="danger" onClick={handleDelete} className="flex-1 py-5 rounded-3xl">
                  {t('common.delete').toUpperCase()}
                </Button>
              )}
              <Button type="submit" className="flex-[2] py-5 rounded-3xl">
                {editingData ? t('modal.updateInfoBtn') : t('modal.saveAcademyBtn')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
