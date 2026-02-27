"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";

type Property = {
  id: string;
  name: string;
  ical_import_url: string | null;
};

export default function AcomodacaoDetalhe() {
  const supabase = createClient();
  const params = useParams();
  const id = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [name, setName] = useState("");
  const [icalUrl, setIcalUrl] = useState("");

  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setProperty(data);
        setName(data.name);
        setIcalUrl(data.ical_import_url ?? "");
      }
    };

    load();
  }, [id]);

  const handleSave = async () => {
    await supabase
      .from("properties")
      .update({
        name,
        ical_import_url: icalUrl || null,
      })
      .eq("id", id);

    alert("Salvo com sucesso.");
  };

  if (!property) return <p className="p-10">Carregando...</p>;

  const handleSync = async () => {
    if (!icalUrl) {
      alert("Configure a URL iCal primeiro.");
      return;
    }

    setIsSyncing(true);

    try {
      const response = await fetch("/api/ical/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId: id,
          icalUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Erro ao sincronizar.");
        return;
      }

      alert("Sincronização concluída com sucesso.");
    } catch (error) {
      alert("Erro inesperado ao sincronizar.");
    }

    setIsSyncing(false);
  };

  return (
    <div className="min-h-screen bg-white-50 p-10">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-lg">
        <h1 className="text-2xl font-semibold mb-6">Configurar Acomodação</h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Nome da acomodação
            </label>
            <input
              className="w-full border p-3 rounded-lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              URL iCal do Airbnb
            </label>
            <input
              className="w-full border p-3 rounded-lg"
              value={icalUrl}
              onChange={(e) => setIcalUrl(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t mt-8">
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition"
            >
              Salvar alterações
            </button>

            <Link
              href="/acomodacoes"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-800 mb-6"
            >
              ← Voltar para acomodações
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
