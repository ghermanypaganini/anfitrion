"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function Header({ email }: { email: string | null }) {
  const [open, setOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const initials = email?.substring(0, 2).toUpperCase() ?? "AP";

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
      <div>
        <h2 className="text-xl font-semibold text-brand-900">Dashboard</h2>
      </div>

      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="w-10 h-10 rounded-full bg-brand-700 text-white flex items-center justify-center font-semibold"
        >
          {initials}
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg border border-slate-200 rounded-lg py-2 text-sm">
            <button
              onClick={() => router.push("/configuracoes")}
              className="block w-full text-left px-4 py-2 hover:bg-slate-100"
            >
              Configurações
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 hover:bg-slate-100 text-red-600"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
