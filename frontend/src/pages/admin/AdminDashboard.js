import { useEffect, useState } from "react";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [drivers, setDrivers] = useState([]);
  const [rides, setRides] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState({});
  const navigate = useNavigate();

  // -----------------------------
  // LOGOUT
  // -----------------------------
  const logout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
  };

  // -----------------------------
  // LOAD DRIVERS
  // -----------------------------
  const loadDrivers = async () => {
    try {
      const res = await api.get("/drivers/");
      setDrivers(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load drivers");
    }
  };

  // -----------------------------
  // LOAD RIDES
  // -----------------------------
  const loadRides = async () => {
    try {
      const res = await api.get("/rides/");
      setRides(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load rides");
    }
  };

  useEffect(() => {
    loadDrivers();
    loadRides();

    const timer = setInterval(() => {
      loadDrivers();
      loadRides();
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  // -----------------------------
  // APPROVE / REJECT DRIVER
  // -----------------------------
  const updateDriverStatus = async (id, action) => {
    try {
      await api.post(`/admin/driver/${id}/approve/`, { action });

      alert(`Driver ${action}d successfully`);
      loadDrivers();
    } catch (err) {
      console.error(err);
      alert("Failed to update driver");
    }
  };

  // -----------------------------
  // ASSIGN DRIVER TO RIDE
  // -----------------------------
  const assignDriver = async (rideId) => {
    const driverId = selectedDriver[rideId];
    if (!driverId) return alert("Please select a driver");

    try {
      await api.post(`/rides/${rideId}/assign/`, { driver_id: driverId });

      alert("Driver assigned successfully!");
      loadDrivers();
      loadRides();
    } catch (err) {
      console.error(err);
      alert("Failed to assign driver");
    }
  };

  return (
    <div style={styles.page}>

      {/* ---------------- TOP NAVBAR ---------------- */}
      <header style={styles.topbar}>
        <h3 style={{ margin: 0, color: "#fff", fontWeight: "600" }}>
          Driver Hiring
        </h3>

        <div style={styles.topRight}>
          <span style={styles.topLink}>Dashboard</span>
          <button style={styles.logoutTopBtn} onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {/* ---------------- SIDEBAR + MAIN WRAPPER ---------------- */}
      <div style={styles.wrapper}>

        {/* ---------------- SIDEBAR ---------------- */}
        <aside style={styles.sidebar}>
          <h2 style={styles.logo}>Admin Panel</h2>

          <nav style={styles.nav}>
            <div style={styles.navItem}>Dashboard</div>
            <div style={styles.navItem}>Drivers</div>
            <div style={styles.navItem}>Rides</div>
          </nav>
        </aside>

        {/* ---------------- MAIN CONTENT ---------------- */}
        <main style={styles.main}>
          <h1 style={styles.heading}>Admin Dashboard</h1>

          <div style={styles.grid}>

            {/* ---------------- DRIVERS SECTION ---------------- */}
            <section style={styles.section}>
              <h2 style={styles.subHeading}>Drivers</h2>

              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {drivers.map((driver) => (
                      <tr key={driver.id}>
                        <td>{driver.full_name}</td>
                        <td>{driver.phone}</td>
                        <td>{driver.email}</td>
                        <td>
                          <b
                            style={{
                              color:
                                driver.approval_status === "APPROVED"
                                  ? "green"
                                  : driver.approval_status === "REJECTED"
                                  ? "red"
                                  : "#7a7a00",
                            }}
                          >
                            {driver.approval_status}
                          </b>
                        </td>

                        <td>
                          {driver.approval_status !== "APPROVED" && (
                            <button
                              style={styles.approveBtn}
                              onClick={() =>
                                updateDriverStatus(driver.id, "approve")
                              }
                            >
                              Approve
                            </button>
                          )}

                          {driver.approval_status !== "REJECTED" && (
                            <button
                              style={styles.rejectBtn}
                              onClick={() =>
                                updateDriverStatus(driver.id, "reject")
                              }
                            >
                              Reject
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ---------------- PENDING RIDES SECTION ---------------- */}
            <section style={styles.section}>
              <h2 style={styles.subHeading}>Pending Rides</h2>

              {rides.filter((r) => r.status === "REQUESTED" || !r.driver)
                .length === 0 ? (
                <p>No pending rides</p>
              ) : (
                rides
                  .filter((r) => r.status === "REQUESTED" || !r.driver)
                  .map((ride) => (
                    <div key={ride.id} style={styles.card}>
                      <p>
                        <b>Ride #{ride.id}</b>
                      </p>
                      <p>Pickup: {ride.pickup_address}</p>
                      <p>Drop: {ride.drop_address}</p>
                      <p>Fare: ₹{ride.estimated_fare}</p>

                      <label>Select Driver:</label>
                      <select
                        style={styles.select}
                        value={selectedDriver[ride.id] || ""}
                        onChange={(e) =>
                          setSelectedDriver({
                            ...selectedDriver,
                            [ride.id]: e.target.value,
                          })
                        }
                      >
                        <option value="">Choose driver</option>

                        {drivers
                          .filter(
                            (d) =>
                              d.approval_status === "APPROVED" &&
                              d.is_available
                          )
                          .map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.full_name} ({d.phone})
                            </option>
                          ))}
                      </select>

                      <button
                        style={styles.assignBtn}
                        onClick={() => assignDriver(ride.id)}
                      >
                        Assign Driver
                      </button>
                    </div>
                  ))
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   STYLES 
--------------------------------------------------------- */

const styles = {
  page: {
    width: "100%",
    minHeight: "100vh",
    background: "#eef2f7",
    display: "flex",
    flexDirection: "column",
  },

  /* TOP NAVIGATION BAR */
  topbar: {
    height: "60px",
    background: "#0f1b33",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
  },

  topRight: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },

  topLink: {
    color: "#fff",
    cursor: "pointer",
  },

  logoutTopBtn: {
    background: "#dc3545",
    padding: "8px 14px",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
    border: "none",
  },

  /* SIDEBAR + MAIN WRAPPER */
  wrapper: {
    display: "flex",
    flex: 1,
    marginTop: "60px",
  },

  /* SIDEBAR */
  sidebar: {
    width: "240px",
    background: "#1e1e2f",
    color: "white",
    padding: "20px",
    position: "fixed",
    top: "60px",
    bottom: 0,
    left: 0,
  },

  logo: {
    fontSize: "22px",
    fontWeight: "700",
    marginBottom: "15px",
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  navItem: {
    padding: "10px 12px",
    background: "#2c2c40",
    borderRadius: "6px",
    cursor: "pointer",
  },

  /* MAIN CONTENT */
  main: {
    marginLeft: "260px",
    padding: "25px",
    flex: 1,
  },

  heading: {
    fontSize: "28px",
    marginBottom: "20px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "25px",
  },

  section: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
  },

  tableContainer: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  approveBtn: {
    background: "#28a745",
    padding: "6px 12px",
    color: "#fff",
    borderRadius: "6px",
    marginRight: "8px",
  },

  rejectBtn: {
    background: "#dc3545",
    padding: "6px 12px",
    color: "#fff",
    borderRadius: "6px",
  },

  card: {
    background: "#f8f8f8",
    padding: "15px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    marginBottom: "12px",
  },

  select: {
    width: "100%",
    padding: "8px",
    marginTop: "10px",
    borderRadius: "6px",
  },

  assignBtn: {
    marginTop: "10px",
    background: "#007bff",
    color: "white",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    border: "none",
  },
};
