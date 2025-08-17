import React, { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";

// Define types based on API response
interface Payment {
  id: string;
  jobId: string;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
}
interface Application {
  id: string;
  jobId: string;
  workerId: string;
  status: string;
  createdAt: string;
}

interface Job {
  id: string;
  title: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  hirerId?: string;
  workerId?: string;
  applicationCount?: number;
  applicationStatus?: string;
  payment?: Payment;
}

interface JobWithPayment extends Job {
  payment?: Payment;
}

export default function Dashboard() {
  const { user } = useAuth();
  const userRole = user?.user_metadata?.role;
  const userId = user?.id;

  const [stats, setStats] = useState({
    jobs: 0,
    payments: 0,
    earnings: 0,
    applications: 0,
  });
  const [recentItems, setRecentItems] = useState<JobWithPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview" as const);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        jobs: 12,
        payments: 8,
        earnings: 2450,
        applications: 15,
      });
      setRecentItems([
        {
          id: "1",
          title: "Frontend Developer",
          status: "PENDING",
          createdAt: "2025-08-10",
          applicationStatus: "PENDING",
          payment: { id: "pay1", jobId: "1", amount: 500, status: "PAID" },
        },
        {
          id: "2",
          title: "UI/UX Designer",
          status: "IN_PROGRESS",
          createdAt: "2025-08-08",
          applicationStatus: "ACCEPTED",
          payment: { id: "pay2", jobId: "2", amount: 750, status: "PAID" },
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const renderRoleSpecificContent = () => {
    if (userRole === "hirer") {
      return (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <h3 className="text-gray-500 text-sm font-medium mb-1">
                Active Jobs
              </h3>
              <p className="text-3xl font-bold text-gray-800">{stats.jobs}</p>
            </Card>
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
              <h3 className="text-gray-500 text-sm font-medium mb-1">
                Active Applications
              </h3>
              <p className="text-3xl font-bold text-gray-800">
                {stats.applications}
              </p>
            </Card>
            <Card className="bg-gradient-to-r from-purple-50 to-violet-50">
              <h3 className="text-gray-500 text-sm font-medium mb-1">
                Total Spent
              </h3>
              <p className="text-3xl font-bold text-gray-800">
                ${stats.earnings.toLocaleString()}
              </p>
            </Card>
            <Card className="bg-gradient-to-r from-yellow-50 to-amber-50">
              <h3 className="text-gray-500 text-sm font-medium mb-1">
                Payments Due
              </h3>
              <p className="text-3xl font-bold text-gray-800">
                {stats.payments}
              </p>
            </Card>
          </div>
          <Card className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Recent Job Postings
              </h2>
              <Button>Create New Job</Button>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-4 text-gray-500">
                  Loading recent jobs...
                </div>
              ) : error ? (
                <div className="text-center py-4 text-red-500">
                  Error loading jobs: {error}
                </div>
              ) : recentItems.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No recent jobs found
                </div>
              ) : (
                recentItems.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-3 border-b hover:bg-gray-50 transition-colors last:border-b-0"
                  >
                    <div>
                      <h3 className="font-medium text-gray-800">{job.title}</h3>
                      <p className="text-gray-500 text-sm">
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                          job.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : job.status === "IN_PROGRESS"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {job.status}
                      </span>
                      <span className="ml-4 font-medium text-gray-800">
                        {job.applicationCount} applications
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </>
      );
    } else if (userRole === "worker") {
      return (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <h3 className="text-gray-500 text-sm font-medium mb-1">
                Jobs Applied
              </h3>
              <p className="text-3xl font-bold text-gray-800">{stats.jobs}</p>
            </Card>
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
              <h3 className="text-gray-500 text-sm font-medium mb-1">
                Completed Jobs
              </h3>
              <p className="text-3xl font-bold text-gray-800">
                {stats.payments}
              </p>
            </Card>
            <Card className="bg-gradient-to-r from-purple-50 to-violet-50">
              <h3 className="text-gray-500 text-sm font-medium mb-1">
                Earnings
              </h3>
              <p className="text-3xl font-bold text-gray-800">
                ${stats.earnings.toLocaleString()}
              </p>
            </Card>
            <Card className="bg-gradient-to-r from-yellow-50 to-amber-50">
              <h3 className="text-gray-500 text-sm font-medium mb-1">
                Applications
              </h3>
              <p className="text-3xl font-bold text-gray-800">
                {stats.applications}
              </p>
            </Card>
          </div>
          <Card className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Recent Applications
              </h2>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-4 text-gray-500">
                  Loading recent applications...
                </div>
              ) : error ? (
                <div className="text-center py-4 text-red-500">
                  Error loading applications: {error}
                </div>
              ) : recentItems.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No recent applications found
                </div>
              ) : (
                recentItems.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-3 border-b hover:bg-gray-50 transition-colors last:border-b-0"
                  >
                    <div>
                      <h3 className="font-medium text-gray-800">{job.title}</h3>
                      <p className="text-gray-500 text-sm">
                        Applied {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                          job.applicationStatus === "ACCEPTED"
                            ? "bg-green-100 text-green-800"
                            : job.applicationStatus === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {job.applicationStatus}
                      </span>
                      {job.payment && (
                        <span className="ml-4 font-medium text-gray-800">
                          ${job.payment.amount}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </>
      );
    }
    return null;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      {renderRoleSpecificContent()}
    </div>
  );
}
