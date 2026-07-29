import { Badge } from "@/components/ui/badge";
import { GripVertical, Users } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/react/sortable";
import {
  DragDropProvider,
  DragOverlay,
  useDragDropMonitor,
  useDroppable,
  type DragDropEventHandlers,
} from "@dnd-kit/react";
import { CollisionPriority } from "@dnd-kit/abstract";
import { move } from "@dnd-kit/helpers";
import {
  Feedback,
  PointerSensor,
  KeyboardSensor,
  PointerActivationConstraints,
} from "@dnd-kit/dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { RestrictToWindow } from "@dnd-kit/dom/modifiers";
import {
  useEmployeesQuery,
  useUpdateEmployees,
  type Employee,
} from "@/apis/employee.api";
import { toast } from "sonner";

type RoomKey = "ROOM1" | "ROOM3";

const roomLabels: Record<RoomKey, string> = {
  ROOM1: "Phòng 1",
  ROOM3: "Phòng 3",
};

function MemberPillContent({ member }: { member: Employee }) {
  return (
    <div className="flex items-center gap-1 whitespace-nowrap rounded-full  bg-background h-6 select-none">
      <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
      <Label className="text-foreground font-medium">{member.full_name}</Label>
    </div>
  );
}

function MemberPill({
  roomKey,
  member,
  index,
}: {
  roomKey: RoomKey;
  member: Employee;
  index: number;
}) {
  const { ref, isDragging } = useSortable({
    id: member.id,
    index: index,
    type: "member",
    accept: "member",
    // plugins: [Feedback.configure({ feedback: "clone" })],
    group: roomKey,
    data: { roomKey, member: { ...member, index: index } },
  });

  return (
    <div
      ref={ref}
      data-dragging={isDragging}
      style={{ touchAction: "none" }}
      className={cn(
        "flex cursor-grab touch-none items-center gap-1 whitespace-nowrap rounded-full border border-border bg-background p-1.5 text-[12px] shadow-sm active:cursor-grabbing select-none",
        isDragging && "opacity-40 border-dashed",
      )}
    >
      <span>index: {index}</span>
      <MemberPillContent member={member} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  RoomRow: 1 hàng ngang cho mỗi phòng                                       */
/* -------------------------------------------------------------------------- */

function RoomRow({
  roomKey,
  members,
}: {
  roomKey: RoomKey;
  members: Employee[];
}) {
  const { ref } = useDroppable({
    id: roomKey,
    type: "room",
    accept: ["member"],
    collisionPriority: CollisionPriority.Low,
    data: { roomKey },
  });

  const [activeRoomKey, setActiveRoomKey] = useState<RoomKey | null>(null);
  const [isDrag, setIsDrag] = useState(false);

  useDragDropMonitor({
    onDragOver(event) {
      const target = event.operation.target;
      // target?.id có thể là roomKey (khi đè lên vùng trống)
      // hoặc là member.id (khi đè lên 1 pill) -> lấy roomKey từ data
      const roomKey = (target?.data?.roomKey as RoomKey | undefined) ?? null;

      setActiveRoomKey(roomKey);
    },
    onDragEnd() {
      setActiveRoomKey(null);
      setIsDrag(false);
    },
    onDragStart() {
      setIsDrag(true);
    },
  });

  const isDropTarget = activeRoomKey === roomKey;

  return (
    <Card className="flex-1 border">
      <CardHeader className="flex items-center gap-2">
        <span className="text-[12px] font-semibold text-foreground">
          {roomLabels[roomKey]}
        </span>
        <Badge variant="secondary" className="gap-1 font-normal text-[12px]">
          <Users className="h-3 w-3" />
          {members.length}
        </Badge>
      </CardHeader>

      <CardContent
        ref={ref}
        className={cn(
          "flex flex-col gap-2 min-w-50 my-2",
          isDropTarget && "bg-sky-100/70 opacity-70",
          isDrag && "border border-dashed border-sky-300 rounded",
        )}
      >
        {members.length === 0 ? (
          <span className="px-2 text-[12px] text-muted-foreground italic">
            Kéo thành viên vào đây
          </span>
        ) : (
          members.map((member, index) => (
            <MemberPill
              key={`${roomKey}-${member.id}`}
              member={member}
              roomKey={roomKey}
              index={index}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

const DndRoom = () => {
  const { data: employees } = useEmployeesQuery();
  const { mutateAsync: mutateUpdateEmps } = useUpdateEmployees();

  const [items, setItems] = useState<Record<RoomKey, Employee[]>>({
    ROOM1: [],
    ROOM3: [],
  });

  const [rooms] = useState(Object.keys(items));
  const snapshot = useRef(structuredClone(items));

  const [activeMember, setActiveMember] = useState<Employee | null>(null);

  useEffect(() => {
    if (employees) {
      const sortByOrder = (a: Employee, b: Employee) =>
        (a.order ?? 0) - (b.order ?? 0);
      const room1 = employees
        .filter((emp) => emp.room === "ROOM1")
        .sort(sortByOrder);
      const room3 = employees
        .filter((emp) => emp.room === "ROOM3")
        .sort(sortByOrder);

      setItems({
        ROOM1: room1,
        ROOM3: room3,
      });
    }
  }, [employees]);

  return (
    <DragDropProvider
      sensors={[
        PointerSensor.configure({
          activatorElements(source) {
            return [source.element, source.handle];
          },
          activationConstraints: (event, _) => {
            if (event.pointerType === "touch") {
              // Longer delay for touch to avoid hijacking scroll gestures
              return [
                new PointerActivationConstraints.Delay({
                  value: 150,
                  tolerance: 5,
                }),
              ];
            }

            // Mouse and pen: 5px movement threshold
            return [new PointerActivationConstraints.Distance({ value: 5 })];
          },
        }),
        KeyboardSensor,
      ]}
      plugins={(defaults) => [
        ...defaults,
        Feedback.configure({ dropAnimation: null }),
      ]}
      modifiers={(defaults) => [...defaults, RestrictToWindow]}
      onDragStart={useCallback<DragDropEventHandlers["onDragStart"]>(
        (event) => {
          snapshot.current = structuredClone(items);

          const { source } = event.operation;
          const member = source?.data.member as Employee;
          setActiveMember(member);
        },
        [items],
      )}
      onDragOver={useCallback<DragDropEventHandlers["onDragOver"]>((event) => {
        const { source } = event.operation;

        if (source?.type === "rooms") {
          // We can rely on optimistic sorting for columns
          return;
        }

        setItems((items) => move(items, event));
      }, [])}
      onDragEnd={useCallback<DragDropEventHandlers["onDragEnd"]>(
        async (event) => {
          if (event.canceled) {
            setItems(snapshot.current);
            return;
          }
          setActiveMember(null);

          const rooms1 = items.ROOM1.map((prev, index) => ({
            ...prev,
            room: "ROOM1" as RoomKey,
            order: index + 1,
          }));
          const rooms3 = items.ROOM3.map((prev, index) => ({
            ...prev,
            room: "ROOM3" as RoomKey,
            order: index + 1,
          }));
          const allEmployees = [...(rooms1 ?? []), ...(rooms3 ?? [])];

          await mutateUpdateEmps({
            updatedEmployees: allEmployees,
          });

          toast.success("Cập nhật danh sách thành công");
        },
        [items],
      )}
    >
      <div className="flex flex-col gap-2 lg:flex-row">
        {rooms.map((room) => {
          const members = items[room as RoomKey];
          return (
            <RoomRow key={room} roomKey={room as RoomKey} members={members} />
          );
        })}
      </div>
      <DragOverlay>
        {activeMember ? <MemberPillContent member={activeMember} /> : null}
      </DragOverlay>
    </DragDropProvider>
  );
};

export default DndRoom;
