import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { jobApi, applicationApi } from "../lib/api";
import { Button } from "../components/ui";
import type { Job, JobApplication } from "../lib/types";

export default function JobDiscovery() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch jobs
        const jobsData = await jobApi.getJobs();
        const pendingJobs = jobsData.filter(
          (job: Job) => job.status === "PENDING"
        );
        setJobs(pendingJobs);

        // Fetch applications to see which jobs user has applied to
        const applications = await applicationApi.getApplications();
        setAppliedJobs(applications.map((app: JobApplication) => app.jobId));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApply = async (job: Job) => {
    try {
      // Create application
      const application = await applicationApi.createApplication({
        jobId: job.id,
        message: "I'm interested in this job!",
      });

      // Confirm payment intent
      await applicationApi.confirmApplicationPayment(application.id);

      // Update applied jobs list
      setAppliedJobs([...appliedJobs, job.id]);

      alert("Application submitted successfully!");
    } catch (error) {
      console.error("Application failed:", error);
      alert("Failed to submit application");
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(filter.toLowerCase()) ||
      job.initialDescription.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading jobs...</p>
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Job Discovery</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search jobs..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No jobs found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No jobs match your search criteria. Try adjusting your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-lg shadow overflow-hidden border border-gray-200"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {job.title}
                </h3>
                <p className="text-gray-600 mb-4">{job.initialDescription}</p>

                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <svg
                    className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {job.address}
                </div>

                {appliedJobs.includes(job.id) ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Applied
                  </span>
                ) : (
                  <Button
                    onClick={() => handleApply(job)}
                    variant="primary"
                    className="w-full mt-4"
                  >
                    Apply with $5 Deposit
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
