import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import viLocale from "@fullcalendar/core/locales/vi";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, {
  type EventResizeDoneArg,
} from "@fullcalendar/interaction";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, List, Timer } from "lucide-react";
import type {
  AllDayContentArg,
  DatesSetArg,
  DayHeaderContentArg,
  EventClickArg,
  EventContentArg,
  EventDropArg,
  EventInput,
  SlotLabelContentArg,
} from "@fullcalendar/core/index.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { EventImpl } from "@fullcalendar/core/internal";
import {
  useSchedulesQuery,
  useUpdateSchedule,
  type Schedule,
} from "@/apis/schedules.api";
import { format } from "date-fns";
import CreateSchedule from "./components/create-schedule.component";
import { toast } from "sonner";
import UpdateSchedule from "./components/update-schedule.component";
import { scheduleColorMap } from "./components/schedule-form.schema";
import { CopyButton } from "@/components/animate-ui/components/buttons/copy";

const DashboardPage = () => {
  const { data: schedules } = useSchedulesQuery();
  const { mutateAsync: mutateUpdateSchedule } = useUpdateSchedule();
  const containerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<FullCalendar>(null);
  const [calendarTitle, setCalendarTitle] = useState<string>("");
  const [events, setEvents] = useState<EventInput[]>([]);

  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null,
  );
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  const handleEventClick = (arg: EventClickArg) => {
    const found = schedules?.find((s) => String(s.id) === arg.event.id);
    if (!found) return;
    setSelectedSchedule(found);
    setIsUpdateOpen(true);
  };

  useEffect(() => {
    if (schedules && schedules.length > 0) {
      setEvents(scheduleMapEvents(schedules));
    } else {
      setEvents([]);
    }
  }, [schedules]);

  const scheduleMapEvents = (schedules: Schedule[]): EventInput[] =>
    schedules.map((schedule) => ({
      id: String(schedule.id),
      title: schedule.title,
      start: schedule.start_datetime.substring(0, 19).replace(" ", "T"),
      end: schedule.end_datetime.substring(0, 19).replace(" ", "T"),
      allDay: schedule.is_all_day,
      extendedProps: {
        users: schedule.employees?.map((emp) => emp.full_name),
        color: schedule.color,
      },
    }));

  const persistEventTime = async (
    event: EventImpl,
    payload: Partial<
      Pick<Schedule, "start_datetime" | "end_datetime" | "is_all_day">
    >,
    revert: () => void,
  ) => {
    try {
      await mutateUpdateSchedule({
        id: Number(event.id),
        updatedFields: payload,
      });

      setEvents((prev) =>
        prev.map((evt) =>
          evt.id === event.id
            ? { ...evt, start: event.startStr, end: event.endStr }
            : evt,
        ),
      );
      toast.success("Cập nhật thời gian thành công");
    } catch (error) {
      toast.error("Cập nhật thời gian thất bại", {
        description: "Sự kiện đã được khôi phục vị trí cũ",
      });
      revert();
    }
  };

  const goPrev = (): void => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) calendarApi.prev();
  };

  const goNext = (): void => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) calendarApi.next();
  };

  const goToday = (): void => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) calendarApi.today();
  };

  const changeView = (viewName: string): void => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) calendarApi.changeView(viewName);
  };

  const handleDatesSet = (dateInfo: DatesSetArg): void => {
    setCalendarTitle(dateInfo.view.title);
    const dayEl = document.querySelectorAll(".fc-daygrid-day");
    if (dateInfo.view.type == "timeGridWeek") {
      dayEl.forEach((el) => el.classList.add("bg-accent"));
    } else {
      dayEl.forEach((el) => el.classList.remove("bg-accent"));
    }
  };

  const handleEventDrop = async (info: EventDropArg) => {
    const startTime = new Date(info.event.start ?? Date.now());
    const endTime = new Date(info.event.end ?? Date.now());

    persistEventTime(
      info.event,
      {
        start_datetime: format(startTime, "yyyy-MM-dd'T'HH:mm:ss"),
        end_datetime: format(endTime, "yyyy-MM-dd'T'HH:mm:ss"),
        is_all_day: info.event.allDay,
      },
      info.revert,
    );
  };

  // 3. Xử lý khi người dùng kéo giãn thời lượng sự kiện (Resize)
  const handleEventResize = async (info: EventResizeDoneArg) => {
    const endTime = new Date(info.event.end ?? Date.now());
    persistEventTime(
      info.event,
      { end_datetime: format(endTime, "yyyy-MM-dd'T'HH:mm:ss") },
      info.revert,
    );
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      calendarRef.current?.getApi().updateSize();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="m-4 border rounded-md">
      <div className="flex justify-between items-center p-2">
        <div className="flex gap-1 items-center">
          <Button size="sm" onClick={goToday}>
            Hôm nay
          </Button>
          <Button onClick={goPrev} size="icon-xs" variant="ghost">
            <ChevronLeft />
          </Button>
          <Button onClick={goNext} size="icon-xs" variant="ghost">
            <ChevronRight />
          </Button>
          <h2>{calendarTitle}</h2>
        </div>
        <div className="flex gap-2">
          <CopyButton variant="outline" size="xs" content="Hello world!" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon-sm">
                <List />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => changeView("dayGridMonth")}>
                Tháng
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeView("timeGridWeek")}>
                Tuần
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <CreateSchedule />
        </div>
      </div>
      <FullCalendar
        ref={calendarRef}
        locale={viLocale}
        // Đăng ký cả dayGrid và timeGrid để nút chuyển đổi hoạt động mượt mà
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        events={events}
        // Config
        headerToolbar={false}
        height="auto"
        slotDuration="00:30:00"
        snapDuration="00:15:00"
        // Bật tính năng kéo thả hoặc click nếu cần
        datesSet={handleDatesSet}
        editable={true}
        droppable={true}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop} // Hàm chạy khi kéo thả xong
        eventResize={handleEventResize} // Hàm chạy khi kéo giãn thời gian xong
        longPressDelay={100}
        allDayContent={(arg: AllDayContentArg) => {
          return (
            <span className="text-xs text-muted-foreground bg-accent">
              {arg.text}
            </span>
          );
        }}
        dayHeaderContent={(arg: DayHeaderContentArg) => {
          // arg.date chứa thông tin ngày hiện tại của cột đó
          const isToday = arg.isToday;

          return (
            <div
              className="border-none text-center flex gap-1"
              style={{ border: "none" }}
            >
              <span
                className={`text-xs border-none ${!isToday && "text-muted-foreground"}`}
              >
                {arg.text.split(" ")[0]} {arg.date.getDate()}
              </span>
            </div>
          );
        }}
        slotLabelContent={(arg: SlotLabelContentArg) => {
          return (
            <div className="text-xs text-center text-muted-foreground">
              {arg.text}
            </div>
          );
        }}
        eventBackgroundColor="transparent"
        eventBorderColor="transparent"
        eventContent={(arg: EventContentArg) => {
          const viewType = arg.view.type;
          const isAllDay = arg.event.allDay;
          const colorKey = arg.event.extendedProps?.color;
          const style = scheduleColorMap[colorKey] ?? scheduleColorMap.blue;
          return (
            <div
              className={`relative h-full overflow-hidden flex flex-col gap-1 text-xs p-1 rounded-sm ${viewType == "dayGridMonth" && "w-full"}`}
              style={{ backgroundColor: style.bgColor, color: style.textColor }}
            >
              <span>{arg.event.title}</span>
              <span className="opacity-60 flex items-center gap-1">
                {isAllDay ? "24 giờ" : arg.timeText} <Timer size={12} />
              </span>
              <div className="flex flex-col gap-1">
                {arg.event.extendedProps?.users?.map((user: string) => (
                  <span className="w-full">{user}</span>
                ))}
              </div>
            </div>
          );
        }}
      />

      <UpdateSchedule
        schedule={selectedSchedule}
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
      />
    </div>
  );
};

export default DashboardPage;
