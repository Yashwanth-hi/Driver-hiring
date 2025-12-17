import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  // Get login sessions
  const customer = JSON.parse(localStorage.getItem("customer"));
  const driver = JSON.parse(localStorage.getItem("driver"));
  const admin = JSON.parse(localStorage.getItem("admin"));

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("customer");
    localStorage.removeItem("driver");
    localStorage.removeItem("admin");
    localStorage.removeItem("admin_token");

    navigate("/");
  };

  return (
    <nav style={styles.nav}>
      {/* Logo */}
      <Link to="/" style={styles.logo}>
        Driver Hiring
      </Link>

      {/* RIGHT SIDE NAV LINKS */}
      <div style={styles.links}>
        {/* ADMIN NAVIGATION */}
        {admin && (
          <>
            <Link to="/admin/dashboard" style={styles.link}>
              Dashboard
            </Link>

            <button style={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          </>
        )}

        {/* DRIVER NAVIGATION */}
        {driver && (
          <>
            <Link to="/driver/dashboard" style={styles.link}>
              Dashboard
            </Link>
            <button style={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          </>
        )}

        {/* CUSTOMER NAVIGATION */}
        {customer && (
          <>
            <Link to="/customer/dashboard" style={styles.link}>
              Dashboard
            </Link>

            <button style={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          </>
        )}

        {/* PUBLIC (NOT LOGGED IN) */}
        {!customer && !driver && !admin && (
          <>
            <Link to="/customer/login" style={styles.link}>Customer Login</Link>
            <Link to="/customer/register" style={styles.link}>Customer Register</Link>

            <Link to="/driver/login" style={styles.link}>Driver Login</Link>
            <Link to="/driver/register" style={styles.link}>Driver Register</Link>

            <Link to="/admin/login" style={styles.link}>Admin Login</Link>
          </>
        )}
      </div>
    </nav>
  );
}

/* ---------------------- UI Styles ---------------------- */
const styles = {
  nav: {
    height: "60px",
    width: "100%",
    background: "#0f1b33",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 25px",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
  },

  logo: {
    color: "white",
    fontWeight: "700",
    fontSize: "20px",
    textDecoration: "none",
    letterSpacing: "0.5px",
  },

  links: {
    display: "flex",
    alignItems: "center",
    gap: "25px",
  },

  link: {
    color: "#f0f0f0",
    textDecoration: "none",
    fontSize: "16px",
    transition: "0.2s",
  },

  logoutBtn: {
    background: "#dc3545",
    color: "white",
    padding: "8px 14px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    transition: "0.2s",
  },
};

export default Navbar;
