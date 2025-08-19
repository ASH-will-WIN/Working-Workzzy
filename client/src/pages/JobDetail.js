import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getJobById } from "../api/jobApi";
import {
  createApplication,
  getApplicationsForJob,
  acceptApplication,
  rejectApplication,
} from "../api/applicationApi";
import { useAuth } from "../context/AuthContext";
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
    } catch (error) {
      console.error("Failed to fetch job details:", error);
    } finally {
      setLoading(false);
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
      alert("Application accepted!");
      fetchJobAndApps(); // Refresh data
    } catch (error) {
      alert("Failed to accept application.");
    }
  };
  const handleReject = async (appId) => {
    try {
      await rejectApplication(appId);
      alert("Application rejected.");
      fetchJobAndApps(); // Refresh data
    } catch (error) {
      alert("Failed to reject application.");
    }
  };
  if (loading) return <p>Loading job details...</p>;
  if (!job) return <p>Job not found.</p>;
  return (
    <div className="job-detail-container">
      <h1>{job.title}</h1>
      <span className={`status-badge status-${job.status.toLowerCase()}`}>
        {job.status}
      </span>
      <p>
        <strong>Location:</strong> {job.address}
      </p>
      <p>
        <strong>Description:</strong> {job.fullDescription}
      </p>
      {isHirer ? (
        <div className="applications-section">
          <h3>Applications for this Job</h3>
          {applications.length > 0 ? (
            applications.map((app) => (
              <div key={app.id} className="application-card">
                <p>
                  <strong>From Worker:</strong> {app.workerId.substring(0, 8)}
                  ...
                </p>
                <p>
                  <strong>Message:</strong> {app.message}
                </p>
                <p>
                  <strong>Status:</strong> {app.status}
                </p>
                {job.status === "PENDING" && app.status === "APPLIED" && (
                  <div>
                    <button onClick={() => handleAccept(app.id)}>Accept</button>
                    <button onClick={() => handleReject(app.id)}>Reject</button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No applications yet.</p>
          )}
        </div>
      ) : (
        <>
          {job.status === "PENDING" && !showPaymentForm && (
            <form onSubmit={handleApply} className="form-container">
              <h3>Apply for this Job</h3>
              <textarea
                placeholder="Include a message with your application (optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button type="submit">Proceed to Deposit</button>
            </form>
          )}
          {showPaymentForm && clientSecret && (
            <div className="form-container">
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm
                  clientSecret={clientSecret}
                  onPaymentSuccess={onPaymentSuccess}
                  onPaymentError={onPaymentError}
                />
              </Elements>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default JobDetail;
