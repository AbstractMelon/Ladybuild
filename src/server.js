const express = require("express");
const path = require("path");
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

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
