import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();

// ✅ Enable CORS globally
app.use(cors());
app.use(bodyParser.json());

const GOOGLE_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbwVytk1hUEvItJUQJvcsJQn4UBnYdBCaGech7JeNikpTtPs8DgP6hspuBMxdHpwbVdajA/exec"
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
    const data = await response.json();
    res.json(data); // send back to frontend
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch enquiries" });
  }
});


// ✅ No need for app.options("*", …) in Express v5
// If you still want it:
app.options(/.*/, cors());

app.listen(3000, () =>
  console.log("✅ Proxy running at http://localhost:3000")
);
