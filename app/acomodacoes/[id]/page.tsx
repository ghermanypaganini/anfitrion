"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

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

  return (
    <div className="min-h-screen bg-gray-50 p-10">
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

          <button
            onClick={handleSave}
            className="bg-black text-white px-6 py-2.5 rounded-lg"
          >
            Salvar alterações
          </button>
        </div>
      </div>
    </div>
  );
}
