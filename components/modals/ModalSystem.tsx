import React, { useState, useEffect } from 'react';
import { X, Bus, UserCircle, PlusCircle, MinusCircle, Phone, Calendar, CreditCard, Palette, Repeat, Layers, Clock } from 'lucide-react';
import { useScheduleStore, type Schedule, type Academy, type Child } from '@/hooks/useScheduleStore';
import { COLOR_OPTIONS, COLOR_HEX } from '@/lib/constants';
import { cn, formatPhone } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import ChildModal from '@/components/modals/ChildModal';
import { useTranslation } from '@/hooks/useTranslation';
import { generateRepeatingSchedules } from '@/lib/schedule-utils';
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
    addSchedules,
    updateSchedule,
    updateScheduleGroup,
    removeSchedule,
    removeScheduleGroup,
    addAcademy,
    updateAcademy,
    removeAcademy,
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
    endCondition: 'date' | 'count';
    endDate: string;
    count: number;
    repeatDays: number[];
  }>({
    childId: '',
    academyId: '',
    date: new Date().toISOString().split('T')[0],
    start: '13:00',
    end: '14:00',
    shuttleIn: '',
    shuttleOut: '',
    groupId: null,
    repeatType: 'none',
    endCondition: 'date',
    endDate: '',
    count: 10,
    repeatDays: [new Date().getDay()],
  });

  const [academyForm, setAcademyForm] = useState({
    name: '',
    teachers: [{ name: '', contact: '' }],
    contact: '',
    price: '',
    paymentDay: '',
    color: 'rose'
  });

  // State for choosing how to edit/delete a grouped event
  const [groupActionPrompt, setGroupActionPrompt] = useState<'update' | 'delete' | null>(null);

  useEffect(() => {
    if (type === 'schedule' && editingData) {
      const s = editingData as Schedule;
      setScheduleForm({
        childId: s.childId,
        academyId: s.academyId,
        date: s.date,
        start: s.start,
        end: s.end,
        shuttleIn: s.shuttleIn || '',
        shuttleOut: s.shuttleOut || '',
        groupId: s.groupId || null,
        repeatType: s.repeatType || 'none',
        endCondition: 'date',
        endDate: '',
        count: 10,
        repeatDays: [new Date(s.date).getDay()]
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
        groupId: null, repeatType: 'none', endCondition: 'date', endDate: '', count: 10, repeatDays: [new Date().getDay()]
      });
      setAcademyForm({ name: '', teachers: [{ name: '', contact: '' }], contact: '', price: '', paymentDay: '', color: 'rose' });
    }
    setGroupActionPrompt(null);
  }, [type, editingData]);

  if (!type) return null;

  if (type === 'child') {
    return <ChildModal isOpen={true} onClose={onClose} editingChild={editingData as Child} />;
  }

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.childId || !scheduleForm.academyId) {
      toast({
        title: '입력 확인',
        description: '자녀와 학원을 모두 선택해주세요.',
        variant: 'destructive'
      });
      return;
    }

    if (editingData) {
      if (scheduleForm.groupId) {
        setGroupActionPrompt('update');
      } else {
        executeScheduleUpdate('single');
      }
    } else {
      // Create new schedule
      const { endCondition, endDate, count, repeatType, repeatDays, ...baseSchedule } = scheduleForm;
      if (repeatType === 'none') {
        addSchedule({ ...baseSchedule, repeatType: 'none' });
      } else {
        const newGroupId = `g-${Date.now()}`;
        const schedulesToInsert = generateRepeatingSchedules(
          baseSchedule,
          { repeatType, endCondition, endDate, count, repeatDays },
          newGroupId
        );
        if (addSchedules) {
          addSchedules(schedulesToInsert);
        } else {
          // Fallback if addSchedules isn't defined or we're mocking it without it
          schedulesToInsert.forEach(s => addSchedule(s));
        }
      }
      toast({
        title: t('modal.scheduleAddSuccess') || '일정 등록 완료',
        description: t('modal.scheduleAddDesc') || '성공적으로 등록되었습니다.',
      });
      onClose();
    }
  };

  const executeScheduleUpdate = (mode: 'single' | 'group') => {
    const targetId = (editingData as Schedule).id;
    const targetDate = (editingData as Schedule).date;
    const { childId, academyId, date, start, end, shuttleIn, shuttleOut } = scheduleForm;
    const updatePayload = { childId, academyId, date, start, end, shuttleIn, shuttleOut };

    if (mode === 'group' && scheduleForm.groupId) {
      updateScheduleGroup(scheduleForm.groupId, targetDate, updatePayload);
      toast({ title: '일괄 수정 완료', description: '해당 날짜 이후의 일정이 모두 수정되었습니다.' });
    } else {
      updateSchedule(targetId, { ...updatePayload, groupId: mode === 'single' ? null : scheduleForm.groupId });
      toast({ title: t('modal.scheduleUpdateSuccess') || '수정 완료', description: t('modal.scheduleUpdateDesc') || '일정이 수정되었습니다.' });
    }
    onClose();
  };

  const executeScheduleDelete = (mode: 'single' | 'group') => {
    const targetId = (editingData as Schedule).id;
    const targetDate = (editingData as Schedule).date;

    if (mode === 'group' && scheduleForm.groupId) {
      removeScheduleGroup(scheduleForm.groupId, targetDate);
      toast({ title: '일괄 삭제 완료', description: '해당 날짜 이후의 일정이 모두 삭제되었습니다.' });
    } else {
      removeSchedule(targetId);
      toast({ title: t('modal.scheduleDeleteSuccess') || '삭제 완료', description: t('modal.scheduleDeleteDesc') || '일정이 삭제되었습니다.' });
    }
    onClose();
  };

  const handleDelete = async () => {
    if (!editingData) return;

    if (type === 'schedule') {
      if (scheduleForm.groupId) {
        setGroupActionPrompt('delete');
        return;
      }

      const ok = await confirm({
        title: t('modal.deleteConfirmTitle') || '일정 삭제',
        message: t('modal.deleteConfirmMessage') || '이 일정을 정말 삭제하시겠습니까?',
        confirmText: t('common.delete') || '삭제',
        variant: "danger"
      });
      if (!ok) return;
      executeScheduleDelete('single');

    } else {
      const ok = await confirm({
        title: t('modal.deleteConfirmTitle') || '학원 삭제',
        message: t('modal.deleteConfirmMessage') || '정말 삭제하시겠습니까? 연결된 일정 내역이 모두 함께 삭제됩니다.',
        confirmText: t('common.delete') || '삭제',
        variant: "danger"
      });
      if (!ok) return;
      if (editingData.id) {
        removeAcademy((editingData as Academy).id!);
        toast({ title: t('modal.academyDeleteSuccess'), description: t('modal.academyDeleteDesc') });
      }
      onClose();
    }
  };

  const handleSaveAcademy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!academyForm.name) {
      toast({
        title: '입력 확인',
        description: '학원 이름을 입력해주세요.',
        variant: 'destructive'
      });
      return;
    }

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
      toast({ title: t('modal.academyUpdateSuccess'), description: t('modal.academyUpdateDesc') });
    } else {
      addAcademy(data);
      toast({ title: t('modal.academyAddSuccess'), description: t('modal.academyAddDesc') });
    }
    onClose();
  };

  // Intermediate Dialog for Group Actions
  if (groupActionPrompt) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[210] flex items-center justify-center animate-in fade-in duration-200">
        <div className="bg-white dark:bg-gray-900 rounded-3xl w-[90%] max-w-sm p-6 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <Layers className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-black text-gray-800 dark:text-gray-100">
              {groupActionPrompt === 'update' ? '반복 일정 수정' : '반복 일정 삭제'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-bold">
              어떻게 적용할까요?
            </p>
          </div>
          <div className="grid gap-3">
            <Button variant="outline" className="w-full py-4 text-sm whitespace-normal h-auto rounded-2xl" onClick={() => groupActionPrompt === 'update' ? executeScheduleUpdate('single') : executeScheduleDelete('single')}>
              이 일정만 {groupActionPrompt === 'update' ? '수정' : '삭제'} (그룹 해제)
            </Button>
            <Button className={cn("w-full py-4 text-sm whitespace-normal h-auto rounded-2xl", groupActionPrompt === 'delete' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-primary')} onClick={() => groupActionPrompt === 'update' ? executeScheduleUpdate('group') : executeScheduleDelete('group')}>
              이 일정 및 향후 반복 일정 모두 {groupActionPrompt === 'update' ? '수정' : '삭제'}
            </Button>
          </div>
          <Button variant="ghost" className="w-full rounded-2xl" onClick={() => setGroupActionPrompt(null)}>
            취소
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-200 flex items-end animate-in fade-in duration-200">
      <div className="w-full bg-background dark:bg-gray-900 rounded-t-[3rem] p-6 animate-in slide-in-from-bottom duration-500 max-h-[95vh] overflow-y-auto shadow-2xl relative transition-colors no-scrollbar">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full" />

        <div className="flex justify-between items-center mb-8 pt-2 sticky top-0 bg-background dark:bg-gray-900 z-10 py-2">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight">
              {editingData
                ? (type === 'schedule' ? t('modal.editSchedule') || '일정 수정' : t('modal.editAcademy'))
                : (type === 'schedule' ? t('modal.addSchedule') || '일정 등록' : t('modal.addAcademy'))}
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
          <form onSubmit={handleSaveSchedule} className="space-y-6 pb-20">
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
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('modal.dateLabel') || '시작 날짜'}</label>
              <Input
                type="date"
                icon={<Calendar size={18} />}
                value={scheduleForm.date}
                onChange={(e) => {
                  const newDate = e.target.value;
                  const newDay = new Date(newDate).getDay();
                  setScheduleForm(prev => ({
                    ...prev,
                    date: newDate,
                    repeatDays: prev.repeatDays.includes(newDay) ? prev.repeatDays : [newDay]
                  }));
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('modal.timeLabel')}</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black ml-1 uppercase">{t('modal.startLabel')}</p>
                  <Input type="time" icon={<Clock size={16} />} value={scheduleForm.start} onChange={(e) => setScheduleForm({ ...scheduleForm, start: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black ml-1 uppercase">{t('modal.endLabel')}</p>
                  <Input type="time" icon={<Clock size={16} />} value={scheduleForm.end} onChange={(e) => setScheduleForm({ ...scheduleForm, end: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Repeat configuration (Only shown when adding new schedule. When editing, we abstract this behind the grouping) */}
            {!editingData && (
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Repeat size={14} /> 반복 설정
                </label>

                <Select
                  value={scheduleForm.repeatType}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, repeatType: e.target.value as any })}
                >
                  <option value="none">반복 없음</option>
                  <option value="weekly">매 주 반복</option>
                  <option value="monthly">매 월 반복</option>
                </Select>

                {scheduleForm.repeatType === 'weekly' && (
                  <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700/50 mt-3">
                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">반복 요일</label>
                    <div className="flex gap-1">
                      {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            const nextDays = scheduleForm.repeatDays.includes(i)
                              ? scheduleForm.repeatDays.filter(day => day !== i)
                              : [...scheduleForm.repeatDays, i];
                            // Prevent unselecting the last day
                            if (nextDays.length === 0) return;
                            setScheduleForm({ ...scheduleForm, repeatDays: nextDays });
                          }}
                          className={cn(
                            "flex-1 h-9 rounded-xl font-bold text-xs transition-colors",
                            scheduleForm.repeatDays.includes(i)
                              ? "bg-primary text-white shadow-md shadow-primary/20"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                          )}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {scheduleForm.repeatType !== 'none' && (
                  <div className="grid gap-3 pt-2">
                    <Select
                      value={scheduleForm.endCondition}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, endCondition: e.target.value as any })}
                    >
                      <option value="date">종료 날짜 지정</option>
                      <option value="count">반복 횟수 지정</option>
                    </Select>

                    {scheduleForm.endCondition === 'date' ? (
                      <Input
                        type="date"
                        icon={<Calendar size={16} />}
                        value={scheduleForm.endDate}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, endDate: e.target.value })}
                        placeholder="종료 날짜를 선택하세요"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={scheduleForm.count.toString()}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, count: parseInt(e.target.value, 10) || 1 })}
                        />
                        <span className="text-xs font-bold text-gray-500 shrink-0">회 (반복일정 당)</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Bus size={14} /> {t('modal.shuttleLabel')}</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-black ml-1 uppercase">{t('modal.shuttleInLabel')}</p>
                  <Input type="time" icon={<Bus size={16} className="text-amber-500" />} className="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30" value={scheduleForm.shuttleIn} onChange={(e) => setScheduleForm({ ...scheduleForm, shuttleIn: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black ml-1 uppercase">{t('modal.shuttleOutLabel')}</p>
                  <Input type="time" icon={<Bus size={16} className="text-emerald-500" />} className="bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/30" value={scheduleForm.shuttleOut} onChange={(e) => setScheduleForm({ ...scheduleForm, shuttleOut: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4 sticky bottom-0 bg-background dark:bg-gray-900 z-10 py-4">
              {editingData && (
                <Button type="button" variant="danger" onClick={handleDelete} className="flex-1 py-5 rounded-3xl">
                  {t('common.delete').toUpperCase()}
                </Button>
              )}
              <Button type="submit" className="flex-[2] py-5 rounded-3xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 -skew-x-12 -ml-4 w-12" />
                {editingData ? (t('modal.updateScheduleBtn') || '저장') : (t('modal.saveScheduleBtn') || '저장')}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSaveAcademy} className="space-y-6 pb-20">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('modal.academyNameLabel')}</label>
              <Input type="text" placeholder={t('modal.academyNamePlaceholder')} value={academyForm.name} onChange={(e) => setAcademyForm({ ...academyForm, name: e.target.value })} />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 flex justify-between items-center">
                {t('modal.teacherLabel')}
                <button type="button" onClick={() => setAcademyForm({ ...academyForm, teachers: [...academyForm.teachers, { name: '', contact: '' }] })} className="text-primary flex items-center gap-1 font-black lowercase tracking-tight hover:scale-105 active:scale-95 transition-transform">
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

            <div className="flex gap-4 pt-4 sticky bottom-0 bg-background dark:bg-gray-900 z-10 py-4">
              {editingData && (
                <Button type="button" variant="danger" onClick={handleDelete} className="flex-1 py-5 rounded-3xl">
                  {t('common.delete').toUpperCase()}
                </Button>
              )}
              <Button type="submit" className="flex-[2] py-5 rounded-3xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 -skew-x-12 -ml-4 w-12" />
                {editingData ? t('modal.updateInfoBtn') : t('modal.saveAcademyBtn')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
