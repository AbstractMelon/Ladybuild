const API_BASE_URL = '/api';
const buildsContainer = document.querySelector('.grid');
const searchInput = document.querySelector('input[type="text"]');
const platformSelect = document.querySelector('select');
const weeklyBuildButton = document.querySelector('.weekly-btn');

const fetchBuilds = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/builds`);
        if (!response.ok) throw new Error("Failed to fetch builds");
        return await response.json();
    } catch (error) {
        console.error("Error fetching builds:", error);
        return [];
    }
};

const handleDownload = async (downloadUrl, buildId) => {
    try {
        await fetch(`${API_BASE_URL}/increment/${buildId}`).catch(() => {});
    } finally {
        window.location.href = downloadUrl;
    }
};

const getPlatformIcon = (platform) => {
    const icons = {
        windows: 'windows',
        linux: 'linux',
        mac: 'apple',
        macos: 'apple',
        all: 'globe'
    };
    return icons[platform.toLowerCase()] || 'question';
};

function filterAndDisplayBuilds(builds, searchTerm = '', selectedPlatform = 'all') {
    if (!builds.length) {
        buildsContainer.innerHTML = `
            <div class="col-span-full text-center text-gray-400">
                <p>No builds available.</p>
            </div>
        `;
        return;
    }

    const weeklyBuild = builds.find(build => build.isWeekly && build.platform === 'all');
    updateWeeklyBuildButton(weeklyBuild);

    const filteredBuilds = builds.filter(build => {
        const matchesSearch = build.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (build.platform?.toLowerCase() ?? '').includes(searchTerm.toLowerCase());
        const matchesPlatform = selectedPlatform === 'all' || build.platform === selectedPlatform;
        return (!build.isWeekly || build.platform !== 'all') && matchesSearch && matchesPlatform;
    });

    renderBuilds(filteredBuilds);
}

function updateWeeklyBuildButton(weeklyBuild) {
    if (weeklyBuild) {
        weeklyBuildButton.onclick = () => handleDownload(weeklyBuild.downloadUrl, weeklyBuild.id);
        weeklyBuildButton.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
        weeklyBuildButton.onclick = null;
        weeklyBuildButton.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

function renderBuilds(builds) {
    if (builds.length === 0) {
        buildsContainer.innerHTML = `
            <div class="col-span-full text-center text-gray-400">
                <p>No builds found matching your criteria.</p>
            </div>
        `;
        return;
    }
    
    buildsContainer.innerHTML = builds.map(build => `
        <div class="bg-dark-card rounded-xl p-6 card-shadow transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary/10 border border-gray-800/10">
            <div class="flex items-center gap-4 mb-4">
                <i class="fab fa-${getPlatformIcon(build.platform)} text-3xl text-primary"></i>
                <div class="flex-1">
                    <div class="flex items-center gap-2">
                        <h2 class="text-xl font-semibold">${build.name}</h2>
                        <span class="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">Stable(ish)</span>
                    </div>
                </div>
            </div>
            <div class="flex justify-between items-center mb-4">
                <p class="text-gray-400">${new Date(build.date).toLocaleDateString()}</p>
                <button onclick="handleDownload('${build.downloadUrl}', '${build.id}')" 
                        class="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors duration-300">
                    <i class="fas fa-download mr-2"></i>Download
                </button>
            </div>
            <div class="flex gap-2">
                <span class="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">${build.platform.toUpperCase()}</span>
            </div>
        </div>
    `).join('');
}

// Event listeners
searchInput.addEventListener('input', async () => {
    const builds = await fetchBuilds();
    filterAndDisplayBuilds(builds, searchInput.value, platformSelect.value);
});

platformSelect.addEventListener('change', async () => {
    const builds = await fetchBuilds();
    filterAndDisplayBuilds(builds, searchInput.value, platformSelect.value);
});

// Initial load
(async () => {
    const builds = await fetchBuilds();
    filterAndDisplayBuilds(builds);
})();

// Loading state
buildsContainer.innerHTML = `
    <div class="col-span-full text-center text-gray-400">
        <p>Loading builds...</p>
    </div>
`;
