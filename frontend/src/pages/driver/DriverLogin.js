import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

function DriverLogin() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phone || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await api.post("/login-driver/", {
        phone,
        password,
      });

      alert("Login Successful!");

      // Save driver data
      localStorage.setItem("driver", JSON.stringify(res.data.driver));

      // Redirect to driver dashboard
      navigate("/driver/dashboard");
    } catch (error) {
      alert(error.response?.data?.detail || "Invalid login details");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.logo}>🚕 Driver Hiring</h2>
        <h3 style={styles.title}>Driver Login</h3>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />

          <div style={styles.checkboxRow}>
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={() => setRemember(!remember)}
            />
            <label htmlFor="remember" style={{ marginLeft: "8px" }}>
              Remember this device
            </label>
          </div>

          <button type="submit" style={styles.loginBtn}>
            Log In
          </button>
        </form>

        <p style={styles.footer}>
          New to Driver Hiring?{" "}
          <span
            style={styles.link}
            onClick={() => navigate("/driver/register")}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    width: "100%",
    background: "#e6ebf1",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    background: "white",
    padding: "35px",
    width: "380px",
    borderRadius: "12px",
    boxShadow: "0 8px 18px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  logo: {
    fontWeight: "700",
    fontSize: "22px",
    marginBottom: "10px",
  },
  title: {
    marginBottom: "20px",
    fontSize: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "10px",
    fontSize: "15px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
  },
  loginBtn: {
    marginTop: "10px",
    padding: "10px",
    fontSize: "16px",
    background: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  footer: {
    marginTop: "15px",
    fontSize: "14px",
  },
  link: {
    color: "#007bff",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default DriverLogin;
