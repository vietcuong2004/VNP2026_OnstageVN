"use client";

import React, { useState, useEffect } from "react";
import { X, Edit, MapPin, Phone, Briefcase, FileText, Check } from "lucide-react";
import { updateBrandManagedTalent } from "@/lib/brand-api";
import {
  DEFAULT_CITY_VALUE,
  DEFAULT_TALENT_TYPE_VALUE,
  TALENT_TYPE_OPTIONS,
  normalizeTalentTypeLabel,
} from "@/components/ui/ComboboxOptionValues";
import { useCityOptions } from "@/hooks/use-location-options";
import type { BrandTalentCard, RosterTalent } from "./page";

interface EditTalentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedEntry: RosterTalent, updatedTalent: Partial<BrandTalentCard>) => void;
  addToast: (msg: string) => void;
  talent: BrandTalentCard | null;
  entry: RosterTalent | null;
}

const TALENT_TYPES = TALENT_TYPE_OPTIONS;

export default function EditTalentModal({
  isOpen,
  onClose,
  onSuccess,
  addToast,
  talent,
  entry,
}: EditTalentModalProps) {
  const cityOptions = useCityOptions();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState(DEFAULT_CITY_VALUE);
  const [talentType, setTalentType] = useState(DEFAULT_TALENT_TYPE_VALUE);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync form values from talent/entry when modal opens
  useEffect(() => {
    if (isOpen && talent) {
      setName(talent.name || "");
      setPhone(talent.phone || "");
      setCity(talent.city || DEFAULT_CITY_VALUE);
      setTalentType(normalizeTalentTypeLabel(talent.type || DEFAULT_TALENT_TYPE_VALUE));
      setNotes(entry?.notes || "");
      setErrorMsg("");
      setIsSuccess(false);
    }
  }, [isOpen, talent, entry]);

  if (!isOpen || !talent || !entry) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Vui lòng nhập Họ và tên.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const rosterId = entry.rosterId;
      if (!rosterId) throw new Error("Không tìm thấy roster ID.");

      const selectedCityOption = cityOptions.find((option) => option.value === city || option.label === city);
      const updated = await updateBrandManagedTalent(rosterId, {
        name: name.trim(),
        phone: phone.trim() || undefined,
        city: selectedCityOption?.label || city,
        city_id: selectedCityOption?.id,
        talent_types: [normalizeTalentTypeLabel(talentType)],
        notes: notes.trim() || null,
      });

      const updatedEntry: RosterTalent = {
        ...entry,
        notes: updated.notes ?? null,
      };

      const updatedTalent: Partial<BrandTalentCard> = {
        name: name.trim(),
        phone: phone.trim(),
        city: selectedCityOption?.label || city,
        type: normalizeTalentTypeLabel(talentType),
      };

      addToast("Đã cập nhật thông tin Talent.");
      onSuccess(updatedEntry, updatedTalent);
      setIsSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Có lỗi xảy ra khi cập nhật.");
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
              Đã cập nhật thành công
            </h3>
            <p className="text-xs text-[#574D54] font-semibold leading-relaxed dark:text-slate-400">
              Thông tin Talent đã được lưu lại.
            </p>
          </div>
          <button
            type="button"
            style={{ color: "#ffffff" }}
            onClick={() => { setIsSuccess(false); onClose(); }}
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
      <div className="relative w-full max-w-lg flex flex-col bg-white border border-[#F0D7D3] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 dark:bg-[#08090f] dark:border-[#151b2d]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#F0D7D3] bg-[#FAF7F6] dark:border-[#151b2d]/60 dark:bg-slate-950/45">
          <div>
            <span className="rounded-md border border-[#F0D7D3] bg-[#FFF0EE] px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-[#8F0709] shadow-sm dark:border-yellow-500/20 dark:bg-yellow-500/10 dark:text-yellow-300">
              EDIT IDOL
            </span>
            <h2 className="font-display font-black text-lg text-[#191116] uppercase tracking-tight mt-2 flex items-center gap-2 dark:text-white">
              <Edit className="h-5 w-5 text-[#8F0709] dark:text-yellow-400" /> Chỉnh sửa Idol
            </h2>
            <p className="text-[10px] text-[#574D54] mt-1 font-semibold dark:text-slate-500">
              Cập nhật thông tin của <span className="text-[#8F0709] font-bold dark:text-white">{talent.name}</span>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold dark:bg-red-950/50 dark:border-red-500/30 dark:text-red-300">
              {errorMsg}
            </div>
          )}

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
                    <option key={c.id ?? c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#9A8B88] text-xs dark:text-slate-500">▼</div>
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
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#9A8B88] text-xs dark:text-slate-500">▼</div>
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
              maxLength={200}
              className="w-full rounded-xl bg-white border border-[#F0D7D3] focus:border-[#8F0709] outline-none p-3 text-xs text-[#191116] placeholder:text-[#9A8B88] font-semibold resize-none shadow-sm dark:bg-[#050711] dark:border-[#151b2d] dark:text-white dark:placeholder:text-slate-600"
            />
            <div className="text-right text-[10px] text-[#9A8B88] font-mono dark:text-slate-600">{notes.length}/200</div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#F0D7D3] flex justify-end gap-3 dark:border-[#151b2d]/60">
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
              className="light-force-white flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white cursor-pointer shadow-md hover:brightness-110 active:scale-95 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span style={{ color: "#ffffff" }} className="!text-white text-white font-black">{loading ? "Đang lưu..." : "Lưu thay đổi"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
