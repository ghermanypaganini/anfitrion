// Reservation status helpers

export const STATUS_OPTIONS = [
  { value: "confirmed", label: "Confirmada" },
  { value: "pending", label: "Pendente" },
  { value: "blocked", label: "Bloqueio" },
] as const;

export const ORIGIN_OPTIONS = [
  { value: "direct", label: "Direto" },
  { value: "airbnb", label: "Airbnb" },
  { value: "booking", label: "Booking" },
  { value: "whatsapp", label: "WhatsApp" },
] as const;

export function statusLabel(status: string): string {
  switch (status) {
    case "confirmed":
      return "Confirmada";
    case "pending":
      return "Pendente";
    case "cancelled":
      return "Cancelada";
    case "blocked":
      return "Bloqueio";
    case "completed":
      return "Finalizada";
    default:
      return status;
  }
}

export function statusVariant(
  status: string
): "success" | "warning" | "danger" | "default" {
  switch (status) {
    case "confirmed":
      return "success";
    case "pending":
      return "warning";
    case "cancelled":
      return "danger";
    case "completed":
      return "default";
    default:
      return "default";
  }
}

export function originLabel(origin: string): string {
  switch (origin) {
    case "direct":
      return "Direto";
    case "airbnb":
      return "Airbnb";
    case "booking":
      return "Booking";
    case "whatsapp":
      return "WhatsApp";
    default:
      return origin;
  }
}

/**
 * Determina o status visual da reserva.
 * Reservas confirmadas cuja end_date é anterior a hoje = "completed" (Finalizada).
 * Não altera o banco — é só para apresentação.
 */
export function displayStatus(status: string, endDate: string): string {
  const todayStr = new Date().toISOString().split("T")[0];
  if (status === "confirmed" && endDate < todayStr) {
    return "completed";
  }
  return status;
}

// Property status helpers

export const PROPERTY_STATUS_OPTIONS = [
  { value: "active", label: "Aberta", color: "bg-green-100 text-green-700" },
  { value: "inactive", label: "Fechada", color: "bg-red-100 text-red-700" },
  {
    value: "maintenance",
    label: "Manutenção",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    value: "cleaning",
    label: "Limpeza",
    color: "bg-slate-100 text-slate-700",
  },
] as const;

export function propertyStatusLabel(status: string): string {
  return (
    PROPERTY_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status
  );
}

export function propertyStatusVariant(
  status: string
): "success" | "warning" | "danger" | "default" {
  switch (status) {
    case "active":
      return "success";
    case "inactive":
      return "danger";
    case "maintenance":
      return "warning";
    default:
      return "default";
  }
}

export function propertyStatusColor(status: string): string {
  return (
    PROPERTY_STATUS_OPTIONS.find((o) => o.value === status)?.color ??
    "bg-slate-100 text-slate-700"
  );
}
