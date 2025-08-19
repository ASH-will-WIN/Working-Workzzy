// src/components/CheckoutForm.js

import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const CheckoutForm = ({ clientSecret, onPaymentSuccess, onPaymentError }) => {
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
