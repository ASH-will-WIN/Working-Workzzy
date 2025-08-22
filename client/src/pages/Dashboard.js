import React, { useState, useEffect } from "react";
import {
  getMyApplications,
  getApplicationsForJob,
  acceptApplication,
  rejectApplication,
} from "../api/applicationApi";
import { getJobsByHirer, startJob, completeJob } from "../api/jobApi";
import { getPaymentsForJob } from "../api/paymentApi";
import { useAuth } from "../context/AuthContext";
import FinalPaymentForm from "../components/FinalPaymentForm";

const Dashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [hirerJobs, setHirerJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const isWorker = user?.user_metadata?.role === "WORKER";

  useEffect(() => {
    if (isWorker) {
      fetchWorkerData();
    } else {
      fetchHirerData();
    }
  }, [isWorker]);

  const fetchWorkerData = async () => {
    try {
      const data = await getMyApplications();
      setApplications(data);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHirerData = async () => {
    try {
      const data = await getJobsByHirer();
      setHirerJobs(data);
    } catch (error) {
      console.error("Failed to fetch hirer jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatus = async (jobId) => {
    try {
      const payments = await getPaymentsForJob(jobId);
      return payments.find((p) => p.type === "FINAL_PAYMENT" || p.amount > 5);
    } catch (error) {
      console.error("Failed to fetch payment status:", error);
      return null;
    }
  };

  const handleStartJob = async (jobId) => {
    try {
      await startJob(jobId);
      if (isWorker) {
        fetchWorkerData();
      } else {
        fetchHirerData();
      }
    } catch (error) {
      console.error("Failed to start job:", error);
    }
  };

  const handleCompleteJob = async (jobId) => {
    try {
      await completeJob(jobId);
      if (isWorker) {
        fetchWorkerData();
      } else {
        fetchHirerData();
      }
    } catch (error) {
      console.error("Failed to complete job:", error);
    }
  };

  const handleAcceptApplication = async (applicationId) => {
    try {
      await acceptApplication(applicationId);
      fetchHirerData(); // Refresh to get updated status
    } catch (error) {
      console.error("Failed to accept application:", error);
    }
  };

  const handleRejectApplication = async (applicationId) => {
    try {
      await rejectApplication(applicationId);
      fetchHirerData(); // Refresh to get updated status
    } catch (error) {
      console.error("Failed to reject application:", error);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      COMMITTED: "bg-blue-100 text-blue-800",
      IN_PROGRESS: "bg-orange-100 text-orange-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusColors[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  const getApplicationStatusBadge = (status) => {
    const statusColors = {
      APPLIED: "bg-blue-100 text-blue-800",
      ACCEPTED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      WITHDRAWN: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusColors[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  if (loading) return <p>Loading dashboard...</p>;

  if (isWorker) {
    // Worker Dashboard
    const acceptedJobs = applications.filter(
      (app) => app.status === "ACCEPTED"
    );

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          My Accepted Jobs
        </h1>

        {acceptedJobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              You don't have any accepted jobs yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {acceptedJobs.map((application) => (
              <div
                key={application.id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {application.job.title}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {application.job.address}
                  </p>
                  <div className="mt-2 flex space-x-2">
                    {getStatusBadge(application.job.status)}
                    {getApplicationStatusBadge(application.status)}
                  </div>
                </div>

                <p className="text-gray-700 mb-4">
                  {application.job.initialDescription}
                </p>

                {application.message && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Your message:</span>{" "}
                      {application.message}
                    </p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Job Progress
                  </h3>

                  {application.job.status === "COMMITTED" && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-2">
                        Your application has been accepted! You can now start
                        the job when you're ready.
                      </p>
                      <button
                        onClick={() => handleStartJob(application.job.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Start Job
                      </button>
                    </div>
                  )}

                  {application.job.status === "IN_PROGRESS" && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-2">
                        Job is in progress. Mark it as complete when you're
                        done.
                      </p>
                      <button
                        onClick={() => handleCompleteJob(application.job.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Mark as Complete
                      </button>
                    </div>
                  )}

                  {application.job.status === "COMPLETED" && (
                    <div className="mb-3">
                      <p className="text-sm text-green-600 font-medium">
                        ✓ Job completed successfully!
                      </p>
                      <p className="text-sm text-gray-600">
                        The hirer will process the final payment. You'll receive
                        90% of the payment amount plus your $5 deposit refund.
                      </p>
                      <PaymentStatusDisplay jobId={application.job.id} />
                    </div>
                  )}

                  <div className="text-sm text-gray-500">
                    <p>Deposit Status: {application.depositStatus}</p>
                    <p>
                      Applied:{" "}
                      {new Date(application.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {applications.length > acceptedJobs.length && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              All Applications
            </h2>
            <div className="space-y-4">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="bg-white rounded-lg shadow-sm p-4 border"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {application.job.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {application.job.address}
                      </p>
                      <div className="mt-2 flex space-x-2">
                        {getStatusBadge(application.job.status)}
                        {getApplicationStatusBadge(application.status)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(application.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  } else {
    // Hirer Dashboard
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          My Job Postings
        </h1>

        {hirerJobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              You haven't posted any jobs yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {hirerJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {job.title}
                    </h2>
                    <p className="text-gray-600 mt-1">{job.address}</p>
                    <div className="mt-2">{getStatusBadge(job.status)}</div>
                  </div>
                  <button
                    onClick={() =>
                      setSelectedJob(selectedJob === job.id ? null : job.id)
                    }
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {selectedJob === job.id ? "Hide Details" : "View Details"}
                  </button>
                </div>

                <p className="text-gray-700 mb-4">{job.initialDescription}</p>

                {selectedJob === job.id && (
                  <div className="border-t pt-4">
                    <h3 className="font-medium text-gray-900 mb-3">
                      Applications ({job.applications.length})
                    </h3>

                    {job.applications.length === 0 ? (
                      <p className="text-gray-500">No applications yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {job.applications.map((application) => (
                          <div
                            key={application.id}
                            className="border rounded-lg p-4 bg-gray-50"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium text-gray-900">
                                  Worker ID: {application.workerId}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {application.message || "No message provided"}
                                </p>
                                <div className="mt-2">
                                  {getApplicationStatusBadge(
                                    application.status
                                  )}
                                </div>
                              </div>
                            </div>

                            {application.status === "APPLIED" &&
                              job.status === "PENDING" && (
                                <div className="mt-3 space-x-2">
                                  <button
                                    onClick={() =>
                                      handleAcceptApplication(application.id)
                                    }
                                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                  >
                                    Accept Application
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleRejectApplication(application.id)
                                    }
                                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                  >
                                    Reject Application
                                  </button>
                                </div>
                              )}

                            {application.status === "ACCEPTED" &&
                              job.status === "COMMITTED" && (
                                <div className="mt-3">
                                  <p className="text-sm text-green-600 mb-2">
                                    ✓ Application accepted! Waiting for worker
                                    to start the job.
                                  </p>
                                  <button
                                    onClick={() => handleStartJob(job.id)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                  >
                                    Start Job (if worker is ready)
                                  </button>
                                </div>
                              )}

                            {application.status === "REJECTED" && (
                              <div className="mt-3">
                                <p className="text-sm text-red-600">
                                  Application rejected. $5 deposit has been
                                  refunded.
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {job.status === "COMPLETED" && (
                      <div className="mt-6 p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800 font-medium">
                          ✓ Job completed! You can now process the final
                          payment.
                        </p>
                        <div className="mt-4">
                          <FinalPaymentForm
                            jobId={job.id}
                            onPaymentComplete={() => fetchHirerData()}
                          />
                        </div>
                        <PaymentStatusDisplay jobId={job.id} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
};

export default Dashboard;

const PaymentStatusDisplay = ({ jobId }) => {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const paymentData = await getPaymentsForJob(jobId);
        // Identify final payments by amount > $5 (deposits are exactly $5)
        const finalPayment = paymentData.find((p) => p.amount > 5);
        setPayment(finalPayment);
      } catch (error) {
        console.error("Failed to fetch payment:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [jobId]);

  if (loading)
    return (
      <div className="mt-3 text-sm text-gray-500">
        Loading payment status...
      </div>
    );

  if (!payment)
    return (
      <div className="mt-3 text-sm text-gray-500">
        No final payment information available
      </div>
    );

  return (
    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
      <h4 className="text-sm font-medium text-blue-900 mb-2">Payment Status</h4>
      <div className="text-xs text-blue-800 space-y-1">
        <p>
          <strong>Status:</strong> {payment.status}
        </p>
        <p>
          <strong>Amount:</strong> ${payment.amount}
        </p>
        <p>
          <strong>Worker Receives:</strong> ${payment.workerAmount}
        </p>
        <p>
          <strong>Platform Fee:</strong> ${payment.platformFee}
        </p>
        {payment.depositRefund && (
          <p>
            <strong>Deposit Refund:</strong> ${payment.depositRefund}
          </p>
        )}
        {payment.status === "PAID" && (
          <p className="text-green-600 font-medium">✓ Payment completed!</p>
        )}
      </div>
    </div>
  );
};
