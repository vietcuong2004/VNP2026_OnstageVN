"use client";

import React, { useEffect, useState } from "react";
import { X, UserPlus, MapPin, Phone, Briefcase, FileText, Check, ImagePlus } from "lucide-react";
import { createBrandManagedTalent, type BrandRosterTalent } from "@/lib/brand-api";
import {
  DEFAULT_CITY_VALUE,
  DEFAULT_TALENT_TYPE_VALUE,
  TALENT_TYPE_OPTIONS,
  normalizeTalentTypeLabel,
} from "@/components/ui/ComboboxOptionValues";
import { useCityOptions } from "@/hooks/use-location-options";

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (talent: any) => void;
  addToast: (msg: string) => void;
}

const TALENT_TYPES = TALENT_TYPE_OPTIONS;

export default function CreateTalentModal({
  isOpen,
  onClose,
  onSuccess,
  addToast,
}: CreateModalProps) {
  const cityOptions = useCityOptions();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState(DEFAULT_CITY_VALUE);
  const [talentType, setTalentType] = useState(DEFAULT_TALENT_TYPE_VALUE);
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
      const selectedCityOption = cityOptions.find((option) => option.value === city || option.label === city);
      const createdRosterItem = await createBrandManagedTalent({
        name: name.trim(),
        phone: phone.trim() || undefined,
        city: selectedCityOption?.label || city,
        city_id: selectedCityOption?.id,
        talent_types: [normalizeTalentTypeLabel(talentType)],
        notes: notes.trim() || undefined,
        avatar: avatarFile,
      });

      addToast("Đã thêm Talent thành công");
      onSuccess(createdRosterItem);
      setIsSuccess(true);

      // Reset form
      setName("");
      setPhone("");
      setCity(DEFAULT_CITY_VALUE);
      setTalentType(DEFAULT_TALENT_TYPE_VALUE);
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#191116]/60 backdrop-blur-md animate-in fade-in duration-300 dark:bg-[#020408]/85">
        <div className="relative w-full max-w-md flex flex-col bg-white border border-[#F0D7D3] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 p-8 text-center space-y-6 dark:bg-[#08090f] dark:border-[#151b2d]">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Check className="h-8 w-8" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-display font-black text-lg text-[#191116] uppercase tracking-tight dark:text-white">
              Đã thêm Idol thành công
            </h3>
            <p className="text-xs text-[#574D54] font-semibold leading-relaxed dark:text-slate-400">
              Bạn có thể bắt đầu quản lý Idol ngay bây giờ.<br />Thông tin chi tiết có thể bổ sung sau.
            </p>
          </div>

          <button
            type="button"
            style={{ color: "#ffffff" }}
            onClick={() => {
              setIsSuccess(false);
              onClose();
            }}
            className="light-force-white w-full flex items-center justify-center rounded-xl py-3 text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white cursor-pointer shadow-md hover:brightness-105 active:scale-95 transition-all duration-300"
          >
            <span style={{ color: "#ffffff" }} className="!text-white text-white font-black">Hoàn tất</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#191116]/60 backdrop-blur-md animate-in fade-in duration-300 dark:bg-[#020408]/85">
      <div className="relative flex max-h-[calc(100dvh-32px)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-[#F0D7D3] bg-white shadow-2xl animate-in zoom-in-95 duration-300 dark:border-[#151b2d] dark:bg-[#08090f]">
        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#F0D7D3] bg-[#FAF7F6] p-5 sm:p-6 dark:border-[#151b2d]/60 dark:bg-slate-950/45">
          <div>
            <span className="rounded-md border border-[#F0D7D3] bg-[#FFF0EE] px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-[#8F0709] shadow-sm dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
              CREATE IDOL
            </span>
            <h2 className="font-display font-black text-lg text-[#191116] uppercase tracking-tight mt-2 flex items-center gap-2 dark:text-white">
              <UserPlus className="h-5 w-5 text-[#8F0709] dark:text-amber-400" /> Thêm Idol mới
            </h2>
            <p className="text-[10px] text-[#574D54] mt-1 font-semibold dark:text-slate-500">
              Tạo nhanh tài khoản quản lý nội bộ (Managed Account) cho Idol của bạn.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#F0D7D3] bg-[#FFF0EE] text-[#574D54] hover:text-[#8F0709] cursor-pointer transition-all dark:border-[#151b2d] dark:bg-[#050711] dark:text-slate-400 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold dark:bg-red-950/50 dark:border-red-500/30 dark:text-red-300">
              {errorMsg}
            </div>
          )}

          {/* Avatar Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-[#574D54] flex items-center gap-1.5 dark:text-slate-400">
              <ImagePlus className="h-3.5 w-3.5 text-[#8F0709] dark:text-slate-500" /> Ảnh đại diện
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-[#F0D7D3] bg-[#FAF7F6] p-3 dark:border-[#151b2d] dark:bg-[#050711]">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[#F0D7D3] bg-slate-100 flex items-center justify-center dark:border-amber-500/25 dark:bg-slate-950">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                ) : (
                  <ImagePlus className="h-7 w-7 text-[#9A8B88] dark:text-slate-600" />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-[10px] font-semibold text-[#574D54] leading-relaxed dark:text-slate-500">
                  Ảnh này sẽ được dùng làm avatar ban đầu của Talent sau khi kích hoạt tài khoản.
                </p>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-[#F0D7D3] bg-[#FFF0EE] px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[#8F0709] hover:bg-[#FFE5E2] transition shadow-sm dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300">
                    Tải ảnh lên
                    <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAvatarChange} className="hidden" />
                  </label>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={clearAvatar}
                      className="rounded-xl border border-[#F0D7D3] bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[#574D54] hover:text-[#8F0709] transition shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:text-white"
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
            <label className="text-[10px] font-black uppercase tracking-wider text-[#574D54] flex items-center gap-1.5 dark:text-slate-400">
              Họ và tên <span className="text-[#8F0709] dark:text-amber-400">*</span>
            </label>
            <div className="flex items-center rounded-xl bg-white border border-[#F0D7D3] focus-within:border-[#8F0709] transition-colors px-3 py-2.5 shadow-sm dark:bg-[#050711] dark:border-[#151b2d]">
              <input
                type="text"
                placeholder="Nhập họ và tên của Talent..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="flex-1 bg-transparent text-xs text-[#191116] placeholder:text-[#9A8B88] outline-none font-medium dark:text-white dark:placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Phone Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-[#574D54] dark:text-slate-400">
              Số điện thoại
            </label>
            <div className="flex items-center rounded-xl bg-white border border-[#F0D7D3] focus-within:border-[#8F0709] transition-colors px-3 py-2.5 shadow-sm dark:bg-[#050711] dark:border-[#151b2d]">
              <Phone className="h-4 w-4 text-[#9A8B88] mr-2 shrink-0 dark:text-slate-500" />
              <input
                type="tel"
                placeholder="Nhập số điện thoại..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 bg-transparent text-xs text-[#191116] placeholder:text-[#9A8B88] outline-none font-medium dark:text-white dark:placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* City Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#574D54] flex items-center gap-1.5 dark:text-slate-400">
                <MapPin className="h-3.5 w-3.5 text-[#9A8B88] dark:text-slate-500" /> Khu vực
              </label>
              <div className="relative">
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl bg-white border border-[#F0D7D3] focus:border-[#8F0709] outline-none px-3 py-2.5 text-xs text-[#191116] appearance-none cursor-pointer font-semibold shadow-sm dark:bg-[#050711] dark:border-[#151b2d] dark:text-white"
                >
                  {cityOptions.map((c) => (
                    <option key={c.id ?? c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#9A8B88] text-xs dark:text-slate-500">
                  ▼
                </div>
              </div>
            </div>

            {/* Profession Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#574D54] flex items-center gap-1.5 dark:text-slate-400">
                <Briefcase className="h-3.5 w-3.5 text-[#9A8B88] dark:text-slate-500" /> Nghề nghiệp
              </label>
              <div className="relative">
                <select
                  value={talentType}
                  onChange={(e) => setTalentType(e.target.value)}
                  className="w-full rounded-xl bg-white border border-[#F0D7D3] focus:border-[#8F0709] outline-none px-3 py-2.5 text-xs text-[#191116] appearance-none cursor-pointer font-semibold shadow-sm dark:bg-[#050711] dark:border-[#151b2d] dark:text-white"
                >
                  {TALENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#9A8B88] text-xs dark:text-slate-500">
                  ▼
                </div>
              </div>
            </div>
          </div>

          {/* Notes Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-[#574D54] flex items-center gap-1.5 dark:text-slate-400">
              <FileText className="h-3.5 w-3.5 text-[#9A8B88] dark:text-slate-500" /> Ghi chú
            </label>
            <textarea
              placeholder="Nhập ghi chú hoặc thông tin bổ sung..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl bg-white border border-[#F0D7D3] focus:border-[#8F0709] outline-none p-3 text-xs text-[#191116] placeholder:text-[#9A8B88] font-semibold resize-none shadow-sm dark:bg-[#050711] dark:border-[#151b2d] dark:text-white dark:placeholder:text-slate-600"
            />
          </div>

          </div>

          {/* Footer Actions */}
          <div className="flex shrink-0 justify-end gap-3 border-t border-[#F0D7D3] bg-[#FAF7F6] p-5 backdrop-blur sm:p-6 dark:border-[#151b2d]/60 dark:bg-[#08090f]/95">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#F0D7D3] bg-white text-xs font-black uppercase text-[#574D54] hover:border-[#8F0709] hover:text-[#8F0709] transition active:scale-95 cursor-pointer shadow-sm dark:border-white/5 dark:bg-white/5 dark:text-slate-400 dark:hover:text-white"
            >
              Hủy
            </button>
            <button
              type="submit"
              style={{ color: "#ffffff" }}
              disabled={loading}
              className="light-force-white flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white cursor-pointer shadow-md hover:brightness-110 active:scale-95 transition-all duration-300"
            >
              <span style={{ color: "#ffffff" }} className="!text-white text-white font-black">{loading ? "Đang thêm..." : "Thêm Talent"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
