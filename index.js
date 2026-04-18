const express = require("express");
const fetch = require("node-fetch");

const app = express();

// 🔥 APIs
const APIs = [
  "https://ff-ez-bot1.onrender.com/join",
  "https://ff-ez-bot2.onrender.com/join"
];

// 🔥 round robin
let lastIndex = -1;

// 🔥 lock system
let locks = {};
const LOCK_TIME = 80;

// =========================
// API SELECTOR
// =========================
function getAPI() {
  let now = Date.now();

  for (let i = 1; i <= APIs.length; i++) {
    let idx = (lastIndex + i) % APIs.length;

    if (!locks[idx] || now - locks[idx] > LOCK_TIME) {
      locks[idx] = now;
      lastIndex = idx;
      return APIs[idx];
    }
  }

  lastIndex = (lastIndex + 1) % APIs.length;
  return APIs[lastIndex];
}

// =========================
// QUERY BUILDER
// =========================
function buildQuery(q) {
  let { tc, uid1, uid2, uid3, uid4, emote_id } = q;

  if (!tc || !uid1 || !emote_id) return null;

  let params = new URLSearchParams();

  params.append("tc", tc);
  params.append("uid1", uid1);
  params.append("emote_id", emote_id);

  if (uid2) params.append("uid2", uid2);
  if (uid3) params.append("uid3", uid3);
  if (uid4) params.append("uid4", uid4);

  return params.toString();
}
app.get("/", (req, res) => {
  res.send("Controller Alive");
});
// =========================
// MAIN ROUTE
// =========================
app.get("/join", async (req, res) => {
  try {
    console.log("JOIN HIT:", req.query); // 👈 add this

    let query = buildQuery(req.query);

    if (!query) {
      return res.status(400).send("tc, uid1, emote_id required");
    }

    let api = getAPI();
    let url = api + "?" + query;

    console.log("Forwarding to:", url); // 👈 add this

    let response = await fetch(url);
    let data = await response.text();

    res.send(data);

  } catch (err) {
    console.error("ERROR:", err); // 👈 add this
    res.status(500).send("Error: " + err.message);
  }
});

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Controller running on port", PORT);
});
