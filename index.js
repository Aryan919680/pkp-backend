import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();

// ✅ Enable CORS globally
app.use(cors());
app.use(bodyParser.json());

const GOOGLE_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbwxB2Zq_tsnQ9vvTfC48e1msz3RoqwYo06K62CTsk1CjMuJZXV5DIO948z-fTos0o4qBw/exec"
app.post("/submit", async (req, res) => {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const text = await response.text(); // 👈 first get raw text
    let data;

    try {
      data = JSON.parse(text); // Try parse JSON
    } catch (err) {
      console.error("Google Script returned non-JSON:", text);
      return res.status(500).json({ error: "Invalid response from Google Script" });
    }

    res.json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req,res)=>{
  res.json("Wokring fine")
})

app.get("/api/enquiries", async (req, res) => {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL);
    const text = await response.text();

    console.log("Google Script Raw:", text.slice(0, 200)); // 👀 debug first 200 chars

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: "Invalid JSON from Google Script",
        raw: text
      });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});



// ✅ No need for app.options("*", …) in Express v5
// If you still want it:
app.options(/.*/, cors());

app.listen(3000, () =>
  console.log("✅ Proxy running at http://localhost:3000")
);
