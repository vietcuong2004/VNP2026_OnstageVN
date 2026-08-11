"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import {
  Banknote, Check, CheckCircle2, Landmark, Mic, QrCode, Users, Wallet, X, ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import BookingMCForm from "./BookingMCForm";
import BookingLookbookForm from "./BookingLookbookForm";
import BookingPGForm from "./BookingPGForm";
import BookingContactForm from "./BookingContactForm";
import { getAuthToken } from "@/lib/api-client";

type JobType = "mc" | "lookbook" | "pg";
type BookingStep = 2 | 8 | 3 | 10 | 4 | 5 | 6 | 7;
type BookingPackageId = "basic" | "standard" | "premium";

const DEPOSIT_AMOUNT = 200000;
const DEPOSIT_AMOUNT_LABEL = "200.000 VND";

const BOOKING_PACKAGES: {
  id: BookingPackageId;
  name: string;
  duration: string;
  note: string;
  price: string;
}[] = [
    { id: "basic", name: "Gói cơ bản", duration: "1-2 tiếng", note: "Tư vấn nhanh", price: "200.000đ" },
    { id: "standard", name: "Gói tiêu chuẩn", duration: "2-4 tiếng", note: "Gợi ý lịch phù hợp", price: "300.000đ" },
    { id: "premium", name: "Gói nâng cao", duration: "1 ngày", note: "Ưu tiên xác nhận", price: "500.000đ" },
  ];

export type BookingFlowProps = {
  talent?: any;
  onSuccess?: () => void;
  className?: string;
};

function toDateValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatBookingSchedule(date: string, start: string, end: string) {
  if (!date && !start && !end) return "";
  const timeRange = [start, end].filter(Boolean).join(" - ");
  return [date, timeRange].filter(Boolean).join(" ");
}

function buildBookingCode(jobType: JobType | null) {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  const role = (jobType || "mc").toUpperCase();
  return `#${role}${pad(now.getDate())}${pad(now.getMonth() + 1)}${String(now.getFullYear()).slice(-2)}-001`;
}

// ── Custom SVG Icon for Lookbook matching image 3 (Camera + Dress Mannequin & Hanger) ──
function LookbookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M50 12 C52.5 12 54.5 14 54.5 16.5 C54.5 19 52.5 21 50 21 C47.5 21 45.5 19 45.5 16.5 C45.5 14 47.5 12 50 12 Z M42 25 C45 22 55 22 58 25 L73 35 C75.5 36.5 74.5 40 71.5 40 L64 40 L70.5 73 C71 76.5 68.5 79 65 79 L35 79 C31.5 79 29 76.5 29.5 73 L36 40 L28.5 40 C25.5 40 24.5 36.5 27 35 Z"
        fill="currentColor"
        opacity="0.38"
      />
      <path
        d="M50 16.5 C53.5 16.5 56 13.5 54 10.5 C52 7.5 47 9.5 49.5 13"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <rect x="20" y="40" width="60" height="40" rx="11" fill="currentColor" />
      <path d="M36 40 L41 33 H59 L64 40 H36 Z" fill="currentColor" />
      <circle cx="50" cy="60" r="12" fill="#0e1322" stroke="#F59E0B" strokeWidth="4.5" />
      <circle cx="67" cy="48" r="3" fill="#F59E0B" />
    </svg>
  );
}

function DepositQrCode({
  payload,
  canvasRef,
}: {
  payload: string;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}) {
  return (
    <div className="relative mx-auto flex h-48 w-48 items-center justify-center rounded-2xl bg-white p-3 shadow-2xl transition-transform duration-300 hover:scale-[1.02]">
      <QRCodeCanvas
        ref={canvasRef}
        value={payload}
        size={168}
        bgColor="#ffffff"
        fgColor="#020617"
        level="H"
        includeMargin={false}
        className="h-full w-full rounded-xl"
      />
      <div className="absolute flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-950 shadow-lg">
        <img src="/favicon.png" alt="OnstageVN" className="h-full w-full object-cover" />
      </div>
    </div>
  );
}

function downloadQrImage(canvas: HTMLCanvasElement | null, fileName: string) {
  if (!canvas) return;
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function BookingFlow({ talent, onSuccess, className }: BookingFlowProps) {
  const router = useRouter();
  const depositQrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // ── State ──
  const [step, setStep] = useState<BookingStep>(2);
  const [selectedTalent, setSelectedTalent] = useState<any>(talent || null);
  const [selectedJobType, setSelectedJobType] = useState<JobType | null>("mc");
  const [selectedPackage, setSelectedPackage] = useState<BookingPackageId>("basic");
  const [jobName, setJobName] = useState("");
  const [mcJobDescription, setMcJobDescription] = useState("");

  // Step 3 Form Data - MC
  const [workDate, setWorkDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [mcLocation, setMcLocation] = useState("");
  const [mcLanguage, setMcLanguage] = useState("Tiếng Việt");

  // Specific inputs per job type
  const [lookbookTopic, setLookbookTopic] = useState("");
  const [lookbookStyle, setLookbookStyle] = useState("Sang trọng & Dạ hội");
  const [lookbookLocation, setLookbookLocation] = useState("");

  const [pgOutfit, setPgOutfit] = useState("");
  const [pgJobDescription, setPgJobDescription] = useState("");
  const [pgSkills, setPgSkills] = useState("");

  const [extraRequirements, setExtraRequirements] = useState("");

  // Step 4 Form Data
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "wallet">("bank");

  // Success Modal
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [bookingCode, setBookingCode] = useState("");
  const depositQrPayload = `ONSTAGE_DEPOC_${bookingCode || "PENDING"}_${DEPOSIT_AMOUNT}_${contactName || "HOTEN"}_${contactPhone || "SODT"}`;

  useEffect(() => {
    if (talent) {
      setSelectedTalent(talent);
    }
  }, [talent]);

  // Default schedule to tomorrow evening.
  useEffect(() => {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(18, 0, 0, 0);

    const end = new Date(start);
    end.setHours(20, 0, 0, 0);

    setWorkDate(toDateValue(start));
    setStartTime("18:00");
    setEndTime("20:00");
  }, []);

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactPhone) {
      alert("Vui lòng nhập Họ và tên và Số điện thoại liên hệ.");
      return;
    }
    const code = buildBookingCode(selectedJobType);
    setBookingCode(code);
    setStep(5);
  };

  const handleProceedFromStep10 = () => {
    if (getAuthToken()) {
      const code = buildBookingCode(selectedJobType);
      setBookingCode(code);
      setStep(5);
    } else {
      setStep(4);
    }
  };

  const handleClose = () => {
    router.back();
  };

  const handleSelectJobType = (type: JobType) => {
    setSelectedJobType(type);
    setSelectedPackage("basic");
    setStep(getAuthToken() ? 3 : 8);
  };

  const getDetailsBackStep = () => (getAuthToken() ? 2 : 8);

  const jobTypeOptions: { type: JobType; label: string; desc: string; icon: any }[] = [
    {
      type: "mc",
      label: "MC",
      desc: "Người dẫn chương trình cho sự kiện",
      icon: Mic,
    },
    {
      type: "lookbook",
      label: "Lookbook",
      desc: "Người mẫu chụp ảnh, quay video theo chủ đề",
      icon: LookbookIcon,
    },
    {
      type: "pg",
      label: "PG",
      desc: "Người hỗ trợ sự kiện, quảng bá sản phẩm",
      icon: Users,
    },
  ];

  const getJobTypeName = (type: JobType | null) => {
    if (type === "mc") return "MC";
    if (type === "lookbook") return "Lookbook";
    if (type === "pg") return "PG";
    return "MC";
  };

  const renderSummaryRow = (label: string, value?: string | null) => {
    const displayValue = String(value || "").trim();
    if (!displayValue) return null;

    return (
      <div className="space-y-1">
        <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</span>
        <p className="whitespace-pre-wrap break-words rounded-xl border border-white/5 bg-black/30 p-3 text-xs font-bold leading-relaxed text-white">
          {displayValue}
        </p>
      </div>
    );
  };

  return (
    <div className={cn("h-full min-h-0 text-slate-100", className)}>
      {/* ── STEP 2: CHỌN LOẠI CÔNG VIỆC ── */}
      {step === 2 && (
        <div className="h-full w-full animate-in fade-in duration-300">
          <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#070913]">

            {/* Top Right Close / Back Button */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-5 top-5 z-30 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-slate-900/80 text-slate-300 shadow-md transition hover:bg-white/15 hover:text-white active:scale-95"
              title="Quay lại màn hình chính"
            >
              <X className="h-5 w-5 text-amber-400" />
            </button>

            {/* Header */}
            <div className="z-20 flex h-[88px] shrink-0 flex-col justify-center border-b border-white/10 bg-[#070913]/95 px-5 pr-20 text-left backdrop-blur-md">
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                Chọn loại công việc
              </h2>
              <p className="text-xs md:text-sm text-slate-400 mt-1.5 font-medium">
                Vui lòng chọn loại công việc bạn cần thuê
              </p>
            </div>

            {/* Job Cards */}
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:p-7">
              {jobTypeOptions.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.type}
                    onClick={() => handleSelectJobType(item.type)}
                    className="flex items-center gap-5 p-5 sm:p-6 rounded-3xl border border-amber-500/20 bg-gradient-to-r from-[#161c2c] via-[#101422] to-[#090c17] hover:border-amber-400/70 hover:bg-slate-900/90 shadow-[0_6px_25px_rgba(0,0,0,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.22)] transition-all duration-300 cursor-pointer relative overflow-hidden group active:scale-[0.99] min-h-[100px] md:min-h-[112px]"
                  >
                    <div className="h-16 w-16 md:h-18 md:w-18 rounded-2xl flex items-center justify-center shrink-0 border border-amber-500/35 bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent text-amber-400 group-hover:bg-amber-400 group-hover:text-slate-950 transition-all duration-300 shadow-md">
                      <Icon className="h-8 w-8 md:h-9 md:w-9" />
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <h3 className="text-base md:text-lg font-black text-white uppercase tracking-wider group-hover:text-amber-300 transition-colors">
                        {item.label}
                      </h3>
                      <p className="text-xs md:text-sm text-slate-400 mt-1 leading-relaxed font-medium">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3: NHẬP YÊU CẦU CHI TIẾT (FORM TÁCH VỚI HEADER & FOOTER CỐ ĐỊNH) ── */}
      {step === 8 && (
        <div className="h-full w-full animate-in fade-in duration-300">
          <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#070913]">
            <div className="z-20 flex h-[88px] shrink-0 items-center justify-between border-b border-white/10 bg-[#070913]/95 px-5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-300 transition hover:bg-white/10 active:scale-95"
                  title="Quay lại"
                >
                  <ArrowLeft className="h-5 w-5 text-amber-400" />
                </button>
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-black tracking-tight text-white md:text-xl">
                    {getJobTypeName(selectedJobType)}
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-slate-400">Chọn gói & xem giá</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-slate-900/80 text-slate-300 transition hover:bg-white/15 hover:text-white active:scale-95"
                title="Thoát"
              >
                <X className="h-5 w-5 text-amber-400" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5 pb-8 text-left sm:p-7 sm:pb-10">
              <p className="text-xs font-bold text-slate-400">Chọn gói phù hợp</p>
              {BOOKING_PACKAGES.map((item) => {
                const active = selectedPackage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedPackage(item.id)}
                    className={cn(
                      "flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition active:scale-[0.99]",
                      active
                        ? "border-amber-400 bg-amber-400/10 shadow-[0_0_18px_rgba(245,158,11,0.18)]"
                        : "border-white/10 bg-white/[0.04] hover:border-amber-400/40"
                    )}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-black text-white">{item.name}</p>
                      <p className="mt-1 text-xs font-bold text-slate-400">{item.duration}</p>
                      <p className="mt-0.5 text-[11px] font-medium text-slate-500">{item.note}</p>
                    </div>
                    <span className="shrink-0 text-sm font-black text-white">{item.price}</span>
                  </button>
                );
              })}

              <p className="pt-2 text-sm font-bold leading-relaxed text-slate-400">
                Số tiền còn lại sẽ được thanh toán sau khi xác nhận ứng viên.
              </p>
            </div>

            <div className="z-20 shrink-0 border-t border-white/10 bg-[#070913]/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] backdrop-blur-md sm:p-5">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex h-13 w-full cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-xs font-black uppercase tracking-widest text-slate-950 shadow-[0_4px_25px_rgba(245,158,11,0.35)] transition-all hover:brightness-110 active:scale-[0.98] md:text-sm"
              >
                Tiếp tục
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <>
          {selectedJobType === "mc" && (
            <BookingMCForm
              jobName={jobName}
              setJobName={setJobName}
              mcJobDescription={mcJobDescription}
              setMcJobDescription={setMcJobDescription}
              workDate={workDate}
              setWorkDate={setWorkDate}
              startTime={startTime}
              setStartTime={setStartTime}
              endTime={endTime}
              setEndTime={setEndTime}
              mcLocation={mcLocation}
              setMcLocation={setMcLocation}
              mcLanguage={mcLanguage}
              setMcLanguage={setMcLanguage}
              extraRequirements={extraRequirements}
              setExtraRequirements={setExtraRequirements}
              onBack={() => setStep(getDetailsBackStep())}
              onNext={() => setStep(10)}
              handleClose={handleClose}
            />
          )}

          {selectedJobType === "lookbook" && (
            <BookingLookbookForm
              jobName={jobName}
              setJobName={setJobName}
              workDate={workDate}
              setWorkDate={setWorkDate}
              startTime={startTime}
              setStartTime={setStartTime}
              endTime={endTime}
              setEndTime={setEndTime}
              lookbookTopic={lookbookTopic}
              setLookbookTopic={setLookbookTopic}
              lookbookStyle={lookbookStyle}
              setLookbookStyle={setLookbookStyle}
              lookbookLocation={lookbookLocation}
              setLookbookLocation={setLookbookLocation}
              extraRequirements={extraRequirements}
              setExtraRequirements={setExtraRequirements}
              onBack={() => setStep(getDetailsBackStep())}
              onNext={() => setStep(10)}
              handleClose={handleClose}
            />
          )}

          {selectedJobType === "pg" && (
            <BookingPGForm
              jobName={jobName}
              setJobName={setJobName}
              pgJobDescription={pgJobDescription}
              setPgJobDescription={setPgJobDescription}
              workDate={workDate}
              setWorkDate={setWorkDate}
              startTime={startTime}
              setStartTime={setStartTime}
              endTime={endTime}
              setEndTime={setEndTime}
              pgOutfit={pgOutfit}
              setPgOutfit={setPgOutfit}
              pgSkills={pgSkills}
              setPgSkills={setPgSkills}
              extraRequirements={extraRequirements}
              setExtraRequirements={setExtraRequirements}
              onBack={() => setStep(getDetailsBackStep())}
              onNext={() => setStep(10)}
              handleClose={handleClose}
            />
          )}
        </>
      )}

      {/* ── STEP 10: XÁC NHẬN YÊU CẦU ── */}
      {step === 10 && (
        <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#070913]">
          {/* Header */}
          <div className="z-20 shrink-0 border-b border-white/10 bg-[#070913]/95 p-4 backdrop-blur-md flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#C9A86A]/50 bg-[#C9A86A]/15 text-[#C9A86A] transition-all hover:bg-[#C9A86A]/25 active:scale-95 cursor-pointer"
              title="Quay lại"
              aria-label="Quay lại"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h2 className="text-base font-black text-white">Xác nhận yêu cầu</h2>
            <button
              type="button"
              onClick={handleClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-slate-900 text-slate-300 transition hover:bg-white/15 hover:text-white active:scale-95 cursor-pointer"
              title="Thoát"
              aria-label="Thoát"
            >
              <X className="h-4 w-4 text-amber-400" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6 pb-8 text-left">
            <div className="rounded-3xl border border-white/10 bg-[#121522] p-5 space-y-4 shadow-xl">
              {/* Talent Header Info */}
              <div className="flex items-center gap-3.5 border-b border-white/5 pb-4">
                <img
                  src={selectedTalent?.avatar_url || selectedTalent?.avatar}
                  alt={selectedTalent?.name || "Talent"}
                  className="h-14 w-14 rounded-2xl object-cover border-2 border-amber-400/40 shadow-sm"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-black text-white">{selectedTalent?.name}</h3>
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    {selectedTalent?.category || (selectedJobType === "mc" ? "MC" : selectedJobType === "lookbook" ? "Lookbook" : "PG / PB")}
                  </p>
                </div>
              </div>

              {/* Job Title if entered */}
              {jobName && (
                <div className="border-b border-white/5 pb-3.5 space-y-1">
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Tiêu đề công việc
                  </span>
                  <p className="text-xs font-bold text-white">{jobName}</p>
                </div>
              )}

              {/* Time Row */}
              <div className="border-b border-white/5 pb-3.5 space-y-1">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Thời gian
                </span>
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-amber-400">
                    {workDate ? workDate.split("-").reverse().join("/") : "Chưa chọn ngày"}
                  </span>
                  <span className="text-white">
                    {startTime && endTime ? `${startTime} - ${endTime}` : "Chưa chọn giờ"}
                  </span>
                </div>
              </div>

              {/* ── MC FIELDS ── */}
              {selectedJobType === "mc" && (
                <>
                  <div className="border-b border-white/5 pb-3.5 space-y-1">
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Ngôn ngữ dẫn
                    </span>
                    <p className="text-xs font-bold text-white">{mcLanguage}</p>
                  </div>

                  {mcLocation && (
                    <div className="border-b border-white/5 pb-3.5 space-y-1">
                      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Địa điểm làm việc
                      </span>
                      <p className="text-xs font-bold text-white leading-relaxed">{mcLocation}</p>
                    </div>
                  )}

                  {mcJobDescription && (
                    <div className="border-b border-white/5 pb-3.5 space-y-1">
                      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Mô tả công việc
                      </span>
                      <p className="text-xs font-medium text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {mcJobDescription}
                      </p>
                    </div>
                  )}

                  {extraRequirements && (
                    <div className="space-y-1 pt-0.5">
                      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Ghi chú thêm
                      </span>
                      <p className="text-xs font-medium text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {extraRequirements}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* ── LOOKBOOK FIELDS ── */}
              {selectedJobType === "lookbook" && (
                <>
                  {lookbookTopic && (
                    <div className="border-b border-white/5 pb-3.5 space-y-1">
                      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Chủ đề / Concept
                      </span>
                      <p className="text-xs font-bold text-amber-300 leading-relaxed">
                        {lookbookTopic}
                      </p>
                    </div>
                  )}

                  <div className="border-b border-white/5 pb-3.5 space-y-1">
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Yêu cầu khác / Phong cách
                    </span>
                    <p className="text-xs font-bold text-amber-400">{lookbookStyle}</p>
                  </div>

                  {lookbookLocation && (
                    <div className="border-b border-white/5 pb-3.5 space-y-1">
                      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Địa điểm
                      </span>
                      <p className="text-xs font-bold text-white leading-relaxed">
                        {lookbookLocation}
                      </p>
                    </div>
                  )}

                  {extraRequirements && (
                    <div className="space-y-1 pt-0.5">
                      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Ghi chú thêm
                      </span>
                      <p className="text-xs font-medium text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {extraRequirements}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* ── PG / PB FIELDS ── */}
              {selectedJobType === "pg" && (
                <>
                  {pgJobDescription && (
                    <div className="border-b border-white/5 pb-3.5 space-y-1">
                      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Mô tả công việc PG/PB
                      </span>
                      <p className="text-xs font-medium text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {pgJobDescription}
                      </p>
                    </div>
                  )}

                  {pgOutfit && (
                    <div className="border-b border-white/5 pb-3.5 space-y-1">
                      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Trang phục yêu cầu
                      </span>
                      <p className="text-xs font-bold text-amber-300 leading-relaxed">
                        {pgOutfit}
                      </p>
                    </div>
                  )}

                  {pgSkills && (
                    <div className="border-b border-white/5 pb-3.5 space-y-1">
                      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Kỹ năng
                      </span>
                      <p className="text-xs font-bold text-white">{pgSkills}</p>
                    </div>
                  )}

                  {extraRequirements && (
                    <div className="space-y-1 pt-0.5">
                      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Ghi chú thêm
                      </span>
                      <p className="text-xs font-medium text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {extraRequirements}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="z-20 shrink-0 border-t border-white/10 bg-[#070913]/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] backdrop-blur-md sm:p-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 h-13 rounded-2xl border border-white/15 bg-white/5 text-xs md:text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4 text-amber-400" />
                Bước trước
              </button>
              <button
                type="button"
                onClick={handleProceedFromStep10}
                className="flex-1 h-13 cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-xs font-black uppercase tracking-widest text-slate-950 shadow-[0_4px_25px_rgba(245,158,11,0.35)] transition-all hover:brightness-110 active:scale-[0.98] md:text-sm"
              >
                Tiếp tục
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 4: THÔNG TIN LIÊN HỆ (HIỂN THỊ KHI CHƯA ĐĂNG NHẬP) ── */}
      {step === 4 && (
        <div className="h-full w-full animate-in fade-in duration-300">
          <form onSubmit={handleConfirmBooking} className="relative flex h-full w-full flex-col overflow-hidden bg-[#070913]">

            {/* ── Fixed Header ── */}
            <div className="z-20 flex h-[88px] shrink-0 items-center justify-between border-b border-white/10 bg-[#070913]/95 px-5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(10)}
                  className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-300 transition hover:bg-white/10 active:scale-95"
                  title="Quay lại"
                >
                  <ArrowLeft className="h-5 w-5 text-amber-400" />
                </button>
                <h2 className="text-lg md:text-xl font-black text-white tracking-tight">
                  Thông tin liên hệ
                </h2>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-slate-900/80 text-slate-300 transition hover:bg-white/15 hover:text-white active:scale-95"
                title="Thoát"
              >
                <X className="h-5 w-5 text-amber-400" />
              </button>
            </div>

            {/* ── Scrollable Body ── */}
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5 pb-8 text-left sm:p-7 sm:pb-10">
              <BookingContactForm
                contactName={contactName}
                setContactName={setContactName}
                contactPhone={contactPhone}
                setContactPhone={setContactPhone}
                contactEmail={contactEmail}
                setContactEmail={setContactEmail}
              />
            </div>

            {/* ── Fixed Footer ── */}
            <div className="z-20 shrink-0 border-t border-white/10 bg-[#070913]/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] backdrop-blur-md sm:p-5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(10)}
                  className="flex-1 h-13 rounded-2xl border border-white/15 bg-white/5 text-xs md:text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="h-4 w-4 text-amber-400" />
                  Bước trước
                </button>
                <button
                  type="submit"
                  className="flex-1 h-13 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-slate-950 text-xs md:text-sm font-black uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_25px_rgba(245,158,11,0.35)]"
                >
                  Xác nhận & Đặt cọc
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ── SUCCESS MODAL ── */}
      {step === 5 && (
        <div className="flex h-full w-full flex-col overflow-hidden bg-[#070913] text-white animate-in fade-in duration-300">
          <div className="z-20 flex h-[88px] shrink-0 items-center justify-between border-b border-white/10 bg-[#070913]/95 px-5 backdrop-blur-md">
            <button type="button" onClick={() => setStep(getAuthToken() ? 10 : 4)} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5 text-amber-400">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-black">Đặt cọc</h2>
            <button type="button" onClick={handleClose} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-slate-900/80 text-amber-400">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.10),transparent_34%),linear-gradient(180deg,#090713,#05050d)] p-5 pb-8">
            <div className="space-y-1.5">
              <h3 className="text-xl font-black tracking-tight text-white">Đặt cọc để gửi yêu cầu</h3>
              <p className="max-w-sm text-xs font-semibold leading-relaxed text-slate-400">Khoản đặt cọc giúp giữ lịch ưu tiên và sẽ được trừ vào tổng chi phí khi booking thành công.</p>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-amber-300/30 bg-gradient-to-br from-[#1a1608] via-[#0d0b14] to-[#080811] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-300/10 blur-3xl" />
              <div className="relative flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-300/10 text-amber-300 shadow-[0_0_24px_rgba(245,158,11,0.16)]">
                  <Banknote className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Số tiền đặt cọc</span>
                  <p className="mt-1 text-3xl font-black tracking-tight text-amber-300">{DEPOSIT_AMOUNT_LABEL}</p>
                  <p className="mt-3 text-xs font-semibold leading-relaxed text-slate-400">Số tiền này sẽ được trừ vào tổng chi phí nếu booking thành công.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white">Phương thức thanh toán</h3>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Chọn 1</span>
              </div>
              {[
                { key: "bank" as const, icon: Landmark, title: "Chuyển khoản ngân hàng", desc: "Quét mã QR để chuyển khoản" },
                { key: "wallet" as const, icon: Wallet, title: "Ví điện tử", desc: "MoMo, ZaloPay, VNPay..." },
              ].map((item) => {
                const Icon = item.icon;
                const active = paymentMethod === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setPaymentMethod(item.key)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition active:scale-[0.99]",
                      active ? "border-amber-300/70 bg-amber-300/10 shadow-[0_0_24px_rgba(245,158,11,0.12)]" : "border-white/10 bg-[#11111c] hover:border-white/20"
                    )}
                  >
                    <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl border", active ? "border-amber-300/35 bg-amber-300/15 text-amber-300" : "border-white/10 bg-slate-950 text-slate-400")}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-black text-white">{item.title}</span>
                      <span className="mt-0.5 block text-xs font-semibold text-slate-500">{item.desc}</span>
                    </span>
                    <span className={cn("flex h-5 w-5 items-center justify-center rounded-full border", active ? "border-amber-300 bg-amber-300 text-slate-950" : "border-white/15 text-transparent")}>
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="hidden">
              <div>
                <h3 className="text-base font-black">Đặt cọc để gửi yêu cầu</h3>
                <p className="mt-1 text-xs font-semibold text-slate-400">Khoản đặt cọc sẽ được giữ để ưu tiên booking thành công.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0B0A16] p-5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Số tiền đặt cọc</span>
                <p className="mt-2 text-2xl font-black text-amber-300">{DEPOSIT_AMOUNT_LABEL}</p>
                <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-400">Số tiền này sẽ được trừ vào tổng chi phí nếu booking thành công.</p>
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-black">Phương thức thanh toán</h3>
                {[
                  { key: "bank" as const, icon: Landmark, title: "Chuyển khoản ngân hàng", desc: "Quét mã QR để chuyển khoản" },
                  { key: "wallet" as const, icon: Wallet, title: "Ví điện tử", desc: "MoMo, ZaloPay, VNPay..." },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = paymentMethod === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setPaymentMethod(item.key)}
                      className={cn("flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition", active ? "border-amber-400/70 bg-amber-400/10" : "border-white/10 bg-white/[0.03]")}
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-slate-950 text-amber-300">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-black text-white">{item.title}</span>
                        <span className="mt-0.5 block text-xs font-semibold text-slate-500">{item.desc}</span>
                      </span>
                      {active && <Check className="h-4 w-4 text-amber-300" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="z-20 shrink-0 border-t border-white/10 bg-[#070913]/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] backdrop-blur-md">
            <button type="button" onClick={() => setStep(6)} className="h-13 w-full rounded-2xl bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 text-xs font-black uppercase tracking-widest text-slate-950 shadow-[0_4px_25px_rgba(245,158,11,0.35)]">
              Tiếp tục
            </button>
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="flex h-full w-full flex-col overflow-hidden bg-[#070913] text-white animate-in fade-in duration-300">
          <div className="z-20 flex h-[88px] shrink-0 items-center justify-between border-b border-white/10 bg-[#070913]/95 px-5 backdrop-blur-md">
            <button type="button" onClick={() => setStep(5)} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5 text-amber-400">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-black">Chuyển khoản đặt cọc</h2>
            <button type="button" onClick={handleClose} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-slate-900/80 text-amber-400">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 pb-8">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="block font-black uppercase text-slate-500">Số tiền</span><span className="mt-1 block font-black text-white">{DEPOSIT_AMOUNT_LABEL}</span></div>
              <div><span className="block font-black uppercase text-slate-500">Mã yêu cầu</span><span className="mt-1 block font-black text-white">{bookingCode}</span></div>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Nội dung chuyển khoản</span>
              <p className="mt-1 break-words text-sm font-black text-white">ONSTAGE_DEPOC_{contactName || "HOTEN"}_{contactPhone || "SODT"}</p>
            </div>
            <div className="flex flex-col items-center gap-3 py-2">
              <DepositQrCode payload={depositQrPayload} canvasRef={depositQrCanvasRef} />
              <button
                type="button"
                onClick={() => downloadQrImage(depositQrCanvasRef.current, `onstage-qr-${bookingCode.replace("#", "") || "deposit"}.png`)}
                className="rounded-full border border-amber-300/35 bg-amber-300/10 px-4 py-2 text-xs font-black text-amber-200 transition hover:border-amber-300 hover:bg-amber-300/15 active:scale-95"
              >
                Tải QR về
              </button>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs font-semibold leading-relaxed text-slate-300">
              <p className="font-black text-white">Thông tin tài khoản</p>
              <p className="mt-2">Ngân hàng: Techcombank</p>
              <p>STK: 1234 5678 9012</p>
              <p>Chủ TK: ONSTAGE VN</p>
            </div>
            <p className="text-xs font-semibold leading-relaxed text-slate-400">Sau khi chuyển khoản, yêu cầu của bạn sẽ được gửi đi tự động.</p>
          </div>
          <div className="z-20 shrink-0 border-t border-white/10 bg-[#070913]/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] backdrop-blur-md">
            <button type="button" onClick={() => setStep(7)} className="h-13 w-full rounded-2xl bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 text-xs font-black uppercase tracking-widest text-slate-950 shadow-[0_4px_25px_rgba(245,158,11,0.35)]">
              Đã chuyển khoản
            </button>
          </div>
        </div>
      )}

      {step === 7 && (
        <div className="flex h-full w-full flex-col items-center justify-center bg-[#070913] p-6 text-center text-white animate-in fade-in duration-300">
          <div className="mb-10 flex h-24 w-24 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 shadow-[0_0_45px_rgba(52,211,153,0.28)]">
            <CheckCircle2 className="h-14 w-14" />
          </div>
          <h2 className="text-2xl font-black">Gửi yêu cầu thành công!</h2>
          <div className="mt-5 max-w-xs space-y-4 text-sm font-semibold leading-relaxed text-slate-300">
            <p>Cảm ơn bạn đã đặt cọc {DEPOSIT_AMOUNT_LABEL}.</p>
            <p>
              Mã yêu cầu: <span className="font-black text-amber-300">{bookingCode}</span>
            </p>
            <p>
              Chúng tôi sẽ liên hệ với bạn qua<br />
              <span className="font-black text-white">{contactPhone || "số điện thoại"}</span>
            </p>
            <p>trong thời gian sớm nhất.</p>
          </div>
          <p className="hidden mt-5 max-w-xs text-sm font-semibold leading-relaxed text-slate-300">
            Cảm ơn bạn đã đặt cọc {DEPOSIT_AMOUNT_LABEL}. Chúng tôi sẽ liên hệ với bạn qua {contactPhone || "số điện thoại"} trong thời gian sớm nhất.
          </p>
          <button
            type="button"
            onClick={() => {
              if (onSuccess) onSuccess();
              else router.push("/brand/my-bookings");
            }}
            className="mt-12 h-13 w-full max-w-sm rounded-2xl bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 text-xs font-black uppercase tracking-widest text-slate-950 shadow-[0_4px_25px_rgba(245,158,11,0.35)] cursor-pointer"
          >
            Xem yêu cầu của tôi
          </button>
          <button
            type="button"
            onClick={() => router.push("/brand")}
            className="mt-4 text-xs font-bold text-slate-300 underline underline-offset-4 transition hover:text-amber-300"
          >
            Quay về trang chủ
          </button>
        </div>
      )}

      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className="max-w-md w-full rounded-3xl border border-emerald-500/30 bg-[#091510] p-6 text-center shadow-2xl space-y-5 relative">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]">
              <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                GỬI YÊU CẦU THÀNH CÔNG
              </span>
              <h3 className="text-lg font-black text-white">Yêu cầu Booking #{bookingCode}</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Cảm ơn <strong className="text-white">{contactName}</strong>! Yêu cầu dịch vụ cho Idol{" "}
                <strong className="text-amber-300">{selectedTalent?.name}</strong> đã được ghi nhận.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsSuccessModalOpen(false);
                if (onSuccess) onSuccess();
                else router.push("/brand/search");
              }}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-400 to-green-600 text-slate-950 text-xs font-black uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-md"
            >
              Hoàn tất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
