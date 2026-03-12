import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Formatar data para iCal: YYYYMMDD (VALUE=DATE, sem horário)
function formatIcalDate(dateStr: string): string {
  return dateStr.replace(/-/g, "");
}

// Formatar timestamp para iCal: YYYYMMDDTHHmmssZ
function formatIcalTimestamp(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

// Escapar texto para iCal (RFC 5545)
function escapeIcalText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: "Token não fornecido" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Buscar propriedade pelo token de exportação
    const { data: property, error: propError } = await supabase
      .from("properties")
      .select("id, name")
      .eq("ical_export_token", token)
      .single();

    if (propError || !property) {
      return NextResponse.json(
        { error: "Calendário não encontrado" },
        { status: 404 }
      );
    }

    // Buscar reservas ativas (confirmed, pending, blocked)
    const { data: reservations } = await supabase
      .from("reservations")
      .select("id, label, start_date, end_date, status")
      .eq("property_id", property.id)
      .in("status", ["confirmed", "pending", "blocked"])
      .order("start_date", { ascending: true });

    const now = new Date();
    const dtstamp = formatIcalTimestamp(now);

    // Gerar eventos VEVENT
    const events = (reservations ?? []).map((r) => {
      const summary =
        r.status === "blocked"
          ? "Bloqueado - Anfitrion Hub"
          : escapeIcalText(r.label || "Reserva - Anfitrion Hub");

      return [
        "BEGIN:VEVENT",
        `DTSTART;VALUE=DATE:${formatIcalDate(r.start_date)}`,
        `DTEND;VALUE=DATE:${formatIcalDate(r.end_date)}`,
        `DTSTAMP:${dtstamp}`,
        `UID:${r.id}@anfitrion.com`,
        `SUMMARY:${summary}`,
        `STATUS:CONFIRMED`,
        "END:VEVENT",
      ].join("\r\n");
    });

    // Montar o .ics completo
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Anfitrion Hub//PT",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      `X-WR-CALNAME:${escapeIcalText(property.name)}`,
      ...events,
      "END:VCALENDAR",
    ].join("\r\n");

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${property.name}.ics"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Erro ao exportar iCal:", error);
    return NextResponse.json(
      { error: "Erro interno ao gerar calendário" },
      { status: 500 }
    );
  }
}
