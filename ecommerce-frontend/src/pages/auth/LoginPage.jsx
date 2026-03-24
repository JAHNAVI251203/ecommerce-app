import { useState } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const navigate = useNavigate();
  const handleLogin = async (e) => {e.preventDefault();
    try {
      const res = await API.post(
        "/auth/login",
        { email, password }
      );

      //store JWT
      localStorage.setItem("token", res.data.token);

      //redirect to home
      navigate("/");

    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="page-title">
          Login
        </div>

        <form onSubmit={handleLogin}>

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
            className="login-button"
          >
            Login
          </button>

          <div className="auth-link">
            Don't have an account? <a href="/register">Register</a>
          </div>

        </form>

      </div>

    </div>
  );
}

export default LoginPage;