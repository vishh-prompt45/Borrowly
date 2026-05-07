import { useState, useEffect } from "react";

function App() {
  const [mode, setMode] = useState("home");
  const [uid, setUid] = useState("");
  const [isbn, setIsbn] = useState("");
  const [message, setMessage] = useState("");

  // 🔥 AUTO FETCH RFID UID
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://localhost:5000/scan");
        const data = await res.json();

        if (data.uid && data.uid !== uid) {
          setUid(data.uid);
        }
      } catch {}
    }, 1000);

    return () => clearInterval(interval);
  }, [uid]);

  // 🔥 CALCULATE RETURN DATE (+5 DAYS)
  const getReturnDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 5);
    return today.toLocaleDateString();
  };

  // 🔥 HANDLE ISSUE / RETURN
  const handleSubmit = async () => {
    const endpoint = mode === "borrow" ? "issue" : "return";

    try {
      const res = await fetch(`http://localhost:5000/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ uid, isbn })
      });

      const data = await res.json();

      if (data.success) {
        if (mode === "borrow") {
          setMessage(`✅ Book Issued | Return by: ${getReturnDate()}`);
        } else {
          setMessage(`✅ ${data.msg}`);
        }

        setIsbn("");
      } else {
        setMessage(`❌ ${data.msg}`);
      }

    } catch {
      setMessage("❌ Server error");
    }
  };

  // =========================
  // 🏠 HOME SCREEN
  // =========================
  if (mode === "home") {
    return (
      <div style={styles.container}>
        <div style={styles.topBar}>
          <h2>Borrowly</h2>
          <span>{new Date().toLocaleTimeString()}</span>
        </div>

        <div style={styles.home}>
          <h1 style={styles.bigText}>
            Hi <span style={{ color: "#c95c5c" }}>User!</span>
          </h1>

          <div style={styles.cardRow}>
            <div
              style={{ ...styles.actionCard, background: "#2f6df6" }}
              onClick={() => setMode("borrow")}
            >
              📘 Borrow Book
              <p>Scan ID + enter ISBN</p>
            </div>

            <div
              style={{ ...styles.actionCard, background: "#2fa65a" }}
              onClick={() => setMode("return")}
            >
              🔁 Return Book
              <p>Return & check status</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // 📚 BORROW / RETURN SCREEN
  // =========================
  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <h2>Borrowly</h2>
        <span>{new Date().toLocaleTimeString()}</span>
      </div>

      {/* 🔥 HEADER WITH RETURN DATE */}
      <div style={styles.headerRow}>
        <h1 style={styles.pageTitle}>
          {mode === "borrow" ? "Borrow Book" : "Return Book"}
        </h1>

        {mode === "borrow" && (
          <h3 style={styles.returnDate}>
            Return date: {getReturnDate()}
          </h3>
        )}
      </div>

      <div style={styles.main}>
        {/* LEFT SIDE */}
        <div style={styles.left}>
          <div style={styles.step}>
            <h3>1. Scan ID Card</h3>
            <div style={styles.status}>
              {uid ? "✅ ID Scanned" : "⌛ Waiting..."}
            </div>
            <p>{uid || "No UID yet"}</p>
          </div>

          <div style={styles.step}>
            <h3>2. Enter ISBN</h3>
            <input
              style={styles.input}
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="Enter ISBN"
            />
          </div>

          <button style={styles.bigButton} onClick={handleSubmit}>
            {mode === "borrow" ? "Confirm Issue" : "Confirm Return"}
          </button>

          <p style={styles.message}>{message}</p>

          <button style={styles.back} onClick={() => setMode("home")}>
            ⬅ Back
          </button>
        </div>

        {/* RIGHT SIDE */}
        <div style={styles.right}>
          <h3>User Details</h3>
          <p>UID: {uid || "-"}</p>
          <p>Status: Active</p>

          <hr />

          <h3>Book</h3>
          <p>ISBN: {isbn || "-"}</p>

          {mode === "borrow" && (
            <p><strong>Return By:</strong> {getReturnDate()}</p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "Arial",
    background: "#f4f6f8",
    minHeight: "100vh"
  },
  topBar: {
    background: "#222",
    color: "white",
    padding: "10px 20px",
    display: "flex",
    justifyContent: "space-between"
  },
  home: {
    textAlign: "center",
    marginTop: "100px"
  },
  bigText: {
    fontSize: "60px"
  },
  cardRow: {
    display: "flex",
    justifyContent: "center",
    gap: "30px",
    marginTop: "40px"
  },
  actionCard: {
    padding: "30px",
    borderRadius: "12px",
    color: "white",
    cursor: "pointer",
    width: "250px",
    fontSize: "20px"
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 40px"
  },
  returnDate: {
    color: "#c95c5c"
  },
  pageTitle: {
    textAlign: "center",
    color: "#c95c5c"
  },
  main: {
    display: "flex",
    justifyContent: "center",
    gap: "40px",
    marginTop: "30px"
  },
  left: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    width: "350px"
  },
  right: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    width: "300px"
  },
  step: {
    marginBottom: "20px"
  },
  status: {
    fontWeight: "bold",
    marginTop: "5px"
  },
  input: {
    width: "100%",
    padding: "10px",
    marginTop: "10px"
  },
  bigButton: {
    marginTop: "20px",
    padding: "15px",
    width: "100%",
    background: "#2f6df6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px"
  },
  message: {
    marginTop: "15px",
    fontWeight: "bold"
  },
  back: {
    marginTop: "10px",
    background: "transparent",
    border: "none",
    cursor: "pointer"
  }
};

export default App;