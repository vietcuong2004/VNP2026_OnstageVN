"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import AuthGuard from "@/components/auth-guard";
import BottomNavigation from "@/components/BottomNavigation";
import Header from "@/components/header";
import RouteScrollReset from "@/components/route-scroll-reset";
import Sidebar from "@/components/sidebar";
import { isStandalonePublicPath } from "@/lib/auth-routes";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalonePublic = isStandalonePublicPath(pathname || "/");
  const isMessages = pathname?.endsWith("/messages") ?? false;

  return (
    <ThemeProvider>
      <AuthGuard>
        <Suspense fallback={null}>
          <RouteScrollReset />
        </Suspense>
        <div className="flex flex-col h-dvh w-full relative overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] -z-10 h-[600px] w-[600px] rounded-full bg-amber-500/5 blur-[150px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] -z-10 h-[700px] w-[700px] rounded-full bg-purple-600/5 blur-[160px] pointer-events-none" />

          {!isStandalonePublic && <Header />}

          <div className="flex flex-1 min-h-0 relative w-full">
            {!isStandalonePublic && <Sidebar />}

            <div className="flex-1 flex flex-col min-h-0 min-w-0 w-full">
              <main
                data-app-scroll-root
                className={`flex-1 ${isMessages ? "overflow-hidden" : "overflow-y-auto overflow-x-hidden"} ${isStandalonePublic ? "p-0" : isMessages ? "p-0" : "px-4 py-5 md:px-8 md:py-7 lg:px-10 lg:py-8 2xl:px-12 pb-20 md:pb-8"}`}
              >
                <div className={`w-full ${isStandalonePublic ? "mx-auto max-w-none" : "mx-0 max-w-none [@media(min-width:2400px)]:mx-auto [@media(min-width:2400px)]:max-w-[2040px] [@media(min-width:3200px)]:max-w-[2280px]"}`}>
                  {children}
                </div>
              </main>
            </div>
          </div>

          {!isStandalonePublic && <BottomNavigation />}
        </div>
      </AuthGuard>
    </ThemeProvider>
  );
}
