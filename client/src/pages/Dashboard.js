import React, { useState, useEffect } from "react";
import { getMyApplications } from "../api/applicationApi";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const isWorker = user?.user_metadata?.role === "WORKER";

  useEffect(() => {
    if (isWorker) {
      const fetchApplications = async () => {
        try {
          const data = await getMyApplications();
          setApplications(data);
        } catch (error) {
          console.error("Failed to fetch applications:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchApplications();
    } else {
      setLoading(false); // Hirers dashboard can show their jobs, not implemented here for simplicity
    }
  }, [isWorker]);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      {isWorker ? (
        <div>
          <h2>My Applications</h2>
          {applications.length > 0 ? (
            applications.map((app) => (
              <div key={app.id} className="job-card">
                <h3>{app.job.title}</h3>
                <p>Status: {app.status}</p>
                <p>Deposit Status: {app.depositStatus}</p>
              </div>
            ))
          ) : (
            <p>You have not applied to any jobs yet.</p>
          )}
        </div>
      ) : (
        <div>
          <h2>My Job Postings</h2>
          <p>
            Feature coming soon! Go to the homepage to see jobs you've posted.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
