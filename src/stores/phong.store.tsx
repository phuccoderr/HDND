const STORAGE_KEY = "rooms_data";
const STORAGE_KEY_ROOM1 = "room_1";
const STORAGE_KEY_ROOM3 = "room_3";
const STORAGE_KEY_TOILET = "toilet";

type Member = {
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
    { id: 12, full_name: "Bảo" },
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

export const getStoredRoom1 = (): Member | null => {
  try {
    const data = window.localStorage.getItem(STORAGE_KEY_ROOM1);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Lỗi đọc dữ liệu từ localStorage:", error);
    return null;
  }
};

export const setStoredRoom1 = (item: Member) => {
  try {
    // Chuyển Object/Array thành chuỗi JSON rồi mới lưu
    window.localStorage.setItem(STORAGE_KEY_ROOM1, JSON.stringify(item));
  } catch (error) {
    console.error("Lỗi khi lưu dữ liệu vào localStorage:", error);
  }
};

export const getStoredRoom3 = (): Member | null => {
  try {
    const data = window.localStorage.getItem(STORAGE_KEY_ROOM3);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Lỗi đọc dữ liệu từ localStorage:", error);
    return null;
  }
};

export const setStoredRoom3 = (item: Member) => {
  try {
    // Chuyển Object/Array thành chuỗi JSON rồi mới lưu
    window.localStorage.setItem(STORAGE_KEY_ROOM3, JSON.stringify(item));
  } catch (error) {
    console.error("Lỗi khi lưu dữ liệu vào localStorage:", error);
  }
};

export const getStoredToilet = (): Member | null => {
  try {
    const data = window.localStorage.getItem(STORAGE_KEY_TOILET);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Lỗi đọc dữ liệu từ localStorage:", error);
    return null;
  }
};

export const setStoredToilet = (item: Member) => {
  try {
    // Chuyển Object/Array thành chuỗi JSON rồi mới lưu
    window.localStorage.setItem(STORAGE_KEY_TOILET, JSON.stringify(item));
  } catch (error) {
    console.error("Lỗi khi lưu dữ liệu vào localStorage:", error);
  }
};
