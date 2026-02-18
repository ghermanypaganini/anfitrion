"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import CalendarView from "@/app/components/CalendarView";
import ReservationModal from "@/app/components/ReservationModal";
import Link from "next/link";

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
  // Carregar usuário e imóveis
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
  // Carregar reservas do imóvel selecionado
  // -------------------------------
  useEffect(() => {
    if (!selectedProperty) return;

    const loadReservations = async () => {
      const { data } = await supabase
        .from("reservations")
        .select("*")
        .eq("property_id", selectedProperty)
        .order("start_date", { ascending: true });

      if (data) {
        setReservations(data);
      }
    };

    loadReservations();
  }, [selectedProperty]);

  // -------------------------------
  // Função de validação de reservas na mesma data.
  //

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
    console.log("Clicou em salvar");

    if (!selectedProperty) {
      console.log("Nenhum imóvel selecionado");
      return;
    }

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

  // -------------------------------
  // Clique no calendário
  // -------------------------------
  const handleSelectSlot = (slotInfo: any) => {
    const start = slotInfo.start;
    const end = slotInfo.end;

    const formattedStart = start.toISOString().split("T")[0];
    const formattedEnd = end.toISOString().split("T")[0];

    setStartDate(formattedStart);
    setEndDate(formattedEnd);
    setGuestName("");
    setIsModalOpen(true);
  };

  // -------------------------------
  // Converter reservas para eventos do calendário
  // -------------------------------
  const events = reservations.map((reservation) => ({
    title: reservation.guest_name,
    start: new Date(reservation.start_date),
    end: new Date(reservation.end_date),
  }));

  // -------------------------------
  // Criar imóvel
  // -------------------------------
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight mb-10 text-black">
          Anfitrion
        </h1>

        <nav className="space-y-2 text-sm">
          <Link
            href="/dashboard"
            className="block px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            Dashboard
          </Link>

          <Link
            href="/acomodacoes"
            className="block px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            Acomodações
          </Link>

          <Link
            href="/reservas"
            className="block px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            Reservas
          </Link>
        </nav>

        <div className="mt-auto text-xs text-gray-400 pt-8">v0.1 Beta</div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 p-10">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center pb-6 border-b border-gray-200">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Dashboard
              </h1>
              <p className="text-gray-500 text-sm">Logado como: {email}</p>
            </div>

            <button
              onClick={() => {
                setGuestName("");
                setStartDate("");
                setEndDate("");
                setIsModalOpen(true);
              }}
              className="bg-black hover:bg-gray-900 transition text-white px-6 py-2.5 rounded-lg shadow-sm"
            >
              Nova Reserva
            </button>
          </div>

          {/* Tela vazia */}
          {!isLoading && properties.length === 0 && (
            <div className="border p-6 rounded text-center text-gray-600">
              <p className="mb-2 font-medium">
                Você ainda não cadastrou nenhuma acomodação.
              </p>
              <p className="mb-4">
                Cadastre um imóvel para começar a criar reservas.
              </p>

              <button
                onClick={() => setIsPropertyModalOpen(true)}
                className="bg-black text-white px-4 py-2 rounded"
              >
                Adicionar acomodação
              </button>
            </div>
          )}

          {/* Conteúdo quando há imóveis */}
          {!isLoading && properties.length > 0 && selectedProperty && (
            <>
              <div>
                <div className="flex items-center gap-4">
                  <div>
                    <label className="block mb-2 font-medium">
                      Acomodação:
                    </label>

                    <select
                      className="border p-2 rounded"
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

                  <button
                    onClick={() => setIsPropertyModalOpen(true)}
                    className="mt-6 bg-dark-200 hover:bg-dark-300 px-4 py-2 rounded"
                  >
                    + Novo
                  </button>
                </div>
              </div>

              {(() => {
                const property = properties.find(
                  (p) => p.id === selectedProperty
                );

                if (!property) return null;

                return (
                  <div className="text-sm mt-2">
                    {property.ical_import_url ? (
                      <span className="text-green-600">✓ iCal configurado</span>
                    ) : (
                      <span className="text-gray-400">
                        iCal não configurado
                      </span>
                    )}
                  </div>
                );
              })()}

              <button
                onClick={async () => {
                  const property = properties.find(
                    (p) => p.id === selectedProperty
                  );
                  if (!property?.ical_import_url) {
                    alert("Configure a URL iCal primeiro.");
                    return;
                  }

                  await fetch("/api/ical/import", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      propertyId: selectedProperty,
                      icalUrl: property.ical_import_url,
                    }),
                  });

                  alert("Sincronização concluída.");
                }}
                className="bg-gray-200 px-4 py-2 rounded"
              >
                Sincronizar Airbnb
              </button>

              <div className="mt-4">
                <CalendarView events={events} onSelectSlot={handleSelectSlot} />
              </div>
            </>
          )}

          {/* Modal Reserva */}
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

          {/* Modal Imóvel */}
          {isPropertyModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setIsPropertyModalOpen(false)}
              />

              <div className="relative bg-white p-6 rounded-xl w-96 shadow-xl space-y-4">
                <h2 className="text-xl font-semibold">Nova acomodação</h2>

                <input
                  className="w-full border p-2 rounded"
                  placeholder="Nome do imóvel"
                  value={newPropertyName}
                  onChange={(e) => setNewPropertyName(e.target.value)}
                />

                <input
                  className="w-full border p-2 rounded"
                  placeholder="URL iCal do Airbnb (opcional)"
                  value={newIcalUrl}
                  onChange={(e) => setNewIcalUrl(e.target.value)}
                />

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsPropertyModalOpen(false)}
                    className="px-4 py-2 border rounded"
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={handleAddProperty}
                    className="px-4 py-2 bg-black text-white rounded"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>{" "}
        {/* fecha max-w-6xl container */}
      </main>
    </div>
  );
}
