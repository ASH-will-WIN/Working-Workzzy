import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { applicationApi } from "../lib/api";

interface Application {
  id: string;
  job: {
    title: string;
    initialDescription: string;
  };
  status: string;
}

export default function ApplicationStatusTracking() {
  const { user } = useAuth();
  const [applications, setApplications] = React.useState<Application[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchApplications = async () => {
      try {
        const applications = await applicationApi.getApplications();
        setApplications(applications);
      } catch (error) {
        console.error("Failed to fetch applications", error);
        setError("Failed to load applications");
      }
    };
    fetchApplications();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6 transition-all duration-300 hover:shadow-xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Application Status
          </h1>
          <p className="text-gray-500 mt-1">
            Track the status of your applications
          </p>
        </div>
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        <ul>
          {applications.map((application) => (
            <li key={application.id}>
              <div className="flex items-center justify-between p-3 border-b hover:bg-gray-50 transition-colors last:border-b-0">
                <div>
                  <h3 className="font-medium text-gray-800">
                    {application.job.title}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {application.job.initialDescription}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Status: {application.status}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
