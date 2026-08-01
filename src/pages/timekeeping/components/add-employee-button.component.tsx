import type { Employee } from "@/apis/employee.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMemo, useState } from "react";

export const AddEmployeeButton = ({
  candidates,
  onSelect,
}: {
  candidates: Employee[];
  onSelect: (employee: Employee) => void;
}) => {
  {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const filtered = useMemo(
      () =>
        candidates.filter((c) =>
          c.full_name.toLowerCase().includes(search.trim().toLowerCase()),
        ),
      [candidates, search],
    );

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            className="mt-1 w-full rounded-md h-6 border border-dashed border-border text-xs text-muted-foreground bg-background"
          >
            + Thêm
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="start">
          <Input
            autoFocus
            placeholder="Tìm nhân sự..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-2 h-8 text-xs"
          />
          <ScrollArea className="h-48">
            {filtered.length === 0 ? (
              <div className="px-2 py-1.5 text-xs text-slate-400">
                Không có kết quả
              </div>
            ) : (
              filtered.map((emp) => (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => {
                    onSelect(emp);
                    setSearch("");
                    setOpen(false);
                  }}
                  className="block w-full rounded px-2 py-1.5 text-left text-xs hover:bg-slate-100"
                >
                  {emp.full_name}
                </button>
              ))
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    );
  }
};

export function ExportWordButton({
  employees,
  onSelect,
}: {
  employees: Employee[];
  onSelect: (employee: Employee) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      employees.filter((c) =>
        c.full_name.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [employees, search],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline">
          Xuất Word theo nhân viên
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="end">
        <Input
          autoFocus
          placeholder="Tìm nhân sự..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2 h-8 text-xs"
        />
        <div className="max-h-56 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-2 py-1.5 text-xs text-slate-400">
              Không có kết quả
            </div>
          ) : (
            filtered.map((emp) => (
              <button
                key={emp.id}
                type="button"
                onClick={() => {
                  onSelect(emp);
                  setSearch("");
                  setOpen(false);
                }}
                className="block w-full rounded px-2 py-1.5 text-left text-xs hover:bg-slate-100"
              >
                {emp.full_name}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
