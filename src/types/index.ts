export type Source = "waste" | "elevator" | "travel" | "digital";
export type Department =
  | "產品設計部"
  | "工程研發部"
  | "營運管理部"
  | "業務行銷部";
export interface CarbonEvent {
  id: string;
  employeeId: string;
  department: Department;
  source: Source;
  title: string;
  date: string;
  emission: number;
  avoided: number;
  detail: string;
  mock: true;
}
export interface Employee {
  id: string;
  name: string;
  department: Department;
  points: number;
  tasks: number;
}
export interface Mission {
  id: string;
  title: string;
  description: string;
  source: Source;
  target: number;
  coins: number;
  exp: number;
  difficulty: string;
}
export interface Device {
  id: string;
  name: string;
  source: Source;
  location: string;
  status: "在線" | "離線" | "警告";
  battery: number;
  lastEvent: string;
}
export interface Redemption {
  id: string;
  name: string;
  item: string;
  coins: number;
  date: string;
  status: "待審核" | "已核准" | "已拒絕";
}
export interface DemoState {
  version: 1;
  events: CarbonEvent[];
  progress: Record<string, number>;
  claimed: string[];
  coins: number;
  exp: number;
  redemptions: Redemption[];
  devices: Device[];
  settings: { notifications: boolean; summary: boolean };
}
