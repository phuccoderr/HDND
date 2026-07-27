import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  setSchedules,
  useDeleteSchedule,
  useUpdateSchedule,
  type Schedule,
} from "@/apis/schedules.api";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  scheduleFormSchema,
  type ScheduleFormValues,
} from "./schedule-form.schema";
import { ScheduleFormFields } from "./schedule-form-fields.component";
import {
  employeesByScheduleQueryKey,
  fetchEmployeesByScheduleFromDb,
  useUpdateEmployeesBySchedule,
} from "@/apis/employees_schedules.api";
import { queryClient } from "@/lib/query-client";

type Props = {
  schedule: Schedule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const scheduleToFormValues = (schedule: Schedule): ScheduleFormValues => ({
  title: schedule.title,
  note: schedule.note ?? "",
  color: schedule.color,
  is_all_day: schedule.is_all_day ?? false,
  start_datetime: schedule.start_datetime.substring(0, 19).replace(" ", "T"),
  end_datetime: schedule.end_datetime.substring(0, 19).replace(" ", "T"),
  employee_ids: schedule.employees.map((emp) => String(emp.id)),
  is_updated: schedule.is_updated,
});

const UpdateSchedule = ({ schedule, open, onOpenChange }: Props) => {
  const { mutateAsync: mutateUpdate, isPending: updateIsPending } =
    useUpdateSchedule();

  const { mutateAsync: mutateDelete, isPending: deleteIsPending } =
    useDeleteSchedule();
  const { mutateAsync: mutateUpdateEmployeesBySchedule } =
    useUpdateEmployeesBySchedule();

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      title: "",
      note: "",
      color: "blue",
      is_all_day: false,
      start_datetime: "",
      end_datetime: "",
    },
  });

  // đổ dữ liệu vào form mỗi khi người dùng chọn 1 sự kiện khác để sửa
  useEffect(() => {
    if (schedule) form.reset(scheduleToFormValues(schedule));
  }, [schedule, form]);

  const handleSubmit = async (values: ScheduleFormValues) => {
    if (!schedule) return;
    const { employee_ids, ...scheduleBody } = values;
    let step: "schedule" | "employees" | "refresh" = "schedule";

    try {
      await mutateUpdate({ id: schedule.id, updatedFields: scheduleBody });
      step = "employees";

      const junctionData = employee_ids.map((emp_id) => ({
        schedule_id: schedule.id,
        employee_id: Number(emp_id),
      }));

      await mutateUpdateEmployeesBySchedule({
        scheduleId: schedule.id,
        newJunctionData: junctionData,
      });
      step = "refresh";

      const nextEmployees = await queryClient.fetchQuery({
        queryKey: employeesByScheduleQueryKey(schedule.id),
        queryFn: () => fetchEmployeesByScheduleFromDb(schedule.id),
      });
      const newUpdatedSchedule = {
        ...schedule,
        ...scheduleBody,
        employees: nextEmployees,
      };
      setSchedules((prev) =>
        prev.map((s) =>
          s.id === newUpdatedSchedule.id ? { ...s, ...newUpdatedSchedule } : s,
        ),
      );
      toast.success("Cập nhật sự kiện thành công");
      onOpenChange(false);
    } catch (error) {
      if (step === "schedule") {
        toast.error("Cập nhật sự kiện thất bại", {
          description: "Đã có lỗi xảy ra khi lưu vào cơ sở dữ liệu",
        });
      } else if (step === "employees") {
        toast.error("Cập nhật nhân sự thất bại", {
          description: "Đã có lỗi xảy ra khi lưu các nhân sự liên quan",
        });
      } else {
        toast.error("Làm mới dữ liệu thất bại", {
          description: "Vui lòng tải lại trang để xem dữ liệu mới nhất",
        });
      }
    }
  };

  const handleDelete = async () => {
    if (!schedule) return;

    try {
      await mutateDelete(schedule.id);
      setSchedules((prev) => prev.filter((s) => s.id !== schedule.id));
      toast.success("Đã xóa sự kiện");
      onOpenChange(false);
    } catch (error) {
      toast.error("Xóa sự kiện thất bại", {
        description: "Đã có lỗi xảy ra khi xóa khỏi cơ sở dữ liệu",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật sự kiện</DialogTitle>
        </DialogHeader>
        <form
          id="update-schedule-form"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <ScheduleFormFields control={form.control} />
        </form>
        <DialogFooter className="items-center justify-between!">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                size="icon-sm"
                variant="destructive"
                disabled={deleteIsPending}
              >
                {deleteIsPending ? <Spinner aria-hidden="true" /> : <Trash2 />}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xóa sự kiện này?</AlertDialogTitle>
                <AlertDialogDescription>
                  Hành động này không thể hoàn tác. Sự kiện "{schedule?.title}"
                  sẽ bị xóa vĩnh viễn.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              form="update-schedule-form"
              disabled={updateIsPending}
            >
              Lưu
              {updateIsPending && <Spinner aria-hidden="true" />}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateSchedule;
