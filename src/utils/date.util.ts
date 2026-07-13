import { format } from "date-fns";

export class DateUtil {
  static parseInputDDMMYYYY = (value: string): Date | undefined => {
    const clean = value.replace(/[^0-9]/g, "").slice(0, 8);
    if (clean.length !== 8) return undefined;

    const day = parseInt(clean.slice(0, 2), 10);
    const month = parseInt(clean.slice(2, 4), 10);
    const year = parseInt(clean.slice(4, 8), 10);

    if (year < 1900 || month < 1 || month > 12 || day < 1) {
      return undefined;
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    if (day > daysInMonth) return undefined;

    return new Date(year, month - 1, day);
  };
  static formatDate = (date?: Date): string => {
    return date ? format(date, "dd/MM/yyyy") : "";
  };

  static generateTimeSlots = (): string[] => {
    const slots: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = hour.toString().padStart(2, "0");
        const formattedMinute = minute.toString().padStart(2, "0");
        slots.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return slots;
  };
}
