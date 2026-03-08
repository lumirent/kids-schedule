"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Info } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import HomeView from '@/components/views/HomeView';
import ScheduleView from '@/components/views/ScheduleView';
import AcademyView from '@/components/views/AcademyView';
import SettingsView from '@/components/views/SettingsView';
import ModalSystem from '@/components/modals/ModalSystem';
import { useScheduleStore, type Schedule, type Academy, type Child } from '@/hooks/useScheduleStore';
import { decodeData } from '@/lib/sharing';

export default function App() {
  const [view, setView] = useState('home');
  const [modalType, setModalType] = useState<'schedule' | 'academy' | 'child' | null>(null);
  const [editingData, setEditingData] = useState<Schedule | Academy | Child | null>(null);
  const { isViewerMode, loadViewerData, setIsViewerMode } = useScheduleStore();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('SW registered:', registration);
        
        // 새로운 서비스 워커가 발견되었을 때 업데이트 확인
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // 새로운 내용이 있으므로 알림을 띄우거나 자동 새로고침 고려
                  console.log('New content is available; please refresh.');
                }
              }
            };
          }
        };
      });

      // 서비스 워커가 제어권을 잡으면 (skipWaiting 후) 페이지 새로고침
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          window.location.reload();
          refreshing = true;
        }
      });
    }
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sharedData = params.get('data');
      if (sharedData) {
        const decoded = decodeData(sharedData);
        if (decoded) {
          loadViewerData(decoded);
        }
      } else if (isViewerMode) {
        // Clear viewer mode if URL param is gone
        setIsViewerMode(false);
        // Force reload to restore user data from localStorage
        window.location.reload();
      }
    }
  }, [loadViewerData, isViewerMode, setIsViewerMode]);

  const handleEdit = (type: 'schedule' | 'academy' | 'child', data: Schedule | Academy | Child) => {
    if (isViewerMode) return;
    setEditingData(data);
    setModalType(type);
  };

  const handleAdd = (type: 'schedule' | 'academy' | 'child') => {
    if (isViewerMode) return;
    setEditingData(null);
    setModalType(type);
  };

  const renderView = () => {
    switch (view) {
      case 'home': return <HomeView setView={setView} onAddChild={() => handleAdd('child')} />;
      case 'schedule': return <ScheduleView onEdit={(s) => handleEdit('schedule', s)} />;
      case 'academy': return (
        <AcademyView
          onAdd={() => handleAdd('academy')}
          onEdit={(a) => handleEdit('academy', a)}
        />
      );
      case 'settings': return <SettingsView onEditChild={(c) => handleEdit('child', c)} onAddChild={() => handleAdd('child')} />;
      default: return <HomeView setView={setView} onAddChild={() => handleAdd('child')} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground max-w-md mx-auto shadow-[0_0_50px_rgba(0,0,0,0.1)] dark:shadow-[0_0_50px_rgba(0,0,0,0.3)] overflow-hidden relative border-x border-border/50">
      {isViewerMode && (
        <div className="bg-primary text-white text-[10px] font-bold py-1.5 px-4 flex justify-between items-center shrink-0 z-[60]">
          <div className="flex items-center gap-1.5 uppercase tracking-widest">
            <Info size={12} /> Viewer Mode
          </div>
          <button
            onClick={() => window.location.href = window.location.pathname}
            className="underline opacity-80 hover:opacity-100 transition-opacity"
          >
            Exit
          </button>
        </div>
      )}

      <header className="px-6 py-5 glass sticky top-0 flex justify-between items-center shrink-0 z-50">
        <h1 className="text-xl font-black tracking-tight text-primary">Kids Schedule</h1>
        {!isViewerMode && (
          <button
            onClick={() => handleAdd('schedule')}
            aria-label="Add schedule"
            className="w-10 h-10 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={24} />
          </button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        <div className="animate-slide-up">
          {renderView()}
        </div>
      </main>

      <BottomNav currentView={view} setView={setView} />

      <ModalSystem
        type={modalType}
        onClose={() => setModalType(null)}
        editingData={editingData}
      />
    </div>
  );
}
