// Constants and elements
const monthlyIncome = 1000;
const titheGoal = monthlyIncome * 0.1;
const submitButton = document.getElementById("submit-entry");
const entriesList = document.getElementById("entries-list");
const totalTithingEl = document.getElementById("total-tithing");
const remainingGoalEl = document.getElementById("remaining-goal");
const monthSelect = document.getElementById("month-select");
const viewYearButton = document.getElementById("view-year");
const yearlyList = document.getElementById("yearly-list");
const editSection = document.getElementById("edit-section");
const yearlySummary = document.getElementById("yearly-summary");

// Load entries from local storage
let entries = JSON.parse(localStorage.getItem("tithingEntries")) || [];
let currentEntryIndex = null;

// Helper functions
function saveEntries() {
  localStorage.setItem("tithingEntries", JSON.stringify(entries));
}

function getEntriesByMonth(month, year) {
  return entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate.getMonth() === month && entryDate.getFullYear() === year;
  });
}

function getMonthlyTotal(month, year) {
  return getEntriesByMonth(month, year).reduce((total, entry) => total + entry.amount, 0);
}

function updateMonthSelect() {
  const uniqueMonths = Array.from(new Set(entries.map(entry => {
    const date = new Date(entry.date);
    return `${date.getFullYear()}-${date.getMonth()}`;
  })));

  monthSelect.innerHTML = '<option value="current">Current Month</option>';
  uniqueMonths.forEach(month => {
    const [year, monthIndex] = month.split('-');
    const option = document.createElement("option");
    option.value = `${year}-${monthIndex}`;
    option.textContent = `${new Date(year, monthIndex).toLocaleString('default', { month: 'long', year: 'numeric' })}`;
    monthSelect.appendChild(option);
  });
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
    saveEntries();
    updateDashboard();
    editSection.style.display = "none";
  }
}

// Event listeners
submitButton.addEventListener("click", () => {
  const amount = parseFloat(document.getElementById("amount").value);
  if (amount) {
    entries.push({ amount, date: new Date().toISOString() });
    saveEntries();
    updateDashboard();
    updateMonthSelect();
    document.getElementById("amount").value = "";
  }
});

monthSelect.addEventListener("change", () => {
  if (monthSelect.value === "current") {
    updateDashboard();
  } else {
    const [year, month] = monthSelect.value.split("-");
    updateDashboard(parseInt(month), parseInt(year));
  }
});

viewYearButton.addEventListener("click", showYearlySummary);

document.getElementById("save-edit").addEventListener("click", saveEdit);
document.getElementById("cancel-edit").addEventListener("click", () => {
  editSection.style.display = "none";
});

// Initialize
updateDashboard();
updateMonthSelect();
