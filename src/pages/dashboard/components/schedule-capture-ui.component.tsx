import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, Eye } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { toBlob } from "html-to-image";
import { supabaseClient } from "@/apis/http.client";
import type { Command } from "@/apis/commands.api";
import { addDays } from "date-fns";
import type { Duty } from "@/apis/duties.api";
import { DateHelper } from "@/utils/date.util";
import { useSchedulesQuery } from "@/apis/schedules.api";

import { Spinner } from "@/components/ui/spinner";
import { useCleanRoomQuery } from "@/apis/clean_room.api";

const ScheduleCaptureUI = () => {
  const scheduleRef = useRef<HTMLDivElement>(null);
  const toDay = new Date();
  const { data: clean_room } = useCleanRoomQuery(1);

  const [loading, setLoading] = useState(false);
  const [command, setCommand] = useState<Command | null>();
  const [duty, setDuty] = useState<Duty | null>();
  const { data: schedules } = useSchedulesQuery({
    start_time: DateHelper.getDateWithString({ hours: 18 }).dateTimeUTC,
    end_time: DateHelper.getDateWithString({
      date: addDays(toDay, 1),
      hours: 18,
      minutes: 0,
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
    hours: 18,
    minutes: 0,
  }).dateObject;

  const dayShifts = schedules?.filter((schedule) => {
    const startDate = new Date(schedule.start_datetime);
    return startDate >= startDayTime && startDate < endDayTime;
  });

  const nightShifts = schedules?.filter((schedule) => {
    const startDate = new Date(schedule.start_datetime);
    return startDate >= startNightTime && startDate < endNightTime;
  });

  const copyUiToClipboard = async (
    elementRef: React.RefObject<HTMLDivElement | null>,
    fileName = "ca-truc.png",
  ) => {
    if (!elementRef.current) return;
    setLoading(true);
    try {
      const blob = await toBlob(elementRef.current, {
        cacheBust: true,
      });

      if (!blob) {
        toast.error("Lỗi khi tạo hình ảnh!");
        return;
      }

      // 2. Tạo đường dẫn URL tạm thời từ Blob
      const url = URL.createObjectURL(blob);

      // 3. Xử lý tải về bằng thẻ <a> ẩn
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // 4. Dọn dẹp DOM và bộ nhớ
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      toast.success("Đã tải ảnh thành công!");
    } catch (error) {
      console.error("Lỗi copy ảnh:", error);
      toast.error("Không thể copy ảnh vào Clipboard.");
    } finally {
      setLoading(false);
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ca trực hôm nay</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            Xem chi tiết ca trực ngày hôm nay{" "}
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => copyUiToClipboard(scheduleRef)}
              disabled={loading}
            >
              {loading ? <Spinner /> : <Download />}
            </Button>
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
                  Phòng 1: {`(${clean_room?.room1_employee?.full_name})`}
                </span>
                <span>
                  Phòng 3: {`(${clean_room?.room3_employee?.full_name})`}
                </span>
                <span>
                  Hành lang: {`(${clean_room?.toilet_employee?.full_name})`}
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
              <div className="hidden lg:flex-1"></div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleCaptureUI;
