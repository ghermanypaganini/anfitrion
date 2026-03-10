"use client";

import { useEffect } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;

  propertyName?: string;

  label: string;
  setLabel: (value: string) => void;

  startDate: string;
  setStartDate: (value: string) => void;

  endDate: string;
  setEndDate: (value: string) => void;

  onSave: () => void;
  isSaving: boolean;
};

export default function ReservationModal({
  isOpen,
  onClose,
  propertyName,
  label,
  setLabel,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onSave,
  isSaving,
}: Props) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isValid = label.trim() !== "" && startDate !== "" && endDate !== "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white p-8 rounded-2xl w-full max-w-2xl shadow-2xl space-y-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Nova Reserva
          </h2>
          {propertyName && (
            <p className="text-sm text-slate-500 mt-1">
              Acomodação:{" "}
              <span className="font-medium text-slate-700">{propertyName}</span>
            </p>
          )}
        </div>

        <input
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Identificador da reserva (ex: Fulano, Casal de Floripa ou Grupo de amigos)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />

        <input
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <input
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || !isValid}
            className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
          >
            {isSaving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
