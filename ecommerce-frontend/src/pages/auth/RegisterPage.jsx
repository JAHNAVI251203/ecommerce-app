import { useState } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const handleRegister = async (e) => {e.preventDefault();
    try {
      await API.post(
        "/auth/register",
        { name, email, password }
      );
      navigate("/login");

    } catch (err) {
      console.log(err.response?.data);
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="register-page">

      <div className="register-card">

        <div className="page-title">
          Create Account
        </div>

        <form onSubmit={handleRegister}>

          <div className="form-group">
            <input
              className="form-input"
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input
              className="form-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input
              className="form-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="register-button"
          >
            Register
          </button>

          <div className="auth-link">
            Already have an account? <a href="/login">Login</a>
          </div>

        </form>

      </div>

    </div>
  );
}

export default RegisterPage;