import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createJob } from "../api/jobApi";
import { useAuth } from "../context/AuthContext";

const CreateJob = () => {
  const [title, setTitle] = useState("");
  const [initialDescription, setInitialDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to post a job.");
      return;
    }

    const jobData = {
      title,
      initialDescription,
      fullDescription,
      address,
      hirerId: user.id,
    };

    try {
      await createJob(jobData);
      navigate("/");
    } catch (err) {
      setError("Failed to create job.");
      console.error(err);
    }
  };

  return (
    <div className="form-container">
      <h2>Create a New Job</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Job Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Short Description"
          value={initialDescription}
          onChange={(e) => setInitialDescription(e.target.value)}
          required
        />
        <textarea
          placeholder="Full Job Description"
          value={fullDescription}
          onChange={(e) => setFullDescription(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Job Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
        <button type="submit">Post Job</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default CreateJob;
