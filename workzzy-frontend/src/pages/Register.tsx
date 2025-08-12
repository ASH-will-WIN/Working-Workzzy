import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<"hirer" | "worker">("worker");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await register(email, password, name, role);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <br />
      <label>
        Email:
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <br />
      <label>
        Password:
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <br />
      <label>
        Role:
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "hirer" | "worker")}
        >
          <option value="worker">Worker</option>
          <option value="hirer">Hirer</option>
        </select>
      </label>
      <br />
      <button type="submit">Register</button>
    </form>
  );
}
