"use client";

import React, { useState, useEffect } from "react";
import { X, Edit, MapPin, Phone, Briefcase, FileText, Check } from "lucide-react";
import { updateBrandManagedTalent } from "@/lib/brand-api";
import {
  CITY_VALUES,
  DEFAULT_CITY_VALUE,
  DEFAULT_TALENT_TYPE_VALUE,
  TALENT_TYPE_OPTIONS,
  normalizeTalentTypeLabel,
} from "@/components/ui/ComboboxOptionValues";
import type { BrandTalentCard, RosterTalent } from "./page";

interface EditTalentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedEntry: RosterTalent, updatedTalent: Partial<BrandTalentCard>) => void;
  addToast: (msg: string) => void;
  talent: BrandTalentCard | null;
  entry: RosterTalent | null;
}

const CITIES = CITY_VALUES;
const TALENT_TYPES = TALENT_TYPE_OPTIONS;

export default function EditTalentModal({
  isOpen,
  onClose,
  onSuccess,
  addToast,
  talent,
  entry,
}: EditTalentModalProps) {
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

      const updated = await updateBrandManagedTalent(rosterId, {
        name: name.trim(),
        phone: phone.trim() || undefined,
        city,
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
        city,
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-md animate-in fade-in duration-300">
        <div className="relative w-full max-w-md flex flex-col bg-[#08090f] border border-[#151b2d] rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.9)] overflow-hidden animate-in zoom-in-95 duration-300 p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              <Check className="h-8 w-8" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-display font-black text-lg text-white uppercase tracking-tight">
              Đã cập nhật thành công
            </h3>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Thông tin Talent đã được lưu lại.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setIsSuccess(false); onClose(); }}
            className="w-full flex items-center justify-center rounded-xl py-3 text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 text-slate-950 cursor-pointer shadow-[0_0_15px_rgba(244,196,48,0.2)] hover:brightness-105 active:scale-95 transition-all duration-300"
          >
            Hoàn tất
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg flex flex-col bg-[#08090f] border border-[#151b2d] rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.9)] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#151b2d]/60 bg-slate-950/45">
          <div>
            <span className="rounded-md border border-yellow-500/20 bg-yellow-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-yellow-300">
              EDIT IDOL
            </span>
            <h2 className="font-display font-black text-lg text-white uppercase tracking-tight mt-2 flex items-center gap-2">
              <Edit className="h-5 w-5 text-yellow-400" /> Chỉnh sửa Idol
            </h2>
            <p className="text-[10px] text-slate-500 mt-1 font-semibold">
              Cập nhật thông tin của <span className="text-white font-bold">{talent.name}</span>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              Họ và tên <span className="text-amber-400">*</span>
            </label>
            <div className="flex items-center rounded-xl bg-[#050711] border border-[#151b2d] focus-within:border-yellow-500/40 transition-colors px-3 py-2.5">
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
            <div className="flex items-center rounded-xl bg-[#050711] border border-[#151b2d] focus-within:border-yellow-500/40 transition-colors px-3 py-2.5">
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
                  className="w-full rounded-xl bg-[#050711] border border-[#151b2d] focus:border-yellow-500/40 outline-none px-3 py-2.5 text-xs text-white appearance-none cursor-pointer font-medium"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 text-xs">▼</div>
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
                  className="w-full rounded-xl bg-[#050711] border border-[#151b2d] focus:border-yellow-500/40 outline-none px-3 py-2.5 text-xs text-white appearance-none cursor-pointer font-medium"
                >
                  {TALENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 text-xs">▼</div>
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
              maxLength={200}
              className="w-full rounded-xl bg-[#050711] border border-[#151b2d] focus:border-yellow-500/40 outline-none p-3 text-xs text-white placeholder:text-slate-600 font-medium resize-none"
            />
            <div className="text-right text-[10px] text-slate-600 font-mono">{notes.length}/200</div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#151b2d]/60 flex justify-end gap-3">
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
              className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 text-slate-950 cursor-pointer shadow-[0_0_15px_rgba(244,196,48,0.2)] hover:shadow-[0_0_25px_rgba(244,196,48,0.35)] hover:brightness-105 active:scale-95 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
