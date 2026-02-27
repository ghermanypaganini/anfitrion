import { NextResponse } from "next/server";
import ical from "ical";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { propertyId, icalUrl } = await req.json();

    if (!propertyId || !icalUrl) {
      return NextResponse.json(
        { error: "Missing propertyId or icalUrl" },
        { status: 400 }
      );
    }

    const response = await fetch(icalUrl);
    const text = await response.text();

    const parsed = ical.parseICS(text);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let importedCount = 0;

    for (const key in parsed) {
      const event = parsed[key];

      if (event.type !== "VEVENT") continue;
      if (!event.start || !event.end) continue;

      await supabase.from("reservations").upsert(
        {
          property_id: propertyId,
          guest_name: event.summary || "Reserva Airbnb",
          start_date: event.start,
          end_date: event.end,
          ical_uid: event.uid,
          source: "airbnb",
        },
        {
          onConflict: "ical_uid",
        }
      );

      importedCount++;
    }

    return NextResponse.json({
      success: true,
      imported: importedCount,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao importar iCal" },
      { status: 500 }
    );
  }
}
