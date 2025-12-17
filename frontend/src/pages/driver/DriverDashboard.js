import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function DriverDashboard() {
  const driver = JSON.parse(localStorage.getItem("driver"));

  const [wsStatus, setWsStatus] = useState(false);
  const [stats, setStats] = useState({
    total_rides: 0,
    total_earnings: 0,
    today_earnings: 0,
    week_earnings: 0,
  });

  const mapRef = useRef(null); // ⭐ Prevents multiple map initialization

  /* ===========================================
     LOAD DRIVER STATS
  ============================================ */
  const loadStats = async () => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/driver/${driver.id}/rides/`
      );
      const rides = await res.json();

      const totalEarnings = rides.reduce(
        (sum, r) => sum + Number(r.estimated_fare || 0),
        0
      );
      const totalRides = rides.length;

      const today = new Date().toISOString().slice(0, 10);
      const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);

      const todayEarnings = rides
        .filter((r) => r.completed_at?.slice(0, 10) === today)
        .reduce((sum, r) => sum + Number(r.estimated_fare || 0), 0);

      const weekEarnings = rides
        .filter((r) => new Date(r.completed_at) >= weekAgo)
        .reduce((sum, r) => sum + Number(r.estimated_fare || 0), 0);

      setStats({
        total_rides: totalRides,
        total_earnings: totalEarnings,
        today_earnings: todayEarnings,
        week_earnings: weekEarnings,
      });
    } catch (err) {
      console.log("Failed loading stats", err);
    }
  };

  /* ===========================================
     INIT MAP - SAFE WAY
  ============================================ */
  useEffect(() => {
    if (mapRef.current) return; // ⭐ Prevent double initialization

    // Fix old map reference issue
    const existingMap = L.DomUtil.get("driverMap");
    if (existingMap !== null) {
      existingMap._leaflet_id = null;
    }

    mapRef.current = L.map("driverMap").setView([20.5937, 78.9629], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
      mapRef.current
    );

    L.marker([20.5937, 78.9629]).addTo(mapRef.current);

    loadStats();
  }, []);

  /* ===========================================
     WEBSOCKET
  ============================================ */
  useEffect(() => {
    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/driver/${driver.id}/`
    );

    ws.onopen = () => setWsStatus(true);
    ws.onclose = () => setWsStatus(false);
    ws.onerror = () => setWsStatus(false);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      alert("🚖 New Ride Assigned!\nPickup: " + data.pickup);
      loadStats();
    };
  }, []);

  return (
    <div style={styles.wrapper}>
      {/* ================= SIDEBAR ================= */}
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>Driver Panel</h2>

        <div style={styles.menuItem}>Dashboard</div>
        <div style={styles.menuItem}>My Rides</div>
        <div style={styles.menuItem}>Earnings</div>
        <div style={styles.menuItem}>Profile</div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main style={styles.main}>
        <div style={styles.contentWrapper}>
          <h1 style={styles.heading}>Welcome, {driver.full_name}</h1>

          {/* WebSocket Status */}
          <div style={styles.statusRow}>
            <b>WebSocket:</b>
            <span
              style={wsStatus ? styles.dotOnline : styles.dotOffline}
            ></span>
            {wsStatus ? "Connected" : "Disconnected"}
          </div>

          {/* STATS CARDS */}
          <div style={styles.statsGrid}>
            <div style={styles.card}>
              <h3>Total Rides</h3>
              <p style={styles.statNumber}>{stats.total_rides}</p>
            </div>

            <div style={styles.card}>
              <h3>Total Earnings</h3>
              <p style={styles.statNumber}>₹ {stats.total_earnings}</p>
            </div>

            <div style={styles.card}>
              <h3>Today's Earnings</h3>
              <p style={styles.statNumber}>₹ {stats.today_earnings}</p>
            </div>

            <div style={styles.card}>
              <h3>This Week Earnings</h3>
              <p style={styles.statNumber}>₹ {stats.week_earnings}</p>
            </div>
          </div>

          {/* MAP */}
          <div id="driverMap" style={styles.map}></div>
        </div>
      </main>
    </div>
  );
}

/* ===========================================
   STYLES
=========================================== */
const styles = {
  wrapper: {
    display: "flex",
    width: "100%",
  },

  sidebar: {
    width: "220px",
    background: "#1e1e2f",
    color: "white",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    position: "fixed",
    top: "80px",
    bottom: 0,
    left: 0,
    zIndex: 10,
  },

  main: {
    marginLeft: "240px", // ⭐ FIX so main content clears sidebar
    marginTop: "100px", // ⭐ FIX so content clears navbar
    padding: "25px",
    flex: 1,
    background: "#f5f6fa",
  },

  contentWrapper: {
    padding: "10px",
  },

  heading: {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "15px",
  },

  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "20px",
  },

  dotOnline: {
    width: "12px",
    height: "12px",
    background: "green",
    borderRadius: "50%",
  },

  dotOffline: {
    width: "12px",
    height: "12px",
    background: "red",
    borderRadius: "50%",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    marginBottom: "25px",
  },

  card: {
    background: "#fff",
    padding: "18px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    textAlign: "center",
  },

  statNumber: {
    fontSize: "28px",
    fontWeight: "700",
    marginTop: "10px",
  },

  map: {
    width: "100%",
    height: "450px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
};
