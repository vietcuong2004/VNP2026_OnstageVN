"use client";

import React, { useEffect, useState } from "react";
import {
  Edit3, ShieldCheck, CheckCircle, Camera, X, Plus, Info, Upload, Video
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EditInfoTabProps {
  profile: any;
  setProfile: (profile: any) => void;
  addToast: (message: string, type?: "success" | "info") => void;
}

export default function EditInfoTab({
  profile,
  setProfile,
  addToast
}: EditInfoTabProps) {

  // Identity card (CCCD) upload state simulators
  const [cccdFrontUploaded, setCccdFrontUploaded] = useState(false);
  const [cccdBackUploaded, setCccdBackUploaded] = useState(false);
  const [selfieUploaded, setSelfieUploaded] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"unverified" | "pending" | "verified">("unverified");

  // Form states for profile editing
  const [editForm, setEditForm] = useState<any>({
    name: "",
    height: 172,
    weight: 51,
    bust: 85,
    waist: 60,
    hips: 90,
    location: "",
    hometown: "",
    education: "",
    languages: "",
    rateCard: {},
    plasticSurgery: "false",
    maritalStatus: "Độc thân"
  });

  // Upload simulation states
  const [uploadingType, setUploadingType] = useState<"photos" | "catwalk" | "intro" | "mc" | "cccd_front" | "cccd_back" | "cccd_selfie" | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Sync edit form fields once profile loads
  useEffect(() => {
    if (profile) {
      setEditForm({
        name: profile.name || "",
        height: profile.height || 172,
        weight: profile.weight || 51,
        bust: profile.bust || 85,
        waist: profile.waist || 60,
        hips: profile.hips || 90,
        location: profile.location || "",
        hometown: profile.hometown || "",
        education: profile.education || "",
        languages: Array.isArray(profile.languages) ? profile.languages.join(", ") : (profile.languages || ""),
        rateCard: { ...(profile.rateCard || {}) },
        plasticSurgery: profile.plasticSurgery || "false",
        maritalStatus: profile.maritalStatus || "Độc thân"
      });
      if (profile.verifiedLevel === "Elite" || profile.verifiedLevel === "Pro" || profile.verifiedLevel === "Basic") {
        setVerificationStatus("verified");
        setCccdFrontUploaded(true);
        setCccdBackUploaded(true);
        setSelfieUploaded(true);
      }
    }
  }, [profile]);

  // Simulated identity uploaders
  const startCccdUpload = (type: "cccd_front" | "cccd_back" | "cccd_selfie") => {
    if (uploadingType) return;
    setUploadingType(type);
    setUploadProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          if (type === "cccd_front") setCccdFrontUploaded(true);
          if (type === "cccd_back") setCccdBackUploaded(true);
          if (type === "cccd_selfie") setSelfieUploaded(true);
          setUploadingType(null);
          addToast(`Tải lên tài liệu ${type === "cccd_front" ? "Mặt trước CCCD" : type === "cccd_back" ? "Mặt sau CCCD" : "Ảnh Selfie xác thực"} thành công!`, "success");
        }, 100);
      }
    }, 100);
  };

  // Submit Identity Verification Request
  const handleIdentitySubmit = () => {
    if (!cccdFrontUploaded || !cccdBackUploaded || !selfieUploaded) {
      addToast("Vui lòng tải lên đầy đủ 3 tài liệu xác thực trước!", "info");
      return;
    }
    setVerificationStatus("pending");
    addToast("Đã gửi hồ sơ xác minh CCCD lên hệ thống! Tiến trình xét duyệt từ 1-2 tiếng.", "success");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-300">

      {/* SUB-SECTION 1: PERSONAL INFORMATION & METRICS FORM */}
      <div className="rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-6">
        <div className="border-b border-[#151b2d] pb-4">
          <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2">
            <Edit3 className="h-4.5 w-4.5 text-[#f4c430]" /> Cập Nhật Thông Tin Cá Nhân
          </h3>
          <span className="block text-[8px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">
            Đồng bộ trực tiếp lên hệ thống và hiển thị chỉ số ngoại hình của bạn
          </span>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          const updated = {
            ...profile,
            name: editForm.name,
            height: Number(editForm.height),
            weight: Number(editForm.weight),
            bust: Number(editForm.bust),
            waist: Number(editForm.waist),
            hips: Number(editForm.hips),
            location: editForm.location,
            hometown: editForm.hometown,
            education: editForm.education,
            languages: editForm.languages.split(",").map((s: string) => s.trim()),
            rateCard: { ...editForm.rateCard },
            plasticSurgery: editForm.plasticSurgery,
            maritalStatus: editForm.maritalStatus
          };
          setProfile(updated);
          localStorage.setItem("vnp_talent_profile", JSON.stringify(updated));
          addToast("Cập nhật thông tin cá nhân và ngoại hình thành công!", "success");
        }} className="space-y-4 text-xs">

          {/* Row 1: Name & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Họ tên nghệ danh</label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Khu vực hoạt động</label>
              <input
                type="text"
                required
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          {/* Row 2: Hometown & Education */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Quê quán</label>
              <input
                type="text"
                required
                value={editForm.hometown}
                onChange={(e) => setEditForm({ ...editForm, hometown: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Học vấn</label>
              <input
                type="text"
                required
                value={editForm.education}
                onChange={(e) => setEditForm({ ...editForm, education: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          {/* Row 3: Height, Weight & Surgery */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Chiều cao (cm)</label>
              <input
                type="number"
                required
                value={editForm.height}
                onChange={(e) => setEditForm({ ...editForm, height: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Cân nặng (kg)</label>
              <input
                type="number"
                required
                value={editForm.weight}
                onChange={(e) => setEditForm({ ...editForm, weight: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Phẫu thuật thẩm mỹ</label>
              <select
                value={editForm.plasticSurgery}
                onChange={(e) => setEditForm({ ...editForm, plasticSurgery: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              >
                <option value="false">Tự nhiên 100%</option>
                <option value="true">Đã can thiệp thẩm mỹ</option>
              </select>
            </div>
          </div>

          {/* Row 4: 3-vong */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Vòng 1 (cm)</label>
              <input
                type="number"
                required
                value={editForm.bust}
                onChange={(e) => setEditForm({ ...editForm, bust: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Vòng 2 (cm)</label>
              <input
                type="number"
                required
                value={editForm.waist}
                onChange={(e) => setEditForm({ ...editForm, waist: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Vòng 3 (cm)</label>
              <input
                type="number"
                required
                value={editForm.hips}
                onChange={(e) => setEditForm({ ...editForm, hips: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          {/* Row 5: Languages & Marriage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Ngôn ngữ (ngăn cách bằng dấu phẩy)</label>
              <input
                type="text"
                required
                value={editForm.languages}
                onChange={(e) => setEditForm({ ...editForm, languages: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Tình trạng hôn nhân</label>
              <input
                type="text"
                required
                value={editForm.maritalStatus}
                onChange={(e) => setEditForm({ ...editForm, maritalStatus: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          {/* Rate card config editing */}
          <div className="border-t border-[#151b2d] pt-4 space-y-3">
            <span className="block font-bold text-slate-300 uppercase tracking-wider text-[8px]">Cấu hình bảng giá dịch vụ (VND)</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(editForm.rateCard).map((key) => (
                <div key={key} className="space-y-1.5">
                  <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">{key}</label>
                  <input
                    type="number"
                    required
                    value={editForm.rateCard[key]}
                    onChange={(e) => {
                      const updatedRates = { ...editForm.rateCard, [key]: Number(e.target.value) };
                      setEditForm({ ...editForm, rateCard: updatedRates });
                    }}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-10 rounded-xl bg-[#f4c430] text-slate-950 font-black uppercase tracking-wider hover:brightness-105 active:scale-98 transition-all cursor-pointer shadow-lg"
            >
              Lưu thay đổi hồ sơ & Bảng giá
            </button>
          </div>
        </form>
      </div>

      {/* SUB-SECTION 2: CCCD IDENTITY DOCUMENT VERIFICATION */}
      <div className="rounded-2xl border border-cyan-500/20 bg-[#08090f] p-6 space-y-6">
        <div className="border-b border-[#151b2d] pb-4">
          <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-cyan-400" /> Xác Minh Căn Cước Công Dân (CCCD)
          </h3>
          <span className="block text-[8px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">
            Tải lên thông tin bắt buộc để nhận Tích xanh/Tích vàng Elite xác thực tài khoản
          </span>
        </div>

        {uploadingType && (uploadingType.includes("cccd")) && (
          <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-2 text-xs">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-white uppercase">Đang mã hóa tệp tin CCCD bảo mật...</span>
              <span className="font-mono text-cyan-400 font-bold">{uploadProgress}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full transition-all duration-100" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">

          {/* Front CCCD */}
          <div className="rounded-xl bg-slate-950 p-4 border border-white/5 flex flex-col justify-between items-center text-center space-y-3">
            <span className="font-bold block uppercase text-[8px] text-slate-400">CCCD Mặt trước</span>
            <div className="h-24 w-full rounded bg-slate-900 border border-white/5 flex items-center justify-center text-slate-600 relative overflow-hidden">
              {cccdFrontUploaded ? (
                <div className="absolute inset-0 bg-emerald-500/5 text-emerald-400 flex flex-col items-center justify-center p-2">
                  <CheckCircle className="h-8 w-8 text-emerald-400 mb-1" />
                  <span className="text-[7.5px] font-black uppercase">Đã Tải Lên</span>
                </div>
              ) : (
                <span className="text-[8px] text-slate-500 px-4">Độ phân giải rõ nét, không bị lóa</span>
              )}
            </div>
            <button
              type="button"
              disabled={!!uploadingType || verificationStatus === "verified"}
              onClick={() => startCccdUpload("cccd_front")}
              className="bg-white/5 border border-white/10 hover:bg-white/10 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider text-white transition-all disabled:opacity-50"
            >
              {cccdFrontUploaded ? "Tải lại" : "Tải lên tệp"}
            </button>
          </div>

          {/* Back CCCD */}
          <div className="rounded-xl bg-slate-950 p-4 border border-white/5 flex flex-col justify-between items-center text-center space-y-3">
            <span className="font-bold block uppercase text-[8px] text-slate-400">CCCD Mặt sau</span>
            <div className="h-24 w-full rounded bg-slate-900 border border-white/5 flex items-center justify-center text-slate-600 relative overflow-hidden">
              {cccdBackUploaded ? (
                <div className="absolute inset-0 bg-emerald-500/5 text-emerald-400 flex flex-col items-center justify-center p-2">
                  <CheckCircle className="h-8 w-8 text-emerald-400 mb-1" />
                  <span className="text-[7.5px] font-black uppercase">Đã Tải Lên</span>
                </div>
              ) : (
                <span className="text-[8px] text-slate-500 px-4">Hiển thị rõ mã vạch và quốc huy</span>
              )}
            </div>
            <button
              type="button"
              disabled={!!uploadingType || verificationStatus === "verified"}
              onClick={() => startCccdUpload("cccd_back")}
              className="bg-white/5 border border-white/10 hover:bg-white/10 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider text-white transition-all disabled:opacity-50"
            >
              {cccdBackUploaded ? "Tải lại" : "Tải lên tệp"}
            </button>
          </div>

          {/* Selfie Verified */}
          <div className="rounded-xl bg-slate-950 p-4 border border-white/5 flex flex-col justify-between items-center text-center space-y-3">
            <span className="font-bold block uppercase text-[8px] text-slate-400">Ảnh chân dung Selfie</span>
            <div className="h-24 w-full rounded bg-slate-900 border border-white/5 flex items-center justify-center text-slate-600 relative overflow-hidden">
              {selfieUploaded ? (
                <div className="absolute inset-0 bg-emerald-500/5 text-emerald-400 flex flex-col items-center justify-center p-2">
                  <CheckCircle className="h-8 w-8 text-emerald-400 mb-1" />
                  <span className="text-[7.5px] font-black uppercase">Đã Tải Lên</span>
                </div>
              ) : (
                <span className="text-[8px] text-slate-500 px-4">Ảnh selfie cầm CCCD trên tay</span>
              )}
            </div>
            <button
              type="button"
              disabled={!!uploadingType || verificationStatus === "verified"}
              onClick={() => startCccdUpload("cccd_selfie")}
              className="bg-white/5 border border-white/10 hover:bg-white/10 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider text-white transition-all disabled:opacity-50"
            >
              {selfieUploaded ? "Tải lại" : "Tải lên tệp"}
            </button>
          </div>

        </div>

        <div className="bg-slate-950/60 p-4 rounded-xl border border-dashed border-[#151b2d] flex justify-between items-center gap-4 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-white block">Trạng thái phê duyệt CCCD</span>
            <span className="text-[9.5px] text-slate-400 block">
              {verificationStatus === "unverified" && "Chưa gửi yêu cầu. Vui lòng tải đủ 3 ảnh trên."}
              {verificationStatus === "pending" && "⏳ Hồ sơ đang chờ quản trị viên phê duyệt trong vòng 120 phút."}
              {verificationStatus === "verified" && "🎉 Tài khoản đã được định danh thật thành công trên hệ thống!"}
            </span>
          </div>
          {verificationStatus !== "verified" && (
            <button
              type="button"
              onClick={handleIdentitySubmit}
              className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 text-[9px] font-black uppercase tracking-wider px-4 py-2 rounded-lg transition-all"
            >
              {verificationStatus === "pending" ? "Đang xử lý..." : "Gửi yêu cầu xác thực"}
            </button>
          )}
        </div>
      </div>

      {/* SUB-SECTION 3: PORTFOLIO GALLERY (MAX 10 PHOTO STRICT LIMIT CONSTRAINT) */}
      <div className="rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-6">
        <div className="border-b border-[#151b2d] pb-4 flex justify-between items-center flex-wrap gap-2">
          <div>
            <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <Camera className="h-4.5 w-4.5 text-purple-400" /> Bộ Sưu Tập Ảnh Nghệ Thuật (Art Portfolio)
            </h3>
            <span className="block text-[8px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">
              Lưu trữ tối đa 10 bức ảnh tinh tuyển. Tải ảnh mới sẽ cập nhật trực tiếp vào Hồ Sơ cá nhân.
            </span>
          </div>
          <span className={cn(
            "text-[10px] font-black px-2 py-0.5 rounded border font-mono",
            (profile.photos || []).length >= 10
              ? "border-red-500/30 text-red-400 bg-red-500/10 animate-pulse"
              : "border-purple-500/30 text-purple-400 bg-purple-500/10"
          )}>
            {(profile.photos || []).length} / 10 Ảnh
          </span>
        </div>

        {uploadingType === "photos" && (
          <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-2 text-xs">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-white uppercase">Đang đăng ảnh nghệ thuật lên máy chủ...</span>
              <span className="font-mono text-purple-400 font-bold">{uploadProgress}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transition-all duration-100" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(profile.photos || []).map((imgUrl: string, idx: number) => (
            <div key={idx} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-white/5 bg-slate-900 group shadow-md">
              <img src={imgUrl} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  const updatedPhotos = [...(profile.photos || [])];
                  updatedPhotos.splice(idx, 1);
                  const updatedProfile = { ...profile, photos: updatedPhotos };
                  setProfile(updatedProfile);
                  localStorage.setItem("vnp_talent_profile", JSON.stringify(updatedProfile));
                  addToast("Đã xóa ảnh khỏi bộ ảnh nghệ thuật", "info");
                }}
                className="absolute top-1.5 right-1.5 h-5 w-5 bg-red-600/90 text-white rounded-full flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer shadow-md"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {/* Add photos trigger block (strictly limit <= 10) */}
          <button
            disabled={!!uploadingType || (profile.photos || []).length >= 10}
            onClick={() => {
              if (uploadingType || (profile.photos || []).length >= 10) return;
              setUploadingType("photos");
              setUploadProgress(0);
              let progress = 0;
              const interval = setInterval(() => {
                progress += 10;
                setUploadProgress(progress);
                if (progress >= 100) {
                  clearInterval(interval);
                  setTimeout(() => {
                    const unsplashPhotos = [
                      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=600",
                      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600",
                      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600",
                      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600",
                      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=600"
                    ];
                    const randomPhoto = unsplashPhotos[Math.floor(Math.random() * unsplashPhotos.length)];
                    const currentPhotos = [...(profile.photos || [])];
                    currentPhotos.push(randomPhoto);
                    const updatedProfile = { ...profile, photos: currentPhotos };
                    setProfile(updatedProfile);
                    localStorage.setItem("vnp_talent_profile", JSON.stringify(updatedProfile));
                    setUploadingType(null);
                    addToast("Đã tải ảnh mới lên Art Portfolio!", "success");
                  }, 100);
                }
              }, 100);
            }}
            className={cn(
              "aspect-[3/4] rounded-lg border border-dashed flex flex-col items-center justify-center gap-1.5 transition-all text-xs",
              (profile.photos || []).length >= 10
                ? "border-red-500/25 bg-red-500/5 text-red-500/60 cursor-not-allowed"
                : "border-white/10 hover:border-amber-400 bg-slate-900 text-slate-500 hover:text-amber-400 cursor-pointer disabled:opacity-50"
            )}
          >
            <Plus className="h-6 w-6" />
            <span className="text-[8px] font-black uppercase text-center">
              {(profile.photos || []).length >= 10 ? "Đầy 10 ảnh" : "Tải thêm ảnh"}
            </span>
          </button>
        </div>

        {(profile.photos || []).length >= 10 && (
          <p className="text-[9px] text-red-400/80 font-bold bg-red-500/5 border border-red-500/10 p-2.5 rounded-lg flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0" />
            Đã đạt giới hạn tối đa 10 ảnh nghệ thuật. Vui lòng xóa ảnh cũ để giải phóng dung lượng trước khi tải ảnh mới.
          </p>
        )}
      </div>

      {/* SUB-SECTION 4: VIDEO UPLOAD MANAGER */}
      <div className="rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-6">
        <div className="border-b border-[#151b2d] pb-4">
          <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2">
            <Video className="h-4.5 w-4.5 text-cyan-400" /> Tải Lên Video Giới Thiệu, Catwalk & MC
          </h3>
          <span className="block text-[8px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">
            Lưu trữ các video giới thiệu bản thân thực tế, catwalk thử đồ và demo dẫn chương trình/livestream
          </span>
        </div>

        {uploadingType && (uploadingType === "catwalk" || uploadingType === "intro" || uploadingType === "mc") && (
          <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-2 text-xs">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-white uppercase">Đang nén và chuyển hóa video lên CDN...</span>
              <span className="font-mono text-cyan-400 font-bold">{uploadProgress}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-500 rounded-full transition-all duration-100" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}

        <div className="space-y-3.5 text-xs text-slate-300">
          {[
            { id: "intro", label: "Video Giới thiệu bản thân (Intro video - Bắt buộc với Elite)", key: "hasUploadedIntro" },
            { id: "catwalk", label: "Video trình diễn Catwalk thời trang (Polaroid)", key: "hasUploadedCatwalk" },
            { id: "mc", label: "Video Demo MC chương trình / Livestream bán hàng", key: "hasUploadedMC" }
          ].map((vid) => {
            const isUploaded = profile[vid.key] || false;
            return (
              <div key={vid.id} className="flex justify-between items-center bg-slate-950 p-3.5 rounded-xl border border-white/5">
                <div className="space-y-1">
                  <span className="font-bold text-white block">{vid.label}</span>
                  <span className="text-[8px] text-slate-500 block">
                    Trạng thái: <span className={isUploaded ? "text-emerald-400 font-bold" : "text-slate-500"}>{isUploaded ? "🟢 Đã tải lên thành công" : "⚪ Chưa tải lên"}</span>
                  </span>
                </div>
                <button
                  type="button"
                  disabled={!!uploadingType}
                  onClick={() => {
                    if (uploadingType) return;
                    setUploadingType(vid.id as any);
                    setUploadProgress(0);
                    let progress = 0;
                    const interval = setInterval(() => {
                      progress += 10;
                      setUploadProgress(progress);
                      if (progress >= 100) {
                        clearInterval(interval);
                        setTimeout(() => {
                          const updated = { ...profile, [vid.key]: true };
                          setProfile(updated);
                          localStorage.setItem("vnp_talent_profile", JSON.stringify(updated));
                          setUploadingType(null);
                          addToast(`Tải lên thành công ${vid.label}!`, "success");
                        }, 100);
                      }
                    }, 100);
                  }}
                  className="bg-white text-slate-950 hover:bg-[#f4c430] hover:text-slate-950 text-[8px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition-all"
                >
                  {isUploaded ? "Cập nhật video" : "Tải video"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
