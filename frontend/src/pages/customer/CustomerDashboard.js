import { useEffect, useState } from "react";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";

export default function CustomerDashboard() {
  const navigate = useNavigate();

  // Retrieve logged-in customer from localStorage
  const customer = JSON.parse(localStorage.getItem("customer"));
  const customerId = customer?.id;

  const [rides, setRides] = useState([]);

  // Fetch customer's ride history
  const loadRides = async () => {
    try {
      const res = await api.get(`/customer/${customerId}/rides/`);
      setRides(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load rides.");
    }
  };

  useEffect(() => {
    if (!customerId) return navigate("/customer/login");

    loadRides();

    // Auto-refresh every 10 seconds
    const timer = setInterval(loadRides, 10000);
    return () => clearInterval(timer);
  }, [customerId]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Welcome, {customer?.full_name}</h2>

        <button
          style={styles.bookBtn}
          onClick={() => navigate("/customer/book")}
        >
          + Book Ride
        </button>
      </div>

      <h3 style={styles.heading}>Your Ride History</h3>

      <div style={styles.listContainer}>
        {rides.length === 0 ? (
          <p>No rides yet. Book your first ride!</p>
        ) : (
          rides.map((ride) => (
            <div key={ride.id} style={styles.card}>
              <p>
                <strong>Ride #{ride.id}</strong>
              </p>
              <p>Pickup: {ride.pickup_address}</p>
              <p>Drop: {ride.drop_address}</p>
              <p>Fare: ₹{ride.estimated_fare}</p>
              <p>
                Status: <b>{ride.status}</b>
              </p>

              <hr />

              <p>
                Driver:{" "}
                {ride.driver ? (
                  <span>{ride.driver.full_name}</span>
                ) : (
                  <span style={{ color: "red" }}>Not Assigned</span>
                )}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ---------------------------
// STYLES
// ---------------------------
const styles = {
  container: {
    padding: "20px",
    background: "#f2f4f7",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  bookBtn: {
    background: "#28a745",
    color: "white",
    padding: "10px 18px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
  },
  heading: {
    marginBottom: "10px",
  },
  listContainer: {
    marginTop: "10px",
  },
  card: {
    background: "white",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "15px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
};
