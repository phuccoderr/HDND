import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Spinner } from "@/components/ui/spinner";
import {
  scheduleFormSchema,
  defaultScheduleFormValues,
  type ScheduleFormValues,
} from "./schedule-form.schema";
import { ScheduleFormFields } from "./schedule-form-fields.component";
import { toast } from "sonner";
import {
  employeesByScheduleQueryKey,
  fetchEmployeesByScheduleFromDb,
  useInsertScheduleToEmployees,
} from "@/apis/employees_schedules.api";
import {
  setSchedules,
  useInsertSchedule,
  type Schedule,
} from "@/apis/schedules.api";
import { queryClient } from "@/lib/query-client";

const CreateSchedule = () => {
  const {
    data,
    mutateAsync: mutateInsert,
    isPending: insertIsPending,
  } = useInsertSchedule();
  const { mutateAsync: mutateInsertScheduleToEmployees } =
    useInsertScheduleToEmployees();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: defaultScheduleFormValues,
  });

  const onOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) form.reset(defaultScheduleFormValues);
  };

  const handleSubmit = async (values: ScheduleFormValues) => {
    const { employee_ids, ...schedule } = values;
    try {
      await mutateInsert(schedule);
      if (!data) return;

      const createdSchedule = data;
      const junctionData = employee_ids.map((emp_id) => ({
        schedule_id: createdSchedule.id,
        employee_id: Number(emp_id),
      }));

      await mutateInsertScheduleToEmployees(junctionData);

      const nextEmployees = await queryClient.fetchQuery({
        queryKey: employeesByScheduleQueryKey(createdSchedule.id),
        queryFn: () => fetchEmployeesByScheduleFromDb(createdSchedule.id),
      });

      const mappedSchedule = {
        ...createdSchedule,
        employees: nextEmployees,
      } as Schedule;

      setSchedules([mappedSchedule]);
      toast.success("Tạo sự kiện thành công");
      setIsOpen(false);
    } catch (error) {
      toast.error("Tạo sự kiện thất bại", {
        description: "Đã có lỗi xảy ra khi lưu vào cơ sở dữ liệu",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <span className="hidden lg:inline">+ Thêm sự kiện</span>
          <span className="lg:hidden">+</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm sự kiện</DialogTitle>
        </DialogHeader>
        <form
          id="create-schedule-form"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <ScheduleFormFields control={form.control} />
        </form>
        <DialogFooter className="items-center">
          <div className="flex items-center gap-1 ml-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset(defaultScheduleFormValues);
                setIsOpen(false);
              }}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              form="create-schedule-form"
              disabled={insertIsPending}
            >
              Lưu
              {insertIsPending && <Spinner aria-hidden="true" />}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSchedule;
