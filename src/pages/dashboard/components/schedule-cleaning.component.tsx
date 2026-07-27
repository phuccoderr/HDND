import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DndItems from "@/pages/work-space/components/dnd-items.component";
import { SelectFieldWork } from "@/pages/work-space/components/select-field-work.component";
import {
  getStoredRoom1,
  getStoredRoom3,
  getStoredRooms,
  getStoredToilet,
  setStoredRoom1,
  setStoredRoom3,
  setStoredToilet,
  type Member,
} from "@/stores/phong.store";
import { BrushCleaning } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const ScheduleCleaning = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [cleanerRoom1, setCleanerRoom1] = useState<Member | null>(null);
  const [cleanerRoom3, setCleanerRoom3] = useState<Member | null>(null);
  const [cleanerToilet, setCleanerToilet] = useState<Member | null>(null);

  const storedRooms = useMemo(() => getStoredRooms(), []);

  const empsRoom3Options = storedRooms.phong3.map((emp) => ({
    label: emp.full_name,
    value: String(emp.id),
  }));

  const empsRoom1Options = storedRooms.phong1.map((emp) => ({
    label: emp.full_name,
    value: String(emp.id),
  }));

  const handleSetRoom1 = (roomId: string) => {
    const member = getStoredRooms().phong1.find(
      (emp) => emp.id === Number(roomId),
    );
    if (member) {
      setStoredRoom1(member, new Date());
      setCleanerRoom1(member);
    }
  };

  const handleSetRoom3 = (roomId: string) => {
    const member = getStoredRooms().phong3.find(
      (emp) => emp.id === Number(roomId),
    );
    if (member) {
      setStoredRoom3(member, new Date());
      setCleanerRoom3(member);
    }
  };

  const handleSetToilet = (roomId: string) => {
    const member = getStoredRooms().phong3.find(
      (emp) => emp.id === Number(roomId),
    );
    if (member) {
      setStoredToilet(member, new Date());
      setCleanerToilet(member);
    }
  };

  useEffect(() => {
    const todayCleanerRoom1 = getStoredRoom1(storedRooms.phong1, new Date());
    const todayCleanerRoom3 = getStoredRoom3(storedRooms.phong3, new Date());
    const todayCleanerToilet = getStoredToilet(storedRooms.phong3, new Date());

    setCleanerRoom1(todayCleanerRoom1);
    setCleanerRoom3(todayCleanerRoom3);
    setCleanerToilet(todayCleanerToilet);
  }, [selectedDate, storedRooms]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon-sm">
          <BrushCleaning />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tạo ca vệ sinh</DialogTitle>
          <DialogDescription>Sắp xếp nhanh ca trực vệ sinh</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <div className="flex-1">
            <div className="grid gap-2 grid-cols-2">
              <div className="flex items-center gap-1">
                <span className="font-medium">Phòng 1:</span>
                <SelectFieldWork
                  onValueChange={handleSetRoom1}
                  items={empsRoom1Options}
                  value={String(cleanerRoom1?.id ?? "")}
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">Nhà vệ sinh:</span>
                <SelectFieldWork
                  onValueChange={handleSetToilet}
                  items={empsRoom3Options}
                  value={String(cleanerToilet?.id ?? "")}
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">Phòng 3:</span>
                <SelectFieldWork
                  onValueChange={handleSetRoom3}
                  items={empsRoom3Options}
                  value={String(cleanerRoom3?.id ?? "")}
                />
              </div>
            </div>
          </div>

          <div className="flex-1">
            <DndItems />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleCleaning;
