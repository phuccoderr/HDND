import React, { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import viLocale from "@fullcalendar/core/locales/vi";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, {
  type EventResizeDoneArg,
} from "@fullcalendar/interaction";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, List, Timer, Trash2 } from "lucide-react";
import type {
  AllDayContentArg,
  DatesSetArg,
  DayHeaderContentArg,
  EventContentArg,
  EventDropArg,
  EventSourceInput,
  SlotLabelContentArg,
} from "@fullcalendar/core/index.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InputDate } from "@/components/ui/input-date";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateUtil } from "@/utils/date.util";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { EventImpl } from "@fullcalendar/core/internal";

const colors = [
  // blue
  { bgColor: "oklch(95% 0.03 243.15)", textColor: "oklch(45% 0.14 243.15)" },
  //green
  { bgColor: "oklch(96% 0.04 142.00)", textColor: "oklch(43% 0.12 142.00)" },
  //amber
  { bgColor: "oklch(96% 0.04 70.00)", textColor: "oklch(47% 0.13 70.00)" },
  //rose
  { bgColor: "oklch(95% 0.04 15.00)", textColor: "oklch(45% 0.14 15.00)" },
  //purple
  { bgColor: "oklch(95% 0.04 295.00)", textColor: "oklch(45% 0.14 295.00)" },
];

const DashboardPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<FullCalendar>(null);
  const [isOpen, setIsOpen] = useState(false);
  const onOpenChange = (open: boolean) => {
    setIsOpen(open);
  };
  const [calendarTitle, setCalendarTitle] = useState<string>("");
  const [events, setEvents] = useState<EventSourceInput>([
    {
      id: "1",
      title: "Họp Chiến Lược",
      start: "2026-07-13T09:00:00",
      end: "2026-07-13T11:00:00",
      extendedProps: {
        users: ["Quang Tuấn Duy", "Võ Quý Minh Quang"],
      },
    },
  ]);

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

  const handleEventDrop = (info: EventDropArg) => {
    const { event } = info;

    // Gợi ý: Bạn có thể gọi API ở đây để lưu thời gian mới vào Database
    // ví dụ: axios.put(`/api/events/${event.id}`, { start: event.startStr, end: event.endStr })

    alert(
      `Đã chuyển sự kiện "${event.title}" sang thời gian mới:\n` +
        `Bắt đầu: ${event.start?.toLocaleString()}\n` +
        `Kết thúc: ${event.end?.toLocaleString() || "Không có"}`,
    );

    // Cập nhật lại State để giao diện đồng bộ (nếu cần)
    updateEventInState(event);
  };

  // 3. Xử lý khi người dùng kéo giãn thời lượng sự kiện (Resize)
  const handleEventResize = (info: EventResizeDoneArg) => {
    const { event } = info;
    alert(
      `Sự kiện "${event.title}" đã thay đổi thời lượng. Kết thúc mới: ${event.end?.toLocaleString()}`,
    );
    updateEventInState(event);
  };

  // Hàm phụ trợ cập nhật state
  const updateEventInState = (updatedEvent: EventImpl) => {
    setEvents((prevEvents) =>
      prevEvents.map((evt) =>
        evt.id === updatedEvent.id
          ? { ...evt, start: updatedEvent.startStr, end: updatedEvent.endStr }
          : evt,
      ),
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
    <div ref={containerRef} className="m-2 border rounded-md">
      <div className="flex justify-between items-center p-2">
        <div className="flex gap-1 items-center">
          <Button onClick={goToday}>Hôm nay</Button>
          <Button onClick={goPrev} size="icon-sm" variant="ghost">
            <ChevronLeft />
          </Button>
          <Button onClick={goNext} size="icon-sm" variant="ghost">
            <ChevronRight />
          </Button>
          <h2>{calendarTitle}</h2>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger>
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
          <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger>
              <Button>+ New Event</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm sự kiện</DialogTitle>
              </DialogHeader>
              <form id="form-submit" onSubmit={() => {}}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="event-title">Tiêu đề</FieldLabel>
                    <Input
                      id="event-title"
                      placeholder="Nhập tiêu đề sự kiện"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="event-description">Mô tả</FieldLabel>
                    <Textarea
                      id="event-description"
                      placeholder="Nhập mô tả sự kiện"
                    />
                  </Field>
                  <div className="flex justify-between gap-1">
                    <Field>
                      <FieldLabel htmlFor="event-date">Bắt đầu ngày</FieldLabel>
                      <InputDate date={undefined} />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="event-date">Thời gian</FieldLabel>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn giờ (HH:mm)" />
                        </SelectTrigger>

                        <SelectContent>
                          {/* Bọc trong ScrollArea của Shadcn để dropdown không bị tràn màn hình */}
                          <SelectGroup>
                            {DateUtil.generateTimeSlots().map((slot) => (
                              <SelectItem key={slot} value={slot}>
                                {slot}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <div className="flex justify-between items-center gap-1">
                    <Field>
                      <FieldLabel htmlFor="event-date">
                        Kết thúc ngày
                      </FieldLabel>
                      <InputDate date={undefined} />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="event-date">Thời gian</FieldLabel>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn giờ (HH:mm)" />
                        </SelectTrigger>

                        <SelectContent>
                          {/* Bọc trong ScrollArea của Shadcn để dropdown không bị tràn màn hình */}
                          <SelectGroup>
                            {DateUtil.generateTimeSlots().map((slot) => (
                              <SelectItem key={slot} value={slot}>
                                {slot}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <Field orientation="horizontal">
                    <Checkbox
                      id="checkout-7j9-same-as-shipping-wgm"
                      defaultChecked
                    />
                    <FieldLabel
                      htmlFor="checkout-7j9-same-as-shipping-wgm"
                      className="font-normal"
                    >
                      Cả ngày
                    </FieldLabel>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="event-color">Màu sắc</FieldLabel>
                    <RadioGroup
                      className="flex gap-2"
                      defaultValue={colors[0].bgColor}
                    >
                      {colors.map((color) => (
                        <RadioGroupItem
                          value={color.bgColor}
                          key={color.bgColor}
                          className="w-6 h-6 rounded-full hover:opacity-75"
                          style={{ backgroundColor: color.bgColor }}
                        />
                      ))}
                    </RadioGroup>
                  </Field>
                </FieldGroup>
              </form>
              <DialogFooter className="items-center justify-between!">
                <Button type="button" size="icon-sm">
                  <Trash2 />
                </Button>
                <div className="flex items-center gap-1">
                  <Button type="button">Cancel</Button>
                  <Button type="button">Save</Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
          return (
            <div
              className={`relative h-full overflow-hidden flex flex-col gap-1 text-xs ${viewType == "dayGridMonth" && "w-full rounded-sm"}`}
              style={{
                backgroundColor: "oklch(95% 0.03 243.15)",
                color: "oklch(45% 0.14 243.15)",
              }}
            >
              <span>{arg.event.title}</span>
              <span className="opacity-60 flex items-center gap-1">
                {arg.timeText} <Timer size={12} />
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
    </div>
  );
};

export default DashboardPage;
