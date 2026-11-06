// ===================================================
// crud.js - Study Materials Manager (Lab 3 Part 2)
// ===================================================

const STORAGE_KEY = "inclusive_study_materials_vault";

// Initial seed data used if storage is missing or corrupted
const SEED_DATA = [
    {
        id: "mat-101",
        title: "The Solar System & Planetary Motion",
        category: "Science",
        readingLevel: "Beginner",
        wordCount: 180,
        hasAudio: true,
        content: "Planets orbit around the Sun. Earth is the third planet and has one natural moon."
    },
    {
        id: "mat-102",
        title: "Ancient Civilizations: The Silk Road",
        category: "History",
        readingLevel: "Intermediate",
        wordCount: 320,
        hasAudio: true,
        content: "The Silk Road was an extensive trade route connecting Asia, the Mediterranean, and Europe."
    },
    {
        id: "mat-103",
        title: "Cellular Biology: Photosynthesis Basics",
        category: "Science",
        readingLevel: "Advanced",
        wordCount: 450,
        hasAudio: false,
        content: "Plants convert light energy, carbon dioxide, and water into glucose through chloroplasts."
    }
];

// In-memory Array of Objects
let materials = [];
let editingId = null; // null = CREATE mode, string = UPDATE mode

/**
 * Loads items from localStorage with safe try/catch error handling
 */
function loadItems() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            materials = JSON.parse(stored);
        } else {
            materials = [...SEED_DATA];
            saveItems();
        }
    } catch (error) {
        console.error("Corrupted localStorage detected. Resetting to initial seed data:", error);
        materials = [...SEED_DATA];
        saveItems();
    }
}

/**
 * Saves current array state into localStorage safely
 */
function saveItems() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(materials));
    } catch (err) {
        console.error("Error saving data to localStorage:", err);
        alert("Failed to save data. Storage quota may be full.");
    }
}

/**
 * Validates the Create/Update input values
 */
function validateItem(title, category, readingLevel, wordCount, content) {
    if (!title || title.trim().length < 3) {
        alert("Validation error: Title must be at least 3 characters long.");
        return false;
    }
    if (!category) {
        alert("Validation error: Please select a category.");
        return false;
    }
    if (!readingLevel) {
        alert("Validation error: Please choose a reading difficulty level.");
        return false;
    }
    const count = Number(wordCount);
    if (isNaN(count) || count <= 0) {
        alert("Validation error: Word count must be a positive number.");
        return false;
    }
    if (!content || content.trim().length < 10) {
        alert("Validation error: Passage content must be at least 10 characters long.");
        return false;
    }
    return true;
}

/**
 * Renders materials into dynamic cards with conditional UI state
 */
function renderItems(itemsToRender) {
    const container = document.getElementById("materialsGrid");
    const countDisplay = document.getElementById("itemCountDisplay");
    if (!container) return;

    container.innerHTML = "";
    if (countDisplay) {
        countDisplay.textContent = `Showing ${itemsToRender.length} material(s)`;
    }

    if (itemsToRender.length === 0) {
        container.innerHTML = `<div class="empty-state"><p>No study materials match your search or filter.</p></div>`;
        return;
    }

    itemsToRender.forEach(item => {
        // Conditional UI styling
        let badgeColorClass = "badge-beginner";
        if (item.readingLevel === "Intermediate") badgeColorClass = "badge-intermediate";
        if (item.readingLevel === "Advanced") badgeColorClass = "badge-advanced";

        const audioBadge = item.hasAudio
            ? `<span class="badge badge-audio" title="Audio narration available">🔊 Audio Ready</span>`
            : `<span class="badge badge-no-audio" title="Text-only format">📄 Text Only</span>`;

        const card = document.createElement("article");
        card.className = "material-card";
        card.innerHTML = `
            <div class="card-header">
                <span class="badge ${badgeColorClass}">${item.readingLevel}</span>
                <span class="category-tag">${item.category}</span>
            </div>
            <h3>${item.title}</h3>
            <p class="card-excerpt">${item.content}</p>
            <div class="card-meta">
                <span><strong>Words:</strong> ${item.wordCount}</span>
                ${audioBadge}
            </div>
            <div class="card-actions">
                <button class="btn btn-secondary btn-sm" onclick="editItem('${item.id}')">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteItem('${item.id}')">Delete</button>
            </div>
        `;
        container.appendChild(card);
    });
}

/**
 * Handles Create & Update submissions
 */
function handleFormSubmit(event) {
    event.preventDefault();

    const title = document.getElementById("matTitle").value;
    const category = document.getElementById("matCategory").value;
    const readingLevel = document.getElementById("matLevel").value;
    const wordCount = document.getElementById("matWordCount").value;
    const hasAudio = document.getElementById("matHasAudio").checked;
    const content = document.getElementById("matContent").value;

    if (!validateItem(title, category, readingLevel, wordCount, content)) {
        return;
    }

    if (editingId) {
        // UPDATE existing item
        const index = materials.findIndex(m => m.id === editingId);
        if (index !== -1) {
            materials[index] = {
                ...materials[index],
                title: title.trim(),
                category: category,
                readingLevel: readingLevel,
                wordCount: Number(wordCount),
                hasAudio: Boolean(hasAudio),
                content: content.trim()
            };
        }
        editingId = null;
        document.getElementById("formSubmitBtn").textContent = "Add Material";
        document.getElementById("cancelEditBtn").style.display = "none";
    } else {
        // CREATE new item
        const newItem = {
            id: "mat-" + Date.now(),
            title: title.trim(),
            category: category,
            readingLevel: readingLevel,
            wordCount: Number(wordCount),
            hasAudio: Boolean(hasAudio),
            content: content.trim()
        };
        materials.unshift(newItem);
    }

    saveItems();
    document.getElementById("materialForm").reset();
    applyFilters();
}

/**
 * Pre-fills form for Editing
 */
function editItem(id) {
    const item = materials.find(m => m.id === id);
    if (!item) return;

    editingId = id;
    document.getElementById("matTitle").value = item.title;
    document.getElementById("matCategory").value = item.category;
    document.getElementById("matLevel").value = item.readingLevel;
    document.getElementById("matWordCount").value = item.wordCount;
    document.getElementById("matHasAudio").checked = item.hasAudio;
    document.getElementById("matContent").value = item.content;

    document.getElementById("formSubmitBtn").textContent = "Update Material";
    document.getElementById("cancelEditBtn").style.display = "inline-block";

    // Scroll smoothly to form
    document.getElementById("materialForm").scrollIntoView({ behavior: "smooth" });
}

/**
 * Deletes item by ID
 */
function deleteItem(id) {
    const confirmed = confirm("Are you sure you want to remove this study material?");
    if (!confirmed) return;

    materials = materials.filter(m => m.id !== id);
    saveItems();
    applyFilters();
}

/**
 * Search, filter and sort logic
 */
function applyFilters() {
    const searchQuery = document.getElementById("searchInput").value.toLowerCase().trim();
    const categoryFilter = document.getElementById("categoryFilter").value;
    const sortCriteria = document.getElementById("sortSelector").value;

    let filtered = materials.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery) ||
                              item.content.toLowerCase().includes(searchQuery);
        const matchesCategory = (categoryFilter === "all") || (item.category === categoryFilter);
        return matchesSearch && matchesCategory;
    });

    // Sorting
    if (sortCriteria === "wordsAsc") {
        filtered.sort((a, b) => a.wordCount - b.wordCount);
    } else if (sortCriteria === "wordsDesc") {
        filtered.sort((a, b) => b.wordCount - a.wordCount);
    } else if (sortCriteria === "titleAsc") {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    renderItems(filtered);
}

// Cancel editing handler
function cancelEditing() {
    editingId = null;
    document.getElementById("materialForm").reset();
    document.getElementById("formSubmitBtn").textContent = "Add Material";
    document.getElementById("cancelEditBtn").style.display = "none";
}

// --- Event Listeners Initialization ---
document.addEventListener("DOMContentLoaded", () => {
    loadItems();
    applyFilters();

    const form = document.getElementById("materialForm");
    if (form) form.addEventListener("submit", handleFormSubmit);

    const cancelBtn = document.getElementById("cancelEditBtn");
    if (cancelBtn) cancelBtn.addEventListener("click", cancelEditing);

    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.addEventListener("input", applyFilters);

    const categoryFilter = document.getElementById("categoryFilter");
    if (categoryFilter) categoryFilter.addEventListener("change", applyFilters);

    const sortSelector = document.getElementById("sortSelector");
    if (sortSelector) sortSelector.addEventListener("change", applyFilters);
});