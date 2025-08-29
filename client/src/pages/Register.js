import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("WORKER"); // Default role
  const [error, setError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate terms agreement
    if (!agreedToTerms) {
      setError("You must agree to the terms and conditions.");
      return;
    }

    try {
      await register(name, email, password, role);
      navigate("/");
    } catch (err) {
      setError("Failed to register.");
      console.error(err);
    }
  };

  return (
    <div className="form-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="WORKER">I'm a Worker</option>
          <option value="HIRER">I'm a Hirer</option>
        </select>

        {/* Terms and Conditions */}
        <div className="terms-checkbox">
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
          />
          <label htmlFor="terms" className="ml-2">
            I agree to the{" "}
            <a href="/terms" className="text-workzzy-600 hover:underline">
              Terms and Conditions
            </a>
          </label>
        </div>

        <button type="submit" disabled={!agreedToTerms} className="mt-4">
          Register
        </button>
        {error && <p className="error mt-2">{error}</p>}
      </form>
    </div>
  );
};

export default Register;
