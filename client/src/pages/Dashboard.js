import React, { useState, useEffect } from "react";
import {
  getMyApplications,
  getApplicationsForJob,
  acceptApplication,
  rejectApplication,
} from "../api/applicationApi";
import { getJobsByHirer, startJob, completeJob } from "../api/jobApi";
import { getPaymentsForJob } from "../api/paymentApi";
import { connectApi } from "../api/connectApi";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";
import PaymentStatusIndicator from "../components/PaymentStatusIndicator";
import FinalPaymentForm from "../components/FinalPaymentForm";

const Dashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [hirerJobs, setHirerJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [stripeStatus, setStripeStatus] = useState(null);
  const [stripeLoading, setStripeLoading] = useState(true);
  const isWorker = user?.user_metadata?.role === "WORKER";
  const needsStripeSetup = user?.user_metadata?.role === "WORKER" || user?.user_metadata?.role === "HIRER";

  useEffect(() => {
    const fetchData = async () => {
      // Check Stripe status for users who need it
      if (needsStripeSetup) {
        try {
          const status = await connectApi.getStripeAccount();
          setStripeStatus(status);
        } catch (error) {
          console.error("Failed to fetch Stripe status:", error);
          setStripeStatus({ exists: false, error: true });
        } finally {
          setStripeLoading(false);
        }
      } else {
        setStripeLoading(false);
      }

      // Fetch job/application data
      if (isWorker) {
        fetchWorkerData();
      } else {
        fetchHirerData();
      }
    };

    fetchData();
  }, [isWorker, needsStripeSetup]);

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

  if (loading || stripeLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/4 mb-8 animate-slide-up"></div>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2 mb-2"></div>
                  <div className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-4"></div>
                  <div className="flex space-x-2">
                    <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-20"></div>
                    <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show Stripe Connect onboarding if needed
  if (needsStripeSetup && stripeStatus && !stripeStatus.detailsSubmitted) {
    return <StripeOnboardingCard stripeStatus={stripeStatus} />;
  }

  if (isWorker) {
    // Worker Dashboard
    const acceptedJobs = applications.filter(
      (app) => app.status === "ACCEPTED"
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-workzzy-50 via-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-workzzy-700 to-workzzy-900 bg-clip-text text-transparent">
              My Accepted Jobs
            </h1>
            <p className="text-gray-600 mt-2">Track your job progress and payment status</p>
          </div>

        {acceptedJobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-lg mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-workzzy-100 to-workzzy-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-workzzy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 6V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2z" />
                </svg>
              </div>
              <p className="text-gray-700 text-xl font-semibold mb-3">
                No accepted jobs yet
              </p>
              <p className="text-gray-500 mb-6">
                Once hirers accept your applications, they'll appear here with payment tracking
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="btn btn-primary btn-lg"
              >
                Browse Available Jobs
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {acceptedJobs.map((application) => (
              <div key={application.id} className="card card-hover bg-white border border-gray-200 shadow-lg">
                {/* Prominent Payment Status Banner */}
                <div className="mb-6 -m-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100">
                  <PaymentStatusIndicator 
                    jobId={application.job.id} 
                    userRole="worker" 
                    className="w-full"
                  />
                </div>

                <div className="card-header">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {application.job.title}
                    </h2>
                    <div className="flex items-center text-gray-600 mt-1">
                      <svg className="w-4 h-4 mr-1" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {application.job.address}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <StatusBadge status={application.job.status} type="job" />
                    <StatusBadge status={application.status} type="application" />
                  </div>
                </div>

                <div className="card-body">
                  <p className="text-gray-700 leading-relaxed">
                    {application.job.initialDescription}
                  </p>

                  {application.message && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <div>
                          <p className="font-medium text-blue-900 mb-1">Your Application Message</p>
                          <p className="text-sm text-blue-800">{application.message}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="card-footer">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-600" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 012-2h2a2 2 0 002 2v2a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 00-2 2H5a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2z" />
                    </svg>
                    Job Progress
                  </h3>

                  {application.job.status === "COMMITTED" && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                      <div className="flex items-start">
                        <svg className="w-6 h-6 text-blue-600 mt-1 mr-3" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                          <p className="font-medium text-blue-900 mb-2">
                            🎉 Application Accepted!
                          </p>
                          <p className="text-sm text-blue-800 mb-4">
                            Your application has been accepted! You can now start the job when you're ready.
                          </p>
                          <button
                            onClick={() => handleStartJob(application.job.id)}
                            className="btn btn-primary"
                          >
                            <svg className="w-4 h-4 mr-2" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1M4 16l4.586-4.586a2 2 0 012.828 0L16 16M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                            </svg>
                            Start Job
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {application.job.status === "IN_PROGRESS" && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg mb-4">
                      <div className="flex items-start">
                        <svg className="w-6 h-6 text-orange-600 mt-1 mr-3" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                          <p className="font-medium text-orange-900 mb-2">
                            🔄 Job In Progress
                          </p>
                          <p className="text-sm text-orange-800 mb-4">
                            You're currently working on this job. Mark it as complete when you're finished.
                          </p>
                          <button
                            onClick={() => handleCompleteJob(application.job.id)}
                            className="btn btn-success"
                          >
                            <svg className="w-4 h-4 mr-2" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Mark as Complete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {application.job.status === "COMPLETED" && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                      <div className="flex items-start">
                        <svg className="w-6 h-6 text-green-600 mt-1 mr-3" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                          <p className="font-medium text-green-900 mb-2">
                            🎉 Job Completed Successfully!
                          </p>
                          <p className="text-sm text-green-800 mb-4">
                            Great work! The hirer will process the final payment. You'll receive 90% of the payment amount plus your $5 deposit refund.
                          </p>
                          <div className="bg-white rounded-lg p-4 border border-green-200">
                            <PaymentStatusIndicator 
                              jobId={application.job.id} 
                              userRole="worker" 
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800 mb-1">💳 Deposit Status</span>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          application.depositStatus === 'CAPTURED' ? 'bg-success-100 text-success-800 border border-success-200' :
                          application.depositStatus === 'REFUNDED' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          'bg-warning-100 text-warning-800 border border-warning-200'
                        }`}>
                          {application.depositStatus === 'CAPTURED' && '✅'}
                          {application.depositStatus === 'REFUNDED' && '💰'}
                          {application.depositStatus === 'PENDING' && '⏳'}
                          <span className="ml-1">{application.depositStatus}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800 mb-1">📅 Applied Date</span>
                      <div className="text-gray-600 font-medium">
                        {new Date(application.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {applications.length > acceptedJobs.length && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-600" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              All Applications ({applications.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {applications.map((application) => (
                <div key={application.id} className="card card-hover">
                  <div className="card-header">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">
                        {application.job.title}
                      </h3>
                      <div className="flex items-center text-gray-500 text-xs mt-1">
                        <svg className="w-3 h-3 mr-1" width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {application.job.address}
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={application.job.status} type="job" />
                      <StatusBadge status={application.status} type="application" />
                    </div>
                  </div>
                  
                  <div className="card-footer">
                    <div className="text-xs text-gray-500">
                      Applied: {new Date(application.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    );
  } else {
    // Hirer Dashboard
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-workzzy-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-workzzy-700 bg-clip-text text-transparent">
              My Job Postings
            </h1>
            <p className="text-gray-600 mt-2">Manage your job postings and process payments</p>
          </div>

        {hirerJobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-lg mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-workzzy-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 6V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2z" />
                </svg>
              </div>
              <p className="text-gray-700 text-xl font-semibold mb-3">
                No job postings yet
              </p>
              <p className="text-gray-500 mb-6">
                Create your first job posting to start receiving applications and manage payments
              </p>
              <button 
                onClick={() => window.location.href = '/jobs/new'}
                className="btn btn-primary btn-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create First Job
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {hirerJobs.map((job) => (
              <div key={job.id} className="card card-hover bg-white border border-gray-200 shadow-lg">
                {/* Prominent Payment Status Banner for Completed Jobs */}
                {job.status === "COMPLETED" && (
                  <div className="-m-6 mb-6 p-4 bg-gradient-to-r from-success-50 to-green-50 border-b border-green-100">
                    <PaymentStatusIndicator 
                      jobId={job.id} 
                      userRole="hirer" 
                      className="w-full"
                    />
                  </div>
                )}

                <div className="card-header">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {job.title}
                    </h2>
                    <div className="flex items-center text-gray-600 mt-1">
                      <svg className="w-4 h-4 mr-1" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {job.address}
                    </div>
                    <div className="mt-2 flex items-center space-x-2">
                      <StatusBadge status={job.status} type="job" />
                      <span className="text-sm text-gray-500">
                        {job.applications.length} {job.applications.length === 1 ? 'application' : 'applications'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setSelectedJob(selectedJob === job.id ? null : job.id)
                    }
                    className="btn btn-secondary btn-sm flex items-center"
                  >
                    {selectedJob === job.id ? (
                      <>
                        <svg className="w-4 h-4 mr-1" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        Hide Details
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-1" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        View Details
                      </>
                    )}
                  </button>
                </div>

                <div className="card-body">
                  <p className="text-gray-700 leading-relaxed">{job.initialDescription}</p>
                </div>

                {selectedJob === job.id && (
                  <div className="card-footer">
                    <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-gray-600" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Applications ({job.applications.length})
                    </h3>

                    {job.applications.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500">No applications yet</p>
                        <p className="text-gray-400 text-sm mt-1">Applications will appear here when workers apply</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {job.applications.map((application) => (
                          <div key={application.id} className="border border-gray-200 rounded-lg p-5 bg-white">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-start">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                  <svg className="w-5 h-5 text-blue-600" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">
                                    Worker Application
                                  </p>
                                  <p className="text-sm text-gray-500 mb-2">
                                    ID: {application.workerId.substring(0, 12)}...
                                  </p>
                                  {application.message && (
                                    <div className="mt-2 p-3 bg-gray-50 rounded-md border">
                                      <p className="text-sm text-gray-700">
                                        <span className="font-medium">Message:</span> {application.message}
                                      </p>
                                    </div>
                                  )}
                                  <div className="mt-3 text-xs text-gray-500">
                                    Applied: {new Date(application.createdAt).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <StatusBadge status={application.status} type="application" />
                            </div>

                            {application.status === "APPLIED" && job.status === "PENDING" && (
                              <div className="pt-4 border-t border-gray-200">
                                <div className="flex space-x-3">
                                  <button
                                    onClick={() => handleAcceptApplication(application.id)}
                                    className="btn btn-success btn-sm flex-1"
                                  >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Accept Application
                                  </button>
                                  <button
                                    onClick={() => handleRejectApplication(application.id)}
                                    className="btn btn-danger btn-sm flex-1"
                                  >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Reject Application
                                  </button>
                                </div>
                              </div>
                            )}

                            {application.status === "ACCEPTED" && job.status === "COMMITTED" && (
                              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-start">
                                  <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <div className="flex-1">
                                    <p className="font-medium text-green-900 mb-2">
                                      Application Accepted
                                    </p>
                                    <p className="text-sm text-green-800 mb-3">
                                      Great! You've accepted this application. The job is now committed and waiting for the worker to start.
                                    </p>
                                    <button
                                      onClick={() => handleStartJob(job.id)}
                                      className="btn btn-primary btn-sm"
                                    >
                                      <svg className="w-4 h-4 mr-2" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1M4 16l4.586-4.586a2 2 0 012.828 0L16 16M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                                      </svg>
                                      Start Job (when worker is ready)
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {application.status === "REJECTED" && (
                              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center">
                                  <svg className="w-5 h-5 text-red-600 mr-3" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <div>
                                    <p className="font-medium text-red-900 mb-1">
                                      Application Rejected
                                    </p>
                                    <p className="text-sm text-red-800">
                                      You rejected this application. The worker's $5 deposit has been refunded.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {job.status === "COMPLETED" && (
                      <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start mb-4">
                          <svg className="w-6 h-6 text-green-600 mt-1 mr-3" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="flex-1">
                            <p className="font-medium text-green-900 mb-2">
                              🎉 Job Completed Successfully!
                            </p>
                            <p className="text-sm text-green-800 mb-4">
                              The worker has marked this job as complete. You can now process the final payment to complete the transaction.
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-white p-6 rounded-xl border border-gray-200 mb-4">
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
                            </svg>
                            Process Final Payment
                          </h4>
                          <FinalPaymentForm
                            jobId={job.id}
                            onPaymentComplete={() => fetchHirerData()}
                          />
                        </div>
                        
                        <div className="bg-gradient-to-r from-success-50 to-green-50 rounded-xl p-4 border border-success-200">
                          <PaymentStatusIndicator 
                            jobId={job.id} 
                            userRole="hirer" 
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    );
  }
};

export default Dashboard;

const StripeOnboardingCard = ({ stripeStatus }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleStartOnboarding = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let onboardingUrl;
      
      if (stripeStatus.exists && stripeStatus.actionUrl) {
        // Account exists but needs completion
        onboardingUrl = stripeStatus.actionUrl;
      } else {
        // Create new account and get onboarding URL
        const result = await connectApi.createStripeAccountLink();
        onboardingUrl = result.onboardingUrl;
      }
      
      // Redirect to Stripe onboarding
      window.location.href = onboardingUrl;
    } catch (err) {
      console.error("Failed to start onboarding:", err);
      setError("Failed to start onboarding. Please try again.");
      setLoading(false);
    }
  };

  const getStatusMessage = () => {
    if (stripeStatus.error) {
      return "There was an error checking your account status.";
    }
    
    if (!stripeStatus.exists) {
      return "You need to set up a Stripe Connect account to receive payments.";
    }
    
    if (!stripeStatus.detailsSubmitted) {
      return "Your Stripe account setup is incomplete. Complete it now to start receiving payments.";
    }
    
    if (stripeStatus.requiresAction) {
      return "Your Stripe account requires additional information. Please complete the setup.";
    }
    
    return "Setting up your payment account...";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-3 mx-auto mb-4 w-fit">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Complete Payment Setup
            </h2>
            
            <p className="text-gray-600 mb-6">
              {getStatusMessage()}
            </p>
            
            {stripeStatus.exists && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Current Status:</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Account Created:</span>
                    <span className="text-green-600">✓ Yes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Details Submitted:</span>
                    <span className={stripeStatus.detailsSubmitted ? "text-green-600" : "text-red-600"}>
                      {stripeStatus.detailsSubmitted ? "✓ Yes" : "✗ No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Charges Enabled:</span>
                    <span className={stripeStatus.chargesEnabled ? "text-green-600" : "text-red-600"}>
                      {stripeStatus.chargesEnabled ? "✓ Yes" : "✗ No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payouts Enabled:</span>
                    <span className={stripeStatus.payoutsEnabled ? "text-green-600" : "text-red-600"}>
                      {stripeStatus.payoutsEnabled ? "✓ Yes" : "✗ No"}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            <button
              onClick={handleStartOnboarding}
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Setting up...
                </div>
              ) : (
                stripeStatus.exists ? "Continue Setup" : "Start Setup"
              )}
            </button>
            
            <p className="mt-4 text-xs text-gray-500">
              You'll be redirected to Stripe to securely complete your account setup.
              This is required to receive payments on the platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
