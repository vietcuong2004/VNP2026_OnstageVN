"use client";

import React, { useEffect, useState } from "react";
import { X, UserPlus, MapPin, Phone, Briefcase, FileText, Check, ImagePlus } from "lucide-react";
import { createBrandManagedTalent, type BrandRosterTalent } from "@/lib/brand-api";

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (talent: any) => void;
  addToast: (msg: string) => void;
}

const CITIES = [
  "Hà Nội",
  "Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "Nha Trang",
  "Đà Lạt",
  "Bình Dương",
  "Đồng Nai",
];

const TALENT_TYPES = [
  { value: "Diễn viên", label: "Diễn viên" },
  { value: "Người mẫu", label: "Người mẫu" },
  { value: "KOLs", label: "KOLs" },
  { value: "KOCs", label: "KOCs" },
  { value: "MC", label: "MC" },
  { value: "PG", label: "PG" },
];

export default function CreateTalentModal({
  isOpen,
  onClose,
  onSuccess,
  addToast,
}: CreateModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Hà Nội");
  const [talentType, setTalentType] = useState("Người mẫu");
  const [notes, setNotes] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Vui lòng chọn tệp ảnh hợp lệ.");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg("Ảnh tải lên vượt quá giới hạn 25MB.");
      return;
    }

    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const clearAvatar = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(null);
    setAvatarPreview("");
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Vui lòng nhập Họ và tên.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const createdRosterItem = await createBrandManagedTalent({
        name: name.trim(),
        phone: phone.trim() || undefined,
        city,
        talent_types: [talentType],
        notes: notes.trim() || undefined,
        avatar: avatarFile,
      });

      addToast("Đã thêm Talent thành công");
      onSuccess(createdRosterItem);
      setIsSuccess(true);

      // Reset form
      setName("");
      setPhone("");
      setCity("Hà Nội");
      setTalentType("Người mẫu");
      setNotes("");
      clearAvatar();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Có lỗi xảy ra khi tạo Talent.");
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-md animate-in fade-in duration-300">
        <div className="relative w-full max-w-md flex flex-col bg-[#08090f] border border-[#151b2d] rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.9)] overflow-hidden animate-in zoom-in-95 duration-300 p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              <Check className="h-8 w-8" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-display font-black text-lg text-white uppercase tracking-tight">
              Đã thêm Talent thành công
            </h3>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Bạn có thể bắt đầu quản lý Talent ngay bây giờ.<br />Thông tin chi tiết có thể bổ sung sau.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsSuccess(false);
              onClose();
            }}
            className="w-full flex items-center justify-center rounded-xl py-3 text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 text-slate-950 cursor-pointer shadow-[0_0_15px_rgba(244,196,48,0.2)] hover:shadow-[0_0_25px_rgba(244,196,48,0.35)] hover:brightness-105 active:scale-95 transition-all duration-300"
          >
            Hoàn tất
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative flex max-h-[calc(100dvh-32px)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-[#151b2d] bg-[#08090f] shadow-[0_24px_60px_rgba(0,0,0,0.9)] animate-in zoom-in-95 duration-300">
        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#151b2d]/60 bg-slate-950/45 p-5 sm:p-6">
          <div>
            <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-amber-300">
              CREATE TALENT
            </span>
            <h2 className="font-display font-black text-lg text-white uppercase tracking-tight mt-2 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-amber-400" /> Thêm Talent mới
            </h2>
            <p className="text-[10px] text-slate-500 mt-1 font-semibold">
              Tạo nhanh tài khoản quản lý nội bộ (Managed Account) cho Talent của bạn.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#151b2d] bg-[#050711] text-slate-400 hover:text-white cursor-pointer transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* Avatar Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ImagePlus className="h-3.5 w-3.5 text-slate-500" /> Ảnh đại diện
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-[#151b2d] bg-[#050711] p-3">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-amber-500/25 bg-slate-950 flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                ) : (
                  <ImagePlus className="h-7 w-7 text-slate-600" />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-[10px] font-semibold text-slate-500 leading-relaxed">
                  Ảnh này sẽ được dùng làm avatar ban đầu của Talent sau khi kích hoạt tài khoản.
                </p>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-amber-300 hover:bg-amber-500/15 transition">
                    Tải ảnh lên
                    <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAvatarChange} className="hidden" />
                  </label>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={clearAvatar}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-white transition"
                    >
                      Bỏ ảnh
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              Họ và tên <span className="text-amber-400">*</span>
            </label>
            <div className="flex items-center rounded-xl bg-[#050711] border border-[#151b2d] focus-within:border-amber-500/40 transition-colors px-3 py-2.5">
              <input
                type="text"
                placeholder="Nhập họ và tên của Talent..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-600 outline-none font-medium"
              />
            </div>
          </div>

          {/* Phone Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Số điện thoại
            </label>
            <div className="flex items-center rounded-xl bg-[#050711] border border-[#151b2d] focus-within:border-amber-500/40 transition-colors px-3 py-2.5">
              <Phone className="h-4 w-4 text-slate-500 mr-2 shrink-0" />
              <input
                type="tel"
                placeholder="Nhập số điện thoại..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-600 outline-none font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* City Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-500" /> Khu vực
              </label>
              <div className="relative">
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl bg-[#050711] border border-[#151b2d] focus:border-amber-500/40 outline-none px-3 py-2.5 text-xs text-white appearance-none cursor-pointer font-medium"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* Profession Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-slate-500" /> Nghề nghiệp
              </label>
              <div className="relative">
                <select
                  value={talentType}
                  onChange={(e) => setTalentType(e.target.value)}
                  className="w-full rounded-xl bg-[#050711] border border-[#151b2d] focus:border-amber-500/40 outline-none px-3 py-2.5 text-xs text-white appearance-none cursor-pointer font-medium"
                >
                  {TALENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 text-xs">
                  ▼
                </div>
              </div>
            </div>
          </div>

          {/* Notes Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-500" /> Ghi chú
            </label>
            <textarea
              placeholder="Nhập ghi chú hoặc thông tin bổ sung..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl bg-[#050711] border border-[#151b2d] focus:border-amber-500/40 outline-none p-3 text-xs text-white placeholder:text-slate-600 font-medium resize-none"
            />
          </div>

          </div>

          {/* Footer Actions */}
          <div className="flex shrink-0 justify-end gap-3 border-t border-[#151b2d]/60 bg-[#08090f]/95 p-5 backdrop-blur sm:p-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-white/5 bg-white/5 text-xs font-black uppercase text-slate-400 hover:bg-white/10 hover:text-white transition active:scale-95 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 text-slate-950 cursor-pointer shadow-[0_0_15px_rgba(244,196,48,0.2)] hover:shadow-[0_0_25px_rgba(244,196,48,0.35)] hover:brightness-105 active:scale-95 transition-all duration-300"
            >
              {loading ? "Đang thêm..." : "Thêm Talent"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
