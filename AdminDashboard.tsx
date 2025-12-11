import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";

interface WaitlistEntry {
  id: string;
  email: string;
  timestamp: any;
}

interface AdminDashboardProps {
  db: any;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ db, onLogout }) => {
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const fetchWaitlist = async () => {
    if (!db) {
      setError("Firebase is not configured. Please add your Firebase config.");
      setLoading(false);
      return;
    }

    try {
      const q = query(collection(db, "waitlist"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      
      const entries: WaitlistEntry[] = [];
      querySnapshot.forEach((doc) => {
        entries.push({
          id: doc.id,
          email: doc.data().email,
          timestamp: doc.data().timestamp
        });
      });
      
      setWaitlistEntries(entries);
      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching waitlist:", err);
      setError(err.message || "Failed to fetch waitlist data");
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return "Invalid date";
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#000", 
      color: "#fff", 
      padding: "20px" 
    }}>
      {/* Header */}
      <div style={{ 
        maxWidth: "1200px", 
        margin: "0 auto",
        borderBottom: "1px solid #333",
        paddingBottom: "20px",
        marginBottom: "30px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "5px" }}>
              Admin Dashboard
            </h1>
            <p style={{ color: "#888", fontSize: "14px" }}>Onetalk Waitlist Management</p>
          </div>
          <button
            onClick={onLogout}
            style={{
              background: "#ef4444",
              color: "#fff",
              padding: "10px 24px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats Card */}
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{
          background: "#111",
          border: "1px solid #333",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "30px"
        }}>
          <h2 style={{ fontSize: "18px", color: "#888", marginBottom: "10px" }}>
            Total Waitlist Signups
          </h2>
          <p style={{ fontSize: "48px", fontWeight: "bold", color: "#7C3AED" }}>
            {loading ? "..." : waitlistEntries.length}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: "#ef444420",
            border: "1px solid #ef4444",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "20px",
            color: "#ef4444"
          }}>
            {error}
          </div>
        )}

        {/* Waitlist Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
            Loading waitlist data...
          </div>
        ) : (
          <div style={{
            background: "#111",
            border: "1px solid #333",
            borderRadius: "12px",
            overflow: "hidden"
          }}>
            <div style={{ padding: "20px", borderBottom: "1px solid #333" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "bold" }}>Waitlist Entries</h3>
            </div>
            
            {waitlistEntries.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#888" }}>
                No waitlist entries yet.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#0a0a0a", borderBottom: "1px solid #333" }}>
                      <th style={{ padding: "16px", textAlign: "left", color: "#888", fontWeight: "600" }}>
                        #
                      </th>
                      <th style={{ padding: "16px", textAlign: "left", color: "#888", fontWeight: "600" }}>
                        Email
                      </th>
                      <th style={{ padding: "16px", textAlign: "left", color: "#888", fontWeight: "600" }}>
                        Signup Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {waitlistEntries.map((entry, index) => (
                      <tr 
                        key={entry.id}
                        style={{ borderBottom: "1px solid #222" }}
                      >
                        <td style={{ padding: "16px", color: "#888" }}>
                          {index + 1}
                        </td>
                        <td style={{ padding: "16px", color: "#fff", fontWeight: "500" }}>
                          {entry.email}
                        </td>
                        <td style={{ padding: "16px", color: "#888" }}>
                          {formatDate(entry.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Refresh Button */}
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button
            onClick={fetchWaitlist}
            disabled={loading}
            style={{
              background: "#7C3AED",
              color: "#fff",
              padding: "12px 32px",
              borderRadius: "8px",
              border: "none",
              cursor: loading ? "wait" : "pointer",
              fontWeight: "600",
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
