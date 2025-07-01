import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { PrivateRoute } from "./auth/PrivateRoute";
import LoginPage from "./pages/login";
import InvitePage from "./pages/invite";
import { Dashboard } from "./screens/Dashboard/Dashboard";
import SDRSales from "./screens/SDRSales";
import CloserSales from "./screens/CloserSales";
import Leads from "./screens/Leads";
import CloserPage from "./pages/closer";
import SetterPage from "./pages/setter";
import CoachPage from "./pages/coach";
import AcquisitionPage from "./pages/acquisition";
import AcquisitionDataPage from "./pages/acquisition-data";
import { Sidebar } from "./components/Sidebar";
import LeadsPage from "./pages/leads";

function AppLayout() {
  return (
    <div className="flex bg-[#0a0a0a] min-h-screen text-white">
      <Sidebar />
      <main className="flex-1 px-12 py-10 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<LoginPage />} />
          {/* Protected routes */}
          <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
            <Route path="/acquisition" element={<AcquisitionPage />} />
            <Route path="/acquisition-data" element={<AcquisitionDataPage />} />
            <Route path="/closer" element={<CloserPage />} />
            <Route path="/setter" element={<SetterPage />} />
            <Route path="/leads" element={<LeadsPage />} />
            {/* <Route path="/coach" element={<CoachPage />} /> */}
            <Route path="/invite" element={<InvitePage />} />
            <Route path="/" element={<Navigate to="/acquisition" />} />
            <Route path="*" element={<Navigate to="/acquisition" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
} 