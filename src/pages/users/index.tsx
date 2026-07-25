import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useDeleteEmployee,
  useEmployeesQuery,
  type Employee,
} from "@/apis/employee.api";
import {
  AnimatedTable,
  type ColumnDef,
  type SortDirection,
} from "@/components/ui/animated-table";
import { Button } from "@/components/ui/button";
import CUEmployee from "./components/c-u-employee.component";
import { employeeTypes } from "./components/employee-form.schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const getEmployeeTypeLabel = (type: Employee["type"]) => {
  return employeeTypes.find((item) => item.value === type)?.label ?? type;
};

const UserPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("full_name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const { data: employees, isLoading: empIsLoading } = useEmployeesQuery();
  const { mutateAsync: empMutateDelete } = useDeleteEmployee();

  const openCreateDialog = () => {
    setIsOpen(true);
  };

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsOpen(true);
  };

  const openEditDelete = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsOpenDelete(true);
  };

  const handleDelete = async () => {
    if (!editingEmployee) return;
    try {
      await empMutateDelete(editingEmployee.id);

      toast.success("Xóa nhân viên thành công", {
        description: editingEmployee.full_name,
      });
    } catch (error) {
      toast.error("Xóa nhân viên thất bại", {
        description: "Đã có lỗi xảy ra khi xóa thông tin.",
      });
    }
  };

  const filteredEmployees = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    const nextEmployees = [...(employees ?? [])];

    const sorted = nextEmployees
      .filter((employee) => {
        if (!query) return true;

        const searchableText =
          `${employee.full_name} ${getEmployeeTypeLabel(employee.type)}`.toLowerCase();
        return searchableText.includes(query);
      })
      .sort((a, b) => {
        const left = a[sortColumn as keyof Employee];
        const right = b[sortColumn as keyof Employee];
        const leftValue = String(left).toLowerCase();
        const rightValue = String(right).toLowerCase();

        if (leftValue < rightValue) {
          return sortDirection === "asc" ? -1 : 1;
        }

        if (leftValue > rightValue) {
          return sortDirection === "asc" ? 1 : -1;
        }

        return 0;
      });

    return sorted;
  }, [employees, searchValue, sortColumn, sortDirection]);

  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        id: "full_name",
        header: "Họ và tên",
        accessorKey: "full_name",
        sortable: true,
        cell: (row) => <span>{row.full_name}</span>,
      },
      {
        id: "type",
        header: "Loại",
        accessorKey: "type",
        sortable: true,
        cell: (row) => <span>{getEmployeeTypeLabel(row.type)}</span>,
      },
      {
        id: "actions",
        header: "Thao tác",
        align: "right",
        hideable: false,
        cell: (row) => (
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => openEditDialog(row)}
            >
              <Pencil className="mr-1 h-4 w-4" />
              Sửa
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => openEditDelete(row)}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Xóa
            </Button>
          </div>
        ),
      },
    ],
    [employees],
  );

  const handleSort = (columnId: string, direction: SortDirection) => {
    setSortColumn(columnId);
    setSortDirection(direction);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Quản lý nhân viên</h1>
          <p className="text-sm text-muted-foreground">
            Thêm, sửa và xóa thông tin nhân viên trong hệ thống.
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm nhân viên
        </Button>
      </div>

      <AnimatedTable
        data={filteredEmployees}
        columns={columns}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        searchable
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Tìm theo tên hoặc loại"
        loading={empIsLoading}
        emptyMessage="Chưa có nhân viên nào"
      />
      <CUEmployee
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          setEditingEmployee(null);
        }}
        editingEmployee={editingEmployee}
      />
      <AlertDialog open={isOpenDelete} onOpenChange={setIsOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa thành viên này?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. thành viên "
              {editingEmployee?.full_name}" sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserPage;
