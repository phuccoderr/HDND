import { differenceInDays, format, startOfDay } from "date-fns";

const STORAGE_KEY = "rooms_data";
const STORAGE_KEY_ROOM1 = "room_1";
const STORAGE_KEY_ROOM3 = "room_3";
const STORAGE_KEY_TOILET = "toilet";

export type Member = {
  id: number;
  full_name: string;
};

type RoomKey = "phong1" | "phong3";

const initialRooms: Record<RoomKey, Member[]> = {
  phong1: [
    { id: 7, full_name: "Phúc" },
    { id: 8, full_name: "Trung" },
    { id: 9, full_name: "Huy" },
    { id: 10, full_name: "Tấn" },
    { id: 11, full_name: "Hưởng" },
  ],
  phong3: [
    { id: 1, full_name: "Khải" },
    { id: 2, full_name: "Quang" },
    { id: 3, full_name: "Vũ" },
    { id: 4, full_name: "Dũng" },
    { id: 5, full_name: "Nhựt" },
    { id: 6, full_name: "Duy" },
  ],
};

export const getStoredRooms = (): Record<RoomKey, Member[]> => {
  try {
    const data = window.localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : initialRooms;
  } catch (error) {
    console.error("Lỗi đọc dữ liệu từ localStorage:", error);
    return initialRooms;
  }
};

export const setStoredRooms = (items: Record<RoomKey, Member[]>) => {
  try {
    // Chuyển Object/Array thành chuỗi JSON rồi mới lưu
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Lỗi khi lưu dữ liệu vào localStorage:", error);
  }
};

const START_DATE_ROOM1 = new Date("2026-07-27");

export const getCleaner = (
  roomMembers: Member[],
  targetDate: Date = new Date(),
): Member | null => {
  if (!roomMembers || roomMembers.length === 0) return null;

  // Tính khoảng cách số ngày từ START_DATE đến targetDate
  const daysDiff = differenceInDays(
    startOfDay(targetDate),
    startOfDay(START_DATE_ROOM1),
  );

  const index =
    ((daysDiff % roomMembers.length) + roomMembers.length) % roomMembers.length;

  return roomMembers[index];
};

const getOverridesFromStorage = (
  storageKey: string,
): Record<string, Member> => {
  try {
    const data = window.localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error(`Lỗi đọc ${storageKey} từ localStorage:`, error);
    return {};
  }
};

const setOverrideToStorage = (
  storageKey: string,
  targetDate: Date,
  member: Member,
) => {
  try {
    const dateKey = format(targetDate, "yyyy-MM-dd");
    const currentMap = getOverridesFromStorage(storageKey);
    currentMap[dateKey] = member;
    window.localStorage.setItem(storageKey, JSON.stringify(currentMap));
  } catch (error) {
    console.error(`Lỗi khi lưu ${storageKey} vào localStorage:`, error);
  }
};

export const getStoredRoom1 = (
  roomMembers: Member[],
  targetDate: Date = new Date(),
): Member | null => {
  const dateKey = format(targetDate, "yyyy-MM-dd");
  const overrides = getOverridesFromStorage(STORAGE_KEY_ROOM1);

  // Nếu ngày này có chọn đè -> Trả về người chọn đè
  if (overrides[dateKey]) {
    return overrides[dateKey];
  }

  // Nếu không -> Tính tự động xoay vòng
  return getCleaner(roomMembers, targetDate);
};

export const setStoredRoom1 = (item: Member, targetDate: Date = new Date()) => {
  setOverrideToStorage(STORAGE_KEY_ROOM1, targetDate, item);
};

export const getStoredRoom3 = (
  roomMembers: Member[],
  targetDate: Date = new Date(),
): Member | null => {
  const dateKey = format(targetDate, "yyyy-MM-dd");
  const overrides = getOverridesFromStorage(STORAGE_KEY_ROOM3);

  if (overrides[dateKey]) {
    return overrides[dateKey];
  }

  return getCleaner(roomMembers, targetDate);
};

export const setStoredRoom3 = (item: Member, targetDate: Date = new Date()) => {
  setOverrideToStorage(STORAGE_KEY_ROOM3, targetDate, item);
};

export const getStoredToilet = (
  roomMembers: Member[],
  targetDate: Date = new Date(),
): Member | null => {
  const dateKey = format(targetDate, "yyyy-MM-dd");
  const overrides = getOverridesFromStorage(STORAGE_KEY_TOILET);

  if (overrides[dateKey]) {
    return overrides[dateKey];
  }

  return getCleaner(roomMembers, targetDate);
};

export const setStoredToilet = (
  item: Member,
  targetDate: Date = new Date(),
) => {
  setOverrideToStorage(STORAGE_KEY_TOILET, targetDate, item);
};
