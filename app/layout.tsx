"use client";

import { ThemeProvider } from "@/components/theme-provider";
import BottomNavigation from "@/components/BottomNavigation";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import { usePathname } from "next/navigation";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isPublic = pathname === "/" || pathname.startsWith("/auth") || pathname.startsWith("/campaign");

  return (
    <html lang="vi" className="h-full dark antialiased" style={{ colorScheme: "dark" }}>
      <body className="h-full bg-[#03050c] text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
        <ThemeProvider>
          <div className="flex flex-col h-screen w-full relative overflow-x-hidden">

            {/* Ambient background glows */}
            <div className="absolute top-[-10%] right-[-10%] -z-10 h-[600px] w-[600px] rounded-full bg-amber-500/5 blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] -z-10 h-[700px] w-[700px] rounded-full bg-purple-600/5 blur-[160px] pointer-events-none" />

            {/* DESKTOP TOP BAR (Full width header at the top) */}
            {!isPublic && <Header />}

            {/* Bottom Section: Sidebar + Main Content */}
            <div className="flex flex-1 min-h-0 relative w-full">

              {/* DESKTOP SIDEBAR */}
              {!isPublic && <Sidebar />}

              {/* MAIN APP CONTENT */}
              <div className="flex-1 flex flex-col min-h-0 min-w-0 w-full">
                {/* Main scrollable body */}
                <main className={`flex-1 overflow-y-auto ${isPublic ? "px-4 md:px-6 py-0" : "px-4 py-5 md:px-8 md:py-7 lg:px-10 lg:py-8 2xl:px-12 pb-24 md:pb-8"}`}>
                  <div className={`w-full ${isPublic ? "mx-auto max-w-[1600px]" : "mx-0 max-w-none [@media(min-width:2400px)]:mx-auto [@media(min-width:2400px)]:max-w-[2040px] [@media(min-width:3200px)]:max-w-[2280px]"}`}>
                    {children}
                  </div>
                </main>
              </div>

            </div>

            {/* Mobile Bottom Navigation menu */}
            {!isPublic && <BottomNavigation />}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
