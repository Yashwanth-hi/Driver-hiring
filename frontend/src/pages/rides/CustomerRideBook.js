import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CustomerRideBook = () => {
  const navigate = useNavigate();

  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const customer_id = localStorage.getItem("customer_id");

    if (!customer_id) {
      setMessage("Customer not logged in.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/rides/create/",
        {
          customer_id: customer_id,
          pickup_address: pickup,
          drop_address: drop,
          pickup_lat: null,
          pickup_lng: null,
          drop_lat: null,
          drop_lng: null,
          estimated_fare: null,
        }
      );

      setMessage("Ride booked successfully!");
      setTimeout(() => navigate("/customer-dashboard"), 1500);
    } catch (error) {
      console.error(error);
      setMessage("Failed to book ride. Try again.");
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Book a Ride</h2>

      <form style={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Pickup Location"
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
          style={styles.input}
          required
        />

        <input
          type="text"
          placeholder="Drop Location"
          value={drop}
          onChange={(e) => setDrop(e.target.value)}
          style={styles.input}
          required
        />

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Booking..." : "Book Ride"}
        </button>

        {message && <p style={styles.message}>{message}</p>}
      </form>
    </div>
  );
};

// 🎨 Basic styling
const styles = {
  container: {
    maxWidth: "400px",
    margin: "40px auto",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    background: "#ffffff",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "12px",
    marginBottom: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    padding: "12px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
  },
  message: {
    marginTop: "15px",
    textAlign: "center",
    color: "green",
    fontWeight: "bold",
  },
};

export default CustomerRideBook;
