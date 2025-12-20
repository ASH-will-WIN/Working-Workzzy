import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import { createFinalPayment, confirmFinalPayment } from "../api/paymentApi";

// Load Stripe outside of the component to avoid re-creating on every render
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const FinalPaymentForm = ({ jobId, onPaymentComplete, jobPrice }) => {
  // const [amount, setAmount] = useState("");
  const [amount, setAmount] = useState(jobPrice || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [currentPayment, setCurrentPayment] = useState(null);

  useEffect(() => {
    setAmount(jobPrice || 0);
  }, [jobPrice]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create the final payment
      const { payment, clientSecret: secret } = await createFinalPayment({
        jobId,
        amount: parseFloat(amount),
      });

      setCurrentPayment(payment);
      setClientSecret(secret);
      setShowPaymentForm(true);
    } catch (error) {
      console.error("Payment error:", error);
      const code = error.response?.data?.error;
      if (code === "worker_not_onboarded" || code === "worker_not_ready") {
        setError(
          "Worker is not ready to receive payouts. Ask them to complete Stripe onboarding."
        );
      } else {
        setError(error.response?.data?.message || "Failed to create payment");
      }
    } finally {
      setLoading(false);
    }
  };

  const onPaymentSuccess = async () => {
    try {
      // Confirm the payment in our database
      if (currentPayment) {
        await confirmFinalPayment(currentPayment.id);
      }

      setShowPaymentForm(false);
      setAmount("");
      setClientSecret(null);
      setCurrentPayment(null);

      if (onPaymentComplete) {
        onPaymentComplete();
      }
    } catch (error) {
      console.error("Failed to confirm payment:", error);
      setError(
        "Payment completed but failed to update status. Please contact support."
      );
    }
  };

  const onPaymentError = (errorMsg) => {
    setError(`Payment failed: ${errorMsg}`);
    setShowPaymentForm(false);
    setClientSecret(null);
    setCurrentPayment(null);
  };

  if (showPaymentForm && clientSecret) {
    return (
      <div className="bg-slate-900 rounded-lg shadow-md p-6 border border-slate-700">
        <h3 className="text-lg font-medium text-white mb-4">
          Final Payment
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          Complete the payment to pay the worker for the completed job.
        </p>

        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm
            clientSecret={clientSecret}
            onPaymentSuccess={onPaymentSuccess}
            onPaymentError={onPaymentError}
            isFinalPayment={true}
            amount={amount}
          />
        </Elements>
      </div>
    );
  }

  console.log(jobPrice);

  return (
    <div className="bg-slate-900 rounded-lg shadow-md p-6 border border-slate-700">
      <h3 className="text-lg font-medium text-white mb-4">Final Payment</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-slate-300 mb-1"
          >
            Payment Amount ($)
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            readOnly
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-slate-700 rounded-md bg-slate-800 text-white cursor-not-allowed focus:outline-none"
            required
          />
          <p className="text-xs text-slate-500 mt-1">
            Worker receives: 100% of the amount entered.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full px-4 py-2 text-white font-medium rounded-md ${loading
              ? "bg-slate-700 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-700"
            }`}
        >
          {loading ? "Creating Payment..." : "Create Payment"}
        </button>
      </form>

      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-xs text-blue-300">
          <strong>Note:</strong> This will create a payment that you can
          complete using your preferred payment method.
        </p>
      </div>
    </div>
  );
};

export default FinalPaymentForm;
