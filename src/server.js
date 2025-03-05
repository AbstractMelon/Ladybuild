const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3006;

// Serve the main page
app.get("/", (req, res) => {
  console.log("Received request to /");
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Fetch builds from external source
app.get("/api/builds", async (req, res) => {
  console.log("Received request to /api/builds");
  try {
    const response = await axios.get(
      "https://raw.githubusercontent.com/AbstractMelon/Ladybuild/main/builds/builds.json"
    );
    console.log("Fetched builds from GitHub");
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching builds:", error);
    res.status(500).json({ error: "Failed to fetch builds" });
  }
});

// Get download count for a specific build
app.get("/api/builds/:buildId/downloads", async (req, res) => {
  const buildId = parseInt(req.params.buildId, 10);
  console.log(`Received request to /api/builds/${buildId}/downloads`);
  try {
    const dataFile = path.join(__dirname, "analytics.json");
    const data = (
      await fs.readFile(dataFile, "utf-8").catch(() => "{}")
    ).toString();
    const analytics = JSON.parse(data);
    const downloads = analytics[buildId] || [];
    console.log(`Found ${downloads.length} downloads for build ${buildId}`);
    res.json({ downloads });
  } catch (error) {
    console.error(`Error fetching download count for build ${buildId}:`, error);
    res.status(500).json({ error: "Failed to fetch download count" });
  }
});

// Get download count for all builds
app.get("/api/builds/downloads", async (req, res) => {
  console.log("Received request to /api/builds/downloads");
  try {
    const dataFile = path.join(__dirname, "analytics.json");
    const data = (
      await fs.readFile(dataFile, "utf-8").catch(() => "{}")
    ).toString();
    const analytics = JSON.parse(data);

    const downloadCounts = Object.entries(analytics).reduce(
      (acc, [id, downloads]) => {
        acc[id] = downloads.length;
        acc[`${id}-times`] = downloads;
        return acc;
      },
      {}
    );

    console.log("Fetched download counts for all builds");
    res.json({ downloadCounts });
  } catch (error) {
    console.error("Error fetching download counts for all builds:", error);
    res.status(500).json({ error: "Failed to fetch download counts" });
  }
});

// Increment download count for a specific build
app.post("/api/builds/:buildId/increment", async (req, res) => {
  const buildId = parseInt(req.params.buildId, 10);
  console.log(`Received request to /api/builds/${buildId}/increment`);
  try {
    const dataFile = path.join(__dirname, "analytics.json");

    // Read the JSON file
    const data = (
      await fs.readFile(dataFile, "utf-8").catch(() => "{}")
    ).toString();
    const analytics = JSON.parse(data);

    // Initialize the array if it doesn't exist
    if (!analytics[buildId]) {
      analytics[buildId] = [];
    }

    // Add the current time to the list
    analytics[buildId].push(new Date().toISOString());

    // Write the updated data back to the file
    await fs.writeFile(dataFile, JSON.stringify(analytics, null, 2));

    // Respond with success
    console.log(`Incremented download count for build ${buildId}`);
    res.json({ success: true });
  } catch (error) {
    console.error(
      `Error incrementing download count for build ${buildId}:`,
      error
    );
    res.status(500).json({ error: "Failed to increment download count" });
  }
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
