import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import { createFinalPayment, confirmFinalPayment } from "../api/paymentApi";

// Load Stripe outside of the component to avoid re-creating on every render
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const FinalPaymentForm = ({ jobId, onPaymentComplete }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [currentPayment, setCurrentPayment] = useState(null);

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
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Final Payment
        </h3>
        <p className="text-sm text-gray-600 mb-4">
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Final Payment</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Payment Amount ($)
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Platform fee: 10% | Worker receives: 90% + $5 deposit refund
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full px-4 py-2 text-white font-medium rounded-md ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Creating Payment..." : "Create Payment"}
        </button>
      </form>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> This will create a payment that you can
          complete using your preferred payment method.
        </p>
      </div>
    </div>
  );
};

export default FinalPaymentForm;
