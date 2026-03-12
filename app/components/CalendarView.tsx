"use client";

import { Calendar, dateFnsLocalizer, SlotInfo } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";

const locales = {
  "pt-BR": ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status?: string;
  resourceId?: string;
};

type Resource = {
  resourceId: string;
  resourceTitle: string;
};

type CalendarViewProps = {
  events: CalendarEvent[];
  onSelectSlot?: (slotInfo: SlotInfo) => void;
  onSelectEvent?: (event: CalendarEvent) => void;
  resources?: Resource[];
};

// Status colors (source of truth for the entire app):
// confirmed → green (#10B981)
// pending   → blue  (#3B82F6)
// cancelled → red   (#EF4444)
// blocked   → amber (#F59E0B)
// completed (past end_date) → gray (#9CA3AF)

const STATUS_COLORS: Record<string, string> = {
  confirmed: "#10B981",
  pending: "#3B82F6",
  cancelled: "#EF4444",
  blocked: "#F59E0B",
};

const COMPLETED_COLOR = "#9CA3AF";

export default function CalendarView({
  events,
  onSelectSlot,
  onSelectEvent,
  resources,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<"month">("month");

  const eventPropGetter = (event: CalendarEvent) => {
    const today = new Date();
    const isPast = isBefore(event.end, today);

    const backgroundColor = isPast
      ? COMPLETED_COLOR
      : STATUS_COLORS[event.status ?? "confirmed"] ?? STATUS_COLORS.confirmed;

    return {
      style: {
        backgroundColor,
        color: "white",
        border: "none",
        cursor: onSelectEvent ? "pointer" : "default",

        height: "22px",
        marginTop: "8px",

        width: "92%",
        marginLeft: "4%",

        fontSize: "12px",
        display: "flex" as const,
        alignItems: "center" as const,
        paddingLeft: "10px",

        overflow: "hidden" as const,
        whiteSpace: "nowrap" as const,
        textOverflow: "ellipsis" as const,

        clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0% 100%)",
      },
    };
  };

  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const today = new Date();

    const isCheckInToday = start.toDateString() === today.toDateString();
    const isCheckOutToday = end.toDateString() === today.toDateString();

    return (
      <span>
        {isCheckInToday && "→ "}
        {event.title}
        {isCheckOutToday && " ←"}
      </span>
    );
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200 h-[650px]">
      <Calendar
        localizer={localizer}
        events={events}
        resources={resources}
        resourceIdAccessor="resourceId"
        resourceTitleAccessor="resourceTitle"
        step={1440}
        timeslots={1}
        startAccessor="start"
        endAccessor="end"
        views={["month"]}
        view={currentView}
        onView={() => setCurrentView("month")}
        culture="pt-BR"
        selectable
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent}
        date={currentDate}
        onNavigate={(date) => setCurrentDate(date)}
        eventPropGetter={eventPropGetter}
        components={{
          event: EventComponent,
        }}
        style={{ height: "100%" }}
        messages={{
          today: "Hoje",
          previous: "Anterior",
          next: "Próximo",
          month: "Mês",
          week: "Semana",
          day: "Dia",
          agenda: "Agenda",
          date: "Data",
          time: "Hora",
          event: "Reserva",
          noEventsInRange: "Nenhuma reserva neste período",
        }}
      />
    </div>
  );
}
