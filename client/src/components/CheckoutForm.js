// src/components/CheckoutForm.js

import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const CheckoutForm = ({ clientSecret, onPaymentSuccess, onPaymentError, isFinalPayment = false, amount = 5.00 }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      }
    );

    if (error) {
      setError(error.message);
      onPaymentError(error.message);
      setProcessing(false);
    } else if (
      paymentIntent.status === "succeeded" ||
      paymentIntent.status === "requires_capture"
    ) {
      // The 'requires_capture' status is what we expect for the deposit.
      onPaymentSuccess();
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
  };

  if (isFinalPayment) {
    return (
      <form onSubmit={handleSubmit}>
        <h4>Complete Final Payment 💳</h4>
        <p className="text-sm text-gray-600 mb-4">
          Amount: ${amount} | Worker receives: ${(amount * 0.9 + 5).toFixed(2)} (90% + $5 deposit refund)
        </p>
        <CardElement options={cardElementOptions} />
        <button
          disabled={!stripe || processing}
          type="submit"
          style={{ marginTop: "20px", width: "100%" }}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {processing ? "Processing..." : `Pay $${amount}`}
        </button>
        {error && (
          <div className="error text-red-600 text-sm mt-2">
            {error}
          </div>
        )}
      </form>
    );
  }

  // Default deposit payment form
  return (
    <form onSubmit={handleSubmit}>
      <h4>Confirm Your $5.00 Deposit 💳</h4>
      <CardElement options={cardElementOptions} />
      <button
        disabled={!stripe || processing}
        type="submit"
        style={{ marginTop: "20px", width: "100%" }}
      >
        {processing ? "Processing..." : "Pay and Submit Application"}
      </button>
      {error && (
        <div className="error" style={{ marginTop: "10px" }}>
          {error}
        </div>
      )}
    </form>
  );
};

export default CheckoutForm;
