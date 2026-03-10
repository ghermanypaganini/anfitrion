"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/app/components/ui/Logo";

export default function Login() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email ou senha incorretos.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && email && password) {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Painel esquerdo — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-900 text-white flex-col justify-between p-12">
        <div>
          <Logo variant="light" size="lg" />
        </div>

        <div className="space-y-6">
          <h2 className="text-4xl font-bold leading-tight tracking-tight">
            Gerencie suas
            <br />
            reservas com
            <br />
            <span className="text-[#ff6a00]">simplicidade.</span>
          </h2>
          <p className="text-brand-100 text-lg max-w-md leading-relaxed">
            Calendário centralizado, controle de hóspedes e visão completa das
            suas acomodações, tudo em um só lugar.
          </p>
        </div>

        <p className="text-brand-100 text-xs">
          © 2026 Anfitrion Hub. Todos os direitos reservados.
        </p>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo mobile */}
          <div className="lg:hidden flex justify-center">
            <Logo variant="dark" size="lg" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-brand-900">
              Bem-vindo de volta
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Entre na sua conta para continuar
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Senha
              </label>
              <input
                className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              onClick={handleLogin}
              disabled={loading || !email || !password}
              className="w-full bg-accent-600 hover:bg-accent-700 text-white font-medium py-3 rounded-lg transition shadow-sm disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </div>

          <p className="text-center text-sm text-slate-500">
            Não tem uma conta?{" "}
            <Link
              href="/signup"
              className="text-accent-600 hover:text-accent-700 font-medium"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
