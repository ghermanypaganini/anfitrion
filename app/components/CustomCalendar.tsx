"use client";

import { useState, useMemo } from "react";

export type CalendarReservation = {
  id: string;
  label: string;
  start_date: string;
  end_date: string;
  status?: string;
  property_id: string;
};

type Props = {
  reservations: CalendarReservation[];
  onDayClick: (date: string, reservations: CalendarReservation[]) => void;
  onReservationClick: (reservation: CalendarReservation) => void;
};

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-green-500",
  pending: "bg-blue-500",
  cancelled: "bg-red-400",
  blocked: "bg-amber-500",
};

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
}

type BarSegment = {
  reservation: CalendarReservation;
  startCol: number;
  span: number;
  isStart: boolean;
  isEnd: boolean;
  row: number;
};

export default function CustomCalendar({
  reservations,
  onDayClick,
  onReservationClick,
}: Props) {
  const today = new Date();
  const todayStr = toDateStr(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  const weeks = useMemo(() => {
    const result: (number | null)[][] = [];
    let week: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) week.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      week.push(d);
      if (week.length === 7) {
        result.push(week);
        week = [];
      }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      result.push(week);
    }
    return result;
  }, [firstDay, daysInMonth]);

  const weekBars = useMemo(() => {
    const activeReservations = reservations.filter(
      (r) => r.status !== "cancelled"
    );

    return weeks.map((week) => {
      const bars: BarSegment[] = [];
      const rowSlots: number[][] = [];

      const weekDates: (string | null)[] = week.map((day) =>
        day !== null ? toDateStr(viewYear, viewMonth, day) : null
      );

      activeReservations.forEach((res) => {
        let startCol = -1;
        let endCol = -1;

        for (let col = 0; col < 7; col++) {
          const dateStr = weekDates[col];
          if (!dateStr) continue;

          // Bar spans from check-in day through check-out day (both inclusive)
          // The diagonal cuts show that check-in starts at afternoon
          // and check-out ends at morning
          const isInRange =
            dateStr >= res.start_date && dateStr <= res.end_date;
          if (isInRange) {
            if (startCol === -1) startCol = col;
            endCol = col;
          }
        }

        if (startCol === -1) return;

        const span = endCol - startCol + 1;

        // Is this the first cell of the reservation?
        const isStart = weekDates[startCol] === res.start_date;
        // Is this the last cell of the reservation?
        const isEnd = weekDates[endCol] === res.end_date;

        let row = 0;
        while (true) {
          if (!rowSlots[row]) rowSlots[row] = [];
          const hasConflict = rowSlots[row].some(
            (col) => col >= startCol && col <= endCol
          );
          if (!hasConflict) break;
          row++;
        }

        for (let c = startCol; c <= endCol; c++) {
          rowSlots[row].push(c);
        }

        bars.push({
          reservation: res,
          startCol,
          span,
          isStart,
          isEnd,
          row,
        });
      });

      return bars;
    });
  }, [weeks, reservations, viewYear, viewMonth]);

  const maxBarRows = Math.max(
    1,
    ...weekBars.map((bars) => {
      if (bars.length === 0) return 0;
      return Math.max(...bars.map((b) => b.row)) + 1;
    })
  );

  const barAreaHeight = Math.max(28, maxBarRows * 26);

  // Parallelogram shape: both edges slant in the same direction
  //   /‾‾‾‾‾‾/
  //  /______/
  function getClipPath(isStart: boolean, isEnd: boolean): string {
    if (isStart && isEnd) {
      return "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)";
    }
    if (isStart) {
      return "polygon(8px 0%, 100% 0%, 100% 100%, 0% 100%)";
    }
    if (isEnd) {
      return "polygon(0% 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)";
    }
    return "none";
  }

  return (
    <div className="bg-white border border-[#1f3a5f]/20 rounded-2xl p-4 md:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[#1f3a5f] text-lg font-semibold capitalize">
          {formatMonthYear(new Date(viewYear, viewMonth))}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={goToday}
            className="text-xs text-[#1f3a5f]/60 hover:text-[#1f3a5f] px-2 py-1 rounded transition"
          >
            Hoje
          </button>
          <button
            onClick={prevMonth}
            className="text-[#1f3a5f]/60 hover:text-[#1f3a5f] p-1.5 rounded-lg hover:bg-[#1f3a5f]/5 transition"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={nextMonth}
            className="text-[#1f3a5f]/60 hover:text-[#1f3a5f] p-1.5 rounded-lg hover:bg-[#1f3a5f]/5 transition"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-[#1f3a5f]/15">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-[#1f3a5f]/70 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Weeks */}
      <div>
        {weeks.map((week, weekIdx) => (
          <div
            key={weekIdx}
            className="border-b border-[#1f3a5f]/10 last:border-b-0"
          >
            {/* Day numbers */}
            <div className="grid grid-cols-7">
              {week.map((day, colIdx) => {
                const dateStr = day
                  ? toDateStr(viewYear, viewMonth, day)
                  : null;
                const isToday = dateStr === todayStr;

                return (
                  <button
                    key={colIdx}
                    disabled={day === null}
                    onClick={() => {
                      if (!dateStr) return;
                      const dayRes = reservations.filter(
                        (r) =>
                          r.status !== "cancelled" &&
                          dateStr >= r.start_date &&
                          dateStr <= r.end_date
                      );
                      onDayClick(dateStr, dayRes);
                    }}
                    className={`
                      py-2 text-center text-sm transition
                      ${
                        day === null
                          ? ""
                          : "hover:bg-[#1f3a5f]/5 cursor-pointer"
                      }
                      ${
                        isToday
                          ? "text-[#ff6a00] font-bold"
                          : day !== null
                          ? "text-[#1f3a5f]"
                          : ""
                      }
                    `}
                  >
                    {day ?? ""}
                  </button>
                );
              })}
            </div>

            {/* Bars area */}
            <div
              className="relative grid grid-cols-7"
              style={{ height: `${barAreaHeight}px` }}
            >
              {weekBars[weekIdx].map((bar, barIdx) => {
                const color =
                  STATUS_COLORS[bar.reservation.status ?? "confirmed"] ??
                  STATUS_COLORS.confirmed;

                const cellPercent = 100 / 7;

                // Bar starts at 50% of check-in cell, ends at 50% of check-out cell
                const startPercent = bar.isStart
                  ? bar.startCol * cellPercent + cellPercent * 0.5
                  : bar.startCol * cellPercent;

                const endPercent = bar.isEnd
                  ? (bar.startCol + bar.span - 1) * cellPercent +
                    cellPercent * 0.5
                  : (bar.startCol + bar.span) * cellPercent;

                const widthPercent = endPercent - startPercent;

                return (
                  <button
                    key={barIdx}
                    onClick={(e) => {
                      e.stopPropagation();
                      onReservationClick(bar.reservation);
                    }}
                    title={bar.reservation.label}
                    className={`
                      absolute h-[22px] ${color} text-white text-[11px] font-medium
                      flex items-center overflow-hidden whitespace-nowrap
                      hover:brightness-110 transition-all cursor-pointer
                    `}
                    style={{
                      left: `${startPercent}%`,
                      width: `${widthPercent}%`,
                      top: `${bar.row * 26 + 2}px`,
                      clipPath:
                        bar.isStart || bar.isEnd
                          ? getClipPath(bar.isStart, bar.isEnd)
                          : undefined,
                    }}
                  >
                    <span className="truncate px-2">
                      {bar.reservation.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#1f3a5f]/10 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span className="text-xs text-[#1f3a5f]/60">Confirmada</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span className="text-xs text-[#1f3a5f]/60">Pendente</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-amber-500" />
          <span className="text-xs text-[#1f3a5f]/60">Bloqueio</span>
        </div>
      </div>
    </div>
  );
}
