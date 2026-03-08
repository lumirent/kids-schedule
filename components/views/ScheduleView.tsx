import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Bus, Download, Clock, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { useScheduleStore, type Schedule } from '@/hooks/useScheduleStore';
import { TIME_SLOTS, SELECTED_COLOR_MAP } from '@/lib/constants';
import { timeToMinutes, cn, getScheduleColor } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { exportToPng } from '@/lib/export-utils';

interface ScheduleViewProps {
  onEdit: (schedule: Schedule) => void;
}

export default function ScheduleView({ onEdit }: ScheduleViewProps) {
  const { schedules, academies, children, selectedChildId, setSelectedChildId, showSunday, updateSchedule, isViewerMode, fetchSchedules } = useScheduleStore();
  const { t } = useTranslation();
  const scheduleRef = useRef<HTMLDivElement>(null);

  // --- Date Logic ---
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const navigateWeek = (offset: number) => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + offset * 7);
      return next;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const weekDates = useMemo(() => {
    const dates = [];
    const baseDate = new Date(currentDate);
    baseDate.setDate(baseDate.getDate() - baseDate.getDay()); // Start from Sunday (0)
    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [currentDate]);

  const activeDates = showSunday ? weekDates : weekDates.slice(1);

  // Date strings for fetching logic
  const startDateStr = weekDates[0].toISOString().split('T')[0];
  const endDateStr = weekDates[6].toISOString().split('T')[0];

  useEffect(() => {
    if (!isViewerMode && fetchSchedules) {
      fetchSchedules(startDateStr, endDateStr);
    }
  }, [startDateStr, endDateStr, fetchSchedules, isViewerMode]);

  // UI Date Formatter
  const currentMonthStr = useMemo(() => {
    return currentDate.toLocaleDateString(t('home.locale'), { year: 'numeric', month: 'long' });
  }, [currentDate, t]);

  const GRID_HEIGHT = 80;
  const HEADER_HEIGHT = 56;

  const filteredSchedules = useMemo(() => {
    if (selectedChildId === 'all') return schedules;
    return schedules.filter(s => s.childId === selectedChildId);
  }, [schedules, selectedChildId]);

  const scheduleByDate = useMemo(() => {
    const map: Record<string, typeof schedules> = {};
    activeDates.forEach(d => {
      const dateStr = d.toISOString().split('T')[0];
      map[dateStr] = [];
    });
    filteredSchedules.forEach(s => {
      if (map[s.date]) {
        map[s.date].push(s);
      }
    });
    return map;
  }, [filteredSchedules, activeDates]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || isViewerMode) return;
    const scheduleId = result.draggableId;
    const newDateStr = result.destination.droppableId; // droppableId is now YYYY-MM-DD
    updateSchedule(scheduleId, { date: newDateStr });
  };

  const downloadImage = async () => {
    if (!scheduleRef.current) return;
    const childName = selectedChildId === 'all' ? '전체' : children.find(c => c.id === selectedChildId)?.name || '';
    const filename = `kids-schedule-${childName}-${currentDate.toISOString().split('T')[0]}.png`;

    await exportToPng(scheduleRef.current, filename);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Search Header Area */}
      <div className="px-6 py-4 flex flex-col gap-3 glass border-b sticky top-0 z-40">

        {/* Child Filters & Download */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-[calc(100%-48px)]">
            <button
              onClick={() => setSelectedChildId('all')}
              className={cn(
                "px-5 py-2.5 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all min-h-[44px]",
                selectedChildId === 'all'
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-muted/50 text-gray-500 dark:text-gray-400 hover:text-gray-600'
              )}
            >
              {t('common.all')}
            </button>
            {children.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedChildId(c.id)}
                className={cn(
                  "px-5 py-2.5 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all min-h-[44px]",
                  selectedChildId === c.id
                    ? `${SELECTED_COLOR_MAP[c.color as keyof typeof SELECTED_COLOR_MAP]} shadow-lg`
                    : 'bg-muted/50 text-gray-500 dark:text-gray-400 hover:text-gray-600'
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
          <button
            onClick={downloadImage}
            className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all active:scale-95 ml-2 shrink-0"
            title={t('common.downloadImage') || '이미지 저장'}
          >
            <Download size={20} />
          </button>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between mt-1">
          <button
            onClick={() => navigateWeek(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-muted/50 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>

          <button onClick={goToToday} className="flex flex-col items-center group">
            <span className="text-sm font-black text-gray-800 dark:text-gray-200 tracking-tight flex items-center gap-1.5 group-hover:text-primary transition-colors">
              <CalendarIcon size={14} /> {currentMonthStr}
            </span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              {t('schedule.thisWeek') || '이번 주'}
            </span>
          </button>

          <button
            onClick={() => navigateWeek(1)}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-muted/50 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-auto no-scrollbar">
          <div ref={scheduleRef} className="inline-flex min-w-full relative bg-background">
            {/* Time Column */}
            <div className="w-14 shrink-0 sticky left-0 top-0 glass z-30 border-r pt-14 flex flex-col bg-background/50 backdrop-blur-sm">
              {TIME_SLOTS.map(t_slot => (
                <div key={t_slot} className="h-20 border-b border-border/50 text-[9px] font-black text-gray-400 dark:text-gray-600 flex justify-center pt-1 transition-colors">
                  {String(t_slot).padStart(2, '0')}
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {activeDates.map(dateObj => {
              const dateStr = dateObj.toISOString().split('T')[0];
              const dayNameKR = ['일', '월', '화', '수', '목', '금', '토'][dateObj.getDay()];
              const isToday = new Date().toISOString().split('T')[0] === dateStr;

              return (
                <Droppable droppableId={dateStr} key={dateStr}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={cn(
                        "w-28 shrink-0 border-r border-border/50 relative min-h-full transition-colors",
                        snapshot.isDraggingOver ? "bg-primary/5" : ""
                      )}
                    >
                      <div className={cn(
                        "h-14 border-b border-border/50 bg-background/80 dark:bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center font-black sticky top-0 z-20 transition-colors gap-0.5",
                        isToday ? "text-primary" : "text-gray-500 dark:text-gray-400"
                      )}>
                        <span className="text-[10px] uppercase tracking-[0.2em]">{t(`schedule.days.${dayNameKR}`)}</span>
                        <span className="text-sm tracking-tight">{dateObj.getDate()}</span>
                      </div>
                      {TIME_SLOTS.map(t_slot => <div key={t_slot} className="h-20 border-b border-border/50 transition-colors"></div>)}

                      {/* School Dismissal Times */}
                      {children
                        .filter(c => selectedChildId === 'all' || c.id === selectedChildId)
                        .map(child => {
                          const dismissalTime = child.schoolDismissalTimes?.[dayNameKR];
                          if (!dismissalTime) return null;

                          const dMin = timeToMinutes(dismissalTime) || 0;

                          return (
                            <div
                              key={`dismissal-${child.id}-${dateStr}`}
                              style={{
                                position: 'absolute',
                                left: '2px',
                                right: '2px',
                                top: `${((dMin - 8 * 60) / 60) * GRID_HEIGHT + HEADER_HEIGHT}px`,
                                height: '24px',
                                zIndex: 1
                              }}
                              className={cn(
                                "px-1.5 py-0.5 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 flex items-center gap-1 overflow-hidden transition-all",
                                selectedChildId !== 'all' && selectedChildId !== child.id ? "opacity-20" : "opacity-100"
                              )}
                            >
                              <Clock size={8} className="text-gray-400 shrink-0" />
                              <div className="text-[7px] font-black text-gray-400 dark:text-gray-500 truncate uppercase tracking-tighter">
                                {child.name[0]} {t('child.schoolDismissalTimeLabel')} {dismissalTime}
                              </div>
                            </div>
                          );
                        })
                      }

                      {scheduleByDate[dateStr]?.map((s, index) => {
                        const academy = academies.find(a => a.id === s.academyId);
                        const child = children.find(c => c.id === s.childId);
                        if (!child) return null;

                        const sMin = timeToMinutes(s.start) || 0;
                        const eMin = timeToMinutes(s.end) || 0;
                        const iMin = timeToMinutes(s.shuttleIn || null);
                        const oMin = timeToMinutes(s.shuttleOut || null);

                        const isFiltered = selectedChildId !== 'all';
                        const colorClass = getScheduleColor(child.color, academy?.color || 'indigo', isFiltered);

                        return (
                          <Draggable key={s.id} draggableId={s.id} index={index} isDragDisabled={isViewerMode}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  position: 'absolute',
                                  left: '4px',
                                  right: '4px',
                                  top: `${(((iMin || sMin) - 8 * 60) / 60) * GRID_HEIGHT + HEADER_HEIGHT}px`,
                                  height: `${(((oMin || eMin) - (iMin || sMin)) / 60) * GRID_HEIGHT}px`,
                                  zIndex: snapshot.isDragging ? 100 : 2
                                }}
                                className={cn(
                                  "p-1.5 rounded-xl border shadow-sm flex flex-col justify-between overflow-hidden cursor-grab active:cursor-grabbing transition-all",
                                  colorClass,
                                  snapshot.isDragging ? "shadow-2xl ring-2 ring-primary scale-105 z-50" : "hover:brightness-95"
                                )}
                                onClick={() => onEdit(s)}
                              >
                                {/* Child color indicator for multiple children */}
                                {children.length > 1 && (
                                  <div
                                    className={cn(
                                      "absolute top-0 left-0 bottom-0 w-1",
                                      SELECTED_COLOR_MAP[child.color as keyof typeof SELECTED_COLOR_MAP].split(' ')[0]
                                    )}
                                  />
                                )}
                                <div className={cn("flex-1 min-h-0", children.length > 1 ? "pl-1.5" : "")}>
                                  <div className="font-black text-[9px] truncate leading-none tracking-tight mb-1">{academy?.name}</div>

                                  <div className="flex flex-col gap-0.5">
                                    {s.shuttleIn && (
                                      <div className="flex items-center gap-0.5 text-[7px] font-bold opacity-60 leading-none">
                                        <Bus size={6} className="shrink-0" />
                                        <span className="truncate">{s.shuttleIn} {t('schedule.pickup')}</span>
                                      </div>
                                    )}

                                    <div className="text-[8px] font-black opacity-90 leading-none">
                                      {s.start} - {s.end}
                                    </div>

                                    {s.shuttleOut && (
                                      <div className="flex items-center gap-0.5 text-[7px] font-bold opacity-60 leading-none">
                                        <Bus size={6} className="shrink-0" />
                                        <span className="truncate">{s.shuttleOut} {t('schedule.dropoff')}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
