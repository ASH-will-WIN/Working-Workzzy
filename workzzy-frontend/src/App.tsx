import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import JobDiscovery from "./pages/JobDiscovery";
import ApplicationStatusTracking from "./pages/ApplicationStatusTracking";
import { Role } from "./lib/types";

// ... existing code ...

<BrowserRouter>
  <Routes>
    <Route
      path="/job-discovery"
      element={
        <ProtectedRoute allowedRoles={[Role.WORKER]}>
          <DashboardLayout>
            <JobDiscovery />
          </DashboardLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/applications"
      element={
        <ProtectedRoute>
          <DashboardLayout>
            <ApplicationStatusTracking />
          </DashboardLayout>
        </ProtectedRoute>
      }
    />
  </Routes>
</BrowserRouter>;
