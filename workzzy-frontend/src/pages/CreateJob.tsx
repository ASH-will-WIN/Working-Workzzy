import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button, Input } from "../components/ui/index";

console.log("Before CreateJob component");
export default function CreateJob() {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobAddress, setJobAddress] = useState("");
  const [hirerId, setHirerId] = useState("");
  const [step, setStep] = useState(1);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: jobTitle,
          description: jobDescription,
          address: jobAddress,
          hirerId: hirerId,
        }),
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4 space-y-6 transition-all duration-300 hover:shadow-xl">
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
          <h1 className="text-2xl font-bold text-gray-800">Create Job</h1>
          <p className="text-gray-500 mt-1">Create a new job</p>
        </div>
        {step === 1 && (
          <form onSubmit={handleSubmit}>
            <Input
              label="Job Title"
              type="text"
              placeholder="Enter job title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
            <Input
              label="Job Description"
              type="text"
              placeholder="Enter job description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              onClick={() => setStep(2)}
            >
              Next
            </Button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <Input
              label="Job Address"
              type="text"
              placeholder="Enter job address"
              value={jobAddress}
              onChange={(e) => setJobAddress(e.target.value)}
            />
            <Input
              label="Hirer ID"
              type="text"
              placeholder="Enter hirer ID"
              value={hirerId}
              onChange={(e) => setHirerId(e.target.value)}
            />
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              onClick={() => setStep(3)}
            >
              Next
            </Button>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={handleSubmit}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
            >
              Create Job
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
console.log("After CreateJob component");
