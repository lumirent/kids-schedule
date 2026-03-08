import React, { useMemo } from 'react';
import { Bus } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { useScheduleStore, type Schedule } from '@/hooks/useScheduleStore';
import { DAYS, TIME_SLOTS, SELECTED_COLOR_MAP } from '@/lib/constants';
import { timeToMinutes, cn, getScheduleColor } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

interface ScheduleViewProps {
  onEdit: (schedule: Schedule) => void;
}

export default function ScheduleView({ onEdit }: ScheduleViewProps) {
  const { schedules, academies, children, selectedChildId, setSelectedChildId, showSunday, updateSchedule, isViewerMode } = useScheduleStore();
  const { t } = useTranslation();
  
  const activeDays = showSunday ? DAYS : DAYS.slice(1);
  const GRID_HEIGHT = 80; 
  const HEADER_HEIGHT = 56;

  const filteredSchedules = useMemo(() => {
    if (selectedChildId === 'all') return schedules;
    return schedules.filter(s => s.childId === selectedChildId);
  }, [schedules, selectedChildId]);

  const scheduleByDay = useMemo(() => {
    const map: Record<string, typeof schedules> = {};
    activeDays.forEach(day => map[day] = []);
    filteredSchedules.forEach(s => {
      if (map[s.day]) map[s.day].push(s);
    });
    return map;
  }, [filteredSchedules, activeDays]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || isViewerMode) return;
    const scheduleId = result.draggableId;
    const newDay = result.destination.droppableId;
    updateSchedule(scheduleId, { day: newDay });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <div className="px-6 py-4 flex gap-2 overflow-x-auto no-scrollbar glass border-b sticky top-0 z-40">
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
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-auto no-scrollbar">
          <div className="inline-flex min-w-full relative">
            {/* Time Column */}
            <div className="w-14 shrink-0 sticky left-0 glass z-30 border-r pt-14">
              {TIME_SLOTS.map(t_slot => (
                <div key={t_slot} className="h-20 border-b border-border/50 text-[9px] font-black text-gray-400 dark:text-gray-600 flex justify-center pt-1 transition-colors">
                  {String(t_slot).padStart(2, '0')}
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {activeDays.map(day => (
              <Droppable droppableId={day} key={day}>
                {(provided, snapshot) => (
                  <div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={cn(
                      "w-28 shrink-0 border-r border-border/50 relative min-h-full transition-colors",
                      snapshot.isDraggingOver ? "bg-primary/5" : ""
                    )}
                  >
                    <div className="h-14 border-b border-border/50 bg-background/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center font-black text-[10px] uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 sticky top-0 z-20 transition-colors">
                      {t(`schedule.days.${day}`)}
                    </div>
                    {TIME_SLOTS.map(t_slot => <div key={t_slot} className="h-20 border-b border-border/50 transition-colors"></div>)}
                    
                    {scheduleByDay[day]?.map((s, index) => {
                      const academy = academies.find(a => a.id === s.academyId);
                      const child = children.find(c => c.id === s.childId);
                      if (!child) return null;

                      const sMin = timeToMinutes(s.start) || 0; 
                      const eMin = timeToMinutes(s.end) || 0;
                      const iMin = timeToMinutes(s.shuttleIn || null); 
                      const oMin = timeToMinutes(s.shuttleOut || null);
                      
                      const colorClass = getScheduleColor(child.color, academy?.color || 'indigo', children.length);

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
                                top: `${(( (iMin || sMin) - 8 * 60) / 60) * GRID_HEIGHT + HEADER_HEIGHT}px`,
                                height: `${(( (oMin || eMin) - (iMin || sMin) ) / 60) * GRID_HEIGHT}px`,
                                zIndex: snapshot.isDragging ? 100 : 2
                              }}
                              className={cn(
                                "p-1.5 rounded-xl border shadow-sm flex flex-col justify-between overflow-hidden cursor-grab active:cursor-grabbing transition-all",
                                colorClass,
                                snapshot.isDragging ? "shadow-2xl ring-2 ring-primary scale-105 z-[100]" : "hover:brightness-95"
                              )}
                              onClick={() => onEdit(s)}
                            >
                              <div className="flex-1 min-h-0">
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
            ))}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
