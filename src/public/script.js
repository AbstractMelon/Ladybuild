// Fetch build data from API
const fetchBuilds = async () => {
  try {
    const response = await fetch("/api/builds");
    if (!response.ok) throw new Error("Failed to fetch builds");
    return await response.json();
  } catch (error) {
    console.error("Error fetching builds:", error);
    return [];
  }
};

// Increment download count for a build
const incrementDownloadCount = async (buildId) => {
  try {
    const response = await fetch("/api/builds/" + buildId + "/increment", {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to increment download count");
  } catch (error) {
    console.error("Error incrementing download count:", error);
  }
};

// Render builds to the DOM
const renderBuilds = (builds, searchQuery = "", selectedPlatform = "all") => {
  const buildList = document.getElementById("buildList");
  buildList.innerHTML = "";

  const filteredBuilds = builds.filter(
    (build) =>
      (build.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (build.platform?.toLowerCase() ?? "").includes(
          searchQuery.toLowerCase()
        )) &&
      (selectedPlatform === "all" || build.platform === selectedPlatform)
  );

  if (filteredBuilds.length === 0) {
    buildList.innerHTML = `<p class="text-gray-400 text-center">No builds found.</p>`;
    return;
  }

  filteredBuilds.forEach((build) => {
    const buildItem = document.createElement("div");
    buildItem.className =
      "p-4 bg-dark-purple rounded-lg hover:bg-dark-purple transition-all duration-300";
    buildItem.innerHTML = `
          <h3 class="text-xl font-semibold text-purple-400">${build.name}</h3>
          <div class="mb-4">
            <span class="bg-purple-600 text-white px-2 py-1 rounded text-sm">
              ${build.platform?.toUpperCase() ?? "None"}
            </span>
          </div>
          <p class="text-gray-400 mb-4">${build.date}</p>
          <a
            href="${build.downloadUrl}"
            class="w-full block text-center bg-purple-600 hover:bg-purple-800 text-white py-2 rounded-lg transition duration-300"
            onclick="incrementDownloadCount(${build.id})"
          >
            Download
          </a>
        `;
    buildList.appendChild(buildItem);
  });
};

// Handle search input
document.getElementById("searchInput").addEventListener("input", (e) => {
  const searchQuery = e.target.value;
  const selectedPlatform = document.getElementById("platformFilter").value;
  fetchBuilds().then((builds) =>
    renderBuilds(builds, searchQuery, selectedPlatform)
  );
});

// Handle platform filter change
document.getElementById("platformFilter").addEventListener("change", (e) => {
  const selectedPlatform = e.target.value;
  const searchQuery = document.getElementById("searchInput").value;
  fetchBuilds().then((builds) =>
    renderBuilds(builds, searchQuery, selectedPlatform)
  );
});

// Handle weekly build button
// document.getElementById("weeklyBuild").addEventListener("click", () => {
//   fetchBuilds().then((builds) => {
//     const weeklyBuild = builds.find((build) => build.isWeekly);
//     if (weeklyBuild) {
//       window.location.href = weeklyBuild.downloadUrl;
//     } else {
//       alert("Weekly build not found.");
//     }
//   });
// });

// Initial load
fetchBuilds().then((builds) => renderBuilds(builds));
