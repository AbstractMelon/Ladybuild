const express = require("express");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3006;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/builds", async (req, res) => {
  try {
    const response = await axios.get(
      "https://raw.githubusercontent.com/AbstractMelon/Ladybuild/main/builds/builds.json"
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching builds:", error);
    res.status(500).json({ error: "Failed to fetch builds" });
  }
});

app.get("/api/builds/:buildId/downloads", async (req, res) => {
  const buildId = req.params.buildId;
  try {
    const dataFile = path.join(__dirname, "public", "data", "builds.json");
    const data = require(dataFile);
    const build = data.find((build) => build.id === buildId);
    if (!build) throw new Error("Could not find build");
    res.json({ downloads: build.downloads || 0 });
  } catch (error) {
    console.error("Error fetching download count:", error);
    res.status(500).json({ error: "Failed to fetch download count" });
  }
});

app.post("/api/builds/:buildId/increment", async (req, res) => {
  const buildId = req.params.buildId;
  try {
    const dataFile = path.join(__dirname, "public", "data", "builds.json");
    const data = require(dataFile);
    const build = data.find((build) => build.id === buildId);
    if (!build) throw new Error("Could not find build");
    build.downloads = (build.downloads || 0) + 1;
    const dataString = JSON.stringify(data, null, 2);
    await fs.promises.writeFile(dataFile, dataString);
    res.json({ success: true });
  } catch (error) {
    console.error("Error incrementing download count:", error);
    res.status(500).json({ error: "Failed to increment download count" });
  }
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
