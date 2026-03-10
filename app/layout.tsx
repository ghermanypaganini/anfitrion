"use client";

import "./globals.css";
import Sidebar from "@/app/components/layout/Sidebar";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const publicRoutes = ["/login", "/signup"];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublicRoute = publicRoutes.includes(pathname);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fechar sidebar ao navegar
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <html lang="pt-BR">
      <body className="bg-slate-50">
        {isPublicRoute ? (
          <>{children}</>
        ) : (
          <div className="flex h-screen">
            {/* Sidebar desktop: sempre visível */}
            <div className="hidden md:block">
              <Sidebar />
            </div>

            {/* Sidebar mobile: overlay */}
            {sidebarOpen && (
              <>
                <div
                  className="fixed inset-0 bg-black/50 z-40 md:hidden"
                  onClick={() => setSidebarOpen(false)}
                />
                <div className="fixed inset-y-0 left-0 z-50 md:hidden">
                  <Sidebar onClose={() => setSidebarOpen(false)} />
                </div>
              </>
            )}

            <div className="flex-1 flex flex-col overflow-auto">
              {/* Top bar mobile com hamburger */}
              <div className="flex items-center h-14 px-4 border-b border-slate-200 bg-white md:hidden">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 -ml-2 rounded-lg hover:bg-slate-100"
                  aria-label="Abrir menu"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </button>

                <img
                  src="/anfitrion-v1.jpg"
                  alt="Anfitrion Hub"
                  className="ml-3 h-8 w-auto"
                />
              </div>

              {children}
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
