"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const linkClasses = (path: string) =>
    `block px-4 py-2 rounded-lg transition ${
      pathname === path
        ? "bg-brand-700 text-white"
        : "text-brand-100 hover:bg-brand-800 hover:text-white"
    }`;

  return (
    <aside className="w-64 bg-brand-900 text-white flex flex-col p-6">
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight">
          Anfitri<span className="text-accent-500">on</span>
        </h1>
        <p className="text-xs text-brand-100 mt-1">
          Gestão inteligente para anfitriões
        </p>
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

      <div className="mt-auto text-xs text-brand-100 pt-10">v0.1 Beta</div>
    </aside>
  );
}
