import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import type { ReactElement } from "react";
import { jobApi, applicationApi } from "../lib/api";
import { Button, Input } from "../components/ui/index";

interface Job {
  id: string;
  title: string;
  initialDescription: string;
  fullDescription: string;
  address: string;
  hirerId: string;
  status: string;
}

export default function JobDiscovery() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobs = await jobApi.getJobs();
        setJobs(jobs.filter((job: Job) => job.status === "PENDING"));
      } catch (error) {
        console.error("Failed to fetch jobs", error);
        setError("Failed to load jobs");
      }
    };
    fetchJobs();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  const filteredJobs = jobs.filter((job: Job) => job.title.includes(filter));

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
          <h1 className="text-2xl font-bold text-gray-800">Job Discovery</h1>
          <p className="text-gray-500 mt-1">Find your next job</p>
        </div>
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        <Input
          label="Filter"
          type="text"
          placeholder="Search for jobs"
          value={filter}
          onChange={handleFilterChange}
        />
        <ul>
          {filteredJobs.map((job: Job) => (
            <li key={job.id}>
              <div className="flex items-center justify-between p-3 border-b hover:bg-gray-50 transition-colors last:border-b-0">
                <div>
                  <h3 className="font-medium text-gray-800">{job.title}</h3>
                  <p className="text-gray-500 text-sm">
                    {job.initialDescription}
                  </p>
                </div>
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    className="w-full mt-2"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    View Job
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
