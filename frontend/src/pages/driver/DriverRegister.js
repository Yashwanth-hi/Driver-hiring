import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

function DriverRegister() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    address: "",
    phone: "",
    password: "",
    experience_years: "1",
    otp: "",
  });

  const [licenseFile, setLicenseFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const [receivedOtp, setReceivedOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [timer, setTimer] = useState(0);

  const navigate = useNavigate();

  // OTP Timer
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Input handler
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateEmail = () =>
    /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(form.email);

  const validatePhone = () => /^[6-9]\d{9}$/.test(form.phone);

  // -----------------------------------------
  // Send OTP
  // -----------------------------------------
  const sendOtp = async () => {
    if (!validatePhone()) return alert("Enter a valid phone number");

    try {
      const res = await api.post("/send-otp/", {
        phone: form.phone.trim(),
      });

      setReceivedOtp(res.data.otp);
      setOtpSent(true);
      setTimer(30);
    } catch (err) {
      alert("Failed to send OTP");
    }
  };

  // -----------------------------------------
  // Verify OTP
  // -----------------------------------------
  const verifyOtp = async () => {
    if (!form.otp) return alert("Enter OTP");

    try {
      await api.post("/verify-otp/", {
        phone: form.phone.trim(),
        otp: form.otp.trim(),
      });

      alert("OTP Verified Successfully!");
      setOtpVerified(true);
    } catch {
      alert("Incorrect OTP");
    }
  };

  // -----------------------------------------
  // Next Steps
  // -----------------------------------------
  const handleNext = () => {
    if (step === 1) {
      if (
        !form.full_name ||
        !form.email ||
        !form.address ||
        !form.phone ||
        !form.password
      ) {
        return alert("Please fill all fields");
      }

      if (!validateEmail()) return alert("Invalid email");
      if (!validatePhone()) return alert("Invalid phone");

      setStep(2);
    }

    if (step === 2) {
      if (!licenseFile || !photoFile)
        return alert("Please upload license and photo");
      setStep(3);
    }
  };

  // -----------------------------------------
  // Submit Registration
  // -----------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otpSent) return alert("Please send OTP first!");
    if (!otpVerified) return alert("Please verify OTP before submitting!");

    setLoading(true);

    const data = new FormData();
    Object.keys(form).forEach((key) => data.append(key, form[key].trim()));
    data.append("license_file", licenseFile);
    data.append("photo", photoFile);

    try {
      await api.post("/register-driver/", data);

      setPopup(true);
      setTimeout(() => navigate("/driver/login"), 2000);
    } catch (err) {
      alert("Registration failed");
    }

    setLoading(false);
  };

  return (
    <div style={styles.page}>
      {/* Success Popup */}
      {popup && (
        <div style={styles.popup}>
          <h2>🎉 Registration Successful!</h2>
          <p>You will be redirected shortly...</p>
          <button
            style={styles.btnPrimary}
            onClick={() => navigate("/driver/login")}
          >
            OK
          </button>
        </div>
      )}

      {/* Loading Spinner */}
      {loading && <div style={styles.spinner}></div>}

      {/* Card */}
      <div style={styles.card}>
        <div style={styles.header}>DRIVER REGISTRATION</div>

        <form style={styles.body} onSubmit={handleSubmit}>
          <h3 style={styles.stepTitle}>Step {step} of 3</h3>

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <input
                style={styles.input}
                placeholder="Full Name"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
              />
              <input
                style={styles.input}
                placeholder="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
              <input
                style={styles.input}
                placeholder="Address"
                name="address"
                value={form.address}
                onChange={handleChange}
              />
              <input
                style={styles.input}
                placeholder="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
              <input
                style={styles.input}
                placeholder="Password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
              />

              <button type="button" style={styles.btnPrimary} onClick={handleNext}>
                Next
              </button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <label style={styles.label}>Upload License</label>
              <input
                type="file"
                style={styles.file}
                onChange={(e) => setLicenseFile(e.target.files[0])}
              />

              <label style={styles.label}>Upload Photo</label>
              <input
                type="file"
                style={styles.file}
                onChange={(e) => setPhotoFile(e.target.files[0])}
              />

              <button type="button" style={styles.btnPrimary} onClick={handleNext}>
                Next
              </button>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              {otpSent ? (
                <>
                  <p style={styles.otpText}>
                    Your OTP:{" "}
                    <b style={styles.otpValue}>{receivedOtp}</b>
                  </p>

                  {timer > 0 ? (
                    <button style={styles.btnDisabled} disabled>
                      Resend OTP ({timer}s)
                    </button>
                  ) : (
                    <button
                      type="button"
                      style={styles.btnWarning}
                      onClick={sendOtp}
                    >
                      Resend OTP
                    </button>
                  )}

                  <input
                    style={styles.input}
                    name="otp"
                    placeholder="Enter OTP"
                    value={form.otp}
                    onChange={handleChange}
                  />

                  <button
                    type="button"
                    style={styles.btnSuccess}
                    onClick={verifyOtp}
                  >
                    Verify OTP
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  style={styles.btnWarning}
                  onClick={sendOtp}
                >
                  Send OTP
                </button>
              )}

              <button
                type="submit"
                disabled={!otpVerified}
                style={{
                  ...styles.btnSubmit,
                  opacity: otpVerified ? 1 : 0.5,
                }}
              >
                Submit
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

/* ---------- CLEAN UI STYLES ---------- */
const styles = {
  page: {
    width: "100%",
    minHeight: "100vh",
    background: "#f5f5f5",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 0",
  },

  card: {
    width: "420px",
    background: "#fff",
    borderRadius: "12px",
    paddingBottom: "20px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    border: "1px solid #ddd",
  },

  header: {
    fontSize: "24px",
    fontWeight: "800",
    padding: "18px",
    textAlign: "center",
    background: "#fff",
    borderBottom: "1px solid #ddd",
  },

  body: { padding: "25px", textAlign: "center" },

  stepTitle: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: 15,
  },

  label: { textAlign: "left", display: "block", marginBottom: 5 },

  input: {
    width: "100%",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    border: "1px solid #ccc",
  },

  file: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
  },

  otpText: { marginBottom: 10, fontSize: 16 },
  otpValue: { fontSize: 22 },

  btnPrimary: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    background: "#000",
    color: "#fff",
    border: "none",
    marginTop: 10,
  },

  btnSuccess: {
    width: "100%",
    padding: 12,
    background: "#28a745",
    borderRadius: 8,
    border: "none",
    color: "#fff",
    marginTop: 10,
  },

  btnWarning: {
    width: "100%",
    padding: 12,
    background: "#f0ad4e",
    borderRadius: 8,
    border: "none",
    color: "#fff",
    marginTop: 10,
  },

  btnDisabled: {
    width: "100%",
    padding: 12,
    background: "#ccc",
    borderRadius: 8,
    border: "none",
    color: "#555",
    marginTop: 10,
  },

  btnSubmit: {
    width: "100%",
    padding: 12,
    background: "#000",
    borderRadius: 8,
    border: "none",
    color: "#fff",
    fontWeight: "700",
    marginTop: 10,
  },

  popup: {
    position: "fixed",
    top: "35%",
    width: "380px",
    background: "#fff",
    padding: "20px",
    borderRadius: 10,
    textAlign: "center",
    boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
  },

  spinner: {
    position: "fixed",
    width: 60,
    height: 60,
    borderRadius: "50%",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    border: "6px solid #ddd",
    borderTop: "6px solid #000",
    animation: "spin 1s linear infinite",
  },
};

export default DriverRegister;
