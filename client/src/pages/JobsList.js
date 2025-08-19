import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getJobs } from "../api/jobApi";

const JobsList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await getJobs();
        setJobs(data);
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading) return <p>Loading jobs...</p>;

  return (
    <div>
      <h1>Available Jobs</h1>
      <div className="job-list">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div key={job.id} className="job-card">
              <h2>{job.title}</h2>
              <p>{job.initialDescription}</p>
              <span
                className={`status-badge status-${job.status.toLowerCase()}`}
              >
                {job.status}
              </span>
              <Link to={`/jobs/${job.id}`}>View Details</Link>
            </div>
          ))
        ) : (
          <p>No jobs available right now.</p>
        )}
      </div>
    </div>
  );
};

export default JobsList;
