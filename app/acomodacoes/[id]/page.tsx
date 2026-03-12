"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter, useParams } from "next/navigation";
import PageHeader from "@/app/components/ui/PageHeader";
import Card from "@/app/components/ui/Card";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import { useToast } from "@/app/components/ui/Toast";

export default function EditarAcomodacaoPage() {
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams();

  const id = params.id as string;

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("active");
  const [airbnbIcal, setAirbnbIcal] = useState("");
  const [bookingIcal, setBookingIcal] = useState("");
  const [coHost, setCoHost] = useState("");
  const [exportToken, setExportToken] = useState("");

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
      setExportToken(data.ical_export_token ?? "");
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
      toast(error.message, "error");
      return;
    }

    toast("Acomodação atualizada com sucesso.", "success");
    router.push("/acomodacoes");
  };

  const handleDelete = async () => {
    const confirm = window.confirm(
      "Tem certeza que deseja excluir esta acomodação?"
    );

    if (!confirm) return;

    await supabase.from("properties").delete().eq("id", id);

    toast("Acomodação excluída.", "success");
    router.push("/acomodacoes");
  };

  const handleGenerateToken = async () => {
    const token = crypto.randomUUID();

    const { error } = await supabase
      .from("properties")
      .update({ ical_export_token: token })
      .eq("id", id);

    if (error) {
      toast(error.message, "error");
      return;
    }

    setExportToken(token);
    toast("Link de exportação gerado.", "success");
  };

  const exportUrl = exportToken
    ? `${window.location.origin}/api/ical/export/${exportToken}`
    : "";

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(exportUrl);
      toast("Link copiado!", "success");
    } catch {
      toast("Não foi possível copiar.", "error");
    }
  };

  return (
    <main className="flex-1 flex flex-col">
      <PageHeader
        title="Editar acomodação"
        subtitle="Atualize as informações da acomodação"
      />

      <div className="p-4 md:p-8 max-w-xl space-y-6">
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

        <Card>
          <h3 className="text-lg font-semibold text-brand-900 mb-4">
            Integração de calendário
          </h3>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Exportar calendário (Anfitrion → Airbnb/Booking)
              </label>
              <p className="text-xs text-slate-500">
                Cole este link no Airbnb e Booking para bloquear automaticamente
                as datas das suas reservas do Anfitrion Hub.
              </p>

              {exportToken ? (
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={exportUrl}
                    className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm bg-slate-50 text-slate-600"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <Button variant="secondary" onClick={handleCopyUrl}>
                    Copiar
                  </Button>
                </div>
              ) : (
                <Button variant="secondary" onClick={handleGenerateToken}>
                  Gerar link de exportação
                </Button>
              )}
            </div>

            <div className="border-t border-slate-200" />

            <div className="space-y-3">
              <label className="text-sm font-medium">
                Importar calendário (Airbnb/Booking → Anfitrion)
              </label>
              <p className="text-xs text-slate-500">
                Cole aqui os links iCal do Airbnb e Booking para importar as
                reservas dessas plataformas. A sincronização será feita
                periodicamente.
              </p>

              <div>
                <label className="text-xs text-slate-500">
                  URL iCal Airbnb
                </label>
                <Input
                  value={airbnbIcal}
                  onChange={(e) => setAirbnbIcal(e.target.value)}
                  placeholder="https://www.airbnb.com/calendar/ical/..."
                />
              </div>

              <div>
                <label className="text-xs text-slate-500">
                  URL iCal Booking
                </label>
                <Input
                  value={bookingIcal}
                  onChange={(e) => setBookingIcal(e.target.value)}
                  placeholder="https://admin.booking.com/hotel/hoteladmin/ical.html?..."
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
