import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import JobsList from "./pages/JobsList";
import Home from "./pages/Home";
import JobDetail from "./pages/JobDetail";
import CreateJob from "./pages/CreateJob";
import Dashboard from "./pages/Dashboard";
import Messages from "./pages/Messages";
import Onboarding from "./pages/Onboarding.js";
import ConnectReturn from "./pages/ConnectReturn";
import ConnectRefresh from "./pages/ConnectRefresh";
import Terms from "./pages/Terms"; // Added import for Terms page
import "./App.css";

function App() {
  return (
    <div className="App">
      <Navbar />
      <main className="container">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/connect-return" element={<ConnectReturn />} />
          <Route path="/connect-refresh" element={<ConnectRefresh />} />
          <Route path="/terms" element={<Terms />} />{" "}
          {/* Added route for Terms and Conditions */}
          <Route path="/" element={<Home />} />
          {/* Protected Routes */}
          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <JobsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/new"
            element={
              <ProtectedRoute>
                <CreateJob />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/:id"
            element={
              <ProtectedRoute>
                <JobDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
