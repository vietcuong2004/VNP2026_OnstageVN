"use client";

import {
  BookmarkCheck,
  Briefcase,
  Building2,
  CircleHelp,
  Search,
  Sparkles,
  User,
  Users2,
} from "lucide-react";

export const unifiedBrandNavigation = [
  { label: "Tìm kiếm Talent", icon: Search, href: "/brand/search" },
  { label: "Đăng việc làm", icon: Briefcase, href: "/brand/campaigns" },
  { label: "Quản lý Talent", icon: Users2, href: "/brand/my-talents" },
  { label: "Danh sách đã lưu", icon: BookmarkCheck, href: "/brand/shortlists" },
  { label: "Thông tin brand", icon: Building2, href: "/brand/settings" },
];

export const unifiedTalentNavigation = [
  { label: "Chợ việc làm", icon: Briefcase, href: "/talent/jobs" },
  { label: "Hồ sơ Talent", icon: User, href: "/talent/portfolio" },
  { label: "Khảo sát", icon: Sparkles, href: "/talent/survey" },
  { label: "Hợp tác Brand", icon: Users2, href: "/talent/brands" },
];

export const unifiedLoggedInNavigationSections = [
  { title: "Dành cho Brand", icon: Briefcase, helpIcon: CircleHelp, items: unifiedBrandNavigation },
  { title: "Dành cho Talent", icon: Sparkles, helpIcon: CircleHelp, items: unifiedTalentNavigation },
];

export const unifiedLoggedInMobilePrimaryNavigation = [
  unifiedBrandNavigation[0],
  unifiedBrandNavigation[1],
  unifiedTalentNavigation[0],
  unifiedTalentNavigation[2],
];
