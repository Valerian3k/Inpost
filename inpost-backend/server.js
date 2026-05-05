import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

// In-memory cache for locker data
let cache = null;
let isLoading = true;

const CACHE_TIME = 1000 * 60 * 60; // 1 hour

// ----------------------
// Fetch all lockers from InPost API (paginated + concurrent)
// ----------------------
async function fetchAllFromInPost() {
  console.log("Fetching locker data from InPost API...");

  const start = Date.now();
  const perPage = 100;

  try {
    const first = await fetch(
      `https://api-global-points.easypack24.net/v1/points?page=1&per_page=${perPage}`
    ).then((r) => r.json());

    const totalPages = first.total_pages;
    let results = [...first.items];

    let currentPage = 2;
    const concurrency = 10;

    async function worker() {
      while (true) {
        const page = currentPage++;
        if (page > totalPages) break;

        try {
          const res = await fetch(
            `https://api-global-points.easypack24.net/v1/points?page=${page}&per_page=${perPage}`
          );

          const data = await res.json();
          results.push(...data.items);
        } catch (err) {
          console.error(`Error fetching page ${page}`, err);
        }
      }
    }

    await Promise.all(Array.from({ length: concurrency }, worker));

    const end = Date.now();

    console.log(`Loaded ${results.length} lockers`);
    console.log(`Execution time: ${(end - start) / 1000}s`);

    return results;
  } catch (err) {
    console.error("Critical fetch error:", err);

    // Optional: system-level alert/log (backend safe)
    console.error("ALERT: Failed to fetch locker data from external API");

    return [];
  }
}

// ----------------------
// Initial preload (server startup)
// ----------------------
async function init() {
  try {
    cache = await fetchAllFromInPost();
    isLoading = false;

    console.log("Cache initialized successfully");
  } catch (err) {
    console.error("Initialization failed:", err);
    console.error("ALERT: Cache initialization failed");
  }
}

// Start preload
init();

// ----------------------
// Background cache refresh (runs periodically)
// ----------------------
setInterval(async () => {
  console.log("Refreshing cache...");

  try {
    const newData = await fetchAllFromInPost();
    cache = newData;

    console.log("Cache refreshed successfully");
  } catch (err) {
    console.error("Cache refresh failed:", err);
    console.error("ALERT: Cache refresh failed");
  }
}, CACHE_TIME);

// ----------------------
// API endpoint: /api/points
// Optional query: ?country=PL
// ----------------------
app.get("/api/points", (req, res) => {
  const country = req.query.country;

  // Data still loading
  if (isLoading) {
    return res.status(503).json({
      message: "Data is still loading. Please try again shortly.",
    });
  }

  console.log("Incoming request: /api/points");

  try {
    const filtered = country
      ? cache?.filter((p) => p.country === country)
      : cache;

    res.json(filtered);
  } catch (err) {
    console.error("API error:", err);

    // Backend "alert"
    console.error("ALERT: API response failure");

    res.status(500).json({
      message: "Internal server error",
    });
  }
});

// ----------------------
// Server start
// ----------------------
app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});