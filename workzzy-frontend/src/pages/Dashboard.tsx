import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { jobApi, applicationApi } from "../lib/api";
import { Button } from "../components/ui";
import { Role } from "../components/ProtectedRoute";
import type { JobApplication } from "../lib/types";

interface Stats {
  jobs: number;
  applications: number;
  earnings: number;
  payments: number;
}

interface RecentItem {
  id: string;
  title: string;
  status?: string;
  createdAt: string;
  applicationStatus?: string;
  amount?: number;
  applicationCount?: number;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats>({
    jobs: 0,
    applications: 0,
    earnings: 0,
    payments: 0,
  });
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userRole = user?.user_metadata?.role as Role | undefined;
  const userId = user?.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (userRole === Role.HIRER && userId) {
          const jobs = await jobApi.getJobs();
          const hirerJobs = jobs.filter((job) => job.hirerId === userId);

          // Get application counts for each job
          const jobsWithCounts = await Promise.all(
            hirerJobs.map(async (job) => {
              try {
                const applications = await applicationApi.getJobApplications(
                  job.id
                );
                return {
                  ...job,
                  applicationCount: applications.length,
                };
              } catch (err) {
                console.error(
                  `Failed to get applications for job ${job.id}:`,
                  err
                );
                return {
                  ...job,
                  applicationCount: 0,
                };
              }
            })
          );

          const totalApplications = jobsWithCounts.reduce(
            (acc, job) => acc + (job.applicationCount || 0),
            0
          );

          setStats({
            jobs: jobsWithCounts.length,
            applications: totalApplications,
            earnings: 0,
            payments: 0,
          });

          // Sort by most recent
          const sortedJobs = [...jobsWithCounts].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          setRecentItems(
            sortedJobs.slice(0, 5).map((job) => ({
              id: job.id,
              title: job.title,
              status: job.status,
              createdAt: job.createdAt,
              applicationCount: job.applicationCount,
            }))
          );
        } else if (userRole === Role.WORKER && userId) {
          const applications = await applicationApi.getApplications();

          // Get job details for each application
          const applicationsWithJobs = await Promise.all(
            applications.map(async (app: JobApplication) => {
              try {
                const job = await jobApi.getJob(app.jobId);
                return {
                  ...app,
                  job,
                };
              } catch (err) {
                console.error(
                  `Failed to get job for application ${app.id}:`,
                  err
                );
                return app;
              }
            })
          );

          const acceptedApplications = applicationsWithJobs.filter(
            (a) => a.status === "ACCEPTED"
          );

          setStats({
            jobs: applications.length,
            applications: acceptedApplications.length,
            earnings: acceptedApplications.reduce((acc, app) => {
              return acc + (app.workerAmount || 0);
            }, 0),
            payments: applications.length,
          });

          // Sort by most recent
          const sortedApplications = [...applicationsWithJobs].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          setRecentItems(
            sortedApplications.slice(0, 5).map((app) => ({
              id: app.id,
              title: app.job?.title || "Job Title",
              status: app.job?.status,
              createdAt: app.createdAt,
              applicationStatus: app.status,
              amount: app.workerAmount,
            }))
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchData();
    }
  }, [userRole, userId, authLoading, user]);

  const renderStats = () => (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.6-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M12 15h.01M12 18h.01M12 21h.01M18 8a2 2 0 00-2-2H8a2 2 0 00-2 2v4a2 2 0 00 2 2h8a2 2 0 00 2-2V8z"
                />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Jobs
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {stats.jobs}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Applications
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {stats.applications}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Earnings
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  ${stats.earnings.toFixed(2)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Payments
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {stats.payments}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRecentItems = () => (
    <div className="mt-8">
      <h3 className="text-lg leading-6 font-medium text-gray-900">
        Recent Activity
      </h3>
      <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {recentItems.map((item) => (
            <li key={item.id}>
              <a href="#" className="block hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-blue-600 truncate">
                      {item.title}
                    </p>
                    {userRole === Role.HIRER && item.status && (
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : item.status === "COMMITTED"
                            ? "bg-blue-100 text-blue-800"
                            : item.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.status}
                      </div>
                    )}
                    {userRole === Role.WORKER && item.applicationStatus && (
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.applicationStatus === "APPLIED"
                            ? "bg-yellow-100 text-yellow-800"
                            : item.applicationStatus === "ACCEPTED"
                            ? "bg-green-100 text-green-800"
                            : item.applicationStatus === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.applicationStatus}
                      </div>
                    )}
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <svg
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {userRole === Role.WORKER && item.amount && (
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <svg
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6V6h4v4H6zm8 0h-4v4h4a2 2 0 002-2v-4a2 2 0 00-2-2h-4v6h4a2 2 0 002-2z"
                            clipRule="evenodd"
                          />
                          <path d="M11 13a1 1 0 10-2 0 1 1 0 002 0zM16 13a1 1 0 10-2 0 1 1 0 002 0zM11 18a1 1 0 10-2 0 1 1 0 002 0zM16 18a1 1 0 10-2 0 1 1 0 002 0z" />
                        </svg>
                        ${item.amount.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </a>
            </li>
          ))}
          {recentItems.length === 0 && (
            <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
              No recent activity
            </li>
          )}
        </ul>
      </div>
    </div>
  );

  const renderRoleSpecificContent = () => {
    if (authLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Welcome to Workzzy
          </h2>
          <p className="text-gray-600 mb-6">
            Please log in to access your dashboard.
          </p>
          <Button
            onClick={() => (window.location.href = "/login")}
            variant="primary"
          >
            Log In
          </Button>
        </div>
      );
    }

    if (userRole === Role.HIRER) {
      return (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Hirer Dashboard
            </h2>
            <Button
              onClick={() => (window.location.href = "/create-job")}
              variant="primary"
            >
              Create New Job
            </Button>
          </div>

          {renderStats()}
          {renderRecentItems()}
        </div>
      );
    }

    if (userRole === Role.WORKER) {
      return (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Worker Dashboard
            </h2>
            <Button
              onClick={() => (window.location.href = "/job-discovery")}
              variant="primary"
            >
              Find Jobs
            </Button>
          </div>

          {renderStats()}
          {renderRecentItems()}
        </div>
      );
    }

    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Welcome to Workzzy
        </h2>
        <p className="text-gray-600 mb-6">
          Please complete your registration to access the appropriate dashboard.
        </p>
        <Button
          onClick={() => (window.location.href = "/register")}
          variant="primary"
        >
          Complete Registration
        </Button>
      </div>
    );
  };

  if (loading && !authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
        <Button
          variant="danger"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      {renderRoleSpecificContent()}
    </div>
  );
}
