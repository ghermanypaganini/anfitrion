"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";
import PageHeader from "@/app/components/ui/PageHeader";
import Card from "@/app/components/ui/Card";
import Button from "@/app/components/ui/Button";
import { PROPERTY_STATUS_OPTIONS, propertyStatusColor } from "@/lib/helpers";
import { useToast } from "@/app/components/ui/Toast";

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
  const { toast } = useToast();
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
  }, [supabase]);

  const handleStatusChange = async (propertyId: string, newStatus: string) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, status: newStatus } : p))
    );

    const { error } = await supabase
      .from("properties")
      .update({ status: newStatus })
      .eq("id", propertyId);

    if (error) {
      toast(error.message, "error");
      const { data } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setProperties(data);
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

              <select
                value={property.status}
                onChange={(e) =>
                  handleStatusChange(property.id, e.target.value)
                }
                className={`text-xs font-medium px-3 py-1 rounded-full border-0 cursor-pointer appearance-none pr-6 ${propertyStatusColor(
                  property.status
                )}`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 6px center",
                }}
              >
                {PROPERTY_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
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
