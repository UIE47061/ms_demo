import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import { TourFrame } from "../components/experience/Tour";
import { Landing } from "../pages/Landing";
import { Analytics, Dashboard } from "../pages/admin/Dashboard";
import { Integrations } from "../pages/admin/Integrations";
import { Devices, People } from "../pages/admin/PeopleDevices";
import { Reports, Rewards } from "../pages/admin/ReportsRewards";
import { Demo } from "../pages/demo/Demo";
import { Assistant } from "../pages/employee/Assistant";
import { EmployeeHome } from "../pages/employee/Home";
import {
  Footprint,
  Leaderboard,
  Missions,
  Profile,
} from "../pages/employee/Pages";
import { TrashScan, TravelScan } from "../pages/employee/Scans";
import { DemoProvider } from "../store/demo";
import { ExperienceProvider } from "../store/experience";
import { AdminLayout, EmployeeLayout } from "./Layouts";
export default function App() {
  return (
    <DemoProvider>
      <ExperienceProvider>
        <BrowserRouter>
          <TourFrame>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/app" element={<EmployeeLayout />}>
                <Route index element={<Navigate replace to="home" />} />
                <Route path="home" element={<EmployeeHome />} />
                <Route path="footprint" element={<Footprint />} />
                <Route path="travel-scan" element={<TravelScan />} />
                <Route path="trash-scan" element={<TrashScan />} />
                <Route path="missions" element={<Missions />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="assistant" element={<Assistant />} />
              </Route>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate replace to="dashboard" />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="people" element={<People />} />
                <Route path="devices" element={<Devices />} />
                <Route path="reports" element={<Reports />} />
                <Route path="rewards" element={<Rewards />} />
                <Route path="integrations" element={<Integrations />} />
              </Route>
              <Route
                path="*"
                element={
                  <div className="not-found">
                    <h1>找不到這個頁面</h1>
                    <p>請檢查網址，或返回工作空間入口。</p>
                    <Link to="/" className="btn">
                      返回角色入口
                    </Link>
                  </div>
                }
              />
            </Routes>
          </TourFrame>
        </BrowserRouter>
      </ExperienceProvider>
    </DemoProvider>
  );
}
