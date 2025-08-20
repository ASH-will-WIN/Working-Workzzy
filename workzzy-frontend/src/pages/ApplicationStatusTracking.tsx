import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { applicationApi, jobApi } from "../lib/api";
import { Button } from "../components/ui";
import type { JobApplication, Job } from "../lib/types";
import { ApplicationStatus, DepositStatus } from "../lib/types";

export default function ApplicationStatusTracking() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobs, setJobs] = useState<Record<string, Job>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch applications
        const applicationsData = await applicationApi.getApplications();
        setApplications(applicationsData);

        // Fetch job details for each application
        const jobPromises = applicationsData.map(
          async (app: JobApplication) => {
            try {
              return await jobApi.getJob(app.jobId);
            } catch (err) {
              console.error(
                `Failed to get job for application ${app.id}:`,
                err
              );
              return null;
            }
          }
        );

        const jobsData = await Promise.all(jobPromises);

        // Create a map of job ID to job
        const jobsMap: Record<string, Job> = {};
        applicationsData.forEach((app, index) => {
          if (jobsData[index]) {
            jobsMap[app.jobId] = jobsData[index];
          }
        });

        setJobs(jobsMap);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load applications"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAccept = async (applicationId: string) => {
    try {
      await applicationApi.acceptApplication(applicationId);

      // Update the application status locally
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId
            ? {
                ...app,
                status: ApplicationStatus.ACCEPTED,
                depositStatus: DepositStatus.CAPTURED,
              }
            : app
        )
      );
    } catch (error) {
      console.error("Failed to accept application:", error);
      setError("Failed to accept application");
    }
  };

  const handleReject = async (applicationId: string) => {
    try {
      await applicationApi.rejectApplication(applicationId);

      // Update the application status locally
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId
            ? {
                ...app,
                status: ApplicationStatus.REJECTED,
                depositStatus: DepositStatus.REFUNDED,
              }
            : app
        )
      );
    } catch (error) {
      console.error("Failed to reject application:", error);
      setError("Failed to reject application");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Application Status
      </h1>

      {applications.length === 0 ? (
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No applications found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You haven't applied for any jobs yet or haven't received any
            applications.
          </p>
          {user?.user_metadata?.role === "hirer" ? (
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => (window.location.href = "/create-job")}
            >
              Create a Job
            </Button>
          ) : (
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => (window.location.href = "/job-discovery")}
            >
              Find Jobs
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => {
            const job = jobs[application.jobId];
            return (
              <div
                key={application.id}
                className="bg-white rounded-lg shadow overflow-hidden border border-gray-200"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {job ? job.title : "Loading job..."}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {job
                          ? job.initialDescription
                          : "Loading job description..."}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        application.status === ApplicationStatus.APPLIED
                          ? "bg-yellow-100 text-yellow-800"
                          : application.status === ApplicationStatus.ACCEPTED
                          ? "bg-green-100 text-green-800"
                          : application.status === ApplicationStatus.REJECTED
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {application.status}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Applied
                      </p>
                      <p className="text-gray-900">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Deposit Status
                      </p>
                      <p
                        className={`text-gray-900 ${
                          application.depositStatus === DepositStatus.CAPTURED
                            ? "text-green-600"
                            : application.depositStatus ===
                              DepositStatus.REFUNDED
                            ? "text-blue-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {application.depositStatus}
                      </p>
                    </div>
                  </div>

                  {application.message && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-500">
                        Message
                      </p>
                      <p className="text-gray-700 italic">
                        "{application.message}"
                      </p>
                    </div>
                  )}

                  {user?.user_metadata?.role === "hirer" &&
                    application.status === ApplicationStatus.APPLIED && (
                      <div className="mt-4 flex space-x-3">
                        <Button
                          variant="secondary"
                          onClick={() => handleAccept(application.id)}
                          className="flex-1"
                        >
                          Accept
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleReject(application.id)}
                          className="flex-1"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
