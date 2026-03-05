"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import PageHeader from "@/app/components/ui/PageHeader";
import Card from "@/app/components/ui/Card";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";

export default function NovaAcomodacaoPage() {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("active");
  const [airbnbIcal, setAirbnbIcal] = useState("");
  const [bookingIcal, setBookingIcal] = useState("");
  const [coHost, setCoHost] = useState("");

  const handleSave = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("properties").insert({
      name,
      location,
      status,
      user_id: user.id,
      ical_import_url: airbnbIcal || null,
      booking_ical_url: bookingIcal || null,
      co_host: coHost || null,
    });

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/acomodacoes");
  };

  return (
    <main className="flex-1 flex flex-col">
      <PageHeader
        title="Nova acomodação"
        subtitle="Cadastre uma nova acomodação"
      />

      <div className="p-8 max-w-xl">
        <Card>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Cabana do Lago"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Localização</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Cidade ou endereço"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2"
              >
                <option value="active">Aberta</option>
                <option value="inactive">Fechada</option>
                <option value="maintenance">Manutenção</option>
                <option value="cleaning">Limpeza</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">URL iCal Airbnb</label>
              <Input
                value={airbnbIcal}
                onChange={(e) => setAirbnbIcal(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="text-sm font-medium">URL iCal Booking</label>
              <Input
                value={bookingIcal}
                onChange={(e) => setBookingIcal(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="text-sm font-medium">Co-host (email)</label>
              <Input
                value={coHost}
                onChange={(e) => setCoHost(e.target.value)}
                placeholder="email do co-anfitrião"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave}>Salvar acomodação</Button>

              <Button
                variant="ghost"
                onClick={() => router.push("/acomodacoes")}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
