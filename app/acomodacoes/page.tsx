"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";
import PageHeader from "@/app/components/ui/PageHeader";
import Card from "@/app/components/ui/Card";
import Button from "@/app/components/ui/Button";
import Badge from "@/app/components/ui/Badge";

type Property = {
  id: string;
  name: string;
  location: string | null;
  status: string;
  booking_ical_url: string | null;
  ical_import_url: string | null;
};

export default function AcomodacoesPage() {
  const supabase = createClient();
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setProperties(data);
    };

    load();
  }, []);

  const statusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "danger";
      case "maintenance":
        return "warning";
      case "cleaning":
        return "default";
      default:
        return "default";
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Aberta";
      case "inactive":
        return "Fechada";
      case "maintenance":
        return "Manutenção";
      case "cleaning":
        return "Limpeza";
      default:
        return status;
    }
  };

  return (
    <main className="flex-1 flex flex-col">
      <PageHeader
        title="Acomodações"
        subtitle="Gerencie suas acomodações"
        action={
          <Link href="/acomodacoes/nova">
            <Button>Nova acomodação</Button>
          </Link>
        }
      />

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Card key={property.id}>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-brand-900">
                  {property.name}
                </h2>
                {property.location && (
                  <p className="text-sm text-slate-500 mt-1">
                    {property.location}
                  </p>
                )}
              </div>

              <Badge variant={statusVariant(property.status)}>
                {statusLabel(property.status)}
              </Badge>
            </div>

            <div className="mt-4 text-sm text-slate-500 space-y-1">
              <p>Airbnb iCal: {property.ical_import_url ? "✓" : "—"}</p>
              <p>Booking iCal: {property.booking_ical_url ? "✓" : "—"}</p>
            </div>

            <div className="mt-6">
              <Link href={`/acomodacoes/${property.id}`}>
                <Button variant="secondary">Editar</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
