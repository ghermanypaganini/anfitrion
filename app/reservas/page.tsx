"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";
import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import PageHeader from "@/app/components/ui/PageHeader";
import ReservationViewModal from "@/app/components/ReservationViewModal";
import type { ReservationData } from "@/app/components/ReservationViewModal";
import {
  statusLabel,
  statusVariant,
  originLabel,
  displayStatus,
} from "@/lib/helpers";
import { useToast } from "@/app/components/ui/Toast";

type Property = {
  id: string;
  name: string;
};

type Guest = {
  id: string;
  name: string;
};

type Reservation = {
  id: string;
  label: string | null;
  start_date: string;
  end_date: string;
  status: string;
  origin: string;
  property_id: string;
  property_name: string;
  guest_id: string | null;
  guest_count: number | null;
  total_price: number | null;
  notes: string | null;
  created_at: string | null;
};

export default function ReservasPage() {
  const supabase = createClient();
  const { toast } = useToast();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterProperty, setFilterProperty] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const { data: propertiesData } = await supabase
        .from("properties")
        .select("id, name");
      if (!propertiesData || propertiesData.length === 0) {
        setReservations([]);
        setLoading(false);
        return;
      }
      setProperties(propertiesData);

      const pMap = new Map<string, string>();
      propertiesData.forEach((p) => pMap.set(p.id, p.name));

      const { data: guestsData } = await supabase
        .from("guests")
        .select("id, name");
      if (guestsData) setGuests(guestsData);

      const all: Reservation[] = [];
      for (const property of propertiesData) {
        const { data } = await supabase
          .from("reservations")
          .select(
            "id, label, start_date, end_date, status, origin, property_id, guest_id, guest_count, total_price, notes, created_at"
          )
          .eq("property_id", property.id)
          .order("start_date", { ascending: false });

        if (data) {
          data.forEach((r) => {
            all.push({ ...r, property_name: pMap.get(r.property_id) ?? "—" });
          });
        }
      }

      all.sort((a, b) => b.start_date.localeCompare(a.start_date));
      setReservations(all);
      setLoading(false);
    };
    loadData();
  }, [supabase]);

  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      if (
        searchText &&
        !(r.label ?? "").toLowerCase().includes(searchText.toLowerCase())
      )
        return false;
      if (filterStatus) {
        const visual = displayStatus(r.status, r.end_date);
        if (visual !== filterStatus) return false;
      }
      if (filterProperty && r.property_id !== filterProperty) return false;
      if (filterDateFrom && r.end_date < filterDateFrom) return false;
      if (filterDateTo && r.start_date > filterDateTo) return false;
      return true;
    });
  }, [
    reservations,
    searchText,
    filterStatus,
    filterProperty,
    filterDateFrom,
    filterDateTo,
  ]);

  const hasActiveFilters =
    searchText ||
    filterStatus ||
    filterProperty ||
    filterDateFrom ||
    filterDateTo;

  const clearFilters = () => {
    setSearchText("");
    setFilterStatus("");
    setFilterProperty("");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  const handleSaveReservation = async (updated: ReservationData) => {
    const { error } = await supabase
      .from("reservations")
      .update({
        label: updated.label,
        start_date: updated.start_date,
        end_date: updated.end_date,
        status: updated.status,
        origin: updated.origin,
        guest_id: updated.guest_id || null,
        guest_count: updated.guest_count ?? null,
        total_price: updated.total_price ?? null,
        notes: updated.notes || null,
      })
      .eq("id", updated.id);

    if (error?.message.includes("no_overlapping_reservations")) {
      toast("Já existe uma reserva nesse período.", "error");
      return;
    }
    if (error) {
      toast(error.message, "error");
      return;
    }

    setReservations((prev) =>
      prev.map((r) =>
        r.id === updated.id
          ? { ...r, ...updated, property_name: r.property_name }
          : r
      )
    );
    setSelectedReservation((prev) =>
      prev ? { ...prev, ...updated, property_name: prev.property_name } : null
    );
    toast("Reserva atualizada com sucesso.", "success");
  };

  const handleCancelReservation = async (id: string) => {
    const { error } = await supabase
      .from("reservations")
      .update({ status: "cancelled" })
      .eq("id", id);
    if (error) {
      toast(error.message, "error");
      return;
    }

    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "cancelled" } : r))
    );
    setSelectedReservation((prev) =>
      prev ? { ...prev, status: "cancelled" } : null
    );
    toast("Reserva cancelada.", "success");
  };

  return (
    <main className="flex-1 flex flex-col">
      <PageHeader
        title="Reservas"
        subtitle="Gerencie todas as reservas"
        action={
          <Link href="/reservas/nova">
            <Button>Nova reserva</Button>
          </Link>
        }
      />

      <div className="p-4 md:p-8 space-y-4">
        <Card>
          <div className="space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar por identificador..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Todos os status</option>
                <option value="confirmed">Confirmada</option>
                <option value="pending">Pendente</option>
                <option value="cancelled">Cancelada</option>
                <option value="blocked">Bloqueio</option>
                <option value="completed">Finalizada</option>
              </select>
              <select
                value={filterProperty}
                onChange={(e) => setFilterProperty(e.target.value)}
                className="border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Todas acomodações</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col md:flex-row gap-3 items-end">
              <div className="flex gap-2 items-center">
                <label className="text-xs text-slate-500 whitespace-nowrap">
                  De
                </label>
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <label className="text-xs text-slate-500 whitespace-nowrap">
                  Até
                </label>
                <input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-slate-500 hover:text-slate-700 underline whitespace-nowrap"
                >
                  Limpar filtros
                </button>
              )}
              <div className="md:ml-auto text-xs text-slate-400">
                {filtered.length} reserva{filtered.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          {loading ? (
            <p className="text-sm text-slate-500 py-4">
              Carregando reservas...
            </p>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-500">
                {hasActiveFilters
                  ? "Nenhuma reserva encontrada com os filtros aplicados."
                  : "Nenhuma reserva encontrada."}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-2 text-sm text-accent-600 hover:text-accent-700 font-medium"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="py-2 pr-4">Identificador</th>
                    <th className="pr-4">Acomodação</th>
                    <th className="pr-4">Check-in</th>
                    <th className="pr-4">Check-out</th>
                    <th className="pr-4">Status</th>
                    <th>Origem</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const visual = displayStatus(r.status, r.end_date);
                    return (
                      <tr
                        key={r.id}
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedReservation(r)}
                      >
                        <td className="py-3 pr-4">
                          {r.label ? (
                            r.label
                          ) : (
                            <span className="italic text-slate-400">
                              Sem identificador
                            </span>
                          )}
                        </td>
                        <td className="pr-4">{r.property_name}</td>
                        <td className="pr-4">{r.start_date}</td>
                        <td className="pr-4">{r.end_date}</td>
                        <td className="pr-4">
                          <Badge variant={statusVariant(visual)}>
                            {statusLabel(visual)}
                          </Badge>
                        </td>
                        <td>{originLabel(r.origin)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <ReservationViewModal
        reservation={selectedReservation}
        propertyName={selectedReservation?.property_name ?? ""}
        guests={guests}
        onClose={() => setSelectedReservation(null)}
        onSave={handleSaveReservation}
        onCancel={handleCancelReservation}
      />
    </main>
  );
}
