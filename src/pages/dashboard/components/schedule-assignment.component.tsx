import {
  useInsertCommand,
  useUpdateCommand,
  type Command,
} from "@/apis/commands.api";
import { type Duty, useInsertDuty, useUpdateDuty } from "@/apis/duties.api";
import { type Employee, useEmployeesQuery } from "@/apis/employee.api";
import { supabaseClient } from "@/apis/http.client";
import { Button } from "@/components/ui/button";
import { AnimatedCalendar } from "@/components/ui/calender";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { SelectFieldWork } from "@/pages/work-space/components/select-field-work.component";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { UserRoundCog } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const ScheduleAssignment = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: employees } = useEmployeesQuery();

  const [empCommandId, setEmpCommandId] = useState("");
  const [empCommandEditing, setEmpCommandEditing] = useState<Command | null>();
  const [dateRangeCommand, setDateRangeCommand] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>();

  const [empDutyId, setEmpDutyId] = useState("");
  const [empDutyEditing, setEmpDutyEditing] = useState<Duty | null>();
  const [dateRangeDuty, setDateRangeDuty] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>();

  const toDay = new Date().toISOString();

  useEffect(() => {
    const fetchCommand = async () => {
      const { data, error } = await supabaseClient
        .from("commands")
        .select("*")
        .lte("start_time", toDay)
        .gte("end_time", toDay);

      if (error) {
        toast.error("Lỗi không tìm thấy chỉ huy");
        return;
      }
      const commands = data as Command[];
      if (commands && commands.length > 0) {
        const command = commands[0];

        setEmpCommandEditing(command);
        setEmpCommandId(String(command.employee_id));
        setDateRangeCommand({
          from: new Date(command.start_time.substring(0, 19).replace(" ", "T")),
          to: new Date(command.end_time.substring(0, 19).replace(" ", "T")),
        });
      }
    };

    const fetchDuty = async () => {
      const { data, error } = await supabaseClient
        .from("duties")
        .select("*")
        .lte("start_time", toDay)
        .gte("end_time", toDay);

      if (error) {
        toast.error("Lỗi không tìm thấy trực ban");
        return;
      }
      const duties = data as Duty[];
      if (duties && duties.length > 0) {
        const duty = duties[0];

        setEmpDutyEditing(duty);
        setEmpDutyId(String(duty.employee_id));
        setDateRangeDuty({
          from: new Date(duty.start_time.substring(0, 19).replace(" ", "T")),
          to: new Date(duty.end_time.substring(0, 19).replace(" ", "T")),
        });
      }
    };

    fetchCommand();
    fetchDuty();
  }, []);

  const { mutateAsync: mutateInsertCommand } = useInsertCommand();
  const { mutateAsync: mutateUpdateCommand } = useUpdateCommand();

  const { mutateAsync: mutateInsertDuty } = useInsertDuty();
  const { mutateAsync: mutateUpdateDuty } = useUpdateDuty();

  const employeeCommandItems = useMemo(() => {
    if (!employees) return [];
    return employees
      .filter((emp) => emp.type === "COMMAND")
      .map((emp) => ({ label: emp.full_name, value: String(emp.id) }));
  }, [employees]);

  const employeeDutyItems = useMemo(() => {
    if (!employees) return [];
    return employees
      .filter((emp) => emp.type === "DUTY")
      .map((emp) => ({ label: emp.full_name, value: String(emp.id) }));
  }, [employees]);

  const handleChangeCommand = (value: string) => {
    setEmpCommandId(value);
  };

  const handleChangeDuty = (value: string) => {
    setEmpDutyId(value);
  };

  const handleSaveAssignment = async () => {
    setLoading(true);
    try {
      // 1. Xử lý logic cho Command (Chỉ huy)
      if (empCommandEditing) {
        // Trường hợp Update
        await mutateUpdateCommand({
          id: empCommandEditing.id,
          payload: {
            employee_id: Number(empCommandId),
            start_time: format(
              dateRangeCommand?.from ?? new Date(),
              "yyyy-MM-dd'T'HH:mm:ss",
            ),
            end_time: format(
              dateRangeCommand?.to ?? new Date(),
              "yyyy-MM-dd'T'HH:mm:ss",
            ),
          },
        });
      } else if (empCommandId) {
        // Trường hợp Insert (Chỉ chạy khi có chọn employee_id và không phải đang Edit)
        await mutateInsertCommand({
          employee_id: Number(empCommandId),
          start_time: format(
            dateRangeCommand?.from ?? new Date(),
            "yyyy-MM-dd'T'HH:mm:ss",
          ),
          end_time: format(
            dateRangeCommand?.to ?? new Date(),
            "yyyy-MM-dd'T'HH:mm:ss",
          ),
        });
      }

      // 2. Xử lý logic cho Duty (Trực ban)
      if (empDutyEditing) {
        // Trường hợp Update
        await mutateUpdateDuty({
          id: empDutyEditing.id,
          payload: {
            employee_id: Number(empDutyId),
            start_time: format(
              dateRangeDuty?.from ?? new Date(),
              "yyyy-MM-dd'T'HH:mm:ss",
            ),
            end_time: format(
              dateRangeDuty?.to ?? new Date(),
              "yyyy-MM-dd'T'HH:mm:ss",
            ),
          },
        });
      } else if (empDutyId) {
        // Trường hợp Insert (Chỉ chạy khi có chọn employee_id và không phải đang Edit)
        await mutateInsertDuty({
          employee_id: Number(empDutyId),
          start_time: format(
            dateRangeDuty?.from ?? new Date(),
            "yyyy-MM-dd'T'HH:mm:ss",
          ),
          end_time: format(
            dateRangeDuty?.to ?? new Date(),
            "yyyy-MM-dd'T'HH:mm:ss",
          ),
        });
      }

      // Sau khi thực hiện xong tất cả các thao tác thành công:
      setOpen(false);
      toast.success("Điều chỉnh chức vụ thành công");
    } catch (error) {
      console.error("Lỗi lưu dữ liệu:", error);
      toast.error("Lỗi không thể lưu cơ sở dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon-sm" onClick={() => setOpen(false)}>
          <UserRoundCog />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quản lý chức vụ</DialogTitle>
          <DialogDescription>
            Điều chỉnh thành viên quản lý trực ban, chỉ huy
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="command">Chỉ huy</FieldLabel>
            <div className="flex gap-2">
              <SelectFieldWork
                onValueChange={handleChangeCommand}
                items={employeeCommandItems}
                value={empCommandId}
              />
              <AnimatedCalendar
                mode="range"
                showTime
                locale={vi}
                value={dateRangeCommand}
                onChange={setDateRangeCommand}
              />
            </div>
          </Field>
          <Field>
            <FieldLabel htmlFor="duty">Trực ban</FieldLabel>
            <div className="flex gap-2">
              <SelectFieldWork
                onValueChange={handleChangeDuty}
                items={employeeDutyItems}
                value={empDutyId}
              />
              <AnimatedCalendar
                mode="range"
                showTime
                locale={vi}
                value={dateRangeDuty}
                onChange={setDateRangeDuty}
              />
            </div>
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button onClick={handleSaveAssignment} disabled={loading}>
            Lưu
            {loading && <Spinner aria-hidden="true" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleAssignment;
