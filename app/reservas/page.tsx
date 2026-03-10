"use client";

import { useEffect, useState } from "react";
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

type Property = {
  id: string;
  name: string;
};

type Guest = {
  id: string;
  name: string;
};

type ReservationRow = {
  id: string;
  label: string | null;
  start_date: string;
  end_date: string;
  status: string;
  origin: string;
  property_id: string;
  guest_id: string | null;
  guest_count: number | null;
  total_price: number | null;
  notes: string | null;
};

type Reservation = ReservationRow & {
  property_name: string;
};

export default function ReservasPage() {
  const supabase = createClient();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

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

      const pMap = new Map<string, string>();
      propertiesData.forEach((p) => pMap.set(p.id, p.name));

      const { data: guestsData } = await supabase
        .from("guests")
        .select("id, name");

      if (guestsData) setGuests(guestsData);

      const { data: reservationsData } = await supabase
        .from("reservations")
        .select(
          "id, label, start_date, end_date, status, origin, property_id, guest_id, guest_count, total_price, notes"
        )
        .order("start_date", { ascending: true });

      if (reservationsData) {
        const combined: Reservation[] = reservationsData.map((r) => ({
          ...r,
          property_name: pMap.get(r.property_id) ?? "—",
        }));
        setReservations(combined);
      }

      setLoading(false);
    };

    loadData();
  }, [supabase]);

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
      alert("Já existe uma reserva nesse período.");
      return;
    }

    if (error) {
      alert(error.message);
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
  };

  const handleCancelReservation = async (id: string) => {
    const { error } = await supabase
      .from("reservations")
      .update({ status: "cancelled" })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "cancelled" } : r))
    );
    setSelectedReservation((prev) =>
      prev ? { ...prev, status: "cancelled" } : null
    );
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

      <div className="p-8">
        <Card>
          {loading ? (
            <p className="text-sm text-slate-500 py-4">
              Carregando reservas...
            </p>
          ) : reservations.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">
              Nenhuma reserva encontrada.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="py-2">Identificador</th>
                  <th>Acomodação</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Status</th>
                  <th>Origem</th>
                </tr>
              </thead>

              <tbody>
                {reservations.map((r) => {
                  const visual = displayStatus(r.status, r.end_date);
                  return (
                    <tr
                      key={r.id}
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedReservation(r)}
                    >
                      <td className="py-2">
                        {r.label ? (
                          r.label
                        ) : (
                          <span className="italic text-slate-400">
                            Sem identificador
                          </span>
                        )}
                      </td>
                      <td>{r.property_name}</td>
                      <td>{r.start_date}</td>
                      <td>{r.end_date}</td>
                      <td>
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
