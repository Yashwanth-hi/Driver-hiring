import { useState } from "react";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    if (!username || !password) {
      return alert("Enter username & password");
    }

    try {
      const res = await api.post("/login-admin/", { username, password });

      // Extract admin details & JWT token
      const admin = res.data.admin;
      const token = res.data.tokens.access;

      // Store both in localStorage
      localStorage.setItem("admin", JSON.stringify(admin));
      localStorage.setItem("admin_token", token);

      alert("Login Successful!");

      navigate("/admin/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Invalid admin credentials");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Admin Login</h2>

        <input
          type="text"
          placeholder="Admin Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button onClick={login} style={styles.loginBtn}>
          Login
        </button>
      </div>
    </div>
  );
}

/* ---------------------- UI Styles ---------------------- */
const styles = {
  page: {
    height: "100vh",
    width: "100%",
    background: "#f0f3f7",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "360px",
    padding: "30px",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    textAlign: "center",
  },
  title: {
    marginBottom: "20px",
    fontSize: "24px",
    fontWeight: "700",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  loginBtn: {
    width: "100%",
    padding: "12px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "17px",
    fontWeight: "600",
  },
};
