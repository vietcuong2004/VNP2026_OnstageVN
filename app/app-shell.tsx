"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import AuthGuard from "@/components/auth-guard";
import BottomNavigation from "@/components/BottomNavigation";
import Header from "@/components/header";
import RouteScrollReset from "@/components/route-scroll-reset";
import Sidebar from "@/components/sidebar";
import { isStandalonePublicPath } from "@/lib/auth-routes";
import { cn } from "@/lib/utils";

function getPageTitle(pathname?: string | null) {
  const path = pathname || "/";

  if (/^\/talent\/jobs\/[^/]+$/.test(path) && path !== "/talent/jobs/saved-jobs") {
    return "Chi tiết công việc";
  }

  if (/^\/brand\/talents\/[^/]+$/.test(path)) {
    return "Chi tiết Idol";
  }

  if (/^\/brand\/manage-jobs\/[^/]+\/edit-job$/.test(path)) {
    return "Chỉnh sửa job";
  }

  if (/^\/brand\/manage-jobs\/[^/]+$/.test(path)) {
    return "Quản lý job";
  }

  if (path.startsWith("/ref")) {
    return "Ứng tuyển job";
  }

  const titles: Record<string, string> = {
    "/": "Tìm kiếm Idol",
    "/about": "Về chúng tôi",
    "/booking": "Đặt dịch vụ Idol",
    "/auth/login": "Đăng nhập",
    "/auth/register": "Đăng ký",
    "/brand": "Khám phá",
    "/brand/dashboard": "Bảng điều khiển",
    "/brand/search": "Tìm kiếm Idol",
    "/brand/shortlists": "Idol đã lưu",
    "/brand/my-bookings": "Yêu cầu của tôi",
    "/brand/manage-jobs": "Tạo và quản lý job",
    "/brand/manage-jobs/create-job": "Tạo job mới",
    "/brand/my-talents": "Quản lý Idol",
    "/brand/informations": "Thông tin cá nhân",
    "/brand/notifications": "Thông báo",
    "/brand/messages": "Tin nhắn",
    "/talent": "Idol",
    "/talent/dashboard": "Bảng điều khiển Idol",
    "/talent/jobs": "Cơ hội việc làm",
    "/talent/jobs/saved-jobs": "Việc làm đã lưu",
    "/talent/profile": "Hồ sơ Idol",
    "/talent/survey": "Khảo sát",
    "/talent/brands": "Hợp tác Brand",
    "/talent/notifications": "Thông báo",
    "/talent/messages": "Tin nhắn",
    "/talent/wallet": "Ví",
    "/talent/calendar": "Lịch làm việc",
    "/creator/campaigns": "Chiến dịch Creator",
    "/creator/campaigns/create": "Tạo chiến dịch Creator",
    "/admin/creator-campaigns": "Quản lý Đơn hàng Chiến dịch",
    "/admin/creators": "Quản lý Creator",
    "/admin/brands": "Quản lý Brand",
    "/settings": "Cài đặt",
  };

  return titles[path] || "Onstage VN";
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isTalentSurveyForm, setIsTalentSurveyForm] = useState(false);
  const [isMobileOverlayOpen, setIsMobileOverlayOpen] = useState(false);
  const isStandalonePublic = isStandalonePublicPath(pathname || "/");
  const isMessages = pathname?.endsWith("/messages") ?? false;
  const isDiscoverHome = pathname === "/";
  const isAbout = pathname === "/about";
  const isBrandTalentDetail = pathname ? /^\/brand\/talents\/[^/]+/.test(pathname) : false;
  const isTalentJobDetail = pathname ? /^\/talent\/jobs\/[^/]+$/.test(pathname) && pathname !== "/talent/jobs/saved-jobs" : false;
  const isTalentSurvey = pathname === "/talent/survey";
  const isBrandSearch = pathname === "/brand/search";
  const isBrandShortlists = pathname === "/brand/shortlists";
  const isBrandMyBookings = pathname === "/brand/my-bookings";
  const isBrandCreateJob = pathname === "/brand/manage-jobs/create-job";
  const isBrandEditJob = pathname ? /^\/brand\/manage-jobs\/[^/]+\/edit-job$/.test(pathname) : false;
  const isBrandJobEditor = isBrandCreateJob || isBrandEditJob;
  const isTalentJobs = pathname === "/talent/jobs";
  const isTalentSavedJobs = pathname === "/talent/jobs/saved-jobs";
  const isBooking = pathname ? (pathname === "/booking" || pathname.endsWith("/booking") || pathname.endsWith("/booking-talent")) : false;
  const isBookingTalent = pathname ? pathname.endsWith("/booking-talent") : false;
  const isSpecialDetail = isBrandTalentDetail || isTalentJobDetail;
  const hideHeaderOnMobile = isTalentSurveyForm || isSpecialDetail || isBrandSearch || isBrandShortlists || isBrandMyBookings || isTalentJobs || isTalentSavedJobs || isBooking;
  const hideChrome = isBrandJobEditor || isBooking || isTalentSurveyForm;

  useEffect(() => {
    if (isBrandTalentDetail) {
      return;
    }
    const pageTitle = getPageTitle(pathname);
    document.title = pageTitle === "Onstage VN" ? "Onstage VN" : `Onstage VN - ${pageTitle}`;
  }, [pathname, isBrandTalentDetail]);

  useEffect(() => {
    const syncSurveyFormMode = () => {
      const isFormMode = pathname === "/talent/survey"
        && new URLSearchParams(window.location.search).get("form") === "1";
      setIsTalentSurveyForm(isFormMode);
    };

    syncSurveyFormMode();
    window.addEventListener("popstate", syncSurveyFormMode);
    window.addEventListener("onstage:survey-form-mode", syncSurveyFormMode);

    return () => {
      window.removeEventListener("popstate", syncSurveyFormMode);
      window.removeEventListener("onstage:survey-form-mode", syncSurveyFormMode);
    };
  }, [pathname]);

  useEffect(() => {
    const syncMobileOverlay = (event: Event) => {
      const detail = (event as CustomEvent<{ open?: boolean }>).detail;
      setIsMobileOverlayOpen(Boolean(detail?.open));
    };

    window.addEventListener("onstage:mobile-overlay", syncMobileOverlay);
    return () => window.removeEventListener("onstage:mobile-overlay", syncMobileOverlay);
  }, []);

  return (
    <ThemeProvider>
      <AuthGuard>
        <Suspense fallback={null}>
          <RouteScrollReset />
        </Suspense>
        <div className="flex flex-col h-dvh w-full relative overflow-hidden">
          <div className="pointer-events-none absolute top-[-10%] right-[-10%] -z-10 hidden h-[600px] w-[600px] rounded-full bg-amber-500/5 blur-[150px] dark:block" />
          <div className="pointer-events-none absolute bottom-[-10%] left-[-10%] -z-10 hidden h-[700px] w-[700px] rounded-full bg-purple-600/5 blur-[160px] dark:block" />

          {!isStandalonePublic && !hideChrome && (
            <div className={hideHeaderOnMobile ? "hidden md:block" : "block"}>
              <Header />
            </div>
          )}

          <div className="flex flex-1 min-h-0 relative w-full">
            {!isStandalonePublic && !hideChrome && <Sidebar />}

            <div className="flex-1 flex flex-col min-h-0 min-w-0 w-full">
              <main
                data-app-scroll-root
                className={cn(
                  "flex-1",
                  isMessages || isBrandJobEditor || isBooking ? "overflow-hidden" : "overflow-y-auto overflow-x-hidden",
                  isStandalonePublic || isMessages || isDiscoverHome || isAbout || (isTalentSurvey && isTalentSurveyForm) || isBrandJobEditor || isBooking
                    ? "p-0"
                    : cn(
                      "px-4 py-5 md:px-8 md:py-7 lg:px-10 lg:py-8 2xl:px-12 pb-20 md:pb-8",
                      (isBrandSearch || isBrandShortlists || isBrandMyBookings || isTalentJobs || isTalentSavedJobs) && "pt-0 md:pt-7"
                    ),
                  isTalentSurvey && !isTalentSurveyForm && "md:px-8 md:py-7 lg:px-10 lg:py-8 2xl:px-12 md:pb-8"
                )}
              >
                <div
                  className={cn(
                    "w-full",
                    (isBrandJobEditor || isBooking) && "h-full min-h-0",
                    isStandalonePublic
                      ? "mx-auto max-w-none"
                      : "mx-0 max-w-none [@media(min-width:2400px)]:mx-auto [@media(min-width:2400px)]:max-w-[2040px] [@media(min-width:3200px)]:max-w-[2280px]"
                  )}
                >
                  {children}
                </div>
              </main>
            </div>
          </div>

          {!isStandalonePublic && !hideChrome && (
            <div className={cn((isTalentSurveyForm || isMobileOverlayOpen || isBooking || isTalentJobDetail) ? "hidden md:block" : "block", "bottom-nav-wrapper")}>
              <BottomNavigation />
            </div>
          )}
        </div>
      </AuthGuard>
    </ThemeProvider>
  );
}
