import { format } from "date-fns";

type DateWithStringProps = {
  date?: string | Date;
  hours?: number;
  minutes?: number;
  seconds?: number;
};

export class DateHelper {
  static formatToUTC = (date: Date) => {
    return date.toISOString().replace("T", " ").slice(0, 19) + "+00";
  };

  static formatDateTime = (date: Date) => {
    return format(date, "yyyy-MM-dd'T'HH:mm:ss");
  };

  static getDateWithString = ({
    date,
    hours = 0,
    minutes = 0,
    seconds = 0,
  }: DateWithStringProps) => {
    const newDate = date ? new Date(date) : new Date();

    if (hours || minutes || seconds) {
      newDate.setUTCHours(hours, minutes, seconds, 0);
    }

    const year = newDate.getUTCFullYear();
    const month = newDate.getUTCMonth() + 1;
    const day = newDate.getUTCDate();
    const hour = newDate.getUTCHours();
    const minute = newDate.getUTCMinutes();
    const second = newDate.getUTCSeconds();

    const monthStr = String(month).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    const hourStr = String(hour).padStart(2, "0");
    const minuteStr = String(minute).padStart(2, "0");
    const secondStr = String(second).padStart(2, "0");

    return {
      // Thông tin giờ
      hours: newDate.getHours(),
      minutes: newDate.getMinutes(),
      seconds: newDate.getSeconds(),
      hourString: hourStr,
      minuteString: minuteStr,
      secondString: secondStr,
      timeString: `${hourStr}:${minuteStr}:${secondStr}`,

      // Thông tin ngày
      year: year,
      month: month,
      day: day,
      monthString: monthStr,
      dayString: dayStr,

      // Thông tin đầy đủ
      dateString: `${year}-${monthStr}-${dayStr}`,
      dateTimeString: `${year}-${monthStr}-${dayStr} ${hourStr}:${minuteStr}:${secondStr}`,
      dateTimeUTC: this.formatToUTC(newDate),

      // Ngày trong tuần
      dayOfWeek: newDate.getDay(),
      dayOfWeekString: [
        "Chủ nhật",
        "Thứ 2",
        "Thứ 3",
        "Thứ 4",
        "Thứ 5",
        "Thứ 6",
        "Thứ 7",
      ][newDate.getDay()],

      // Object Date gốc
      dateObject: newDate,
    };
  };
}
