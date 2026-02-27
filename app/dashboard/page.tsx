"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import CalendarView from "@/app/components/CalendarView";
import ReservationModal from "@/app/components/ReservationModal";
import Card from "@/app//components/ui/Card";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";

type Property = {
  id: string;
  name: string;
  ical_import_url: string | null;
  ical_export_token: string | null;
};

type Reservation = {
  id: string;
  guest_name: string;
  start_date: string;
  end_date: string;
  property_id: string;
};

export default function Dashboard() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>("");

  const [reservations, setReservations] = useState<Reservation[]>([]);

  const [guestName, setGuestName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [newPropertyName, setNewPropertyName] = useState("");
  const [newIcalUrl, setNewIcalUrl] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // -------------------------------
  // Carregar usuário e propriedades
  // -------------------------------
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setEmail(user.email ?? null);

      const { data: propertiesData } = await supabase
        .from("properties")
        .select("*");

      if (propertiesData) {
        setProperties(propertiesData);
        if (propertiesData.length > 0) {
          setSelectedProperty(propertiesData[0].id);
        }
      }

      setIsLoading(false);
    };

    loadData();
  }, []);

  // -------------------------------
  // Carregar reservas
  // -------------------------------
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
  }, [selectedProperty]);

  // -------------------------------
  // Conflito de datas
  // -------------------------------
  const hasConflict = () => {
    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);

    return reservations.some((reservation) => {
      const existingStart = new Date(reservation.start_date);
      const existingEnd = new Date(reservation.end_date);
      return newStart < existingEnd && newEnd > existingStart;
    });
  };

  // -------------------------------
  // Criar reserva
  // -------------------------------
  const handleAddReservation = async () => {
    if (!selectedProperty) return;

    try {
      setIsSaving(true);

      if (!guestName || !startDate || !endDate) {
        alert("Preencha todos os campos.");
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
          guest_name: guestName,
          start_date: startDate,
          end_date: endDate,
        })
        .select()
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      if (data) {
        setReservations((prev) => [...prev, data]);
      }

      setGuestName("");
      setStartDate("");
      setEndDate("");
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectSlot = (slotInfo: any) => {
    const start = slotInfo.start;
    const end = slotInfo.end;

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
    setGuestName("");
    setIsModalOpen(true);
  };

  const events = reservations.map((reservation) => ({
    title: reservation.guest_name,
    start: new Date(reservation.start_date),
    end: new Date(reservation.end_date),
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
      {/* Header da página */}
      <div className="bg-slate-50 border-b border-slate-200 px-8 py-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-brand-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Logado como: {email}</p>
        </div>

        <Button
          onClick={() => {
            setGuestName("");
            setStartDate("");
            setEndDate("");
            setIsModalOpen(true);
          }}
        >
          Nova Reserva
        </Button>
      </div>

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

                <Button
                  variant="secondary"
                  onClick={() => setIsPropertyModalOpen(true)}
                >
                  + Nova
                </Button>
              </div>
            </Card>

            <Card>
              <CalendarView events={events} onSelectSlot={handleSelectSlot} />
            </Card>
          </>
        )}

        <ReservationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          guestName={guestName}
          setGuestName={setGuestName}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          onSave={handleAddReservation}
          isSaving={isSaving}
        />
      </div>
    </main>
  );
}
