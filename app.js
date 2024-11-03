// GitHub API Configuration
const GITHUB_USERNAME = "andibde";
const REPO_NAME = "tithingtracker";
const FILE_PATH = "data.json";
const TOKEN = "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";
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`;

// HTML Elements
const submitButton = document.getElementById("submit-entry");
const entriesList = document.getElementById("entries-list");
const totalTithingEl = document.getElementById("total-tithing");
const remainingGoalEl = document.getElementById("remaining-goal");
const monthSelect = document.getElementById("month-select");
const viewYearButton = document.getElementById("view-year");
const yearlyList = document.getElementById("yearly-list");
const editSection = document.getElementById("edit-section");
const yearlySummary = document.getElementById("yearly-summary");

const monthlyIncome = 1000;
const titheGoal = monthlyIncome * 0.1;
let entries = [];
let currentEntryIndex = null;

// Function to fetch data from GitHub
async function fetchData() {
  try {
    const response = await fetch(GITHUB_API_URL, {
      headers: {
        Authorization: `token ${TOKEN}`,
      },
    });
    const data = await response.json();
    entries = JSON.parse(atob(data.content)); // Decode base64 content
    console.log("Fetched data:", entries);
    updateDashboard();
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Function to update data on GitHub
async function updateData() {
  try {
    // Get the SHA of the existing file (required for GitHub updates)
    const response = await fetch(GITHUB_API_URL, {
      headers: {
        Authorization: `token ${TOKEN}`,
      },
    });
    const fileData = await response.json();
    const sha = fileData.sha;

    // Update data.json with new content
    const putResponse = await fetch(GITHUB_API_URL, {
      method: "PUT",
      headers: {
        Authorization: `token ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Update tithing data",
        content: btoa(JSON.stringify(entries, null, 2)), // Encode data to base64
        sha: sha, // Required to update the existing file
      }),
    });

    if (putResponse.ok) {
      console.log("Data updated successfully.");
    } else {
      console.error("Error updating data:", await putResponse.text());
    }
  } catch (error) {
    console.error("Error updating data:", error);
  }
}

// Helper functions
function getEntriesByMonth(month, year) {
  return entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate.getMonth() === month && entryDate.getFullYear() === year;
  });
}

function getMonthlyTotal(month, year) {
  return getEntriesByMonth(month, year).reduce((total, entry) => total + entry.amount, 0);
}

function updateDashboard(month = new Date().getMonth(), year = new Date().getFullYear()) {
  const selectedEntries = getEntriesByMonth(month, year);
  const totalTithing = selectedEntries.reduce((total, entry) => total + entry.amount, 0);
  const remainingGoal = Math.max(0, titheGoal - totalTithing);

  totalTithingEl.textContent = totalTithing.toFixed(2);
  remainingGoalEl.textContent = remainingGoal.toFixed(2);
  entriesList.innerHTML = "";

  selectedEntries.forEach((entry, index) => {
    const listItem = document.createElement("li");
    listItem.textContent = `${new Date(entry.date).toLocaleDateString()}: €${entry.amount.toFixed(2)}`;
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.onclick = () => startEdit(entry, index);
    listItem.appendChild(editButton);
    entriesList.appendChild(listItem);
  });
}

function showYearlySummary() {
  yearlySummary.style.display = "block";
  yearlyList.innerHTML = "";
  const year = new Date().getFullYear();
  for (let month = 0; month < 12; month++) {
    const total = getMonthlyTotal(month, year);
    const listItem = document.createElement("li");
    listItem.textContent = `${new Date(year, month).toLocaleString('default', { month: 'long' })}: €${total.toFixed(2)}`;
    yearlyList.appendChild(listItem);
  }
}

function startEdit(entry, index) {
  currentEntryIndex = index;
  document.getElementById("edit-amount").value = entry.amount;
  document.getElementById("edit-date").value = entry.date.slice(0, 10);
  editSection.style.display = "block";
}

function saveEdit() {
  const amount = parseFloat(document.getElementById("edit-amount").value);
  const date = document.getElementById("edit-date").value;
  if (amount && date) {
    entries[currentEntryIndex] = { amount, date };
    updateData(); // Save to GitHub
    updateDashboard();
    editSection.style.display = "none";
  }
}

// Event listeners
submitButton.addEventListener("click", () => {
  const amount = parseFloat(document.getElementById("amount").value);
  if (amount) {
    entries.push({ amount, date: new Date().toISOString() });
    updateData(); // Save to GitHub
    updateDashboard();
    document.getElementById("amount").value = "";
  }
});

monthSelect.addEventListener("change", () => {
  const [year, month] = monthSelect.value.split("-");
  if (monthSelect.value === "current") {
    updateDashboard();
  } else {
    updateDashboard(parseInt(month), parseInt(year));
  }
});

viewYearButton.addEventListener("click", showYearlySummary);

document.getElementById("save-edit").addEventListener("click", saveEdit);
document.getElementById("cancel-edit").addEventListener("click", () => {
  editSection.style.display = "none";
});

// Initialize
fetchData(); // Load data from GitHub on startup
