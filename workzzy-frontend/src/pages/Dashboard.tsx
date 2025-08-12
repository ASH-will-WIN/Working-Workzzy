import { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";

// Define types based on API response
interface Payment {
  id: string;
  jobId: string;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
}
interface Job {
  id: string;
  title: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  createdAt: string; // ISO date string
}
interface JobWithPayment extends Job {
  payment?: Payment;
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    jobs: 0,
    payments: 0,
    earnings: 0,
  });
  const [recentJobs, setRecentJobs] = useState<JobWithPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get the session token from localStorage
        const storedSession = localStorage.getItem("supabase.auth.token");
        let token = null;

        if (storedSession) {
          try {
            const session = JSON.parse(storedSession);
            token = session?.access_token;
          } catch (e) {
            console.error("Error parsing session:", e);
          }
        }

        // If no token, redirect to login
        if (!token) {
          window.location.href = "/login";
          return;
        }

        // Fetch jobs and payments in parallel
        const [jobsRes, paymentsRes] = await Promise.all([
          fetch("http://localhost:5000/api/jobs", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("http://localhost:5000/api/payments", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!jobsRes.ok || !paymentsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const jobs: Job[] = await jobsRes.json();
        const payments: Payment[] = await paymentsRes.json();

        // Calculate stats
        const paidPayments = payments.filter((p) => p.status === "PAID");
        const totalEarnings = paidPayments.reduce(
          (sum, p) => sum + p.amount,
          0
        );

        setStats({
          jobs: jobs.length,
          payments: paidPayments.length,
          earnings: totalEarnings,
        });

        // Combine job data with payment info for recent jobs
        const jobPaymentMap: Record<string, Payment> = {};
        payments.forEach((payment: Payment) => {
          jobPaymentMap[payment.jobId] = payment;
        });

        // Sort jobs by creation date
        const sortedJobs = [...jobs].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Get top 3 most recent jobs
        const latestJobs = sortedJobs.slice(0, 3).map((job) => ({
          ...job,
          payment: jobPaymentMap[job.id],
        }));

        setRecentJobs(latestJobs);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Total Jobs</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.jobs}</p>
        </Card>
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
          <h3 className="text-gray-500 text-sm font-medium mb-1">
            Payments Processed
          </h3>
          <p className="text-3xl font-bold text-gray-800">{stats.payments}</p>
        </Card>
        <Card className="bg-gradient-to-r from-purple-50 to-violet-50">
          <h3 className="text-gray-500 text-sm font-medium mb-1">
            Total Earnings
          </h3>
          <p className="text-3xl font-bold text-gray-800">
            ${stats.earnings.toLocaleString()}
          </p>
        </Card>
      </div>
      <Card className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Jobs</h2>
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
          ) : recentJobs.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No recent jobs found
            </div>
          ) : (
            recentJobs.map((job) => (
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
                      job.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : job.status === "IN_PROGRESS"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {job.status.replace("_", " ")}
                  </span>
                  {job.payment && (
                    <span className="ml-4 font-medium text-gray-800">
                      ${job.payment.amount.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
