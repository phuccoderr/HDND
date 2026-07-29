import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import DndRoom from "@/pages/dashboard/components/dnd-room.component";
import { SelectCommon } from "@/components/select-common.component";

import { BrushCleaning } from "lucide-react";
import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { useEmployeesQuery } from "@/apis/employee.api";
import { useCleanRoomQuery, useUpdateCleanRoom } from "@/apis/clean_room.api";
import { toast } from "sonner";

const ScheduleCleaning = () => {
  const { data: clean_room } = useCleanRoomQuery(1);
  const { mutateAsync: mutateUpdateCleanRoom } = useUpdateCleanRoom();
  const { data: employees } = useEmployeesQuery();

  const empRoom1Options = useMemo(() => {
    return employees
      ?.filter((emp) => emp.room == "ROOM1")
      .map((emp) => ({
        label: emp.full_name,
        value: String(emp.id),
      }));
  }, [employees]);

  const empRoom3Options = useMemo(() => {
    return employees
      ?.filter((emp) => emp.room == "ROOM3")
      .map((emp) => ({
        label: emp.full_name,
        value: String(emp.id),
      }));
  }, [employees]);

  const handleSetRoom1 = async (empId: string) => {
    try {
      await mutateUpdateCleanRoom({
        id: 1,
        payload: {
          room1_employee_id: Number(empId),
        },
      });
      toast.success("Thay đổi vệ sinh phòng 1 thành công");
    } catch (error) {
      toast.error("Lỗi thao tác đổi người dọn vệ sinh phòng 1");
    }
  };

  const handleSetRoom3 = async (empId: string) => {
    try {
      await mutateUpdateCleanRoom({
        id: 1,
        payload: {
          room3_employee_id: Number(empId),
        },
      });
      toast.success("Thay đổi vệ sinh phòng 3 thành công");
    } catch (error) {
      toast.error("Lỗi thao tác đổi người dọn vệ sinh phòng 3");
    }
  };

  const handleSetToilet = async (empId: string) => {
    try {
      await mutateUpdateCleanRoom({
        id: 1,
        payload: {
          toilet_employee_id: Number(empId),
        },
      });
      toast.success("Thay đổi vệ sinh hành lang thành công");
    } catch (error) {
      toast.error("Lỗi thao tác đổi người dọn vệ sinh hành lang");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon-sm">
          <BrushCleaning />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tạo ca vệ sinh</DialogTitle>
          <DialogDescription>Sắp xếp nhanh ca trực vệ sinh</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-100">
          <div className="flex flex-col gap-2">
            <div className="flex-1">
              <div className="grid gap-2 grid-cols-2">
                <div className="flex items-center gap-1">
                  <Label className="font-medium">Phòng 1:</Label>
                  <SelectCommon
                    onValueChange={handleSetRoom1}
                    items={empRoom1Options ?? []}
                    value={String(clean_room?.room1_employee_id ?? "")}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Label className="font-medium">Nhà vệ sinh:</Label>
                  <SelectCommon
                    onValueChange={handleSetToilet}
                    items={empRoom1Options ?? []}
                    value={String(clean_room?.toilet_employee_id ?? "")}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Label className="font-medium">Phòng 3:</Label>
                  <SelectCommon
                    onValueChange={handleSetRoom3}
                    items={empRoom3Options ?? []}
                    value={String(clean_room?.room3_employee_id ?? "")}
                  />
                </div>
              </div>
            </div>

            <div className="flex-1">
              <DndRoom />
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleCleaning;
