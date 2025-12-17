import { useState } from "react";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";

export default function CustomerLogin() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    if (!phone || !password) {
      return alert("Enter phone & password");
    }

    try {
      const res = await api.post("/login/customer/", {
        phone,
        password,
      });

      // Save logged-in user data
      localStorage.setItem("customer", JSON.stringify(res.data.customer));

      alert("Login successful!");

      navigate("/customer/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Customer Login</h2>

      <input
        style={styles.input}
        type="text"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <input
        style={styles.input}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button style={styles.button} onClick={login}>
        Login
      </button>

      <p style={{ marginTop: "10px" }}>
        Don’t have an account?{" "}
        <span
          style={styles.link}
          onClick={() => navigate("/customer/register")}
        >
          Register
        </span>
      </p>
    </div>
  );
}

// 💅 Inline styles
const styles = {
  container: {
    maxWidth: "350px",
    margin: "80px auto",
    padding: "30px",
    borderRadius: "12px",
    background: "#fff",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  heading: {
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
  },
  link: {
    color: "#007bff",
    cursor: "pointer",
    fontWeight: "600",
  },
};
