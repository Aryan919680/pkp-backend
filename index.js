import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();

// ✅ Enable CORS globally
app.use(cors());
app.use(bodyParser.json());

const GOOGLE_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbxPG38p6QaIo5oCKxXxCoIxkTAXTQMny-5L9eUyvckJ814SV3Y-IA2teiGYebC3tXs82A/exec";
app.post("/submit", async (req, res) => {
  try {
    // Ensure sheetName is passed
    if (!req.body.sheetName) {
      return res.status(400).json({ error: "sheetName is required" });
    }
    console.log(req.body.sheetName)
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      console.error("Google Script returned non-JSON:", text);
      return res.status(500).json({ error: "Invalid response from Google Script" });
    }

    res.json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET request (read from specific sheet)
app.get("/api/enquiries", async (req, res) => {
  try {
    const sheetName = req.query.sheetName; // e.g. /api/enquiries?sheetName=Sheet2
    if (!sheetName) {
      return res.status(400).json({ error: "sheetName is required" });
    }

    const response = await fetch(`${GOOGLE_SCRIPT_URL}?sheetName=${encodeURIComponent(sheetName)}`);
    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({
        success: false,
        error: "Invalid JSON from Google Script",
        raw: text,
      });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/", (req, res) => {
  res.json("✅ Working fine");
});

// ✅ No need for app.options("*", …) in Express v5
// If you still want it:
app.options(/.*/, cors());

app.listen(3000, () =>
  console.log("✅ Proxy running at http://localhost:3000")
);
