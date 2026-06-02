"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Eye,
  Filter,
  Heart,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
  X,
  ChevronDown,
  ChevronUp,
  Award,
  MessageSquare
} from "lucide-react";
import { savedTalentIds, talents, campaigns } from "@/lib/brand-mvp-data";
import { cn } from "@/lib/utils";

const allValue = "all";

export default function DiscoverTalentsPage() {
  const router = useRouter();

  // Search and Filters states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState(allValue);
  const [selectedType, setSelectedType] = useState(allValue);
  const [selectedCity, setSelectedCity] = useState(allValue);
  const [selectedPlatform, setSelectedPlatform] = useState(allValue);

  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(40);
  const [minHeight, setMinHeight] = useState(150);
  const [maxHeight, setMaxHeight] = useState(190);
  const [minWeight, setMinWeight] = useState(40);
  const [maxWeight, setMaxWeight] = useState(90);

  const [minBust, setMinBust] = useState(0);
  const [minWaist, setMinWaist] = useState(0);
  const [minHips, setMinHips] = useState(0);

  const [selectedExperience, setSelectedExperience] = useState(allValue);
  const [minFollowers, setMinFollowers] = useState(0);
  const [minEngagement, setMinEngagement] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [minJobs, setMinJobs] = useState(0);

  const [savedIds, setSavedIds] = useState<string[]>(savedTalentIds);
  const [selectedInviteTalent, setSelectedInviteTalent] = useState<any | null>(null);
  const [selectedCampaignForInvite, setSelectedCampaignForInvite] = useState("");

  // Accordion filters state
  const [expandedSection, setExpandedSection] = useState<Record<string, boolean>>({
    basic: true,
    physical: true,
    professional: true,
    social: true,
    quality: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSection(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Filter Algorithm
  const filteredTalents = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();

    return talents
      .filter((talent) => {
        const matchesSearch =
          !keyword ||
          talent.name.toLowerCase().includes(keyword) ||
          talent.skills.some((skill) => skill.toLowerCase().includes(keyword)) ||
          talent.type.toLowerCase().includes(keyword);

        const matchesGender = selectedGender === allValue || talent.gender === selectedGender;
        const matchesType = selectedType === allValue || talent.type === selectedType;
        const matchesCity = selectedCity === allValue || talent.city === selectedCity;
        const matchesPlatform = selectedPlatform === allValue || talent.platforms.includes(selectedPlatform);

        const matchesAge = talent.age >= minAge && talent.age <= maxAge;
        const matchesHeight = talent.height >= minHeight && talent.height <= maxHeight;
        const matchesWeight = talent.weight >= minWeight && talent.weight <= maxWeight;

        const matchesBust = !minBust || talent.bust >= minBust;
        const matchesWaist = !minWaist || talent.waist >= minWaist;
        const matchesHips = !minHips || talent.hips >= minHips;

        let matchesExperience = true;
        if (selectedExperience !== allValue) {
          if (selectedExperience === "under_1") matchesExperience = talent.yearsOfExperience < 1;
          else if (selectedExperience === "1_3") matchesExperience = talent.yearsOfExperience >= 1 && talent.yearsOfExperience <= 3;
          else if (selectedExperience === "3_5") matchesExperience = talent.yearsOfExperience >= 3 && talent.yearsOfExperience <= 5;
          else if (selectedExperience === "over_5") matchesExperience = talent.yearsOfExperience > 5;
        }

        const matchesFollowers = talent.followersCount >= minFollowers;
        const matchesEngagement = talent.engagementRate >= minEngagement;
        const matchesVerified = !verifiedOnly || talent.verified;
        const matchesRating = talent.rating >= minRating;
        const matchesJobs = talent.completedJobs >= minJobs;

        return (
          matchesSearch &&
          matchesGender &&
          matchesType &&
          matchesCity &&
          matchesPlatform &&
          matchesAge &&
          matchesHeight &&
          matchesWeight &&
          matchesBust &&
          matchesWaist &&
          matchesHips &&
          matchesExperience &&
          matchesFollowers &&
          matchesEngagement &&
          matchesVerified &&
          matchesRating &&
          matchesJobs
        );
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [
    searchQuery,
    selectedGender,
    selectedType,
    selectedCity,
    selectedPlatform,
    minAge,
    maxAge,
    minHeight,
    maxHeight,
    minWeight,
    maxWeight,
    minBust,
    minWaist,
    minHips,
    selectedExperience,
    minFollowers,
    minEngagement,
    verifiedOnly,
    minRating,
    minJobs,
  ]);

  const getTalentStatus = (id: string) => {
    if (id === "tal-1" || id === "tal-2") return "available";
    if (id === "tal-3") return "busy";
    return "maybe";
  };

  function resetFilters() {
    setSearchQuery("");
    setSelectedGender(allValue);
    setSelectedType(allValue);
    setSelectedCity(allValue);
    setSelectedPlatform(allValue);
    setMinAge(18);
    setMaxAge(40);
    setMinHeight(150);
    setMaxHeight(190);
    setMinWeight(40);
    setMaxWeight(90);
    setMinBust(0);
    setMinWaist(0);
    setMinHips(0);
    setSelectedExperience(allValue);
    setMinFollowers(0);
    setMinEngagement(0);
    setVerifiedOnly(false);
    setMinRating(0);
    setMinJobs(0);
  }

  function toggleSaved(id: string) {
    setSavedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <section className="border-b border-[#2B313D] pb-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-md border border-[#C9A86A]/30 bg-[#C9A86A]/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#C9A86A]">
            TÌM KIẾM TÀI NĂNG
          </span>
        </div>
        <h1 className="font-display text-2xl font-black tracking-tight text-white uppercase">
          DANH SÁCH TÀI NĂNG NỔI BẬT
        </h1>
        <p className="mt-2 max-w-3xl text-xs font-semibold leading-relaxed text-slate-400 uppercase tracking-wide">
          Hệ thống tìm kiếm kết hợp các bộ lọc chi tiết từ nhân khẩu học, ngoại hình đến chỉ số mạng xã hội.
        </p>
      </section>

      {/* Outer Layout: Sidebar (320px) + Result Area (Flexible) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Sidebar Filters - 320px (w-80) */}
        <aside className="w-full lg:w-80 shrink-0 space-y-4 rounded-2xl border border-[#2B313D] bg-[#171A21] p-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#C9A86A]">
              <SlidersHorizontal className="h-4 w-4 shrink-0" />
              Bộ lọc nâng cao
            </span>
            <button onClick={resetFilters} className="text-[10px] font-black uppercase text-slate-500 hover:text-white cursor-pointer transition-colors">
              Reset
            </button>
          </div>

          <div className="space-y-3">
            {/* 1. THÔNG TIN CƠ BẢN */}
            <div className="border-b border-white/5 pb-3">
              <button
                onClick={() => toggleSection("basic")}
                className="flex w-full items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-300 hover:text-white py-1 cursor-pointer"
              >
                <span>Thông tin cơ bản</span>
                {expandedSection.basic ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              {expandedSection.basic && (
                <div className="space-y-3 mt-3 animate-in slide-in-from-top-1 duration-200">
                  <label className="block space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Tên / Kỹ năng</span>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="MC, livestream, catwalk..."
                        className="w-full rounded-xl border border-white/5 bg-slate-950/50 py-2 pl-9 pr-3 text-xs text-white outline-none transition focus:border-[#C9A86A]/60"
                      />
                    </div>
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="block space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Giới tính</span>
                      <select value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)} className="w-full rounded-xl border border-white/5 bg-slate-950/50 px-3 py-2 text-xs text-white outline-none focus:border-[#C9A86A]/60">
                        <option value={allValue}>Tất cả</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Nam">Nam</option>
                      </select>
                    </label>
                    <label className="block space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Địa điểm</span>
                      <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="w-full rounded-xl border border-white/5 bg-slate-950/50 px-3 py-2 text-xs text-white outline-none focus:border-[#C9A86A]/60">
                        <option value={allValue}>Toàn quốc</option>
                        <option value="Hà Nội">Hà Nội</option>
                        <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                        <option value="Đà Nẵng">Đà Nẵng</option>
                      </select>
                    </label>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      <span>Độ tuổi</span>
                      <span className="font-mono text-slate-300">{minAge} - {maxAge}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" min={16} max={50} value={minAge} onChange={(e) => setMinAge(Number(e.target.value))} className="rounded-xl border border-white/5 bg-slate-950/50 px-3 py-1.5 text-xs text-white outline-none focus:border-[#C9A86A]/60 text-center" />
                      <input type="number" min={16} max={50} value={maxAge} onChange={(e) => setMaxAge(Number(e.target.value))} className="rounded-xl border border-white/5 bg-slate-950/50 px-3 py-1.5 text-xs text-white outline-none focus:border-[#C9A86A]/60 text-center" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. NGOẠI HÌNH & CHỈ SỐ */}
            <div className="border-b border-white/5 pb-3">
              <button
                onClick={() => toggleSection("physical")}
                className="flex w-full items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-300 hover:text-white py-1 cursor-pointer"
              >
                <span>Ngoại hình & Chỉ số</span>
                {expandedSection.physical ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              {expandedSection.physical && (
                <div className="space-y-3 mt-3 animate-in slide-in-from-top-1 duration-200">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      <span>Chiều cao (cm)</span>
                      <span className="font-mono text-slate-300">{minHeight} - {maxHeight}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" min={140} max={200} value={minHeight} onChange={(e) => setMinHeight(Number(e.target.value))} className="rounded-xl border border-white/5 bg-slate-950/50 px-3 py-1.5 text-xs text-white outline-none focus:border-[#C9A86A]/60 text-center" />
                      <input type="number" min={140} max={200} value={maxHeight} onChange={(e) => setMaxHeight(Number(e.target.value))} className="rounded-xl border border-white/5 bg-slate-950/50 px-3 py-1.5 text-xs text-white outline-none focus:border-[#C9A86A]/60 text-center" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      <span>Cân nặng (kg)</span>
                      <span className="font-mono text-slate-300">{minWeight} - {maxWeight}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" min={35} max={120} value={minWeight} onChange={(e) => setMinWeight(Number(e.target.value))} className="rounded-xl border border-white/5 bg-slate-950/50 px-3 py-1.5 text-xs text-white outline-none focus:border-[#C9A86A]/60 text-center" />
                      <input type="number" min={35} max={120} value={maxWeight} onChange={(e) => setMaxWeight(Number(e.target.value))} className="rounded-xl border border-white/5 bg-slate-950/50 px-3 py-1.5 text-xs text-white outline-none focus:border-[#C9A86A]/60 text-center" />
                    </div>
                  </div>

                  {/* <div className="space-y-1.5">
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">Số đo tối thiểu</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <label className="block space-y-1">
                        <span className="text-[8px] font-semibold text-slate-400 block text-center">Vòng 1</span>
                        <input type="number" placeholder="Bust" value={minBust || ""} onChange={(e) => setMinBust(Number(e.target.value))} className="w-full rounded-xl border border-white/5 bg-slate-950/50 px-2 py-1 text-[11px] text-white outline-none focus:border-[#C9A86A]/60 text-center" />
                      </label>
                      <label className="block space-y-1">
                        <span className="text-[8px] font-semibold text-slate-400 block text-center">Vòng 2</span>
                        <input type="number" placeholder="Waist" value={minWaist || ""} onChange={(e) => setMinWaist(Number(e.target.value))} className="w-full rounded-xl border border-white/5 bg-slate-950/50 px-2 py-1 text-[11px] text-white outline-none focus:border-[#C9A86A]/60 text-center" />
                      </label>
                      <label className="block space-y-1">
                        <span className="text-[8px] font-semibold text-slate-400 block text-center">Vòng 3</span>
                        <input type="number" placeholder="Hips" value={minHips || ""} onChange={(e) => setMinHips(Number(e.target.value))} className="w-full rounded-xl border border-white/5 bg-slate-950/50 px-2 py-1 text-[11px] text-white outline-none focus:border-[#C9A86A]/60 text-center" />
                      </label>
                    </div>
                  </div> */}
                </div>
              )}
            </div>

            {/* 3. NGHỀ NGHIỆP & KINH NGHIỆM */}
            <div className="border-b border-white/5 pb-3">
              <button
                onClick={() => toggleSection("professional")}
                className="flex w-full items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-300 hover:text-white py-1 cursor-pointer"
              >
                <span>Nghề nghiệp & Kỹ năng</span>
                {expandedSection.professional ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              {expandedSection.professional && (
                <div className="space-y-3 mt-3 animate-in slide-in-from-top-1 duration-200">
                  <label className="block space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Loại hình Talent</span>
                    <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full rounded-xl border border-white/5 bg-slate-950/50 px-3 py-2.5 text-xs text-white outline-none focus:border-[#C9A86A]/60">
                      <option value={allValue}>Tất cả loại hình</option>
                      <option value="KOL">KOL</option>
                      <option value="Model">Model</option>
                      <option value="MC">MC</option>
                      <option value="PG">PG</option>
                      <option value="Dancer">Dancer</option>
                    </select>
                  </label>

                  <label className="block space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Kinh nghiệm chuyên môn</span>
                    <select value={selectedExperience} onChange={(e) => setSelectedExperience(e.target.value)} className="w-full rounded-xl border border-white/5 bg-slate-950/50 px-3 py-2.5 text-xs text-white outline-none focus:border-[#C9A86A]/60">
                      <option value={allValue}>Tất cả kinh nghiệm</option>
                      <option value="under_1">Dưới 1 năm</option>
                      <option value="1_3">Từ 1 - 3 năm</option>
                      <option value="3_5">Từ 3 - 5 năm</option>
                      <option value="over_5">Trên 5 năm</option>
                    </select>
                  </label>
                </div>
              )}
            </div>

            {/* 4. MẠNG XÃ HỘI */}
            <div className="border-b border-white/5 pb-3">
              <button
                onClick={() => toggleSection("social")}
                className="flex w-full items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-300 hover:text-white py-1 cursor-pointer"
              >
                <span>Mạng xã hội & Social</span>
                {expandedSection.social ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              {expandedSection.social && (
                <div className="space-y-3 mt-3 animate-in slide-in-from-top-1 duration-200">
                  <div className="grid grid-cols-2 gap-2">
                    <label className="block space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Nền tảng chính</span>
                      <select value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)} className="w-full rounded-xl border border-white/5 bg-slate-950/50 px-3 py-2 text-xs text-white outline-none focus:border-[#C9A86A]/60">
                        <option value={allValue}>Tất cả</option>
                        <option value="TikTok">TikTok</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Facebook">Facebook</option>
                      </select>
                    </label>
                    <label className="block space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Tỷ lệ tương tác tối thiểu</span>
                      <select value={minEngagement} onChange={(e) => setMinEngagement(Number(e.target.value))} className="w-full rounded-xl border border-white/5 bg-slate-950/50 px-3 py-2 text-xs text-white outline-none focus:border-[#C9A86A]/60">
                        <option value={0}>Tất cả ER</option>
                        <option value={2}>&gt; 2% ER</option>
                        <option value={4}>&gt; 4% ER</option>
                        <option value={6}>&gt; 6% ER</option>
                      </select>
                    </label>
                  </div>

                  <label className="block space-y-1.5">
                    <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      <span>Followers tối thiểu</span>
                      <span className="font-mono text-slate-300">
                        {minFollowers >= 1000 ? `${(minFollowers / 1000).toFixed(0)}K` : minFollowers}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={250000}
                      step={10000}
                      value={minFollowers}
                      onChange={(e) => setMinFollowers(Number(e.target.value))}
                      className="w-full accent-[#C9A86A]"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* 5. CHẤT LƯỢNG & ĐÁNH GIÁ */}
            <div>
              <button
                onClick={() => toggleSection("quality")}
                className="flex w-full items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-300 hover:text-white py-1 cursor-pointer"
              >
                <span>Chất lượng & Đánh giá</span>
                {expandedSection.quality ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              {expandedSection.quality && (
                <div className="space-y-3 mt-3 animate-in slide-in-from-top-1 duration-200">
                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/5 bg-slate-900/30 p-2.5">
                    <span className="flex items-center gap-2 text-xs font-bold text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      Chỉ tài khoản Verified
                    </span>
                    <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="rounded accent-[#C9A86A]" />
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="block space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Đánh giá tối thiểu</span>
                      <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="w-full rounded-xl border border-white/5 bg-slate-950/50 px-3 py-2 text-xs text-white outline-none focus:border-[#C9A86A]/60">
                        <option value={0}>Tất cả sao</option>
                        <option value={4}>4.0★ trở lên</option>
                        <option value={4.5}>4.5★ trở lên</option>
                        <option value={4.8}>4.8★ trở lên</option>
                      </select>
                    </label>

                    <label className="block space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Số job tối thiểu</span>
                      <select value={minJobs} onChange={(e) => setMinJobs(Number(e.target.value))} className="w-full rounded-xl border border-white/5 bg-slate-950/50 px-3 py-2 text-xs text-white outline-none focus:border-[#C9A86A]/60">
                        <option value={0}>Tất cả job</option>
                        <option value={5}>&gt; 5 jobs</option>
                        <option value={15}>&gt; 15 jobs</option>
                        <option value={25}>&gt; 25 jobs</option>
                      </select>
                    </label>
                  </div>
                </div>
              )}
            </div>

          </div>
        </aside>

        {/* Content - Flexible */}
        <main className="flex-1 min-w-0 space-y-4">
          <div className="flex flex-col gap-3 border-b border-[#2B313D] pb-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2 text-xs text-slate-400">
              <Filter className="h-4 w-4 text-[#C9A86A]" />
              Tìm thấy <b className="text-white">{filteredTalents.length}</b> talent phù hợp.
            </span>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono shrink-0">
              ĐÃ LƯU <b className="text-white">{savedIds.length}</b> talent vào danh sách yêu thích
            </span>
          </div>

          {filteredTalents.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-slate-950/25 p-16 text-center">
              <Search className="mx-auto mb-3 h-8 w-8 text-slate-600" />
              <h3 className="text-sm font-black text-white">Không tìm thấy talent phù hợp</h3>
              <p className="mt-2 text-xs text-slate-500">Hãy thử nới lỏng bộ lọc hoặc điều chỉnh từ khóa tìm kiếm.</p>
            </div>
          ) : (
            /* Result Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredTalents.map((talent) => {
                const isSaved = savedIds.includes(talent.id);
                const status = getTalentStatus(talent.id);

                return (
                  <article key={talent.id} className="rounded-2xl border border-[#2B313D] bg-[#171A21] p-3.5 shadow-lg hover:border-[#C9A86A]/30 transition-all duration-300 group flex flex-col justify-between min-w-0">
                    <div>
                      {/* Image Top Area */}
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-900 border border-white/5 mb-3.5">
                        <img src={talent.avatar} alt={talent.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                        {/* Overlay top badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                          <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[8.5px] font-black uppercase text-slate-950 shadow-md">
                            Hạng {talent.tier}
                          </span>
                        </div>

                        {/* Floating Wishlist Heart */}
                        <button
                          onClick={() => toggleSaved(talent.id)}
                          className={cn(
                            "absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full border shadow-lg backdrop-blur-sm transition active:scale-90 cursor-pointer",
                            isSaved
                              ? "border-red-500 bg-red-500 text-white"
                              : "border-white/10 bg-[#0F1115]/60 text-slate-300 hover:text-white"
                          )}
                          title={isSaved ? "Bỏ lưu" : "Lưu vào shortlist"}
                        >
                          <Heart className={cn("h-3.5 w-3.5", isSaved && "fill-current")} />
                        </button>

                        {/* Floating calendar status at bottom of image */}
                        <div className="absolute bottom-2 left-2">
                          <span className={cn(
                            "inline-flex items-center gap-1 rounded bg-[#0F1115]/80 border backdrop-blur-sm px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white",
                            status === "available" && "border-emerald-500/30 text-emerald-400",
                            status === "busy" && "border-red-500/30 text-red-400",
                            status === "maybe" && "border-yellow-500/30 text-yellow-400"
                          )}>
                            <span className={cn(
                              "h-1 w-1 rounded-full",
                              status === "available" && "bg-emerald-400",
                              status === "busy" && "bg-red-400",
                              status === "maybe" && "bg-yellow-400"
                            )} />
                            {status === "available" ? "Rảnh" : status === "busy" ? "Bận" : "Chưa có lịch"}
                          </span>
                        </div>
                      </div>

                      {/* Header details */}
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h3 className="text-xs font-black text-white truncate flex-1">{talent.name}</h3>
                          {talent.verified && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                        </div>

                        <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{talent.district}, {talent.city}</span>
                        </div>
                      </div>

                      {/* Info badges row */}
                      <div className="my-2.5 flex flex-wrap gap-1">
                        <span className="rounded bg-white/5 px-1.5 py-0.5 text-[8px] font-bold uppercase text-slate-400">{talent.type}</span>
                        <span className="rounded bg-white/5 px-1.5 py-0.5 text-[8px] font-bold uppercase text-slate-400">{talent.age} tuổi</span>
                        <span className="rounded bg-white/5 px-1.5 py-0.5 text-[8px] font-bold uppercase text-slate-400">{talent.height}cm</span>
                        <span className="rounded bg-white/5 px-1.5 py-0.5 text-[8px] font-bold uppercase text-slate-400">{talent.weight}kg</span>
                      </div>

                      {/* Social stats row */}
                      <div className="grid grid-cols-2 gap-2 bg-[#0F1115]/50 border border-white/5 rounded-xl p-2 text-center text-[10px] my-3">
                        <div>
                          <span className="block text-[7px] font-bold uppercase text-slate-500 tracking-wider">Followers</span>
                          <span className="font-mono font-black text-amber-300 mt-0.5 block">{talent.followers}</span>
                        </div>
                        <div className="border-l border-white/5">
                          <span className="block text-[7px] font-bold uppercase text-slate-500 tracking-wider">Engagement</span>
                          <span className="font-mono font-black text-cyan-300 mt-0.5 block">{talent.engagementRate}%</span>
                        </div>
                      </div>

                      {/* Bio brief */}
                      <p className="line-clamp-2 text-[10px] leading-relaxed text-slate-400 mt-2 min-h-7">{talent.experience}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 pt-3.5 border-t border-white/5 flex gap-2">
                      <button
                        onClick={() => router.push(`/brand/talents/${talent.id}`)}
                        className="flex h-10 px-4 items-center justify-center gap-1.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:text-white transition active:scale-90 cursor-pointer text-[10px] font-black uppercase tracking-wider"
                        title="Xem hồ sơ chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Xem</span>
                      </button>
                      <button
                        onClick={() => router.push(`/brand/messages?talentId=${talent.id}`)}
                        className="flex-1 flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 text-slate-950 font-black text-[10px] uppercase tracking-wider transition active:scale-95 cursor-pointer"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Nhắn tin
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Invite to Campaign Modal Dialog */}
      {selectedInviteTalent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-md flex flex-col bg-[#08090f] border border-[#151b2d] rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-start justify-between p-6 border-b border-[#151b2d]">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Mời Ứng Tuyển</h3>
                <p className="text-[10px] text-slate-500 mt-1">Gửi lời mời tham gia campaign tới {selectedInviteTalent.name}</p>
              </div>
              <button onClick={() => setSelectedInviteTalent(null)} className="text-slate-400 hover:text-white cursor-pointer"><X className="h-4.5 w-4.5" /></button>
            </div>

            <div className="p-6 space-y-4">
              <label className="block space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Chọn chiến dịch tuyển dụng</span>
                <select
                  value={selectedCampaignForInvite}
                  onChange={(e) => setSelectedCampaignForInvite(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60"
                >
                  <option value="">-- Chọn chiến dịch --</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#151b2d] bg-[#050711]">
              <button onClick={() => setSelectedInviteTalent(null)} className="px-4 py-2 rounded-xl border border-[#151b2d] text-xs font-bold text-slate-400 hover:text-white cursor-pointer">Hủy</button>
              <button
                onClick={() => {
                  if (!selectedCampaignForInvite) {
                    window.alert("Vui lòng chọn chiến dịch!");
                    return;
                  }
                  window.alert(`Đã gửi lời mời ứng tuyển tới ${selectedInviteTalent.name} tham gia chiến dịch thành công!`);
                  setSelectedInviteTalent(null);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer"
              >
                Gửi lời mời
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
