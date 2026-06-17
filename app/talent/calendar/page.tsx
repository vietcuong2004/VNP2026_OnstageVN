"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Calendar as CalendarIcon, Clock, ArrowLeft, Check, Play, AlertCircle, ChevronLeft, ChevronRight,
  Trophy, CheckCircle, Sparkles, MapPin, ExternalLink, X, Info, Phone, Mail, Globe, MapPinned, Crown,
  Eye, Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createTalentCalendarEvent, deleteTalentCalendarEvent, loadTalentCalendar, loadTalentProfile, persistTalentProfile, updateTalentCalendarEvent } from "@/lib/talent-api";
import { busyDatesFromTodoLists, getTalentDayStatus } from "@/lib/talent-calendar";

// Contest data for the calendar page detail modal
const CALENDAR_CONTESTS = [
  {
    id: "cal-ct1",
    name: "Hoa hậu Áo Dài Việt Nam",
    organizer: "Hiệp hội Thiết kế Thời trang & Sở Văn hóa",
    duration: "20/08/2026 - 20/10/2026",
    suitability: 90,
    status: "Đang tham gia" as const,
    scale: "Toàn quốc",
    description: "Cuộc thi tôn vinh quốc phục Áo Dài truyền thống Việt Nam, tìm kiếm gương mặt đại diện quảng bá hình ảnh di sản quốc gia ra thế giới.",
    badgeColor: "bg-rose-500/10 border-rose-500/20 text-rose-400",
    detail: {
      organizerName: "BAN TỔ CHỨC HOA HẬU ÁO DÀI VIỆT NAM 2026",
      address: "Tòa nhà Sở Văn Hóa Thể Thao, 164 Đồng Khởi, Quận 1, TP. Hồ Chí Minh",
      phone: "0283 822 4153",
      email: "aodaivietnam@hcm.gov.vn",
      website: "hoahauaodaivietnam.vn",
      phases: [
        {
          title: "I. Khởi động và Phát động thiết kế Áo dài",
          timeline: "Tháng 07/2026",
          location: "TP. Hồ Chí Minh",
          items: [
            "Họp báo phát động cuộc thi thiết kế Áo dài đồng hành cùng chương trình",
            "Mở cổng đăng ký trực tuyến cho các nhà thiết kế và thí sinh",
            "Công bố dàn giám khảo gồm các NTK áo dài danh tiếng toàn quốc"
          ]
        },
        {
          title: "II. Vòng Sơ khảo trực tiếp",
          timeline: "Tháng 08/2026",
          location: "Hà Nội, Huế, TP. Hồ Chí Minh",
          items: [
            "Tổ chức sơ tuyển trực tiếp tại 3 miền Bắc - Trung - Nam",
            "Đo chỉ số nhân trắc và phỏng vấn kiến thức lịch sử tà áo dài Việt Nam",
            "Thí sinh trình diễn áo dài tự chọn trước hội đồng BGK"
          ]
        },
        {
          title: "III. Vòng Bán kết & Hoạt động di sản",
          timeline: "Tháng 09/2026",
          location: "Cố đô Huế, Thừa Thiên Huế",
          items: [
            "Thực hiện bộ ảnh áo dài tại Đại Nội Huế và cầu Tràng Tiền",
            "Đêm trình diễn áo dài di sản (Áo dài Show) phát sóng trên truyền hình",
            "Lựa chọn TOP 35 thí sinh đi tiếp vào đêm chung kết xếp hạng"
          ]
        },
        {
          title: "IV. Đêm Chung kết",
          timeline: "Tháng 10/2026",
          location: "Nhà hát Thành phố, TP. Hồ Chí Minh",
          items: [
            "Tập luyện kỹ năng catwalk uyển chuyển với tà áo dài cùng HLV chuyên nghiệp",
            "Đêm chung kết trao vương miện diễn ra ngày 20/10/2026 (Ngày Phụ nữ Việt Nam)",
            "Truyền hình trực tiếp trên sóng HTV và phát sóng đa nền tảng số"
          ]
        }
      ],
      notes: [
        "Thí sinh tham gia sẽ được các NTK nổi tiếng hỗ trợ may đo áo dài độc quyền suốt hành trình cuộc thi.",
        "Yêu cầu vẻ đẹp tự nhiên hài hòa, nụ cười rạng rỡ và mái tóc dài đen mượt truyền thống."
      ]
    },
    funding: {
      projectName: "Lớp học công nghệ cho trẻ em khuyết tật (Lê Mỹ Linh)",
      projectImage: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&h=300&q=80",
      raised: 45000000,
      goal: 80000000,
      supportersCount: 512,
      sponsors: [
        { name: "VNP Group", tier: "Kim Cương" },
        { name: "EduTech Việt Nam", tier: "Vàng" }
      ]
    }
  },
  {
    id: "cal-ct2",
    name: "Hoa hậu Quốc gia Việt Nam",
    organizer: "Công ty Sen Vàng",
    duration: "15/09/2026 - 18/12/2026",
    suitability: 92,
    status: "Đang chờ duyệt" as const,
    scale: "Toàn quốc (63 tỉnh thành)",
    description: "Cuộc thi tôn vinh vẻ đẹp truyền thống gắn liền với nét đẹp văn hóa đặc trưng của các vùng miền và quảng bá du lịch Việt Nam.",
    badgeColor: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
    detail: {
      organizerName: "CÔNG TY CỔ PHẦN QUẢN CÁO THƯƠNG MẠI SEN VÀNG",
      address: "6D Trường Sa, Phường 15, Quận Bình Thạnh, TP. Hồ Chí Minh",
      phone: "0283 899 2233",
      email: "info@senvangvn.com",
      website: "hoahauquocgia.senvang.com",
      phases: [
        {
          title: "I. Tuyển sinh & Gặp gỡ báo chí",
          timeline: "Tháng 07/2026",
          location: "TP. Hồ Chí Minh",
          items: [
            "Nhận đăng ký ứng viên đại diện cho 63 tỉnh thành",
            "Họp báo ra mắt ban giám khảo và các chuyên gia văn hóa lịch sử",
            "Sơ loại hồ sơ học vấn và năng khiếu vùng miền của thí sinh"
          ]
        },
        {
          title: "II. Vòng Sơ khảo vùng miền",
          timeline: "Tháng 09/2026",
          location: "Miền Bắc, Miền Trung, Miền Nam",
          items: [
            "Tổ chức thi tuyển trực tiếp tại 3 cụm khu vực trọng điểm",
            "Thi tài năng thuyết trình văn hóa du lịch địa phương của thí sinh",
            "Chọn ra 63 gương mặt xuất sắc nhất đại diện cho 63 tỉnh thành"
          ]
        },
        {
          title: "III. Vòng Chung khảo & Hoạt động thực tế",
          timeline: "Tháng 11/2026",
          location: "Khu di tích lịch sử đền Hùng, Phú Thọ",
          items: [
            "Thực hiện bộ ảnh cổ phục dân tộc tại các địa danh văn hóa lớn",
            "Tham gia chuỗi tọa đàm giới thiệu ẩm thực và làng nghề truyền thống",
            "Đêm chung khảo xếp hạng các phần thi phụ"
          ]
        },
        {
          title: "IV. Vòng Chung kết toàn quốc",
          timeline: "Tháng 12/2026",
          location: "Tp. Hà Nội",
          items: [
            "Tổng duyệt catwalk đồng diễn trang phục các dân tộc Việt Nam",
            "Đêm chung kết toàn quốc diễn ra ngày 18/12/2026 tại Trung tâm Hội nghị Quốc gia",
            "Truyền hình trực tiếp trên các kênh VTV và FPT Play"
          ]
        }
      ],
      notes: [
        "Mỗi thí sinh đại diện cho một tỉnh thành sẽ được ban tổ chức tài trợ gói thiết kế trang phục dân tộc riêng (trị giá lên tới 50M).",
        "Chấp nhận thí sinh có can thiệp thẩm mỹ nhẹ nhưng chưa thay đổi cấu trúc khung xương mặt."
      ]
    },
    funding: {
      projectName: "Nước sạch cho trường em bản cao (Trần Thu Thảo)",
      projectImage: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=600&h=300&q=80",
      raised: 88000000,
      goal: 150000000,
      supportersCount: 920,
      sponsors: [
        { name: "Sen Vàng Agency", tier: "Kim Cương" },
        { name: "Lotus Airlines", tier: "Vàng" },
        { name: "AquaPure VN", tier: "Bạc" }
      ]
    }
  }
];

function isBackendCalendarTaskId(taskId: string | number) {
  return /^\d+$/.test(String(taskId));
}

export default function CalendarPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [selectedCalendarContest, setSelectedCalendarContest] = useState<typeof CALENDAR_CONTESTS[number] | null>(null);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

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
            onClick={() => router.push("/talent/dashboard")} 
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
              <span>🟡 Chưa có lịch</span>
            </div>
          </div>
        </div>

      </div>

      {/* Cuộc thi đang tham gia */}
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Trophy className="h-5 w-5 text-amber-400" />
          <h2 className="font-display text-lg font-black text-white uppercase tracking-tight">Cuộc thi đang tham gia</h2>
          <span className="text-[9px] font-bold text-slate-500 bg-white/5 border border-white/5 rounded-lg px-2 py-0.5 uppercase tracking-wider">
            2 cuộc thi
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Contest Card 1: Đang tham gia */}
          <div className="relative overflow-hidden rounded-2xl bg-[#08090f] border border-[#4f1a2d] hover:border-rose-400/40 shadow-[0_0_15px_rgba(236,72,153,0.02)] p-6 transition-all duration-300 group">
            <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full opacity-10 blur-3xl bg-rose-400 pointer-events-none" />

            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded border px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-rose-500/10 border-rose-500/20 text-rose-400">
                    Toàn quốc
                  </span>
                  <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-2.5 py-0.5 text-[8px] text-emerald-400 font-extrabold border border-emerald-500/20 uppercase tracking-wider">
                    <CheckCircle className="h-3 w-3" /> Đang tham gia
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-sm text-white mt-2 leading-snug">Hoa hậu Áo Dài Việt Nam</h3>
                <p className="text-[10px] text-slate-500 font-bold">Hiệp hội Thiết kế Thời trang & Sở Văn hóa</p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Sparkles className="h-3 w-3 text-amber-400 fill-amber-400/20" />
                  <span className="font-display font-extrabold text-sm text-amber-400">90%</span>
                </div>
                <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">Phù hợp</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mt-4 font-medium relative z-10 line-clamp-2">
              Cuộc thi tôn vinh quốc phục Áo Dài truyền thống Việt Nam, tìm kiếm gương mặt đại diện quảng bá hình ảnh di sản quốc gia ra thế giới.
            </p>

            {/* Phase Progress */}
            <div className="mt-5 border-t border-[#151b2d] pt-4 space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tiến độ vòng thi</span>
                <span className="text-[9px] font-mono font-bold text-amber-400">Vòng 3 / 4</span>
              </div>
              <div className="flex gap-1.5">
                {[
                  { label: "Khởi động", done: true },
                  { label: "Sơ khảo", done: true },
                  { label: "Bán kết", done: false, active: true },
                  { label: "Chung kết", done: false }
                ].map((phase, i) => (
                  <div key={i} className="flex-1 space-y-1.5">
                    <div className={cn(
                      "h-1.5 w-full rounded-full transition-all",
                      phase.done
                        ? "bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.3)]"
                        : phase.active
                        ? "bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 shadow-[0_0_6px_rgba(245,158,11,0.3)] animate-pulse"
                        : "bg-slate-800"
                    )} />
                    <span className={cn(
                      "block text-[7px] font-bold uppercase tracking-wider text-center",
                      phase.done ? "text-emerald-400" : phase.active ? "text-amber-400" : "text-slate-600"
                    )}>
                      {phase.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between text-[10px] text-slate-400 relative z-10">
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>20/08/2026 - 20/10/2026</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCalendarContest(CALENDAR_CONTESTS[0])}
                className="flex items-center gap-1 text-amber-300 hover:text-amber-200 font-bold cursor-pointer hover:underline transition-colors"
              >
                Chi tiết <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Contest Card 2: Đang chờ duyệt */}
          <div className="relative overflow-hidden rounded-2xl bg-[#08090f] border border-[#143d4d] hover:border-cyan-400/40 shadow-[0_0_15px_rgba(34,211,238,0.02)] p-6 transition-all duration-300 group">
            <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full opacity-10 blur-3xl bg-cyan-400 pointer-events-none" />

            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded border px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-cyan-500/10 border-cyan-500/20 text-cyan-400">
                    Toàn quốc (63 tỉnh thành)
                  </span>
                  <span className="flex items-center gap-1 rounded bg-amber-500/10 px-2.5 py-0.5 text-[8px] text-amber-400 font-extrabold border border-amber-500/20 uppercase tracking-wider animate-pulse">
                    <Clock className="h-3 w-3" /> Đang chờ duyệt
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-sm text-white mt-2 leading-snug">Hoa hậu Quốc gia Việt Nam</h3>
                <p className="text-[10px] text-slate-500 font-bold">Công ty Sen Vàng</p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Sparkles className="h-3 w-3 text-amber-400 fill-amber-400/20" />
                  <span className="font-display font-extrabold text-sm text-amber-400">92%</span>
                </div>
                <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">Phù hợp</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mt-4 font-medium relative z-10 line-clamp-2">
              Cuộc thi tôn vinh vẻ đẹp truyền thống gắn liền với nét đẹp văn hóa đặc trưng của các vùng miền và quảng bá du lịch Việt Nam.
            </p>

            {/* Phase Progress */}
            <div className="mt-5 border-t border-[#151b2d] pt-4 space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tiến độ vòng thi</span>
                <span className="text-[9px] font-mono font-bold text-amber-400">Chờ duyệt hồ sơ</span>
              </div>
              <div className="flex gap-1.5">
                {[
                  { label: "Tuyển sinh", done: false, active: true },
                  { label: "Sơ khảo", done: false },
                  { label: "Chung khảo", done: false },
                  { label: "Chung kết", done: false }
                ].map((phase, i) => (
                  <div key={i} className="flex-1 space-y-1.5">
                    <div className={cn(
                      "h-1.5 w-full rounded-full transition-all",
                      phase.done
                        ? "bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.3)]"
                        : phase.active
                        ? "bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 shadow-[0_0_6px_rgba(245,158,11,0.3)] animate-pulse"
                        : "bg-slate-800"
                    )} />
                    <span className={cn(
                      "block text-[7px] font-bold uppercase tracking-wider text-center",
                      phase.done ? "text-emerald-400" : phase.active ? "text-amber-400" : "text-slate-600"
                    )}>
                      {phase.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between text-[10px] text-slate-400 relative z-10">
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>15/09/2026 - 18/12/2026</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCalendarContest(CALENDAR_CONTESTS[1])}
                className="flex items-center gap-1 text-amber-300 hover:text-amber-200 font-bold cursor-pointer hover:underline transition-colors"
              >
                Chi tiết <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Contest Detail Modal */}
      {selectedCalendarContest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-[#08090f] border border-[#151b2d] rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-300">

            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-[#151b2d]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={cn("rounded border px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider", selectedCalendarContest.badgeColor)}>
                    {selectedCalendarContest.scale}
                  </span>
                  {selectedCalendarContest.status === "Đang tham gia" && (
                    <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[8px] text-emerald-400 font-extrabold border border-emerald-500/20 uppercase tracking-wider">
                      <CheckCircle className="h-3 w-3" /> Đang tham gia
                    </span>
                  )}
                  {selectedCalendarContest.status === "Đang chờ duyệt" && (
                    <span className="flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[8px] text-amber-400 font-extrabold border border-amber-500/20 uppercase tracking-wider">
                      <Clock className="h-3 w-3" /> Đang chờ duyệt
                    </span>
                  )}
                </div>
                <h2 className="font-display font-black text-lg text-white mt-1.5 uppercase leading-tight tracking-tight">
                  {selectedCalendarContest.name}
                </h2>
                <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">
                  Tổ chức bởi: <span className="text-slate-300">{selectedCalendarContest.organizer}</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedCalendarContest(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#151b2d] bg-[#050711] text-slate-400 hover:text-white transition-all cursor-pointer hover:border-slate-800"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-thin">

              {/* Description */}
              <div className="space-y-2">
                <h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                  <Info className="h-4 w-4 text-amber-400" /> Mô tả cuộc thi
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed pl-6 font-medium">
                  {selectedCalendarContest.description}
                </p>
              </div>

              {/* Organization contact cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#050711]/50 border border-[#151b2d] rounded-2xl p-4 text-[10px] text-slate-400">
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2">
                    <MapPinned className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><b>Trụ sở BTC:</b> <span className="text-slate-300">{selectedCalendarContest.detail.address}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-500 shrink-0" />
                    <span><b>Hotline:</b> <span className="text-slate-300 font-mono">{selectedCalendarContest.detail.phone}</span></span>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-500 shrink-0" />
                    <span><b>Email:</b> <span className="text-slate-300 font-mono">{selectedCalendarContest.detail.email}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-amber-400 shrink-0" />
                    <span><b>Website:</b> <a href={`https://${selectedCalendarContest.detail.website}`} target="_blank" rel="noreferrer" className="text-amber-300 hover:underline font-mono">{selectedCalendarContest.detail.website}</a></span>
                  </div>
                </div>
              </div>

              {/* Funding section */}
              {selectedCalendarContest.funding && (
                <div className="space-y-4 border-t border-[#151b2d] pt-6">
                  <h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                    <Crown className="h-4 w-4 text-amber-400 animate-pulse" /> Gọi vốn dự án & Nhà Tài trợ
                  </h4>

                  <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-b from-[#111421] to-[#08090f] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
                    <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full opacity-10 blur-3xl bg-amber-400 pointer-events-none" />

                    <div className="flex flex-col md:flex-row gap-5">
                      <div className="h-32 md:h-24 md:w-36 w-full rounded-xl bg-slate-900 border border-white/5 relative overflow-hidden shrink-0">
                        <img
                          src={selectedCalendarContest.funding.projectImage}
                          alt={selectedCalendarContest.funding.projectName}
                          className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute bottom-2 left-2">
                          <span className="inline-flex items-center rounded bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.5 text-[8px] font-bold text-amber-300 uppercase">
                            CROWN FUNDING
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 space-y-3">
                        <div>
                          <h5 className="font-display font-black text-xs text-white uppercase tracking-wider leading-snug">
                            {selectedCalendarContest.funding.projectName}
                          </h5>
                          <p className="text-[10px] text-slate-400 font-medium mt-1">
                            Chiến dịch gây quỹ ủng hộ dự án cộng đồng/nhân ái của thí sinh trong khuôn khổ cuộc thi.
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between items-end text-[9px] font-bold uppercase tracking-wider">
                            <span className="text-amber-400">Tiến độ: {Math.round((selectedCalendarContest.funding.raised / selectedCalendarContest.funding.goal) * 100)}%</span>
                            <span className="text-slate-400">
                              <span className="text-white font-mono">{selectedCalendarContest.funding.raised.toLocaleString()}đ</span> / {selectedCalendarContest.funding.goal.toLocaleString()}đ
                            </span>
                          </div>

                          <div className="h-1.5 w-full rounded-full bg-slate-950 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 shadow-[0_0_8px_rgba(245,158,11,0.3)] transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.round((selectedCalendarContest.funding.raised / selectedCalendarContest.funding.goal) * 100))}%` }}
                            />
                          </div>

                          <div className="flex justify-between items-center text-[8px] text-slate-500 font-semibold uppercase tracking-wider">
                            <span>{selectedCalendarContest.funding.supportersCount} Nhà hảo tâm ủng hộ</span>
                            <button
                              onClick={() => {
                                setSelectedCalendarContest(null);
                                router.push("/talent/crown");
                              }}
                              className="text-amber-300 hover:text-amber-200 hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                            >
                              Ủng hộ dự án &rarr;
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sponsors */}
                    <div className="mt-4 pt-4 border-t border-[#151b2d]">
                      <span className="block text-[8px] text-slate-500 font-extrabold uppercase tracking-wider mb-2">Nhà tài trợ đồng hành</span>
                      <div className="flex flex-wrap gap-2 items-center">
                        {selectedCalendarContest.funding.sponsors.map((sponsor, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex items-center gap-1.5 rounded-lg border border-[#151b2d] bg-[#050711]/60 px-2.5 py-1 text-[9px] hover:border-amber-500/20 transition-all duration-300"
                          >
                            <div className={cn(
                              "h-1.5 w-1.5 rounded-full shrink-0",
                              sponsor.tier === "Kim Cương" ? "bg-cyan-400" :
                                sponsor.tier === "Vàng" ? "bg-amber-400" : "bg-slate-400"
                            )} />
                            <span>
                              <strong className="text-slate-200">{sponsor.name}</strong>
                              <span className="text-slate-500 ml-1">({sponsor.tier})</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                  <Trophy className="h-4 w-4 text-amber-400" /> Lịch trình & Vòng thi chi tiết
                </h4>

                <div className="relative border-l border-[#151b2d] ml-3 pl-6 space-y-8">
                  {selectedCalendarContest.detail.phases.map((phase, idx) => (
                    <div key={idx} className="relative">
                      <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#08090f] border-2 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      </span>

                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="text-xs font-bold text-white">{phase.title}</span>
                          <div className="flex flex-wrap gap-1.5">
                            <span className="inline-flex items-center gap-1 rounded bg-[#0f172a] border border-[#1e293b] px-2 py-0.5 text-[8px] font-bold text-amber-400 uppercase font-mono">
                              <Clock className="h-2.5 w-2.5" /> {phase.timeline}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded bg-[#0f172a] border border-[#1e293b] px-2 py-0.5 text-[8px] font-bold text-slate-400 uppercase">
                              <MapPin className="h-2.5 w-2.5" /> {phase.location}
                            </span>
                          </div>
                        </div>

                        <ul className="list-disc pl-4 space-y-1 text-slate-400 text-xs font-medium">
                          {phase.items.map((item, i) => (
                            <li key={i} className="leading-relaxed">{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2.5 border-t border-[#151b2d] pt-4">
                <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">Lưu ý từ ban tổ chức</h4>
                <ul className="list-disc pl-4 space-y-1.5 text-slate-500 text-[10px] font-medium leading-relaxed">
                  {selectedCalendarContest.detail.notes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#151b2d] bg-[#050711]">
              <button
                onClick={() => setSelectedCalendarContest(null)}
                className="px-5 py-2.5 rounded-xl border border-[#151b2d] text-xs font-bold text-slate-400 hover:text-white hover:bg-white/2 cursor-pointer transition-colors"
              >
                Đóng lại
              </button>
              <button
                onClick={() => {
                  setSelectedCalendarContest(null);
                  router.push("/talent/contests");
                }}
                className="px-6 py-2.5 rounded-xl font-display text-xs font-bold transition-all duration-300 cursor-pointer bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 text-slate-950 shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.98]"
              >
                Xem tất cả cuộc thi
              </button>
            </div>

          </div>
        </div>
      )}

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

