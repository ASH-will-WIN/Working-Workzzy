import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useState } from "react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface PaymentFormProps {
  amount: number;
  jobId: string;
  hirerId: string;
  workerId: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: any) => void;
}

const PaymentFormComponent = ({
  amount,
  jobId,
  hirerId,
  workerId,
  onSuccess,
  onError,
}: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      onError(new Error("Stripe has not loaded yet"));
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent on server
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Assuming token-based auth
        },
        body: JSON.stringify({
          job_id: jobId,
          amount,
          hirer_id: hirerId,
          worker_id: workerId,
        }),
      });

      const { paymentIntent } = await response.json();

      // Confirm payment
      const result = await stripe.confirmCardPayment(
        paymentIntent.client_secret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              name: "Customer Name", // This should come from user input or auth context
            },
          },
        }
      );

      if (result.error) {
        onError(result.error);
      } else if (result.paymentIntent) {
        // Payment status will be updated via webhook
        onSuccess(result.paymentIntent);
      }
    } catch (error: any) {
      onError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="card-element">
        <CardElement
          options={{
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
          }}
        />
      </div>
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="submit-button"
      >
        {isProcessing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
      </button>
    </form>
  );
};

export default function WrappedPaymentForm(props: PaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormComponent {...props} />
    </Elements>
  );
}
