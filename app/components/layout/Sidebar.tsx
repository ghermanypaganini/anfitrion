"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import Logo from "@/app/components/ui/Logo";

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const linkClasses = (path: string) =>
    `block px-4 py-2 rounded-lg transition ${
      pathname === path
        ? "bg-brand-700 text-white"
        : "text-brand-100 hover:bg-brand-800 hover:text-white"
    }`;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="w-64 h-full bg-brand-900 text-white flex flex-col p-6">
      <div className="flex justify-between items-center mb-10">
        <Logo variant="light" />

        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden text-brand-100 hover:text-white p-1"
            aria-label="Fechar menu"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      <nav className="space-y-2 text-sm">
        <Link href="/dashboard" className={linkClasses("/dashboard")}>
          Dashboard
        </Link>
        <Link href="/acomodacoes" className={linkClasses("/acomodacoes")}>
          Acomodações
        </Link>
        <Link href="/reservas" className={linkClasses("/reservas")}>
          Reservas
        </Link>
        <Link href="/hospedes" className={linkClasses("/hospedes")}>
          Hóspedes
        </Link>
        <Link href="/configuracoes" className={linkClasses("/configuracoes")}>
          Configurações
        </Link>
      </nav>

      <div className="mt-auto pt-10 space-y-3">
        <button
          onClick={handleLogout}
          className="block w-full text-left px-4 py-2 rounded-lg text-sm text-brand-100 hover:bg-brand-800 hover:text-white transition"
        >
          Sair
        </button>
        <p className="text-xs text-brand-100 px-4">v0.1 Beta</p>
      </div>
    </aside>
  );
}
