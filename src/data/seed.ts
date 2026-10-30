import type {
  DemoState,
  Department,
  Employee,
  Mission,
  Source,
} from "../types";
export const BASE_DATE = "2026-10-27";
export const CURRENT_USER = "e01";
export const departments: Department[] = [
  "產品設計部",
  "工程研發部",
  "營運管理部",
  "業務行銷部",
];
export const sourceMeta: Record<Source, { label: string; color: string }> = {
  waste: { label: "廢棄物", color: "#e7ae58" },
  elevator: { label: "電梯", color: "#78ad90" },
  travel: { label: "商務差旅", color: "#167451" },
  digital: { label: "數位能耗", color: "#8c9dbf" },
};
export const employees: Employee[] = [
  "林沐青",
  "陳以安",
  "許庭宇",
  "王思穎",
  "李承恩",
  "吳品妤",
  "張柏翰",
  "黃若晴",
  "周予辰",
  "蔡宜蓁",
  "劉子謙",
  "鄭書妍",
].map((name, i) => ({
  id: `e${String(i + 1).padStart(2, "0")}`,
  name,
  department: departments[Math.floor(i / 3)],
  points: 1380 - i * 59,
  tasks: 18 - i,
}));
export const missions: Mission[] = [
  {
    id: "transit",
    title: "把旅途，變成綠色足跡",
    description: "登錄 1 次高鐵或大眾運輸差旅憑證，探索更低碳的出行選擇。",
    source: "travel",
    target: 1,
    coins: 80,
    exp: 120,
    difficulty: "簡單",
  },
  {
    id: "recycle",
    title: "分類多一步，地球輕一點",
    description: "完成 1 次智慧垃圾桶分類回收流程。",
    source: "waste",
    target: 1,
    coins: 50,
    exp: 80,
    difficulty: "簡單",
  },
  {
    id: "print",
    title: "紙張的另一面，也很精彩",
    description: "今天的文件使用雙面列印。可按完成任務登錄。",
    source: "digital",
    target: 1,
    coins: 30,
    exp: 50,
    difficulty: "簡單",
  },
  {
    id: "power",
    title: "離開座位，記得關掉耗能",
    description: "離座時關閉螢幕與非必要電源，完成一次節能行動。",
    source: "digital",
    target: 1,
    coins: 40,
    exp: 60,
    difficulty: "簡單",
  },
  {
    id: "cloud",
    title: "給雲端，來場大掃除",
    description: "清理 3 批不需要的雲端檔案，讓數位生活輕盈一些。",
    source: "digital",
    target: 3,
    coins: 60,
    exp: 100,
    difficulty: "進階",
  },
  {
    id: "stairs",
    title: "多走幾階，為日常充電",
    description: "選擇樓梯取代短程電梯，累積 3 次健康行動。",
    source: "elevator",
    target: 3,
    coins: 70,
    exp: 100,
    difficulty: "進階",
  },
];
export const history = [
  { month: "5 月", waste: 320, elevator: 170, travel: 1920, digital: 590 },
  { month: "6 月", waste: 300, elevator: 160, travel: 1740, digital: 570 },
  { month: "7 月", waste: 310, elevator: 150, travel: 1810, digital: 540 },
  { month: "8 月", waste: 280, elevator: 150, travel: 1660, digital: 510 },
  { month: "9 月", waste: 270, elevator: 145, travel: 1550, digital: 495 },
];
const titles: Record<Source, string> = {
  waste: "資源分類回收",
  elevator: "辦公室電梯搭乘",
  travel: "高鐵商務差旅",
  digital: "辦公數位設備能耗",
};
export function createSeed(): DemoState {
  const sources: Source[] = ["waste", "elevator", "travel", "digital"];
  const events = Array.from({ length: 56 }, (_, i) => {
    const source = sources[i % 4];
    const employee = employees[(Math.floor(i / 4) * 5 + (i % 4)) % 12];
    const day = 21 + Math.floor(i / 8);
    return {
      id: `seed-${i}`,
      employeeId: employee.id,
      department: employee.department,
      source,
      title: titles[source],
      date: `2026-10-${day}T${String(9 + (i % 9)).padStart(2, "0")}:${i % 2 ? "30" : "00"}:00`,
      emission:
        source === "travel"
          ? 24 + (i % 5) * 7.2
          : source === "digital"
            ? 8 + (i % 4)
            : source === "elevator"
              ? 0.6 + (i % 3) * 0.2
              : 0.18 + (i % 4) * 0.08,
      avoided: source === "waste" ? 0.25 : 0,
      detail:
        source === "travel"
          ? "臺北 → 臺中・估算"
          : source === "waste"
            ? "回收物 320 g・估算"
            : "系統活動紀錄",
      mock: true as const,
    };
  });
  return {
    version: 1,
    events,
    progress: {
      transit: 0,
      recycle: 0,
      print: 1,
      power: 0,
      cloud: 1,
      stairs: 2,
    },
    claimed: [],
    coins: 360,
    exp: 680,
    redemptions: [
      {
        id: "r1",
        name: "陳以安",
        item: "自備杯咖啡券",
        coins: 150,
        date: BASE_DATE,
        status: "待審核",
      },
      {
        id: "r2",
        name: "吳品妤",
        item: "永續生活提袋",
        coins: 300,
        date: BASE_DATE,
        status: "待審核",
      },
      {
        id: "r3",
        name: "周予辰",
        item: "綠色交通補助券",
        coins: 500,
        date: BASE_DATE,
        status: "待審核",
      },
    ],
    devices: Array.from({ length: 8 }, (_, i) => ({
      id: `dev-${i + 1}`,
      name:
        i < 3
          ? `智慧垃圾桶 ${String(i + 1).padStart(2, "0")}`
          : i < 5
            ? `電梯感測器 ${i - 2}`
            : `數位 Eco-Agent ${i - 4}`,
      source: i < 3 ? "waste" : i < 5 ? "elevator" : "digital",
      location: `青禾辦公室・${(i % 3) + 2}F ${i < 3 ? "茶水間" : i < 5 ? "電梯廳" : "工作區"}`,
      status: i === 6 ? "離線" : i === 2 ? "警告" : "在線",
      battery: i === 2 ? 18 : 92 - i * 3,
      lastEvent: "2026-10-27T10:30:00",
    })),
    settings: { notifications: true, summary: true },
  };
}
