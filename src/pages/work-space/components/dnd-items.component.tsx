import { Badge } from "@/components/ui/badge";
import { GripVertical, Users } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import {
  DragDropProvider,
  useDroppable,
  type DragDropEventHandlers,
} from "@dnd-kit/react";
import { CollisionPriority } from "@dnd-kit/abstract";
import { move } from "@dnd-kit/helpers";
import { Feedback, PointerSensor, KeyboardSensor } from "@dnd-kit/dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getStoredRooms, setStoredRooms } from "@/stores/phong.store";

type Member = {
  id: number;
  full_name: string;
};

type RoomKey = "phong1" | "phong3";

const roomLabels: Record<RoomKey, string> = {
  phong1: "Phòng 1",
  phong3: "Phòng 3",
};

function MemberPill({
  roomKey,
  member,
  index,
}: {
  roomKey: RoomKey;
  member: Member;
  index: number;
}) {
  const { ref, isDragging } = useSortable({
    id: member.id,
    index,
    type: "member",
    accept: "member",
    plugins: [Feedback.configure({ feedback: "clone" })],
    group: roomKey,
  });

  return (
    <div
      ref={ref}
      data-dragging={isDragging}
      className="flex cursor-grab touch-none items-center gap-1 whitespace-nowrap rounded-full border border-border bg-white p-1.5 text-sm shadow-sm active:cursor-grabbing select-none"
    >
      <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-xs text-foreground font-medium">
        {member.full_name}
      </span>
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
  members: Member[];
}) {
  const { isDropTarget, ref } = useDroppable({
    id: roomKey,
    type: "room",
    accept: ["member"],
    collisionPriority: CollisionPriority.Low,
  });

  const style = isDropTarget ? { background: "#00000030" } : undefined;

  return (
    <Card>
      <CardHeader className="flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground">
          {roomLabels[roomKey]}
        </span>
        <Badge variant="secondary" className="gap-1 font-normal">
          <Users className="h-3 w-3" />
          {members.length}
        </Badge>
      </CardHeader>

      <CardContent
        ref={ref}
        style={style}
        className="flex flex-col gap-2 min-w-50"
      >
        {members.length === 0 ? (
          <span className="px-2 text-xs text-muted-foreground italic">
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

const DndItems = () => {
  const [items, setItems] = useState<Record<RoomKey, Member[]>>(() =>
    getStoredRooms(),
  );
  const [rooms] = useState(Object.keys(items));
  const snapshot = useRef(structuredClone(items));

  useEffect(() => {
    if (items) {
      setStoredRooms(items);
    }
  }, [items]);
  return (
    <DragDropProvider
      sensors={[
        PointerSensor.configure({
          activatorElements(source) {
            return [source.element, source.handle];
          },
        }),
        KeyboardSensor,
      ]}
      onDragStart={useCallback<DragDropEventHandlers["onDragStart"]>(() => {
        snapshot.current = structuredClone(items);
      }, [items])}
      onDragOver={useCallback<DragDropEventHandlers["onDragOver"]>((event) => {
        const { source } = event.operation;

        if (source?.type === "rooms") {
          // We can rely on optimistic sorting for columns
          return;
        }

        setItems((items) => move(items, event));
      }, [])}
      onDragEnd={useCallback<DragDropEventHandlers["onDragEnd"]>((event) => {
        if (event.canceled) {
          setItems(snapshot.current);
          return;
        }
      }, [])}
    >
      <div className="flex flex-row gap-5">
        {rooms.map((room) => {
          const members = items[room as RoomKey];
          return (
            <RoomRow key={room} roomKey={room as RoomKey} members={members} />
          );
        })}
      </div>
    </DragDropProvider>
  );
};

export default DndItems;
