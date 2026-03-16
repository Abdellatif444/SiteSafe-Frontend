import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { MainDashboard } from "./pages/MainDashboard";
import { SiteMap } from "./pages/SiteMap";
import { CameraMonitoring } from "./pages/CameraMonitoring";
import { DroneMissions } from "./pages/DroneMissions";
import { PhotoInspection } from "./pages/PhotoInspection";
import { HSERules } from "./pages/HSERules";
import { RealTimeAlerts } from "./pages/RealTimeAlerts";
import { IncidentManagement } from "./pages/IncidentManagement";
import { SafetyReports } from "./pages/SafetyReports";
import { SystemConfig } from "./pages/SystemConfig";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: MainDashboard },
      { path: "map", Component: SiteMap },
      { path: "cameras", Component: CameraMonitoring },
      { path: "drones", Component: DroneMissions },
      { path: "photos", Component: PhotoInspection },
      { path: "rules", Component: HSERules },
      { path: "alerts", Component: RealTimeAlerts },
      { path: "incidents", Component: IncidentManagement },
      { path: "reports", Component: SafetyReports },
      { path: "config", Component: SystemConfig },
    ],
  },
]);
