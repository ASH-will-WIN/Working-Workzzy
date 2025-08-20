import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import type { ReactElement } from "react";
import { Button, Input } from "../components/ui/index";
import PaymentForm from "../components/ui/PaymentForm";

interface Job {
  id: string;
  title: string;
  initialDescription: string;
  fullDescription: string;
  address: string;
  hirerId: string;
  status: string;
}

export default function JobApplicationFlow() {
  const [job, setJob] = useState<Job | null>(null);
  const [depositAmount, setDepositAmount] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch("/api/jobs");
        const data = await response.json();
        setJob(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchJob();
  }, []);

  const handleDepositChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDepositAmount(Number(e.target.value));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6 transition-all duration-300 hover:shadow-xl">
        <div className="text-center">
          <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-primary"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Job Application Flow
          </h1>
          <p className="text-gray-500 mt-1">Apply for a job</p>
        </div>
        <Input
          label="Deposit Amount"
          type="number"
          placeholder="Enter deposit amount"
          value={depositAmount}
          onChange={handleDepositChange}
        />
        {job && (
          <PaymentForm
            amount={depositAmount}
            jobId={job.id}
            hirerId={job.hirerId}
            workerId={user?.id || ""}
            onSuccess={(paymentIntent) => {
              console.log("Payment successful:", paymentIntent);
              navigate("/application-status");
            }}
            onError={(error) => {
              console.error("Payment failed:", error);
            }}
          />
        )}
      </div>
    </div>
  );
}
