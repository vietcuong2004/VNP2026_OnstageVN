"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Calendar as CalendarIcon, Clock, ArrowLeft, Check, Play, AlertCircle, ChevronLeft, ChevronRight,
  Trophy, CheckCircle, Sparkles, MapPin, ExternalLink, X, Info, Phone, Mail, Globe, MapPinned, Crown,
  Eye, Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  createTalentCalendarEvent, deleteTalentCalendarEvent, loadTalentCalendar, 
  loadTalentProfile, persistTalentProfile, updateTalentCalendarEvent,
  loadTalentCampaignsPage, mapCampaignToTalentJob 
} from "@/lib/talent-api";
import { getStoredAuthUser } from "@/lib/api-client";
import { busyDatesFromTodoLists, getTalentDayStatus } from "@/lib/talent-calendar";

function formatDate(value?: string | null) {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function isBackendCalendarTaskId(taskId: string | number) {
  return /^\d+$/.test(String(taskId));
}

export default function CalendarPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [participatingJobs, setParticipatingJobs] = useState<any[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  // Calendar states
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // Default June 2026
  const [selectedDate, setSelectedDate] = useState("2026-06-24"); // Default Selected Day
  const [todayDateStr, setTodayDateStr] = useState("");
  const [busyDates, setBusyDates] = useState<string[]>([]);

  // To-do lists state
  const [todoLists, setTodoLists] = useState<any>({
    "2026-06-26": [
      { id: "t4", time: "14:00 - 16:00", title: "Fitting Đầm Dạ Hội VIP", desc: "Thử đồ chuẩn bị cho show diễn chính tại Gem Center", status: "pending" }
    ]
  });

  const [newTask, setNewTask] = useState({ time: "", title: "", desc: "" });

  const getDayStatus = (dateStr: string) =>
    getTalentDayStatus(dateStr, profile?.availabilityCalendar, busyDates);

  const getTasksForDate = (dateStr: string) => todoLists[dateStr] || [];

  const handleCalendarDayClick = (dateStr: string) => {
    setSelectedDate(dateStr);
  };

  const syncCalendarState = (nextTodoLists: Record<string, any[]>, nextAvailabilityCalendar?: string[]) => {
    const computedBusyDates = busyDatesFromTodoLists(nextTodoLists);
    setTodoLists(nextTodoLists);
    setBusyDates(computedBusyDates);
    setProfile((current: any) => {
      if (!current) return current;
      return persistTalentProfile({
        ...current,
        availabilityCalendar: nextAvailabilityCalendar ?? current.availabilityCalendar ?? [],
        busyDates: computedBusyDates,
      });
    });
  };

  const handleGoToToday = () => {
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();
    const dateStr = `${todayYear}-${String(todayMonth).padStart(2, '0')}-${String(todayDay).padStart(2, '0')}`;
    
    setSelectedDate(dateStr);
    setCurrentMonth(todayMonth);
    setCurrentYear(todayYear);
  };

  useEffect(() => {
    let active = true;
    const today = new Date();
    setTodayDateStr(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);

    loadTalentProfile().then(async (loadedProfile) => {
      if (!active) return;
      setProfile(loadedProfile);

      const calendar = await loadTalentCalendar(loadedProfile);
      if (!active || !calendar) return;

      setTodoLists(calendar.todoLists);
      setBusyDates(calendar.busyDates);

      const updatedProfile = persistTalentProfile({
        ...loadedProfile,
        availabilityCalendar: calendar.availabilityCalendar,
        busyDates: calendar.busyDates,
      });
      setProfile(updatedProfile);
    });

    const currentUser = getStoredAuthUser();
    if (currentUser) {
      setIsLoadingJobs(true);
      loadTalentCampaignsPage({ perPage: 100 })
        .then((res) => {
          if (!active) return;
          if (res?.data) {
            const mapped = res.data.map(mapCampaignToTalentJob);
            const applied = mapped.filter((job) => job.hasApplied);
            setParticipatingJobs(applied);
          }
          setIsLoadingJobs(false);
        })
        .catch((err) => {
          console.warn("Failed to load participating jobs", err);
          if (active) setIsLoadingJobs(false);
        });
    }

    return () => {
      active = false;
    };
  }, []);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayPad = (year: number, month: number) => {
    const firstDayIndex = new Date(year, month - 1, 1).getDay();
    // Monday start pad
    return firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  };

  // Todo tasks handlers
  const cycleTaskStatus = async (date: string, taskId: string) => {
    const dateTodos = getTasksForDate(date);
    const currentTask = dateTodos.find((todo: any) => String(todo.id) === String(taskId));
    if (currentTask?.locked) return;

    let nextStatusForBackend: string | null = null;
    const updated = dateTodos.map((todo: any) => {
      if (todo.id === taskId) {
        let nextStatus = "pending";
        if (todo.status === "pending") nextStatus = "in_progress";
        else if (todo.status === "in_progress") nextStatus = "completed";
        nextStatusForBackend = nextStatus;
        return { ...todo, status: nextStatus };
      }
      return todo;
    });

    const newTodoLists = { ...todoLists, [date]: updated };
    syncCalendarState(newTodoLists);

    if (nextStatusForBackend && isBackendCalendarTaskId(taskId)) {
      try {
        await updateTalentCalendarEvent(taskId, { status: nextStatusForBackend });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const completeTaskAndNext = async (date: string, taskId: string) => {
    const dateTodos = getTasksForDate(date);
    const index = dateTodos.findIndex((todo: any) => todo.id === taskId);
    if (index === -1) return;
    if (dateTodos[index]?.locked) return;
    const nextTodo = dateTodos[index + 1];

    const updated = dateTodos.map((todo: any, idx: number) => {
      if (idx === index) {
        return { ...todo, status: "completed" };
      }
      if (idx === index + 1) {
        return { ...todo, status: "in_progress" };
      }
      return todo;
    });

    const newTodoLists = { ...todoLists, [date]: updated };
    syncCalendarState(newTodoLists);

    try {
      if (isBackendCalendarTaskId(taskId)) {
        await updateTalentCalendarEvent(taskId, { status: "completed" });
      }
      if (nextTodo && isBackendCalendarTaskId(nextTodo.id)) {
        await updateTalentCalendarEvent(nextTodo.id, { status: "in_progress" });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    let taskItem = {
      id: `task-${Date.now()}`,
      time: newTask.time || "Cả ngày",
      title: newTask.title,
      desc: newTask.desc || "",
      status: "pending"
    };

    if (profile?.backendProfileId) {
      try {
        const event = await createTalentCalendarEvent(profile.backendProfileId, selectedDate, newTask);
        taskItem = {
          id: event.id,
          time: event.starts_at && event.ends_at ? `${event.starts_at.slice(11, 16)} - ${event.ends_at.slice(11, 16)}` : taskItem.time,
          title: event.title || taskItem.title,
          desc: event.description || taskItem.desc,
          status: event.status || "pending"
        };
      } catch (error) {
        console.error(error);
      }
    }

    const dateTodos = getTasksForDate(selectedDate);
    const newTodoLists = {
      ...todoLists,
      [selectedDate]: [...dateTodos, taskItem]
    };

    syncCalendarState(newTodoLists);
    setNewTask({ time: "", title: "", desc: "" });
  };

  const handleDeleteTask = async (date: string, taskId: string | number) => {
    const previousTodoLists = todoLists;
    const currentTask = getTasksForDate(date).find((todo: any) => String(todo.id) === String(taskId));
    if (currentTask?.locked) {
      setSelectedTask(null);
      return;
    }

    const nextTasks = getTasksForDate(date).filter((todo: any) => String(todo.id) !== String(taskId));
    syncCalendarState({ ...todoLists, [date]: nextTasks });
    setSelectedTask(null);

    if (!isBackendCalendarTaskId(taskId)) return;

    try {
      await deleteTalentCalendarEvent(taskId);
    } catch (error) {
      console.error(error);
      syncCalendarState(previousTodoLists);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/talent/jobs")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#151b2d] bg-[#08090f] text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-display text-3xl font-black text-white tracking-tight uppercase leading-none">Lịch Trình</h1>
            <p className="text-xs text-slate-400 mt-2 font-medium">Theo dõi timeline công việc hàng ngày và quản lý trạng thái lịch làm việc của bạn.</p>
          </div>
        </div>
      </div>

      {/* Main Grid layout: Timeline (Main) Left, Calendar (Minor) Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Timeline & Daily To-Do Card (Main - 7/12) */}
        <div className="lg:col-span-7 space-y-6">

          {/* Timeline & Daily To-Do Card */}
          <div className="rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-6">
            <div className="border-b border-[#151b2d] pb-3 flex justify-between items-end flex-wrap gap-2">
              <div>
                <h4 className="text-sm font-black text-white uppercase flex items-center gap-2">
                  <Clock className="h-4 w-4 text-cyan-400" /> Lịch trình ngày {selectedDate.split("-")[2]}/{selectedDate.split("-")[1]}/{selectedDate.split("-")[0]}
                </h4>
              </div>
              
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleGoToToday}
                  className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 text-[9.5px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 shadow-lg shadow-cyan-500/10 border border-cyan-400/25"
                >
                  <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
                  Lịch làm việc hôm nay
                </button>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono shrink-0">
                  {getTasksForDate(selectedDate).length} Việc
                </span>
              </div>
            </div>

            {/* Timeline Track */}
            <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
              {getTasksForDate(selectedDate).length > 0 ? (
                getTasksForDate(selectedDate).map((todo: any) => {
                  const isCompleted = todo.status === "completed";
                  const isInProgress = todo.status === "in_progress";
                  const isCampaignEvent = todo.eventType === "campaign" || todo.locked;
                  
                  return (
                    <div key={todo.id} className="relative group animate-in fade-in slide-in-from-left-1 duration-200">
                      
                      {/* Interactive circular timeline status toggle */}
                      <button
                        type="button"
                        onClick={() => cycleTaskStatus(selectedDate, todo.id)}
                        disabled={isCampaignEvent}
                        className={cn(
                          "absolute -left-[23px] flex h-4.5 w-4.5 items-center justify-center rounded-full border bg-slate-950 transition-transform",
                          isCampaignEvent ? "cursor-default" : "hover:scale-110 cursor-pointer",
                          isInProgress ? "top-3.5" : "top-0.5",
                          isCampaignEvent && "border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.3)]",
                          isCompleted && "border-emerald-500 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]",
                          isInProgress && "border-amber-400 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.3)]",
                          !isCampaignEvent && todo.status === "pending" && "border-red-500 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.3)]"
                        )}
                        title={isCampaignEvent ? "Lịch được đồng bộ từ campaign" : "Đổi trạng thái (Bấm để xoay vòng)"}
                      >
                        {isCampaignEvent && <Briefcase className="h-2.5 w-2.5" />}
                        {isCompleted && <Check className="h-2.5 w-2.5" />}
                        {isInProgress && <Play className="h-2 w-2 fill-current" />}
                        {!isCampaignEvent && todo.status === "pending" && <AlertCircle className="h-2.5 w-2.5" />}
                      </button>

                      <div className={cn(
                        "flex justify-between items-start gap-4 text-left transition-all",
                        isCampaignEvent && "bg-cyan-400/5 border border-cyan-400/20 rounded-xl p-3 shadow-[0_0_15px_rgba(34,211,238,0.05)]",
                        isInProgress && "bg-amber-400/5 border border-amber-400/30 rounded-xl p-3 shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                      )}>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] font-mono font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                              {todo.time}
                            </span>
                            <span className={cn(
                              "text-[7.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border",
                              isCampaignEvent && "bg-cyan-400/10 border-cyan-400/20 text-cyan-300",
                              isCompleted && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                              isInProgress && "bg-amber-400/10 border-amber-400/20 text-amber-400",
                              !isCampaignEvent && todo.status === "pending" && "bg-red-500/10 border-red-500/20 text-red-400"
                            )}>
                              {isCampaignEvent ? "Chiến dịch" : isCompleted ? "Đã hoàn thành" : isInProgress ? "Đang làm" : "Chưa hoàn thành"}
                            </span>
                          </div>
                          
                          <h5 className={cn("text-xs font-black text-white mt-1 leading-snug", isCompleted && "line-through text-slate-500")}>
                            {todo.title}
                          </h5>
                          {todo.desc && (
                            <p className={cn("text-[9.5px] text-slate-500 leading-normal", isCompleted && "text-slate-600")}>
                              {todo.desc}
                            </p>
                          )}
                        </div>

                        {/* Task Action Button */}
                        {!isCampaignEvent && todo.status === "in_progress" ? (
                          <button
                            type="button"
                            onClick={() => completeTaskAndNext(selectedDate, todo.id)}
                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/30 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 text-[9.5px] font-black uppercase tracking-wider flex items-center gap-1.5 active:scale-95 shadow-lg shadow-emerald-500/5 hover:shadow-emerald-500/10"
                            title="Đánh dấu hoàn thành"
                          >
                            <Check className="h-3 w-3 shrink-0" />
                            <span>Hoàn thành</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedTask(todo)}
                            className="bg-slate-800/40 hover:bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/30 hover:border-slate-600/50 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 text-[9.5px] font-black uppercase tracking-wider flex items-center gap-1.5 active:scale-95"
                            title="Xem chi tiết công việc"
                          >
                            <Eye className="h-3.5 w-3.5 shrink-0" />
                            <span>Chi tiết</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-slate-600 space-y-2">
                  <p className="text-[10px] uppercase font-black tracking-wider text-amber-400">Hôm nay chưa có lịch nào</p>
                  <p className="text-[9px] normal-case text-slate-500">Trạng thái rảnh. Bạn sẵn sàng nhận lời mời hợp tác mới.</p>
                </div>
              )}
            </div>

            {/* Add Task Inline Form */}
            <form onSubmit={handleAddTask} className="border-t border-[#151b2d] pt-4 space-y-3">
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider text-left">Thêm công việc mới</span>
              
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Giờ (VD: 09:00 - 11:00)"
                  value={newTask.time}
                  onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-amber-400 transition-colors"
                />
                <input
                  type="text"
                  required
                  placeholder="Tên công việc..."
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="col-span-2 w-full bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Mô tả công việc chi tiết..."
                  value={newTask.desc}
                  onChange={(e) => setNewTask({ ...newTask, desc: e.target.value })}
                  className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-amber-400 transition-colors"
                />
                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl px-3 font-bold text-[10px] uppercase tracking-wider flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                >
                  Thêm
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right Column: Month Calendar Grid (Minor - 5/12) */}
        <div className="lg:col-span-5 rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#151b2d] pb-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4.5 w-4.5 text-amber-400" /> 
              <h3 className="font-display font-black text-xs text-white uppercase tracking-wider">
                Tháng {currentMonth < 10 ? `0${currentMonth}` : currentMonth}/{currentYear}
              </h3>
            </div>
            <div className="flex items-center gap-2 z-10">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/5 border border-amber-400/20 text-amber-400 hover:bg-amber-400 hover:text-slate-950 hover:border-transparent hover:shadow-[0_0_12px_rgba(244,196,48,0.3)] transition-all cursor-pointer"
                title="Tháng trước"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/5 border border-amber-400/20 text-amber-400 hover:bg-amber-400 hover:text-slate-950 hover:border-transparent hover:shadow-[0_0_12px_rgba(244,196,48,0.3)] transition-all cursor-pointer"
                title="Tháng sau"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-500 font-black uppercase">
              <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {/* Pad empty days */}
              {Array.from({ length: getFirstDayPad(currentYear, currentMonth) }).map((_, pIdx) => (
                <div key={`pad-${pIdx}`} className="h-14 border border-transparent" />
              ))}

              {/* Real days */}
              {Array.from({ length: getDaysInMonth(currentYear, currentMonth) }).map((_, idx) => {
                const dayNumber = idx + 1;
                const dayStr = dayNumber < 10 ? `0${dayNumber}` : `${dayNumber}`;
                const monthStr = currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;
                const dateKey = `${currentYear}-${monthStr}-${dayStr}`;
                const status = getDayStatus(dateKey);
                const isSelected = dateKey === selectedDate;
                const isToday = dateKey === todayDateStr;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleCalendarDayClick(dateKey)}
                    className={cn(
                      "flex flex-col items-center justify-between p-1.5 h-14 rounded-xl border text-center transition-all cursor-pointer hover:scale-102 relative",
                      isSelected
                        ? "border-amber-400 bg-amber-400/10 text-amber-300 ring-2 ring-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)] z-10"
                        : status === "available"
                        ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.1)] hover:border-emerald-400"
                        : "border-red-500/30 bg-red-500/5 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.1)] hover:border-red-500"
                    )}
                  >
                    <span className="text-[10px] font-mono font-bold block">{dayStr}</span>
                    {isToday && (
                      <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                      </span>
                    )}
                    <span className="text-[7.5px] font-black uppercase tracking-wider scale-90">
                      {status === "available" ? "Rảnh" : "Bận"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[9.5px] text-slate-400 border-t border-white/5 pt-3 mt-1">
              <span>🟢 Rảnh</span>
              <span>🔴 Bận</span>
            </div>
          </div>
        </div>

      </div>

      {/* Công việc đang tham gia */}
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Briefcase className="h-5 w-5 text-amber-400" />
          <h2 className="font-display text-lg font-black text-white uppercase tracking-tight">Công việc đang tham gia</h2>
          <span className="text-[9px] font-bold text-slate-500 bg-white/5 border border-white/5 rounded-lg px-2 py-0.5 uppercase tracking-wider">
            {participatingJobs.length} công việc
          </span>
        </div>

        {isLoadingJobs ? (
          <div className="text-center py-10">
            <span className="text-xs text-slate-400">Đang tải danh sách công việc...</span>
          </div>
        ) : !getStoredAuthUser() ? (
          <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-8 text-center max-w-md mx-auto">
            <Briefcase className="h-8 w-8 text-slate-500 mx-auto mb-3" />
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Xem Công Việc Đang Tham Gia</h4>
            <p className="text-[10px] text-slate-500 mt-2">
              Vui lòng đăng nhập tài khoản Talent để xem thông tin tiến độ và chi tiết các công việc bạn đang tham gia ứng tuyển.
            </p>
            <button
              onClick={() => router.push("/auth/login?redirect=/talent/calendar")}
              className="mt-4 h-8 rounded-lg bg-amber-400 hover:bg-amber-500 px-4 text-[10px] font-black text-slate-950 transition-all uppercase tracking-wider cursor-pointer"
            >
              Đăng nhập ngay
            </button>
          </div>
        ) : participatingJobs.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-8 text-center max-w-md mx-auto">
            <Briefcase className="h-8 w-8 text-slate-500 mx-auto mb-3" />
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Chưa có công việc nào</h4>
            <p className="text-[10px] text-slate-500 mt-2">
              Bạn chưa ứng tuyển hoặc chưa tham gia chiến dịch nào. Hãy khám phá và ứng tuyển các chiến dịch mới tại trang Dashboard!
            </p>
            <button
              onClick={() => router.push("/talent/jobs")}
              className="mt-4 h-8 rounded-lg bg-amber-400 hover:bg-amber-500 px-4 text-[10px] font-black text-slate-950 transition-all uppercase tracking-wider cursor-pointer"
            >
              Xem danh sách chiến dịch
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {participatingJobs.map((job) => {
              const appStatus = job.application?.status || "pending";
              const isApproved = appStatus === "approved" || appStatus === "executing" || appStatus === "completed";
              const dateRange = job.startDate && job.endDate ? `${formatDate(job.startDate)} - ${formatDate(job.endDate)}` : "Chưa cập nhật";
              
              return (
                <div key={job.id} className={cn(
                  "relative overflow-hidden rounded-2xl bg-[#08090f] border hover:border-amber-400/40 p-6 transition-all duration-300 group",
                  isApproved ? "border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.02)]" : "border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.02)]"
                )}>
                  <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full opacity-5 blur-3xl bg-amber-400 pointer-events-none" />

                  <div className="flex justify-between items-start relative z-10">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {job.city && (
                          <span className="rounded border px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-slate-800 border-white/10 text-slate-300">
                            {job.city}
                          </span>
                        )}
                        {isApproved ? (
                          <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-2.5 py-0.5 text-[8px] text-emerald-400 font-extrabold border border-emerald-500/20 uppercase tracking-wider">
                            <CheckCircle className="h-3 w-3" /> Đang tham gia
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 rounded bg-amber-500/10 px-2.5 py-0.5 text-[8px] text-amber-400 font-extrabold border border-amber-500/20 uppercase tracking-wider animate-pulse">
                            <Clock className="h-3 w-3" /> Đang chờ duyệt
                          </span>
                        )}
                      </div>
                      <h3 className="font-display font-extrabold text-sm text-white mt-2 leading-snug">{job.title}</h3>
                      <p className="text-[10px] text-slate-500 font-bold">{job.brand}</p>
                    </div>
                    {job.matchScore && (
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Sparkles className="h-3 w-3 text-amber-400 fill-amber-400/20" />
                          <span className="font-display font-extrabold text-sm text-amber-400">{job.matchScore}%</span>
                        </div>
                        <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">Phù hợp</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mt-4 font-medium relative z-10 line-clamp-2">
                    {job.brief || "Chi tiết công việc chưa được cập nhật mô tả ngắn."}
                  </p>

                  <div className="mt-5 border-t border-[#151b2d] pt-4 flex items-center justify-between text-[10px] text-slate-400 relative z-10">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span>{dateRange}</span>
                    </div>
                    {job.budget && (
                      <span className="text-amber-300 font-bold">{job.budget}</span>
                    )}
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => router.push(`/talent/campaigns?id=${job.id}`)}
                      className="flex items-center gap-1 text-xs text-amber-300 hover:text-amber-200 font-bold cursor-pointer hover:underline transition-colors"
                    >
                      Chi tiết chiến dịch <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg flex flex-col bg-[#08090f] border border-[#151b2d] rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-300">

            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-[#151b2d]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono font-bold text-slate-500 bg-white/5 px-2.5 py-0.5 rounded border border-white/5">
                    {selectedTask.time}
                  </span>
                  <span className={cn(
                    "text-[8px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded border",
                    selectedTask.locked && "bg-cyan-400/10 border-cyan-400/20 text-cyan-300",
                    selectedTask.status === "completed" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                    selectedTask.status === "in_progress" && "bg-amber-400/10 border-amber-400/20 text-amber-400",
                    !selectedTask.locked && selectedTask.status === "pending" && "bg-red-500/10 border-red-500/20 text-red-400"
                  )}>
                    {selectedTask.locked ? "Chiến dịch" : selectedTask.status === "completed" ? "Đã hoàn thành" : selectedTask.status === "in_progress" ? "Đang làm" : "Chưa hoàn thành"}
                  </span>
                </div>
                <h2 className="font-display font-black text-lg text-white mt-2 leading-tight tracking-tight">
                  {selectedTask.locked ? "Chi Tiết Chiến Dịch" : "Chi Tiết Công Việc"}
                </h2>
              </div>

              <button
                onClick={() => setSelectedTask(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#151b2d] bg-[#050711] text-slate-400 hover:text-white transition-all cursor-pointer hover:border-slate-800"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Tên công việc</span>
                <h3 className="text-sm font-extrabold text-white leading-snug">
                  {selectedTask.title}
                </h3>
              </div>

              {selectedTask.desc && (
                <div className="space-y-1 border-t border-[#151b2d] pt-4">
                  <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Mô tả chi tiết</span>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    {selectedTask.desc}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between gap-3 p-6 border-t border-[#151b2d] bg-[#050711]">
              {selectedTask.locked ? (
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                  Đồng bộ từ campaign
                </span>
              ) : (
                <button
                  onClick={() => handleDeleteTask(selectedDate, selectedTask.id)}
                  className="px-5 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-xs font-bold text-red-300 hover:bg-red-500/15 cursor-pointer transition-colors"
                >
                  Xoá công việc
                </button>
              )}
              <button
                onClick={() => setSelectedTask(null)}
                className="px-5 py-2.5 rounded-xl border border-[#151b2d] text-xs font-bold text-slate-400 hover:text-white hover:bg-white/2 cursor-pointer transition-colors"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

