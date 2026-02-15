export type StoredAppointment = {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  insurance: string;
  appointmentTime: string;
  city?: string;
  state?: string;
  npi?: string;
  createdAt: string;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getAppointmentsKey(email: string): string {
  return `connecther:appointments:${normalizeEmail(email)}`;
}

export function getAppointmentsForUser(email: string): StoredAppointment[] {
  const key = getAppointmentsKey(email);
  const raw = localStorage.getItem(key);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is StoredAppointment => {
      return (
        item &&
        typeof item.id === "string" &&
        typeof item.doctorId === "string" &&
        typeof item.doctorName === "string" &&
        typeof item.specialty === "string" &&
        typeof item.insurance === "string" &&
        typeof item.appointmentTime === "string" &&
        typeof item.createdAt === "string"
      );
    });
  } catch {
    return [];
  }
}

export function addAppointmentForUser(
  email: string,
  appointment: Omit<StoredAppointment, "id" | "createdAt">,
): StoredAppointment {
  const existing = getAppointmentsForUser(email);
  const next: StoredAppointment = {
    ...appointment,
    id:
      (typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `appt-${Date.now()}`),
    createdAt: new Date().toISOString(),
  };
  const updated = [next, ...existing];
  localStorage.setItem(getAppointmentsKey(email), JSON.stringify(updated));
  return next;
}
