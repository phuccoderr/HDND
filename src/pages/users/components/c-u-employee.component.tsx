import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EmployeeFormFields from "./employee-form-fields.component";
import {
  defaultEmployeeFormValues,
  employeeFormSchema,
  type EmployeeFormValues,
} from "./employee-form.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import {
  useInsertEmployee,
  useUpdateEmployee,
  type Employee,
} from "@/apis/employee.api";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingEmployee: Employee | null;
};

const CUEmployee = ({ open, onOpenChange, editingEmployee }: Props) => {
  const { mutateAsync: mutateInsert, isPending: insertIsPending } =
    useInsertEmployee();
  const { mutateAsync: mutateUpdate, isPending: updateIsPending } =
    useUpdateEmployee();
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: defaultEmployeeFormValues,
  });

  const resetForm = () => {
    form.reset(defaultEmployeeFormValues);
    onOpenChange(false);
  };

  const handleSubmit = async (values: EmployeeFormValues) => {
    if (editingEmployee) {
      try {
        await mutateUpdate({ id: editingEmployee.id, updatedFields: values });
        toast.success("Cập nhật nhân viên thành công", {
          description: values.full_name,
        });
        resetForm();
      } catch (error) {
        toast.error("Cập nhật nhân viên thất bại", {
          description: "Đã có lỗi xảy ra khi lưu thay đổi.",
        });
      } finally {
        return;
      }
    }

    try {
      await mutateInsert(values);
      toast.success("Thêm nhân viên thành công", {
        description: values.full_name,
      });
      resetForm();
    } catch (error) {
      toast.error("Thêm nhân viên thất bại", {
        description: "Đã có lỗi xảy ra khi lưu thông tin.",
      });
    }
  };

  useEffect(() => {
    if (editingEmployee) {
      form.reset({
        full_name: editingEmployee.full_name,
        type: editingEmployee.type,
      });
    }
  }, [editingEmployee]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingEmployee ? "Cập nhật nhân viên" : "Thêm nhân viên"}
          </DialogTitle>
        </DialogHeader>

        <form id="employee-form" onSubmit={form.handleSubmit(handleSubmit)}>
          <EmployeeFormFields control={form.control} />
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            form="employee-form"
            disabled={insertIsPending || updateIsPending}
          >
            {editingEmployee ? "Cập nhật" : "Thêm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CUEmployee;
