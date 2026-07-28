import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { toBlob } from "html-to-image";
import { CopyButton } from "@/components/animate-ui/components/buttons/copy";
import { supabaseClient } from "@/apis/http.client";
import type { Command } from "@/apis/commands.api";
import { addDays } from "date-fns";
import type { Duty } from "@/apis/duties.api";
import { DateHelper } from "@/utils/date.util";
import { useSchedulesQuery } from "@/apis/schedules.api";
import {
  getStoredRoom1,
  getStoredRoom3,
  getStoredRooms,
  getStoredToilet,
} from "@/stores/phong.store";

const ScheduleCaptureUI = () => {
  const scheduleRef = useRef<HTMLDivElement>(null);
  const toDay = new Date();
  const storedRooms = useMemo(() => getStoredRooms(), []);

  const [command, setCommand] = useState<Command | null>();
  const [duty, setDuty] = useState<Duty | null>();
  const { data: schedules } = useSchedulesQuery({
    start_time: DateHelper.getDateWithString({ hours: 18 }).dateTimeUTC,
    end_time: DateHelper.getDateWithString({
      date: addDays(toDay, 1),
      hours: 17,
      minutes: 59,
    }).dateTimeUTC,
  });

  const startDayTime = DateHelper.getDateWithString({
    date: toDay,
    hours: 18,
  }).dateObject;
  const endDayTime = DateHelper.getDateWithString({
    date: addDays(toDay, 1),
    hours: 6,
  }).dateObject;

  const startNightTime = DateHelper.getDateWithString({
    date: addDays(toDay, 1),
    hours: 6,
  }).dateObject;
  const endNightTime = DateHelper.getDateWithString({
    date: addDays(toDay, 1),
    hours: 17,
    minutes: 59,
  }).dateObject;

  const dayShifts = schedules?.filter((schedule) => {
    const startDate = new Date(schedule.start_datetime);
    return startDate >= startDayTime && startDate < endDayTime;
  });

  const nightShifts = schedules?.filter((schedule) => {
    const startDate = new Date(schedule.start_datetime);
    return startDate >= startNightTime && startDate < endNightTime;
  });

  console.log({
    dayShifts,
  });

  const copyUiToClipboard = async (
    elementRef: React.RefObject<HTMLDivElement | null>,
  ) => {
    if (!elementRef.current) return;

    try {
      // 1. Chuyển đổi thẻ HTML (DOM Node) thành dạng Blob (Binary Large Object)
      const blob = await toBlob(elementRef.current, {
        cacheBust: true,
        backgroundColor: "#ffffff", // Đảm bảo nền trắng, tránh bị trong suốt/đen nền
      });

      if (!blob) {
        toast.error("Lỗi khi tạo hình ảnh!");
        return;
      }

      // 2. Kiểm tra trình duyệt có hỗ trợ ghi ClipboardItem không
      if (navigator.clipboard && window.ClipboardItem) {
        const item = new ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([item]);

        toast.success(
          "Đã copy ÁNH vào Clipboard! Bạn có thể dán (Ctrl+V) vào Zalo/Messenger.",
        );
      } else {
        toast.error("Trình duyệt của bạn không hỗ trợ copy ảnh trực tiếp.");
      }
    } catch (error) {
      console.error("Lỗi copy ảnh:", error);
      toast.error("Không thể copy ảnh vào Clipboard.");
    }
  };

  const dayAndMonth = (isTomorow?: boolean) => {
    const now = isTomorow ? addDays(toDay, 1) : toDay;
    const day = now.getDate();
    const month = now.getMonth() + 1;
    return `${day}/${month}`;
  };

  useEffect(() => {
    const fetchCommand = async () => {
      const { data } = await supabaseClient
        .from("commands")
        .select(
          `
            *,
            employee:employees (*)
          `,
        )
        .lte("start_time", DateHelper.formatToUTC(toDay))
        .gte("end_time", DateHelper.formatToUTC(toDay));
      setCommand(data?.[0]);
    };

    const fetchDuty = async () => {
      const { data } = await supabaseClient
        .from("duties")
        .select(
          `
            *,
            employee:employees (*)
          `,
        )
        .lte("start_time", DateHelper.formatToUTC(toDay))
        .gte("end_time", DateHelper.formatToUTC(toDay));
      setDuty(data?.[0]);
    };

    fetchCommand();
    fetchDuty();
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon-sm">
          <Eye />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Ca trực hôm nay</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            Xem chi tiết ca trực ngày hôm nay{" "}
            <CopyButton
              variant="outline"
              size="xs"
              content="the heck"
              onClick={() => copyUiToClipboard(scheduleRef)}
            />
          </DialogDescription>
        </DialogHeader>
        <div
          ref={scheduleRef}
          className="flex flex-col border gap-2 p-2 text-xs"
        >
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-start">
              <div className="flex-1 flex flex-col gap-2 ">
                <span>Trực chỉ huy: {command?.employee.full_name}</span>
                <span>Trực ban: {duty?.employee.full_name}</span>
                <span>Trực bếp: Dũng</span>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <span>Trực chiến: </span>
                <span>Công tác: </span>
                <span>Nghỉ phép: [ ]</span>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <span>Vệ sinh</span>
                <span>
                  Phòng 1:{" "}
                  {`(${getStoredRoom1(storedRooms.phong1, new Date())?.full_name})`}
                </span>
                <span>
                  Phòng 3:{" "}
                  {`(${getStoredRoom3(storedRooms.phong1, new Date())?.full_name})`}
                </span>
                <span>
                  Hành lang:{" "}
                  {`(${getStoredToilet(storedRooms.phong1, new Date())?.full_name})`}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 flex flex-col gap-2">
                <span>Trực ngày: {dayAndMonth(true)}</span>
                {dayShifts?.map((shift) => {
                  return (
                    <span>
                      {
                        DateHelper.getDateWithString({
                          date: shift.start_datetime,
                        }).hourString
                      }
                      {" - "}
                      {
                        DateHelper.getDateWithString({
                          date: shift.end_datetime,
                        }).hourString
                      }
                      :{" "}
                      {shift.employees.map(
                        (emp) => `${emp.full_name.split(" ").pop()}, `,
                      )}
                    </span>
                  );
                })}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <span>Trực đêm: {dayAndMonth()}</span>
                {nightShifts?.map((shift) => {
                  return (
                    <span>
                      {
                        DateHelper.getDateWithString({
                          date: shift.start_datetime,
                        }).hourString
                      }
                      {" - "}
                      {DateHelper.getDateWithString({
                        date: shift.end_datetime,
                      }).hourString == "17"
                        ? "18"
                        : DateHelper.getDateWithString({
                            date: shift.end_datetime,
                          }).hourString}
                      :{" "}
                      {shift.employees.map(
                        (emp) => `${emp.full_name.split(" ").pop()}, `,
                      )}
                    </span>
                  );
                })}
              </div>
              <div className="flex-1"></div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleCaptureUI;
