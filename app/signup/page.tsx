"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/app/components/ui/Logo";

export default function Signup() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignup = async () => {
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && email && password) {
      handleSignup();
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
            Comece a gerenciar
            <br />
            suas reservas
            <br />
            <span className="text-[#ff6a00]">hoje mesmo.</span>
          </h2>
          <p className="text-brand-100 text-lg max-w-md leading-relaxed">
            Cadastre suas acomodações, controle check-ins e check-outs e tenha
            uma visão clara do seu negócio.
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

          {success ? (
            <div className="space-y-4 text-center">
              <div className="text-4xl">✉️</div>
              <h2 className="text-2xl font-semibold text-brand-900">
                Verifique seu email
              </h2>
              <p className="text-slate-500 text-sm">
                Enviamos um link de confirmação para{" "}
                <span className="font-medium text-slate-700">{email}</span>.
                Clique no link para ativar sua conta.
              </p>
              <Link
                href="/login"
                className="inline-block mt-4 text-accent-600 hover:text-accent-700 font-medium text-sm"
              >
                Voltar para o login
              </Link>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-2xl font-semibold text-brand-900">
                  Criar conta
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Teste o Anfitrion Hub gratuitamente!
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
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  onClick={handleSignup}
                  disabled={loading || !email || !password}
                  className="w-full bg-accent-600 hover:bg-accent-700 text-white font-medium py-3 rounded-lg transition shadow-sm disabled:opacity-50"
                >
                  {loading ? "Criando conta..." : "Criar conta"}
                </button>
              </div>

              <p className="text-center text-sm text-slate-500">
                Já tem uma conta?{" "}
                <Link
                  href="/login"
                  className="text-accent-600 hover:text-accent-700 font-medium"
                >
                  Entrar
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
