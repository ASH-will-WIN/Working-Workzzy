import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { jobApi } from "../lib/api";
import { Button, Input } from "../components/ui";

export default function CreateJob() {
  const [jobTitle, setJobTitle] = useState("");
  const [initialDescription, setInitialDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [jobAddress, setJobAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!jobTitle || !initialDescription || !fullDescription || !jobAddress) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      await jobApi.createJob({
        title: jobTitle,
        initialDescription,
        fullDescription,
        address: jobAddress,
        hirerId: user?.id || "",
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Job creation failed");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Create New Job</h2>
          <p className="text-gray-600 mt-1">
            Fill out the details for your job posting
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          {error && (
            <div
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Job Title"
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
              placeholder="e.g., Web Developer Needed"
            />

            <Input
              label="Public Description"
              type="text"
              value={initialDescription}
              onChange={(e) => setInitialDescription(e.target.value)}
              required
              placeholder="Brief job description visible to all"
            />

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Full Description
              </label>
              <textarea
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Detailed job description (requires deposit to view)"
                rows={6}
                required
              />
            </div>

            <Input
              label="Job Address"
              type="text"
              value={jobAddress}
              onChange={(e) => setJobAddress(e.target.value)}
              required
              placeholder="123 Main Street, City, State"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              Create Job
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
