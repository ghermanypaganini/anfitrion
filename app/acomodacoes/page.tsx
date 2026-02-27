"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";

type Property = {
  id: string;
  name: string;
  ical_import_url: string | null;
};

export default function AcomodacoesPage() {
  const supabase = createClient();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setProperties(data);

      setLoading(false);
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Acomodações
            </h1>
            <p className="text-gray-500 text-sm">
              Gerencie suas unidades reserváveis
            </p>
          </div>

          <Link
            href="/dashboard"
            className="bg-black text-white px-6 py-2.5 rounded-lg"
          >
            + Nova Acomodação
          </Link>
        </div>

        {loading ? (
          <p>Carregando...</p>
        ) : properties.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl shadow text-center text-gray-500">
            Nenhuma acomodação cadastrada ainda.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Link
                key={property.id}
                href={`/acomodacoes/${property.id}`}
                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition duration-300 hover:shadow-lg transition border border-gray-200 hover:-translate-y-1 transform"
              >
                <h2 className="text-lg font-semibold mb-2">{property.name}</h2>

                <div className="text-sm">
                  {property.ical_import_url ? (
                    <span className="text-green-600">✓ iCal configurado</span>
                  ) : (
                    <span className="text-gray-400">iCal não configurado</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
