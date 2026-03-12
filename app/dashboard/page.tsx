"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import CustomCalendar from "@/app/components/CustomCalendar";
import type { CalendarReservation } from "@/app/components/CustomCalendar";
import ReservationViewModal from "@/app/components/ReservationViewModal";
import type { ReservationData } from "@/app/components/ReservationViewModal";
import Card from "@/app/components/ui/Card";
import Button from "@/app/components/ui/Button";
import PageHeader from "@/app/components/ui/PageHeader";
import StatCard from "@/app/components/ui/StatCard";
import { useToast } from "@/app/components/ui/Toast";

type Property = {
  id: string;
  name: string;
  ical_import_url: string | null;
  ical_export_token: string | null;
};

type Reservation = {
  id: string;
  label: string;
  start_date: string;
  end_date: string;
  property_id: string;
  status?: string;
  origin?: string;
  guest_id?: string | null;
  guest_count?: number;
  total_price?: number;
  notes?: string;
  created_at?: string;
};

type Guest = {
  id: string;
  name: string;
};

const ALL_PROPERTIES = "__all__";

export default function Dashboard() {
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>(ALL_PROPERTIES);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const [label, setLabel] = useState("");
  const [guestId, setGuestId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [createPropertyId, setCreatePropertyId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [viewReservation, setViewReservation] = useState<Reservation | null>(
    null
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setEmail(user?.email ?? null);

      const { data: propertiesData } = await supabase
        .from("properties")
        .select("*");
      if (propertiesData) setProperties(propertiesData);

      const { data: guestsData } = await supabase
        .from("guests")
        .select("id, name");
      if (guestsData) setGuests(guestsData);

      setIsLoading(false);
    };
    loadData();
  }, [supabase]);

  useEffect(() => {
    if (properties.length === 0) return;

    const loadReservations = async () => {
      if (selectedTab !== ALL_PROPERTIES) {
        const { data } = await supabase
          .from("reservations")
          .select("*")
          .eq("property_id", selectedTab)
          .order("start_date", { ascending: true });
        if (data) setReservations(data);
      } else {
        const all: Reservation[] = [];
        for (const p of properties) {
          const { data } = await supabase
            .from("reservations")
            .select("*")
            .eq("property_id", p.id)
            .order("start_date", { ascending: true });
          if (data) all.push(...data);
        }
        all.sort((a, b) => a.start_date.localeCompare(b.start_date));
        setReservations(all);
      }
    };
    loadReservations();
  }, [supabase, selectedTab, properties]);

  const effectivePropertyId =
    selectedTab !== ALL_PROPERTIES ? selectedTab : createPropertyId;

  const effectivePropertyName =
    properties.find((p) => p.id === effectivePropertyId)?.name ?? "";

  const hasConflict = () => {
    if (!startDate || !endDate || !effectivePropertyId) return false;
    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);

    return reservations
      .filter((r) => r.property_id === effectivePropertyId)
      .some((r) => {
        if (r.status === "cancelled") return false;
        const s = new Date(r.start_date);
        const e = new Date(r.end_date);
        return (
          newStart < e &&
          newEnd > s &&
          newStart.getTime() !== e.getTime() &&
          newEnd.getTime() !== s.getTime()
        );
      });
  };

  const openCreateModal = (date?: string) => {
    setLabel("");
    setGuestId(null);
    setStartDate(date ?? "");
    if (date) {
      const next = new Date(date + "T12:00:00");
      next.setDate(next.getDate() + 1);
      setEndDate(next.toISOString().split("T")[0]);
    } else {
      setEndDate("");
    }
    setCreatePropertyId(
      selectedTab !== ALL_PROPERTIES ? selectedTab : properties[0]?.id ?? ""
    );
    setIsModalOpen(true);
  };

  const handleAddReservation = async () => {
    if (!effectivePropertyId) {
      toast("Selecione uma acomodação.", "warning");
      return;
    }
    try {
      setIsSaving(true);
      if (!label.trim() || !startDate || !endDate) {
        toast("Preencha todos os campos.", "warning");
        return;
      }
      if (hasConflict()) {
        toast("Conflito de datas detectado.", "error");
        return;
      }

      const { data, error } = await supabase
        .from("reservations")
        .insert({
          property_id: effectivePropertyId,
          label: label.trim(),
          guest_id: guestId,
          start_date: startDate,
          end_date: endDate,
          status: "confirmed",
          origin: "direct",
        })
        .select()
        .single();

      if (error?.message.includes("no_overlapping_reservations")) {
        toast("Já existe uma reserva nesse período.", "error");
        return;
      }
      if (error) {
        toast(error.message, "error");
        return;
      }
      if (data) setReservations((prev) => [...prev, data]);

      setLabel("");
      setGuestId(null);
      setStartDate("");
      setEndDate("");
      setCreatePropertyId("");
      setIsModalOpen(false);
      toast("Reserva criada com sucesso.", "success");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDayClick = (
    date: string,
    dayReservations: CalendarReservation[]
  ) => {
    if (dayReservations.length >= 1) {
      const starting = dayReservations.find((r) => r.start_date === date);
      const target = starting ?? dayReservations[0];
      const reservation = reservations.find((r) => r.id === target.id);
      if (reservation) setViewReservation(reservation);
    } else {
      openCreateModal(date);
    }
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
      prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r))
    );
    setViewReservation({ ...viewReservation!, ...updated });
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
    setViewReservation((prev) =>
      prev ? { ...prev, status: "cancelled" } : null
    );
    toast("Reserva cancelada.", "success");
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const reservationsToday = reservations.filter(
    (r) =>
      r.status !== "cancelled" &&
      r.start_date <= todayStr &&
      r.end_date > todayStr
  ).length;
  const checkinsToday = reservations.filter(
    (r) => r.status !== "cancelled" && r.start_date === todayStr
  ).length;
  const checkoutsToday = reservations.filter(
    (r) => r.status !== "cancelled" && r.end_date === todayStr
  ).length;
  const pendingReservations = reservations.filter(
    (r) => r.status === "pending"
  ).length;

  const calendarReservations: CalendarReservation[] = reservations.map((r) => ({
    id: r.id,
    label: r.label,
    start_date: r.start_date,
    end_date: r.end_date,
    status: r.status,
    property_id: r.property_id,
  }));

  return (
    <main className="flex-1 flex flex-col">
      <PageHeader
        title="Dashboard"
        subtitle={`Logado como: ${email}`}
        action={<Button onClick={() => openCreateModal()}>Nova Reserva</Button>}
      />

      <div className="flex-1 p-4 md:p-8 space-y-6">
        {!isLoading && properties.length === 0 && (
          <Card>
            <p className="mb-4 font-medium">
              Você ainda não cadastrou nenhuma acomodação.
            </p>
            <Button onClick={() => router.push("/acomodacoes/nova")}>
              Adicionar acomodação
            </Button>
          </Card>
        )}

        {!isLoading && properties.length > 0 && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
              <button
                onClick={() => setSelectedTab(ALL_PROPERTIES)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedTab === ALL_PROPERTIES
                    ? "bg-brand-900 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                Todas
              </button>
              {properties.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedTab(p.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedTab === p.id
                      ? "bg-brand-900 text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                title="Reservas hoje"
                value={reservationsToday}
                icon="📅"
              />
              <StatCard
                title="Check-ins hoje"
                value={checkinsToday}
                icon="➡️"
              />
              <StatCard
                title="Check-outs hoje"
                value={checkoutsToday}
                icon="⬅️"
              />
              <StatCard
                title="Pendentes"
                value={pendingReservations}
                icon="⏳"
              />
            </div>

            <CustomCalendar
              reservations={calendarReservations}
              onDayClick={handleDayClick}
              onReservationClick={(res) => {
                const r = reservations.find((x) => x.id === res.id);
                if (r) setViewReservation(r);
              }}
            />
          </>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsModalOpen(false)}
            />
            <div className="relative bg-white p-8 rounded-2xl w-full max-w-2xl shadow-2xl space-y-4 mx-4">
              <h2 className="text-2xl font-semibold tracking-tight">
                Nova Reserva
              </h2>

              {selectedTab === ALL_PROPERTIES ? (
                <div>
                  <label className="text-sm font-medium">Acomodação</label>
                  <select
                    value={createPropertyId}
                    onChange={(e) => setCreatePropertyId(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Acomodação:{" "}
                  <span className="font-medium text-slate-700">
                    {effectivePropertyName}
                  </span>
                </p>
              )}

              <input
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Identificador da reserva (ex: Casal de Floripa)"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Check-in</label>
                  <input
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Check-out</label>
                  <input
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-sm hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <Button
                  onClick={handleAddReservation}
                  disabled={
                    isSaving ||
                    !label.trim() ||
                    !startDate ||
                    !endDate ||
                    !effectivePropertyId
                  }
                >
                  {isSaving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </div>
        )}

        <ReservationViewModal
          reservation={viewReservation}
          propertyName={
            viewReservation
              ? properties.find((p) => p.id === viewReservation.property_id)
                  ?.name ?? ""
              : ""
          }
          guests={guests}
          onClose={() => setViewReservation(null)}
          onSave={handleSaveReservation}
          onCancel={handleCancelReservation}
        />
      </div>
    </main>
  );
}
