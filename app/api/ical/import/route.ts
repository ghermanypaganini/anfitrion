import { NextResponse } from "next/server";
import ical from "ical";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const { propertyId, icalUrl } = await req.json();

  if (!propertyId || !icalUrl) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  try {
    const response = await fetch(icalUrl);
    const data = await response.text();

    const parsed = ical.parseICS(data);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    for (const key in parsed) {
      const event = parsed[key];

      if (event.type === "VEVENT") {
        await supabase.from("reservations").upsert(
          {
            property_id: propertyId,
            guest_name: "Reserva Airbnb",
            start_date: event.start,
            end_date: event.end,
            source: "airbnb",
            ical_uid: event.uid,
          },
          { onConflict: "ical_uid" }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao importar iCal" },
      { status: 500 }
    );
  }
}
