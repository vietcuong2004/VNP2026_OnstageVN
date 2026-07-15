"use client";

import React, { useEffect, useState } from "react";
import {
  Edit3, ShieldCheck, CheckCircle, Upload, Video, Trash2, ChevronDown, ChevronUp,
  X, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { persistTalentProfile, ensureTalentProfile, saveTalentProfile, uploadTalentPhoto } from "@/lib/talent-api";
import { normalizeBackendAssetUrl } from "@/lib/avatar";
import ProgressBar from "@/components/ui/ProgressBar";

const convertToInputDate = (dateStr: string) => {
  if (!dateStr) return "";
  const dateOnly = dateStr.split(/[T ]/)[0];
  if (dateOnly.includes("/")) {
    const parts = dateOnly.split("/");
    if (parts.length === 3) {
      const [d, m, y] = parts;
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }
  return dateOnly;
};

const convertToDisplayDate = (dateStr: string) => {
  if (!dateStr) return "";
  const dateOnly = dateStr.split(/[T ]/)[0];
  if (dateOnly.includes("-")) {
    const parts = dateOnly.split("-");
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
    }
  }
  return dateOnly;
};

const availableSkills = [
  "High Fashion",
  "Runway",
  "Commercial",
  "Beauty Shoot",
  "Editorial",
  "KOL / Event",
  "Fitness Model",
  "Lookbook",
  "MC / Host",
  "Acting / Drama"
];

const availableLanguages = [
  "Tiếng Việt",
  "Tiếng Anh",
  "Tiếng Trung",
  "Tiếng Hàn",
  "Tiếng Nhật",
  "Tiếng Pháp",
  "Tiếng Đức",
  "Tiếng Nga",
  "Tiếng Tây Ban Nha"
];

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

  // Identity card (CCCD) upload states
  const [cccdFront, setCccdFront] = useState<string | null>(null);
  const [cccdBack, setCccdBack] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<"unverified" | "pending" | "verified">("unverified");
  const [lifestyleServices, setLifestyleServices] = useState<any[]>([]);
  const [isLifestyleExpanded, setIsLifestyleExpanded] = useState(false);
  const [selectedLangName, setSelectedLangName] = useState("");
  const [langProficiency, setLangProficiency] = useState("");

  // Form states for profile editing
  const [editForm, setEditForm] = useState<any>({
    name: "",
    email: "",
    phone: "",
    height: "",
    weight: "",
    bust: "",
    waist: "",
    hips: "",
    location: "",
    hometown: "",
    education: "",
    bio: "",
    languages: [],
    rateCard: {},
    plasticSurgery: "false",
    maritalStatus: "",
    gender: "",
    dob: "",
    skinColor: "",
    hairColor: "",
    tattoo: "Không",
    tattooDesc: "",
    experience: "",
    specialSkills: [],
    price: "",
    facebook_url: "",
    instagram_url: "",
    linkedin_url: ""
  });

  const handleAddSkill = (skill: string) => {
    if (skill && !editForm.specialSkills.includes(skill)) {
      setEditForm((prev: any) => ({
        ...prev,
        specialSkills: [...prev.specialSkills, skill]
      }));
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setEditForm((prev: any) => ({
      ...prev,
      specialSkills: prev.specialSkills.filter((s: string) => s !== skillToRemove)
    }));
  };

  const handleAddLanguage = () => {
    if (selectedLangName) {
      const fullLangString = langProficiency.trim()
        ? `${selectedLangName} (${langProficiency.trim()})`
        : selectedLangName;

      if (!editForm.languages.includes(fullLangString)) {
        setEditForm((prev: any) => ({
          ...prev,
          languages: [...prev.languages, fullLangString]
        }));
      }
      setSelectedLangName("");
      setLangProficiency("");
    }
  };

  const handleRemoveLanguage = (langToRemove: string) => {
    setEditForm((prev: any) => ({
      ...prev,
      languages: prev.languages.filter((l: string) => l !== langToRemove)
    }));
  };

  // Video upload state simulator
  const [videoForm, setVideoForm] = useState({
    hasUploadedIntro: false,
    hasUploadedCatwalk: false,
    hasUploadedMC: false
  });

  // Upload simulation states
  const [uploadingState, setUploadingState] = useState<{
    [key: string]: {
      progress: number;
      fileName: string;
      status: "uploading" | "done" | "error" | "idle";
    };
  }>({});

  // Sync edit form fields once profile loads
  useEffect(() => {
    if (profile) {
      const onboarded = !!profile.isOnboarded;
      setEditForm({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        height: profile.height || "",
        weight: profile.weight || "",
        bust: profile.bust || "",
        waist: profile.waist || "",
        hips: profile.hips || "",
        location: profile.location || "",
        hometown: profile.hometown || "",
        education: profile.education || "",
        bio: profile.bio || "",
        languages: Array.isArray(profile.languages) ? profile.languages : (profile.languages ? [profile.languages] : []),
        rateCard: { ...(profile.rateCard || {}) },
        plasticSurgery: profile.plasticSurgery || "false",
        maritalStatus: profile.maritalStatus || "",
        gender: profile.gender || "",
        dob: convertToInputDate(profile.dob),
        skinColor: profile.skinColor || "",
        hairColor: profile.hairColor || "",
        tattoo: profile.tattoo || "Không",
        tattooDesc: profile.tattooDesc || "",
        experience: profile.experience !== undefined && profile.experience !== null ? profile.experience : "",
        specialSkills: Array.isArray(profile.specialSkills) ? profile.specialSkills : (Array.isArray(profile.skills) ? profile.skills : []),
        price: profile.price || "",
        facebook_url: profile.facebook_url || "",
        instagram_url: profile.instagram_url || "",
        linkedin_url: profile.linkedin_url || ""
      });
      setVideoForm({
        hasUploadedIntro: onboarded ? (profile.hasUploadedIntro || false) : false,
        hasUploadedCatwalk: onboarded ? (profile.hasUploadedCatwalk || false) : false,
        hasUploadedMC: onboarded ? (profile.hasUploadedMC || false) : false
      });
      setLifestyleServices(onboarded ? (profile.lifestyleServices || []) : []);

      const front = profile.cccdFront || null;
      const back = profile.cccdBack || null;
      const self = profile.cccdSelfie || null;
      setCccdFront(front);
      setCccdBack(back);
      setSelfie(self);

      if (front && back && self) {
        setVerificationStatus(profile.verificationStatus || "pending");
      } else {
        setVerificationStatus(profile.verificationStatus || "unverified");
      }

      if (onboarded && (profile.verifiedLevel === "Elite" || profile.verifiedLevel === "Pro" || profile.verifiedLevel === "Basic")) {
        setVerificationStatus("verified");
      }
    }
  }, [profile]);

  // Real identity card (CCCD) uploader
  const handleCccdUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "cccd_front" | "cccd_back" | "cccd_selfie") => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const fieldMap = {
      cccd_front: "cccdFront",
      cccd_back: "cccdBack",
      cccd_selfie: "cccdSelfie"
    };
    const field = fieldMap[type];
    const previewUrl = URL.createObjectURL(file);
    setProfile((current: any) => ({ ...current, [field]: previewUrl }));
    if (type === "cccd_front") setCccdFront(previewUrl);
    if (type === "cccd_back") setCccdBack(previewUrl);
    if (type === "cccd_selfie") setSelfie(previewUrl);

    setUploadingState(prev => ({
      ...prev,
      [type]: {
        progress: 0,
        fileName: file.name,
        status: "uploading"
      }
    }));

    let progress = 0;
    const interval = setInterval(() => {
      progress += 8;
      if (progress > 95) progress = 95;
      setUploadingState(prev => {
        if (!prev[type]) return prev;
        return {
          ...prev,
          [type]: {
            ...prev[type],
            progress
          }
        };
      });
    }, 150);

    try {
      const syncedProfile = await ensureTalentProfile(profile);

      let photoUrl = "";
      if (syncedProfile.backendProfileId) {
        const photo = await uploadTalentPhoto(syncedProfile.backendProfileId, file, type);
        photoUrl = photo.url || photo.path || "";
      }

      if (!photoUrl) {
        // Fallback for unauthenticated or local usage: read as Base64 data URL
        photoUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });
      }

      clearInterval(interval);
      setUploadingState(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          progress: 100,
          status: "done"
        }
      }));

      setTimeout(() => {
        setUploadingState(prev => {
          const next = { ...prev };
          delete next[type];
          return next;
        });
      }, 800);

      const updatedProfile = {
        ...syncedProfile,
        ...profile,
        [field]: photoUrl
      };

      setProfile(persistTalentProfile(updatedProfile));
      URL.revokeObjectURL(previewUrl);

      if (type === "cccd_front") setCccdFront(photoUrl);
      if (type === "cccd_back") setCccdBack(photoUrl);
      if (type === "cccd_selfie") setSelfie(photoUrl);

      let typeName = "";
      if (type === "cccd_front") typeName = "Mặt trước CCCD";
      else if (type === "cccd_back") typeName = "Mặt sau CCCD";
      else if (type === "cccd_selfie") typeName = "Ảnh Selfie xác thực";

      addToast(`Tải lên tài liệu ${typeName} thành công!`, "success");
    } catch (error) {
      clearInterval(interval);
      setUploadingState(prev => {
        const next = { ...prev };
        delete next[type];
        return next;
      });
      console.error(error);
      addToast(error instanceof Error ? error.message : "Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại.", "info");
      URL.revokeObjectURL(previewUrl);
    }
  };

  // Submit Identity Verification Request
  const handleIdentitySubmit = () => {
    if (!cccdFront || !cccdBack || !selfie) {
      addToast("Vui lòng tải lên đầy đủ 3 tài liệu xác thực trước!", "info");
      return;
    }
    setVerificationStatus("pending");
    const updated = {
      ...profile,
      verificationStatus: "pending"
    };
    setProfile(persistTalentProfile(updated));
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

        <form onSubmit={async (e) => {
          e.preventDefault();
          const updated = {
            ...profile,
            name: editForm.name,
            email: editForm.email,
            phone: editForm.phone,
            height: Number(editForm.height),
            weight: Number(editForm.weight),
            bust: Number(editForm.bust),
            waist: Number(editForm.waist),
            hips: Number(editForm.hips),
            location: editForm.location,
            hometown: editForm.hometown,
            education: editForm.education,
            bio: editForm.bio,
            languages: editForm.languages,
            rateCard: { ...editForm.rateCard },
            plasticSurgery: editForm.plasticSurgery,
            maritalStatus: editForm.maritalStatus,
            gender: editForm.gender,
            dob: convertToDisplayDate(editForm.dob),
            skinColor: editForm.skinColor,
            hairColor: editForm.hairColor,
            tattoo: editForm.tattoo,
            tattooDesc: editForm.tattoo === "Có" ? editForm.tattooDesc : "",
            experience: Number(editForm.experience),
            specialSkills: editForm.specialSkills,
            skills: editForm.specialSkills,
            lifestyleServices: lifestyleServices,
            price: editForm.price,
            facebook_url: editForm.facebook_url,
            instagram_url: editForm.instagram_url,
            linkedin_url: editForm.linkedin_url
          };
          const syncedProfile = await saveTalentProfile(updated);
          setProfile(syncedProfile);
          addToast("Cập nhật thông tin cá nhân và ngoại hình thành công!", "success");
        }} className="space-y-4 text-xs">

          {/* Row 1: Name & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Họ và tên</label>
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

          {/* Row 1.5: Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Email</label>
              <input
                type="email"
                required
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Số điện thoại</label>
              <input
                type="text"
                required
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          {/* Social Links & Pricing Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Mức giá (VD: "5.000.000đ/buổi" hoặc "Thỏa thuận")</label>
              <input
                type="text"
                value={editForm.price}
                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                placeholder="Nhập mức giá dịch vụ của bạn..."
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Facebook URL</label>
              <input
                type="url"
                value={editForm.facebook_url}
                onChange={(e) => setEditForm({ ...editForm, facebook_url: e.target.value })}
                placeholder="https://facebook.com/yourprofile"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Instagram URL</label>
              <input
                type="url"
                value={editForm.instagram_url}
                onChange={(e) => setEditForm({ ...editForm, instagram_url: e.target.value })}
                placeholder="https://instagram.com/yourprofile"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">LinkedIn URL</label>
              <input
                type="url"
                value={editForm.linkedin_url}
                onChange={(e) => setEditForm({ ...editForm, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/yourprofile"
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

          {/* Bio / Description Field */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Mô tả bản thân (Giới thiệu)</label>
            <textarea
              value={editForm.bio || ""}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              rows={3}
              placeholder="Nhập mô tả ngắn giới thiệu về bản thân của bạn..."
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors resize-none"
            />
          </div>

          {/* Row 3: Height & Weight */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Chiều cao (cm)</label>
              <input
                type="number"
                required
                value={editForm.height}
                onChange={(e) => setEditForm({ ...editForm, height: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Cân nặng (kg)</label>
              <input
                type="number"
                required
                value={editForm.weight}
                onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
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
                onChange={(e) => setEditForm({ ...editForm, bust: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Vòng 2 (cm)</label>
              <input
                type="number"
                required
                value={editForm.waist}
                onChange={(e) => setEditForm({ ...editForm, waist: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Vòng 3 (cm)</label>
              <input
                type="number"
                required
                value={editForm.hips}
                onChange={(e) => setEditForm({ ...editForm, hips: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          {/* New Row: Giới tính, Ngày sinh, Kinh nghiệm */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Giới tính</label>
              <select
                value={editForm.gender}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Ngày sinh</label>
              <input
                type="date"
                required
                value={editForm.dob}
                onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Kinh nghiệm (năm)</label>
              <input
                type="number"
                required
                min={0}
                max={20}
                value={editForm.experience}
                onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          {/* Row 5: Lĩnh vực hoạt động & Ngôn ngữ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Lĩnh vực hoạt động */}
            <div className="space-y-3">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Lĩnh vực hoạt động</label>
              <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-[#05070e] border border-white/5 rounded-xl text-left">
                {editForm.specialSkills.length === 0 ? (
                  <span className="text-[10px] text-slate-600 italic px-2 py-1">Chưa chọn lĩnh vực nào</span>
                ) : (
                  editForm.specialSkills.map((skill: string) => (
                    <span key={skill} className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/5 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[#F0C56B] shadow-sm">
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-slate-400 hover:text-rose-400 cursor-pointer focus:outline-none flex items-center justify-center"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
              <select
                value=""
                onChange={(e) => {
                  handleAddSkill(e.target.value);
                  e.target.value = "";
                }}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-300 text-[11px] font-semibold focus:outline-none focus:border-amber-400 cursor-pointer appearance-none"
                style={{
                  backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23F0C56B%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27/%3e%3c/svg%3e')",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.75rem center",
                  backgroundSize: "0.85em",
                  paddingRight: "2rem"
                }}
              >
                <option value="" disabled hidden>Thêm lĩnh vực hoạt động...</option>
                {availableSkills
                  .filter((s: string) => !editForm.specialSkills.includes(s))
                  .map((s: string) => (
                    <option key={s} value={s} className="bg-slate-950 text-white">{s}</option>
                  ))
                }
              </select>
            </div>

            {/* Ngôn ngữ */}
            <div className="space-y-3">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Ngôn ngữ</label>
              <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-[#05070e] border border-white/5 rounded-xl text-left">
                {editForm.languages.length === 0 ? (
                  <span className="text-[10px] text-slate-600 italic px-2 py-1">Chưa chọn ngôn ngữ nào</span>
                ) : (
                  editForm.languages.map((lang: string) => (
                    <span key={lang} className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/5 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[#F0C56B] shadow-sm">
                      {lang}
                      <button
                        type="button"
                        onClick={() => handleRemoveLanguage(lang)}
                        className="text-slate-400 hover:text-rose-400 cursor-pointer focus:outline-none flex items-center justify-center"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={selectedLangName}
                    onChange={(e) => setSelectedLangName(e.target.value)}
                    className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-300 text-[11px] font-semibold focus:outline-none focus:border-amber-400 cursor-pointer appearance-none"
                    style={{
                      backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23F0C56B%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27/%3e%3c/svg%3e')",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 0.75rem center",
                      backgroundSize: "0.85em",
                      paddingRight: "2rem"
                    }}
                  >
                    <option value="" disabled hidden>Chọn ngôn ngữ...</option>
                    {availableLanguages.map((l: string) => (
                      <option key={l} value={l} className="bg-slate-950 text-white">{l}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={langProficiency}
                    onChange={(e) => setLangProficiency(e.target.value)}
                    placeholder="Trình độ (e.g. Bản xứ, IELTS 7.5)"
                    className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-white text-[11px] font-semibold focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddLanguage}
                  disabled={!selectedLangName}
                  className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${selectedLangName
                    ? "bg-[#f4c430] text-slate-950 hover:opacity-90 active:scale-95 cursor-pointer"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    }`}
                >
                  <Plus className="h-3.5 w-3.5" /> Thêm ngoại ngữ
                </button>
              </div>
            </div>

          </div>

          {/* Lifestyle Companion services config editing */}
          {lifestyleServices && lifestyleServices.length > 0 && (
            <div className="border-t border-[#151b2d] pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[8px] text-left">
                  Dịch Vụ Đồng Hành VIP
                </span>
                <button
                  type="button"
                  onClick={() => setIsLifestyleExpanded(!isLifestyleExpanded)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400 hover:bg-amber-400/20 hover:border-amber-400/40 text-[9px] font-black uppercase transition-all duration-300 focus:outline-none hover:shadow-[0_0_10px_rgba(244,196,48,0.15)]"
                >
                  <span>{isLifestyleExpanded ? "Thu gọn" : "Cấu hình"}</span>
                  {isLifestyleExpanded ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              {isLifestyleExpanded && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Select All Toggle - shown only when expanded */}
                  <div className="flex justify-end">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none bg-slate-950/60 border border-white/5 px-2.5 py-1.5 rounded-lg hover:border-white/10 transition-colors">
                      <input
                        type="checkbox"
                        checked={lifestyleServices.length > 0 && lifestyleServices.every(s => s.enabled)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const updated = lifestyleServices.map(s => ({ ...s, enabled: checked }));
                          setLifestyleServices(updated);
                        }}
                        className="rounded accent-[#f4c430] h-3.5 w-3.5 cursor-pointer"
                      />
                      <span className="text-[8px] font-black text-slate-400 uppercase">Chọn tất cả</span>
                    </label>
                  </div>

                  {/* Grid of items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lifestyleServices.map((service, index) => {
                      return (
                        <div key={service.id} className="rounded-xl border border-white/5 bg-slate-950 p-4 space-y-3 text-left">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-xs text-white">{service.title}</span>
                            <label className="flex items-center gap-1.5 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={service.enabled}
                                onChange={(e) => {
                                  const updated = [...lifestyleServices];
                                  updated[index] = { ...service, enabled: e.target.checked };
                                  setLifestyleServices(updated);
                                }}
                                className="rounded accent-[#f4c430] h-3.5 w-3.5 cursor-pointer"
                              />
                              <span className="text-[8px] font-black text-slate-400 uppercase">Kích hoạt</span>
                            </label>
                          </div>

                          <p className="text-xs text-slate-500 leading-normal">{service.description}</p>

                          {service.enabled && (
                            <div className="space-y-1.5 animate-in fade-in duration-200">
                              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Giá dịch vụ đề xuất (VND / {service.unit})</label>
                              <input
                                type="number"
                                required
                                value={service.rate}
                                onChange={(e) => {
                                  const updated = [...lifestyleServices];
                                  updated[index] = { ...service, rate: Number(e.target.value) };
                                  setLifestyleServices(updated);
                                }}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-amber-400 transition-colors"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-10 rounded-xl bg-[#f4c430] text-slate-950 font-black uppercase tracking-wider hover:brightness-105 active:scale-98 transition-all cursor-pointer shadow-lg"
            >
              Lưu thay đổi
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">

          {/* Front CCCD */}
          <div className="rounded-xl bg-slate-950 p-4 border border-white/5 flex flex-col justify-between items-center text-center space-y-3">
            <span className="font-bold block uppercase text-[8px] text-slate-400">CCCD Mặt trước</span>
            <div className="h-24 w-full rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-600 relative overflow-hidden group">
              {cccdFront ? (
                <>
                  <img src={normalizeBackendAssetUrl(cccdFront)} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" alt="CCCD Mặt trước" />
                  <div className="absolute inset-0 bg-black/25 sm:bg-black/45 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                    <label className="flex flex-col items-center gap-1.5 bg-black/75 hover:bg-black/90 border border-white/15 hover:border-amber-400/80 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-white text-[10px] font-bold cursor-pointer transition-all">
                      <Upload className="h-5 w-5 text-amber-400" />
                      <span>Thay đổi ảnh</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={!!uploadingState["cccd_front"] || verificationStatus === "verified"}
                        onChange={(e) => handleCccdUpload(e, "cccd_front")}
                      />
                    </label>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-4">
                  <span className="text-[8px] text-slate-500 mb-2">Chưa chọn ảnh nào</span>
                  <label className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-[8px] font-black uppercase tracking-wider cursor-pointer transition-all">
                    <Upload className="h-3.5 w-3.5 text-white" />
                    <span>Tải ảnh lên</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={!!uploadingState["cccd_front"] || verificationStatus === "verified"}
                      onChange={(e) => handleCccdUpload(e, "cccd_front")}
                    />
                  </label>
                </div>
              )}

              {/* Progress bar overlay */}
              {uploadingState["cccd_front"] && (
                <ProgressBar
                  progress={uploadingState["cccd_front"].progress}
                  message="Đang tải ảnh mặt trước CCCD lên..."
                />
              )}
            </div>
          </div>

          {/* Back CCCD */}
          <div className="rounded-xl bg-slate-950 p-4 border border-white/5 flex flex-col justify-between items-center text-center space-y-3">
            <span className="font-bold block uppercase text-[8px] text-slate-400">CCCD Mặt sau</span>
            <div className="h-24 w-full rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-600 relative overflow-hidden group">
              {cccdBack ? (
                <>
                  <img src={normalizeBackendAssetUrl(cccdBack)} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" alt="CCCD Mặt sau" />
                  <div className="absolute inset-0 bg-black/25 sm:bg-black/45 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                    <label className="flex flex-col items-center gap-1.5 bg-black/75 hover:bg-black/90 border border-white/15 hover:border-amber-400/80 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-white text-[10px] font-bold cursor-pointer transition-all">
                      <Upload className="h-5 w-5 text-amber-400" />
                      <span>Thay đổi ảnh</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={!!uploadingState["cccd_back"] || verificationStatus === "verified"}
                        onChange={(e) => handleCccdUpload(e, "cccd_back")}
                      />
                    </label>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-4">
                  <span className="text-[8px] text-slate-500 mb-2">Chưa chọn ảnh nào</span>
                  <label className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-[8px] font-black uppercase tracking-wider cursor-pointer transition-all">
                    <Upload className="h-3.5 w-3.5 text-white" />
                    <span>Tải ảnh lên</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={!!uploadingState["cccd_back"] || verificationStatus === "verified"}
                      onChange={(e) => handleCccdUpload(e, "cccd_back")}
                    />
                  </label>
                </div>
              )}

              {/* Progress bar overlay */}
              {uploadingState["cccd_back"] && (
                <ProgressBar
                  progress={uploadingState["cccd_back"].progress}
                  message="Đang tải ảnh mặt sau CCCD lên..."
                />
              )}
            </div>
          </div>

          {/* Selfie Verified */}
          <div className="rounded-xl bg-slate-950 p-4 border border-white/5 flex flex-col justify-between items-center text-center space-y-3">
            <span className="font-bold block uppercase text-[8px] text-slate-400">Ảnh chân dung Selfie</span>
            <div className="h-24 w-full rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-600 relative overflow-hidden group">
              {selfie ? (
                <>
                  <img src={normalizeBackendAssetUrl(selfie)} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Ảnh chân dung Selfie" />
                  <div className="absolute inset-0 bg-black/25 sm:bg-black/45 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                    <label className="flex flex-col items-center gap-1.5 bg-black/75 hover:bg-black/90 border border-white/15 hover:border-amber-400/80 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-white text-[10px] font-bold cursor-pointer transition-all">
                      <Upload className="h-5 w-5 text-amber-400" />
                      <span>Thay đổi ảnh</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={!!uploadingState["cccd_selfie"] || verificationStatus === "verified"}
                        onChange={(e) => handleCccdUpload(e, "cccd_selfie")}
                      />
                    </label>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-4">
                  <span className="text-[8px] text-slate-500 mb-2">Chưa chọn ảnh nào</span>
                  <label className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-[8px] font-black uppercase tracking-wider cursor-pointer transition-all">
                    <Upload className="h-3.5 w-3.5 text-white" />
                    <span>Tải ảnh lên</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={!!uploadingState["cccd_selfie"] || verificationStatus === "verified"}
                      onChange={(e) => handleCccdUpload(e, "cccd_selfie")}
                    />
                  </label>
                </div>
              )}

              {/* Progress bar overlay */}
              {uploadingState["cccd_selfie"] && (
                <ProgressBar
                  progress={uploadingState["cccd_selfie"].progress}
                  message="Đang tải ảnh chân dung selfie lên..."
                />
              )}
            </div>
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

      {/* SUB-SECTION 4: VIDEO UPLOAD MANAGER (Commented out) */}

    </div>
  );
}
