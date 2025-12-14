import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
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
      await register(name, email, password, role, phone);
      navigate("/jobs");
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
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
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
          <option value="CLIENT">I'm a Client</option>
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
            <Link to="/terms" className="text-wurkzi-600 hover:underline">
              Terms and Conditions
            </Link>
          </label>
        </div>

        <button type="submit" disabled={!agreedToTerms} className="mt-4">
          Register
        </button>
        {error && <p className="error mt-2">{error}</p>}
        <div className="text-center mt-2">
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-500">
            Back to Home
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
