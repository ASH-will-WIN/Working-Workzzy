import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getJobById, getJobImages } from "../api/jobApi";
import {
  createApplication,
  getApplicationsForJob,
  acceptApplication,
  rejectApplication,
} from "../api/applicationApi";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";
import ImageGallery from "../components/ImageGallery";
// Removed job-specific StartConversation import
// --- STRIPE IMPORTS ---
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../components/CheckoutForm";
// --- Load Stripe outside of the component to avoid re-creating on every render ---
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [images, setImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  // --- NEW STATE FOR PAYMENT ---
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const isHirer = user?.id === job?.hirerId;
  const fetchJobAndApps = async () => {
    try {
      setLoading(true);
      const jobData = await getJobById(id);
      setJob(jobData);
      if (user?.id === jobData.hirerId) {
        const appData = await getApplicationsForJob(id);
        setApplications(appData);
      }

      // Fetch job images
      await fetchJobImages(id);
    } catch (error) {
      console.error("Failed to fetch job details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobImages = async (jobId) => {
    try {
      setImagesLoading(true);
      const imageData = await getJobImages(jobId);
      setImages(imageData || []);
    } catch (error) {
      console.error("Failed to fetch job images:", error);
      setImages([]); // Set empty array on error
    } finally {
      setImagesLoading(false);
    }
  };
  useEffect(() => {
    fetchJobAndApps();
  }, [id, user]);
  // --- MODIFIED APPLICATION HANDLER ---
  const handleApply = async (e) => {
    e.preventDefault();
    try {
      // Step 1: Create the application on your backend
      const applicationData = await createApplication({ jobId: id, message });
      // Step 2: Get the client_secret from the backend response
      // NOTE: The backend needs to be updated to return `{ clientSecret: depositIntent.client_secret }`
      setClientSecret(applicationData.clientSecret); // Get secret from backend response
      setShowPaymentForm(true); // Show the payment form
    } catch (error) {
      alert(
        `Error: ${
          error.response?.data?.message ||
          "Could not start application process."
        }`
      );
    }
  };
  const onPaymentSuccess = () => {
    alert("Application submitted successfully!");
    setShowPaymentForm(false);
    setMessage("");
  };
  const onPaymentError = (errorMsg) => {
    alert(`Payment failed: ${errorMsg}`);
  };
  const handleAccept = async (appId) => {
    try {
      await acceptApplication(appId);
      // Show success message and refresh data
      fetchJobAndApps();
    } catch (error) {
      console.error("Failed to accept application:", error);
    }
  };
  const handleReject = async (appId) => {
    try {
      await rejectApplication(appId);
      // Show success message and refresh data
      fetchJobAndApps();
    } catch (error) {
      console.error("Failed to reject application:", error);
    }
  };
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="text-gray-500">
          <h2 className="text-2xl font-semibold mb-2">Job not found</h2>
          <p>The job you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Job Header */}
      <div className="card mb-6">
        <div className="card-header">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {job.title}
            </h1>
            <div className="flex items-center text-gray-600 mb-3">
              <svg
                className="w-5 h-5 mr-2"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {job.address}
            </div>
          </div>
          <StatusBadge status={job.status} type="job" />
        </div>

        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed text-lg">
            {job.fullDescription}
          </p>
        </div>
      </div>

      {/* Job Images Section */}
      {(images.length > 0 || imagesLoading) && (
        <div className="card mb-6">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">Job Images</h2>
            {imagesLoading && (
              <div className="flex items-center text-gray-500">
                <svg
                  className="animate-spin w-4 h-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading images...
              </div>
            )}
          </div>

          <ImageGallery images={images} className="mt-4" />
        </div>
      )}
      {isHirer ? (
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Applications for this Job ({applications.length})
          </h3>

          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="border border-gray-200 rounded-lg p-5 bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <svg
                            className="w-5 h-5 text-blue-600"
                            width="20"
                            height="20"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Worker Application
                          </p>
                          <p className="text-sm text-gray-500">
                            ID: {app.workerId.substring(0, 8)}...
                          </p>
                        </div>
                      </div>

                      {app.message && (
                        <div className="mt-3 p-3 bg-white rounded-md border">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium text-gray-900">
                              Message:
                            </span>{" "}
                            {app.message}
                          </p>
                        </div>
                      )}

                      <div className="mt-3 text-sm text-gray-500">
                        Applied: {new Date(app.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="ml-4">
                      <StatusBadge status={app.status} type="application" />
                    </div>
                  </div>

                  {job.status === "PENDING" && app.status === "APPLIED" && (
                    <div className="flex space-x-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleAccept(app.id)}
                        className="btn btn-success btn-sm"
                      >
                        Accept Application
                      </button>
                      <button
                        onClick={() => handleReject(app.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Reject Application
                      </button>
                      {/* Removed job-specific conversation button */}
                    </div>
                  )}

                  {app.status === "ACCEPTED" && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <svg
                            className="w-5 h-5 text-green-600 mr-2"
                            width="20"
                            height="20"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <p className="text-sm text-green-800 font-medium">
                            Application accepted! Waiting for worker to start
                            the job.
                          </p>
                        </div>
                        {/* Removed job-specific conversation button */}
                      </div>
                    </div>
                  )}

                  {app.status === "REJECTED" && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-center">
                        <svg
                          className="w-5 h-5 text-red-600 mr-2"
                          width="20"
                          height="20"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-sm text-red-800">
                          Application rejected. $5 deposit has been refunded.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                width="64"
                height="64"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-500 text-lg">No applications yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Applications will appear here when workers apply
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Add messaging button for workers to contact hirer */}
          {!isHirer && (
            <div className="card mb-6">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">
                  Contact Job Hirer
                </h3>
              </div>
              <div className="card-body">
                <p className="text-gray-600 mb-4">
                  Have questions about this job? Message the hirer directly.
                </p>
                {/* Removed job-specific conversation button */}
              </div>
            </div>
          )}

          {job.status === "PENDING" && !showPaymentForm && (
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Apply for this Job
              </h3>

              <form onSubmit={handleApply} className="space-y-6">
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Why are you interested in this job? (Optional)
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tell the hirer why you're a great fit for this job..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-blue-600 mt-0.5 mr-3"
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 mb-1">
                        Application Deposit Required
                      </p>
                      <p className="text-blue-800">
                        A $5 refundable deposit is required to apply. This
                        deposit will be:
                      </p>
                      <ul className="mt-2 text-blue-700 list-disc list-inside space-y-1">
                        <li>Refunded if your application is rejected</li>
                        <li>
                          Added to your final payment if you complete the job
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-full">
                  <svg
                    className="w-5 h-5 mr-2"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Apply Now - $5 Deposit
                </button>
              </form>
            </div>
          )}

          {showPaymentForm && clientSecret && (
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Complete Your Application
              </h3>
              <div className="mb-6">
                <div className="flex items-center text-green-600 mb-2">
                  <svg
                    className="w-5 h-5 mr-2"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-medium">
                    Application submitted successfully!
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  Please complete the $5 deposit payment to finalize your
                  application.
                </p>
              </div>

              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm
                  clientSecret={clientSecret}
                  onPaymentSuccess={onPaymentSuccess}
                  onPaymentError={onPaymentError}
                />
              </Elements>
            </div>
          )}

          {job.status !== "PENDING" && (
            <div className="card">
              <div className="text-center py-8">
                <svg
                  className="w-10 h-10 text-gray-300 mx-auto mb-4"
                  width="40"
                  height="40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <p className="text-gray-500 text-lg font-medium">
                  Applications Closed
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  This job is no longer accepting applications
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default JobDetail;
