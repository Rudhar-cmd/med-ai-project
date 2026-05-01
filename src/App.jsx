import React, { useState } from "react";
import "./App.css";
import jsPDF from "jspdf";

export default function App() {
  const [activePage, setActivePage] = useState("upload");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleSubmit = async () => {
    if (!image) return alert("Upload image first");
  
    setLoading(true);
  
    const formData = new FormData();
    formData.append("file", image);
  
    try {
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
  
      setResult(data);
  
      setHistory((prev) => [
        { image: preview, result: data },
        ...prev,
      ]);
    } catch (error) {
      alert("Backend error");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!result) return;

    const doc = new jsPDF();
    doc.text("Chest Disease Report", 20, 20);
    doc.text(`Result: ${result.label}`, 20, 40);
    doc.text(`Confidence: ${result.confidence}%`, 20, 50);
    doc.save("report.pdf");
  };

  return (
    <div className="app">

      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">MedAI</div>

        <div
          className={`nav-item ${activePage === "dashboard" ? "active" : ""}`}
          onClick={() => setActivePage("dashboard")}
        >
          Dashboard
        </div>

        <div
          className={`nav-item ${activePage === "upload" ? "active" : ""}`}
          onClick={() => setActivePage("upload")}
        >
          Upload Scan
        </div>

        <div
          className={`nav-item ${activePage === "history" ? "active" : ""}`}
          onClick={() => setActivePage("history")}
        >
          History
        </div>

        <div
          className={`nav-item ${activePage === "settings" ? "active" : ""}`}
          onClick={() => setActivePage("settings")}
        >
          Settings
        </div>

        <div className="footer">AI Diagnostic System v1.0</div>
      </div>

      {/* Main */}
      <div className="main">

        {activePage === "dashboard" && (
          <div className="container center">
            <h1>Welcome to MedAI</h1>
            <p>AI-powered chest disease detection system</p>
          </div>
        )}

        {activePage === "upload" && (
          <div className="container split">

            {/* LEFT */}
            <div className="left">

              {!preview && (
                <label className="upload-box">
                  Upload Chest X-ray Image
                  <input type="file" hidden onChange={handleImageUpload} />
                </label>
              )}

              {preview && (
                <>
                  <img src={preview} className="preview" />

                  {loading && (
                    <>
                      <div className="grid-overlay"></div>
                      <div className="scan-line"></div>
                      <div className="heatmap"></div>
                    </>
                  )}
                </>
              )}

            </div>

            {/* RIGHT */}
            <div className="right">
              <h2 className="title">Chest Disease Detection</h2>

              <button className="button" onClick={handleSubmit}>
                {loading ? "Analyzing..." : "Detect Disease"}
              </button>

              {loading && <div className="loading"></div>}

              {result && (
                <div className="result">
                  <h3 className="typing">{result.label}</h3>

                  <div className="confidence-bar">
                    <div
                      className="confidence-fill"
                      style={{ width: `${result.confidence}%` }}
                    ></div>
                  </div>

                  <p>{result.confidence}% confidence</p>

                  <button className="button" onClick={downloadPDF}>
                    Download Report
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {activePage === "history" && (
          <div className="container center">
            <h2>Scan History</h2>

            {history.map((item, i) => (
              <div key={i} className="history-item">
                <img src={item.image} />
                <div>
                  <p>{item.result.label}</p>
                  <span>{item.result.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activePage === "settings" && (
          <div className="container center">
            <h2>Settings</h2>
            <p>Coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}