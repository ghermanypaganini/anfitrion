"use client";

import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
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

type Event = {
  title: string;
  start: Date;
  end: Date;
};

export default function CalendarView({ events, onSelectSlot }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<"month" | "week">("month");

  return (
    <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={["month", "week"]}
        view={currentView}
        onView={(view) => setCurrentView(view as "month" | "week")}
        defaultView="month"
        culture="pt-BR"
        selectable
        onSelectSlot={onSelectSlot}
        date={currentDate}
        onNavigate={(date) => setCurrentDate(date)}
        style={{ height: 550 }}
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
        eventPropGetter={(event) => {
          return {
            style: {
              backgroundColor: "#E11D48",
              borderRadius: "8px",
              opacity: 0.9,
              color: "white",
              border: "none",
              display: "block",
              padding: "2px 6px",
            },
          };
        }}
      />
    </div>
  );
}
