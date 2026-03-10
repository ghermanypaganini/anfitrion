"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter, useParams } from "next/navigation";
import PageHeader from "@/app/components/ui/PageHeader";
import Card from "@/app/components/ui/Card";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";

export default function EditarAcomodacaoPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();

  const id = params.id as string;

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("active");
  const [airbnbIcal, setAirbnbIcal] = useState("");
  const [bookingIcal, setBookingIcal] = useState("");
  const [coHost, setCoHost] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();

      if (!data) return;

      setName(data.name ?? "");
      setLocation(data.location ?? "");
      setStatus(data.status ?? "active");
      setAirbnbIcal(data.ical_import_url ?? "");
      setBookingIcal(data.booking_ical_url ?? "");
      setCoHost(data.co_host ?? "");
    };

    load();
  }, [supabase, id]);

  const handleSave = async () => {
    const { error } = await supabase
      .from("properties")
      .update({
        name,
        location,
        status,
        ical_import_url: airbnbIcal || null,
        booking_ical_url: bookingIcal || null,
        co_host: coHost || null,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/acomodacoes");
  };

  const handleDelete = async () => {
    const confirm = window.confirm(
      "Tem certeza que deseja excluir esta acomodação?"
    );

    if (!confirm) return;

    await supabase.from("properties").delete().eq("id", id);

    router.push("/acomodacoes");
  };

  return (
    <main className="flex-1 flex flex-col">
      <PageHeader
        title="Editar acomodação"
        subtitle="Atualize as informações da acomodação"
      />

      <div className="p-8 max-w-xl">
        <Card>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div>
              <label className="text-sm font-medium">Localização</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
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
              />
            </div>

            <div>
              <label className="text-sm font-medium">URL iCal Booking</label>
              <Input
                value={bookingIcal}
                onChange={(e) => setBookingIcal(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Co-host (email)</label>
              <Input
                value={coHost}
                onChange={(e) => setCoHost(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave}>Salvar alterações</Button>

              <Button
                variant="ghost"
                onClick={() => router.push("/acomodacoes")}
              >
                Cancelar
              </Button>

              <Button variant="danger" onClick={handleDelete}>
                Excluir
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
