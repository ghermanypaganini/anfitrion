"use client";

import { useEffect, useState } from "react";
import Button from "@/app/components/ui/Button";
import {
  STATUS_OPTIONS,
  ORIGIN_OPTIONS,
  statusLabel,
  originLabel,
} from "@/lib/helpers";

type Guest = {
  id: string;
  name: string;
};

export type ReservationData = {
  id: string;
  label: string;
  start_date: string;
  end_date: string;
  property_id: string;
  status?: string;
  origin?: string;
  guest_id?: string | null;
  guest_count?: number;
  total_price?: number;
  notes?: string;
  created_at?: string;
};

type Props = {
  reservation: ReservationData | null;
  propertyName: string;
  guests: Guest[];
  onClose: () => void;
  onSave: (updated: ReservationData) => void;
  onCancel: (id: string) => void;
};

export default function ReservationViewModal({
  reservation,
  propertyName,
  guests,
  onClose,
  onSave,
  onCancel,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [label, setLabel] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("confirmed");
  const [origin, setOrigin] = useState("direct");
  const [guestId, setGuestId] = useState("");
  const [guestCount, setGuestCount] = useState<number | "">("");
  const [totalPrice, setTotalPrice] = useState<string>("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (reservation) {
      setLabel(reservation.label ?? "");
      setStartDate(reservation.start_date ?? "");
      setEndDate(reservation.end_date ?? "");
      setStatus(reservation.status ?? "confirmed");
      setOrigin(reservation.origin ?? "direct");
      setGuestId(reservation.guest_id ?? "");
      setGuestCount(reservation.guest_count ?? "");
      setTotalPrice(
        reservation.total_price != null ? String(reservation.total_price) : ""
      );
      setNotes(reservation.notes ?? "");
      setIsEditing(false);
    }
  }, [reservation]);

  useEffect(() => {
    if (reservation) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [reservation]);

  if (!reservation) return null;

  const isCancelled = reservation.status === "cancelled";

  const handleSave = async () => {
    if (!label.trim()) {
      alert("O identificador da reserva é obrigatório.");
      return;
    }
    if (!startDate || !endDate) {
      alert("Preencha as datas de check-in e check-out.");
      return;
    }

    setIsSaving(true);

    const updated: ReservationData = {
      ...reservation,
      label: label.trim(),
      start_date: startDate,
      end_date: endDate,
      status,
      origin,
      guest_id: guestId || null,
      guest_count: guestCount !== "" ? Number(guestCount) : undefined,
      total_price: totalPrice !== "" ? Number(totalPrice) : undefined,
      notes: notes || undefined,
    };

    await onSave(updated);
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleCancelReservation = () => {
    const confirmed = window.confirm(
      "Tem certeza que deseja cancelar esta reserva? O registro será mantido."
    );
    if (confirmed) {
      onCancel(reservation.id);
    }
  };

  const handleDiscard = () => {
    setLabel(reservation.label ?? "");
    setStartDate(reservation.start_date ?? "");
    setEndDate(reservation.end_date ?? "");
    setStatus(reservation.status ?? "confirmed");
    setOrigin(reservation.origin ?? "direct");
    setGuestId(reservation.guest_id ?? "");
    setGuestCount(reservation.guest_count ?? "");
    setTotalPrice(
      reservation.total_price != null ? String(reservation.total_price) : ""
    );
    setNotes(reservation.notes ?? "");
    setIsEditing(false);
  };

  const guestName = guests.find((g) => g.id === reservation.guest_id)?.name;

  // ---- VIEW MODE ----
  if (!isEditing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />

        <div className="relative bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl space-y-5 mx-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                {reservation.label || "Sem identificador"}
              </h2>
              <p className="text-sm text-slate-500 mt-1">{propertyName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-xl leading-none"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Check-in</p>
              <p className="font-medium">{reservation.start_date}</p>
            </div>
            <div>
              <p className="text-slate-500">Check-out</p>
              <p className="font-medium">{reservation.end_date}</p>
            </div>
            <div>
              <p className="text-slate-500">Status</p>
              <p className="font-medium">
                {statusLabel(reservation.status ?? "confirmed")}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Origem</p>
              <p className="font-medium">
                {originLabel(reservation.origin ?? "direct")}
              </p>
            </div>
            {guestName && (
              <div>
                <p className="text-slate-500">Hóspede</p>
                <p className="font-medium">{guestName}</p>
              </div>
            )}
            {reservation.guest_count != null && (
              <div>
                <p className="text-slate-500">Nº de hóspedes</p>
                <p className="font-medium">{reservation.guest_count}</p>
              </div>
            )}
            {reservation.total_price != null && (
              <div>
                <p className="text-slate-500">Valor</p>
                <p className="font-medium">
                  R$ {Number(reservation.total_price).toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {reservation.notes && (
            <div className="text-sm">
              <p className="text-slate-500">Observações</p>
              <p className="mt-1 text-slate-700">{reservation.notes}</p>
            </div>
          )}

          {reservation.created_at && (
            <p className="text-xs text-slate-400">
              Criada em{" "}
              {new Date(reservation.created_at).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}

          <div className="flex justify-between items-center pt-2">
            <div>
              {!isCancelled && (
                <button
                  onClick={handleCancelReservation}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Cancelar reserva
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded-lg text-sm hover:bg-slate-50"
              >
                Fechar
              </button>
              {!isCancelled && (
                <Button onClick={() => setIsEditing(true)}>Editar</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- EDIT MODE ----
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleDiscard} />

      <div className="relative bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Editar reserva
            </h2>
            <p className="text-sm text-slate-500 mt-1">{propertyName}</p>
          </div>
          <button
            onClick={handleDiscard}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Identificador</label>
            <input
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex: Casal de Floripa"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Check-in</label>
              <input
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Check-out</label>
              <input
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Origem</label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg"
              >
                {ORIGIN_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Hóspede</label>
            <select
              value={guestId}
              onChange={(e) => setGuestId(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg"
            >
              <option value="">Nenhum (opcional)</option>
              {guests.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Nº de hóspedes</label>
              <input
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                type="number"
                min={1}
                value={guestCount}
                onChange={(e) =>
                  setGuestCount(e.target.value ? Number(e.target.value) : "")
                }
                placeholder="—"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Valor (R$)</label>
              <input
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                type="number"
                min={0}
                step="0.01"
                value={totalPrice}
                onChange={(e) => setTotalPrice(e.target.value)}
                placeholder="—"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Observações</label>
            <textarea
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas sobre a reserva..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={handleDiscard}
            className="px-4 py-2 border rounded-lg text-sm hover:bg-slate-50"
          >
            Descartar
          </button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </div>
    </div>
  );
}
