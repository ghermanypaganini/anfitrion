"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import CalendarView from "@/app/components/CalendarView";
import type { CalendarEvent } from "@/app/components/CalendarView";
import ReservationModal from "@/app/components/ReservationModal";
import ReservationViewModal from "@/app/components/ReservationViewModal";
import type { ReservationData } from "@/app/components/ReservationViewModal";
import Card from "@/app/components/ui/Card";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import PageHeader from "@/app/components/ui/PageHeader";
import StatCard from "@/app/components/ui/StatCard";

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
};

type Guest = {
  id: string;
  name: string;
};

// Parse "YYYY-MM-DD" as local date (avoids UTC timezone shift)
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

export default function Dashboard() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [guests, setGuests] = useState<Guest[]>([]);

  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Modal de criação
  const [label, setLabel] = useState("");
  const [guestId, setGuestId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal de visualização/edição
  const [viewReservation, setViewReservation] = useState<Reservation | null>(
    null
  );

  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [newPropertyName, setNewPropertyName] = useState("");
  const [newIcalUrl, setNewIcalUrl] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Nome da propriedade selecionada
  const selectedPropertyName =
    properties.find((p) => p.id === selectedProperty)?.name ?? "";

  // Carregar usuário, propriedades e hóspedes
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

      if (propertiesData) {
        setProperties(propertiesData);
        if (propertiesData.length > 0) {
          setSelectedProperty(propertiesData[0].id);
        }
      }

      const { data: guestsData } = await supabase
        .from("guests")
        .select("id, name");

      if (guestsData) {
        setGuests(guestsData);
      }

      setIsLoading(false);
    };

    loadData();
  }, [supabase]);

  // Carregar reservas
  useEffect(() => {
    if (!selectedProperty) return;

    const loadReservations = async () => {
      const { data } = await supabase
        .from("reservations")
        .select("*")
        .eq("property_id", selectedProperty)
        .order("start_date", { ascending: true });

      if (data) setReservations(data);
    };

    loadReservations();
  }, [supabase, selectedProperty]);

  // Conflito de datas
  const hasConflict = () => {
    if (!startDate || !endDate) return false;

    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);

    return reservations.some((reservation) => {
      const existingStart = new Date(reservation.start_date);
      const existingEnd = new Date(reservation.end_date);

      return newStart < existingEnd && newEnd > existingStart;
    });
  };

  // Criar reserva
  const handleAddReservation = async () => {
    if (!selectedProperty) return;

    try {
      setIsSaving(true);

      if (!label.trim() || !startDate || !endDate) {
        alert(
          "Preencha todos os campos. O identificador da reserva é obrigatório."
        );
        return;
      }

      if (hasConflict()) {
        alert("Conflito de datas detectado.");
        return;
      }

      const { data, error } = await supabase
        .from("reservations")
        .insert({
          property_id: selectedProperty,
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
        alert("Já existe uma reserva nesse período.");
        return;
      }

      if (error) {
        alert(error.message);
        return;
      }

      if (data) {
        setReservations((prev) => [...prev, data]);
      }

      setLabel("");
      setGuestId(null);
      setStartDate("");
      setEndDate("");
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    const start = slotInfo.start;
    const end = slotInfo.end;

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
    setLabel("");
    setGuestId(null);
    setIsModalOpen(true);
  };

  // Clicar na reserva → abrir modal de visualização/edição
  const handleSelectEvent = (event: CalendarEvent) => {
    const reservation = reservations.find((r) => r.id === event.id);
    if (reservation) {
      setViewReservation(reservation);
    }
  };

  // Salvar edição da reserva
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

    // Atualizar estado local
    setReservations((prev) =>
      prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r))
    );
    setViewReservation({ ...viewReservation!, ...updated });
  };

  // Cancelar reserva
  const handleCancelReservation = async (id: string) => {
    const { error } = await supabase
      .from("reservations")
      .update({ status: "cancelled" })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    // Atualizar estado local
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "cancelled" } : r))
    );
    setViewReservation((prev) =>
      prev ? { ...prev, status: "cancelled" } : null
    );
  };

  // Estatísticas
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const reservationsToday = reservations.filter(
    (r) => r.start_date <= todayStr && r.end_date >= todayStr
  ).length;

  const checkinsToday = reservations.filter(
    (r) => r.start_date === todayStr
  ).length;
  const checkoutsToday = reservations.filter(
    (r) => r.end_date === todayStr
  ).length;

  const pendingReservations = reservations.filter(
    (r) => r.status === "pending"
  ).length;

  // Eventos — parseLocalDate evita o bug de timezone (-1 dia)
  const events: CalendarEvent[] = reservations.map((reservation) => ({
    id: reservation.id,
    title: reservation.label,
    start: parseLocalDate(reservation.start_date),
    end: parseLocalDate(reservation.end_date),
    status: reservation.status,
    resourceId: reservation.property_id,
  }));

  const resources = properties.map((property) => ({
    resourceId: property.id,
    resourceTitle: property.name,
  }));

  const handleAddProperty = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("properties")
      .insert({
        name: newPropertyName,
        user_id: user.id,
        ical_import_url: newIcalUrl || null,
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    if (data) {
      setProperties((prev) => [...prev, data]);
      setSelectedProperty(data.id);
    }

    setNewPropertyName("");
    setNewIcalUrl("");
    setIsPropertyModalOpen(false);
  };

  return (
    <main className="flex-1 flex flex-col">
      <PageHeader
        title="Dashboard"
        subtitle={`Logado como: ${email}`}
        action={
          <Button
            onClick={() => {
              setLabel("");
              setGuestId(null);
              setStartDate("");
              setEndDate("");
              setIsModalOpen(true);
            }}
          >
            Nova Reserva
          </Button>
        }
      />

      <div className="flex-1 p-8 space-y-8">
        {/* Tela vazia */}
        {!isLoading && properties.length === 0 && (
          <Card>
            <p className="mb-4 font-medium">
              Você ainda não cadastrou nenhuma acomodação.
            </p>
            <Button onClick={() => setIsPropertyModalOpen(true)}>
              Adicionar acomodação
            </Button>
          </Card>
        )}

        {/* Conteúdo principal */}
        {!isLoading && properties.length > 0 && selectedProperty && (
          <>
            <Card>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="block mb-2 text-sm font-medium">
                    Acomodação
                  </label>
                  <select
                    className="w-full border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 rounded-lg px-4 py-2"
                    value={selectedProperty}
                    onChange={(e) => setSelectedProperty(e.target.value)}
                  >
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

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

            <Card>
              <CalendarView
                events={events}
                resources={resources}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
              />
            </Card>
          </>
        )}

        {/* Modal de criação */}
        <ReservationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          propertyName={selectedPropertyName}
          label={label}
          setLabel={setLabel}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          onSave={handleAddReservation}
          isSaving={isSaving}
        />

        {/* Modal de visualização/edição */}
        <ReservationViewModal
          reservation={viewReservation}
          propertyName={selectedPropertyName}
          guests={guests}
          onClose={() => setViewReservation(null)}
          onSave={handleSaveReservation}
          onCancel={handleCancelReservation}
        />
      </div>
    </main>
  );
}
