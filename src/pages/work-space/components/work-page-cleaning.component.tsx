import {
  SelectFieldWork,
  type SelectFieldItem,
} from "./select-field-work.component";
import DndItems from "./dnd-items.component";
import type { RoomMember } from "./work-page.types";

type Props = {
  empRoom1: RoomMember | null;
  empRoom3: RoomMember | null;
  empToilet: RoomMember | null;
  empsRoom1Options: SelectFieldItem[];
  empsRoom3Options: SelectFieldItem[];
  onSetRoom1: (value: string) => void;
  onSetRoom3: (value: string) => void;
  onSetToilet: (value: string) => void;
};

export default function WorkCleaningPanel({
  empRoom1,
  empRoom3,
  empToilet,
  empsRoom1Options,
  empsRoom3Options,
  onSetRoom1,
  onSetRoom3,
  onSetToilet,
}: Props) {
  return (
    <section className="border rounded-sm bg-white p-3 text-[12px]">
      <div className="space-y-3">
        <span className="font-medium">Vệ sinh:</span>

        <div className="grid gap-2 grid-cols-2">
          <div className="flex items-center gap-1">
            <span className="font-medium">Phòng 1:</span>
            <SelectFieldWork
              onValueChange={onSetRoom1}
              items={empsRoom1Options}
              value={String(empRoom1?.id ?? "")}
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">Nhà vệ sinh:</span>
            <SelectFieldWork
              onValueChange={onSetToilet}
              items={empsRoom3Options}
              value={String(empToilet?.id ?? "")}
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">Phòng 3:</span>
            <SelectFieldWork
              onValueChange={onSetRoom3}
              items={empsRoom3Options}
              value={String(empRoom3?.id ?? "")}
            />
          </div>
        </div>
      </div>

      <div className="mt-3">
        <DndItems />
      </div>
    </section>
  );
}
