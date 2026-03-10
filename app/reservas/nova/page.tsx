"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

import PageHeader from "@/app/components/ui/PageHeader";
import Card from "@/app/components/ui/Card";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";

type Property = {
  id: string;
  name: string;
};

type Guest = {
  id: string;
  name: string;
};

export default function NovaReservaPage() {
  const supabase = createClient();
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);

  const [propertyId, setPropertyId] = useState("");
  const [label, setLabel] = useState("");
  const [guestId, setGuestId] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [guestCount, setGuestCount] = useState(1);

  const [origin, setOrigin] = useState("direct");
  const [status, setStatus] = useState("confirmed");

  const [totalPrice, setTotalPrice] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const { data: propertiesData } = await supabase
        .from("properties")
        .select("id,name");

      if (propertiesData) {
        setProperties(propertiesData);
      }

      const { data: guestsData } = await supabase
        .from("guests")
        .select("id,name");

      if (guestsData) {
        setGuests(guestsData);
      }
    };

    loadData();
  }, [supabase]);

  const handleSave = async () => {
    if (!propertyId) {
      alert("Selecione uma acomodação.");
      return;
    }

    if (!label.trim()) {
      alert("O identificador da reserva é obrigatório.");
      return;
    }

    if (!startDate || !endDate) {
      alert("Preencha as datas de check-in e check-out.");
      return;
    }

    const { error } = await supabase.from("reservations").insert({
      property_id: propertyId,
      label: label.trim(),
      guest_id: guestId || null,
      start_date: startDate,
      end_date: endDate,
      guest_count: guestCount,
      origin,
      status,
      total_price: totalPrice ? Number(totalPrice) : null,
      notes: notes || null,
    });

    if (error) {
      if (error.message.includes("no_overlapping_reservations")) {
        alert("Já existe uma reserva nesse período para esta acomodação.");
        return;
      }
      alert(error.message);
      return;
    }

    router.push("/reservas");
  };

  const isValid =
    propertyId !== "" &&
    label.trim() !== "" &&
    startDate !== "" &&
    endDate !== "";

  return (
    <main className="flex-1 flex flex-col">
      <PageHeader title="Nova reserva" subtitle="Crie uma nova reserva" />

      <div className="p-8 max-w-xl">
        <Card>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Acomodação</label>

              <select
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="">Selecione</option>

                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">
                Identificador da reserva
              </label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ex: Casal de Floripa, Grupo de amigos, João Silva"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Hóspede</label>

              <select
                value={guestId}
                onChange={(e) => setGuestId(e.target.value)}
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="">Selecione (opcional)</option>

                {guests.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Check-in"
            />

            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="Check-out"
            />

            <Input
              type="number"
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              placeholder="Número de hóspedes"
            />

            <Input
              type="number"
              value={totalPrice}
              onChange={(e) => setTotalPrice(e.target.value)}
              placeholder="Valor da reserva"
            />

            <div>
              <label className="text-sm font-medium">Origem</label>

              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="direct">Direto</option>
                <option value="airbnb">Airbnb</option>
                <option value="booking">Booking</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="confirmed">Confirmada</option>
                <option value="pending">Pendente</option>
                <option value="blocked">Bloqueio</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Observação</label>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} disabled={!isValid}>
                Salvar reserva
              </Button>

              <Button variant="ghost" onClick={() => router.push("/reservas")}>
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
