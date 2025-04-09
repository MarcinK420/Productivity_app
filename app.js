// Initial activities with their difficulty levels
const defaultActivities = [
    { name: "Trening fizyczny", difficulty: 4 },
    { name: "Odkurzanie", difficulty: 2 },
    { name: "Pomoc domowa", difficulty: 3 },
    { name: "Nauka", difficulty: 3 },
    { name: "Projekt", difficulty: 5 },
    { name: "Książka", difficulty: 1 },
    { name: "Duolingo", difficulty: 1 },
    { name: "Film", difficulty: 1 },
    { name: "Praca", difficulty: 4 },
    { name: "Studia", difficulty: 4 },
    { name: "Praca domowa", difficulty: 2 }
];

// Productivity thresholds
const PRODUCTIVE_DAY = 10;
const VERY_PRODUCTIVE_DAY = 15;

// App state
let activities = JSON.parse(localStorage.getItem('activities')) || defaultActivities;
let dailyActivities = JSON.parse(localStorage.getItem('dailyActivities')) || {};

// Habit tracking settings
// const HABIT_SUGGESTION_DAYS = 2; // No longer needed for grid view

// DOM Elements
const tabLinks = document.querySelectorAll('.tabs li');
const tabContents = document.querySelectorAll('.tab-content');

const activitySelect = document.getElementById('activity-select');
const difficultyBadge = document.getElementById('difficulty-level');
const activityComment = document.getElementById('activity-comment');
const addActivityBtn = document.getElementById('add-activity');
const activityList = document.getElementById('activity-list');
const dailyProgress = document.getElementById('daily-progress');
const pointsLabel = document.getElementById('points-label');
const exportJsonBtn = document.getElementById('export-json');

// Habit Grid Elements
const monthSelect = document.getElementById('month-select');
const yearSelect = document.getElementById('year-select');
const updateGridBtn = document.getElementById('update-grid-btn');
const habitGridContainer = document.getElementById('habit-grid-container');

// const recentHabitsList = document.getElementById('recent-habits-list'); // Removed
// const suggestedHabitsList = document.getElementById('suggested-habits-list'); // Removed

const newActivityName = document.getElementById('new-activity-name');
const newActivityDifficulty = document.getElementById('new-activity-difficulty');
const newDifficultyDisplay = document.getElementById('new-difficulty-display');
const saveActivityBtn = document.getElementById('save-activity');
const activitiesTableBody = document.getElementById('activities-table-body');

// Helper function to get local date string in YYYY-MM-DD format
function getLocalDateString(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Helper function to get a timestamp string for filenames
function getTimestampString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Initialize the app
function init() {
    // Load stored daily activities for today (using local date)
    loadDailyActivities();
    
    // Update activities dropdown
    updateActivitySelect();
    
    // Update activities table
    updateActivitiesTable();
    
    // Populate Month/Year selectors for habit grid
    populateDateSelectors();
    
    // Add event listeners
    addEventListeners();
}

// Populate Month and Year Selectors
function populateDateSelectors() {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // 0-indexed
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Populate months
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index; // 0-11
        option.textContent = month;
        if (index === currentMonth) {
            option.selected = true;
        }
        monthSelect.appendChild(option);
    });

    // Populate years (e.g., last 5 years + current year)
    for (let year = currentYear; year >= currentYear - 5; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) {
            option.selected = true;
        }
        yearSelect.appendChild(option);
    }
}

// Load daily activities from localStorage for today (using local date)
function loadDailyActivities() {
    const today = getLocalDateString(new Date()); // Use local date
    
    // If no data for today, initialize it
    if (!dailyActivities[today]) {
        dailyActivities[today] = [];
    }
    
    // Render today's activities
    renderDailyActivities(today);
}

// Save daily activities to localStorage
function saveDailyActivities() {
    localStorage.setItem('dailyActivities', JSON.stringify(dailyActivities));
}

// Save defined activities (habits) to localStorage
function saveActivities() {
    localStorage.setItem('activities', JSON.stringify(activities));
}

// Update activity select dropdown
function updateActivitySelect() {
    activitySelect.innerHTML = '';
    
    activities.forEach(activity => {
        const option = document.createElement('option');
        option.value = activity.name;
        option.textContent = activity.name;
        activitySelect.appendChild(option);
    });
    
    // Update difficulty badge when first loaded
    updateDifficultyBadge();
}

// Update activities table in Manage Activities tab
function updateActivitiesTable() {
    activitiesTableBody.innerHTML = '';
    
    activities.forEach(activity => {
        const row = document.createElement('tr');
        
        const nameCell = document.createElement('td');
        nameCell.textContent = activity.name;
        
        const difficultyCell = document.createElement('td');
        difficultyCell.textContent = activity.difficulty;
        
        const actionsCell = document.createElement('td');
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'action-buttons';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn danger';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteActivity(activity.name));
        
        actionsDiv.appendChild(deleteBtn);
        actionsCell.appendChild(actionsDiv);
        
        row.appendChild(nameCell);
        row.appendChild(difficultyCell);
        row.appendChild(actionsCell);
        
        activitiesTableBody.appendChild(row);
    });
}

// Update difficulty badge based on selected activity
function updateDifficultyBadge() {
    const selectedActivityName = activitySelect.value;
    const activity = activities.find(a => a.name === selectedActivityName);
    
    if (activity) {
        difficultyBadge.textContent = activity.difficulty;
    } else {
        difficultyBadge.textContent = '-'; // Handle case where no activity is selected or found
    }
}

// Add a new activity entry to today's list (using local date)
function addActivity() {
    const selectedActivityName = activitySelect.value;
    const comment = activityComment.value.trim();
    
    if (!selectedActivityName) {
        alert('Please select an activity');
        return;
    }
    
    const activity = activities.find(a => a.name === selectedActivityName);
    
    if (!activity) {
        alert('Selected activity definition not found. Please manage activities.');
        return;
    }
    
    const today = getLocalDateString(new Date()); // Use local date for key
    
    // Create activity entry
    const activityEntry = {
        name: activity.name,
        difficulty: activity.difficulty,
        comment: comment,
        timestamp: new Date().toISOString() // Keep precise UTC timestamp for sorting/recency
    };
    
    // Add to today's activities
    if (!dailyActivities[today]) {
        dailyActivities[today] = [];
    }
    
    dailyActivities[today].push(activityEntry);
    
    // Save and re-render today's list
    saveDailyActivities();
    renderDailyActivities(today);
    
    // Update habit tracking UI immediately as history has changed
    // updateHabitTrackingUI();
    
    // Clear comment field
    activityComment.value = '';
}

// Render the list of activities for a specific date
function renderDailyActivities(date) {
    activityList.innerHTML = ''; // Clear current list
    
    const activitiesForDate = dailyActivities[date] || [];
    let totalPoints = 0;
    
    if (activitiesForDate.length === 0) {
        activityList.innerHTML = '<li class="no-data">No activities added yet for today.</li>';
    } else {
        activitiesForDate.forEach(activity => {
            const li = document.createElement('li');
            
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'activity-details';
            
            const nameDiv = document.createElement('div');
            nameDiv.className = 'activity-name';
            nameDiv.textContent = activity.name;
            
            const commentDiv = document.createElement('div');
            commentDiv.className = 'activity-comment';
            commentDiv.textContent = activity.comment || 'No comment';
            
            const pointsDiv = document.createElement('div');
            pointsDiv.className = 'activity-points';
            pointsDiv.textContent = `${activity.difficulty} points`;
            
            detailsDiv.appendChild(nameDiv);
            detailsDiv.appendChild(commentDiv);
            
            li.appendChild(detailsDiv);
            li.appendChild(pointsDiv);
            
            activityList.appendChild(li);
            
            totalPoints += activity.difficulty;
        });
    }
    
    // Update progress bar and label
    updateProgressBar(totalPoints);
}

// Update the progress bar and points label
function updateProgressBar(totalPoints) {
    const progressPercentage = Math.min((totalPoints / VERY_PRODUCTIVE_DAY) * 100, 100);
    dailyProgress.style.width = `${progressPercentage}%`;
    
    // Change color based on productivity level
    if (totalPoints >= VERY_PRODUCTIVE_DAY) {
        dailyProgress.style.backgroundColor = 'var(--success)';
    } else if (totalPoints >= PRODUCTIVE_DAY) {
        dailyProgress.style.backgroundColor = 'var(--secondary)';
    } else {
        dailyProgress.style.backgroundColor = 'var(--primary)';
    }
    
    // Update points label
    pointsLabel.textContent = `${totalPoints} points`;
}

// Save a new activity type (habit definition)
function saveNewActivity() {
    const name = newActivityName.value.trim();
    const difficulty = parseInt(newActivityDifficulty.value);
    
    if (!name) {
        alert('Please enter an activity name');
        return;
    }
    
    if (activities.some(a => a.name.toLowerCase() === name.toLowerCase())) {
        alert('An activity with this name already exists');
        return;
    }
    
    // Add new activity definition
    activities.push({
        name: name,
        difficulty: difficulty
    });
    
    // Save and update UI
    saveActivities();
    updateActivitySelect();
    updateActivitiesTable();
    // updateHabitTrackingUI(); // Ensure habit tracking reflects the new activity
    
    // Clear form
    newActivityName.value = '';
    newActivityDifficulty.value = 3;
    newDifficultyDisplay.textContent = 3;
}

// Delete an activity type (habit definition)
function deleteActivity(activityName) {
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete the activity "${activityName}"? This will remove it from the list of available activities but won't delete past records.`)) {
        return;
    }
    
    const index = activities.findIndex(a => a.name === activityName);
    
    if (index !== -1) {
        activities.splice(index, 1);
        
        // Save and update UI
        saveActivities();
        updateActivitySelect();
        updateActivitiesTable();
        // updateHabitTrackingUI(); // Habit tracking needs to know the activity is gone
    }
}

// Generate and Display Habit Grid
function generateHabitGrid() {
    const selectedMonth = parseInt(monthSelect.value); // 0-11
    const selectedYear = parseInt(yearSelect.value);

    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay(); // 0=Sunday, 1=Monday, ...
    const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    habitGridContainer.innerHTML = ''; // Clear previous grid or message

    const table = document.createElement('table');
    table.className = 'habit-grid';

    // Create Header Row (Day Numbers)
    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    const habitHeaderCell = document.createElement('th');
    habitHeaderCell.textContent = 'HABIT';
    habitHeaderCell.rowSpan = 2; // Span two rows
    headerRow.appendChild(habitHeaderCell);

    for (let day = 1; day <= daysInMonth; day++) {
        const th = document.createElement('th');
        th.textContent = day;
        headerRow.appendChild(th);
    }

    // Create Second Header Row (Day Letters)
    const dayLetterRow = thead.insertRow();
    for (let day = 1; day <= daysInMonth; day++) {
        const th = document.createElement('th');
        const dayIndex = new Date(selectedYear, selectedMonth, day).getDay();
        th.textContent = dayHeaders[dayIndex];
        th.className = 'day-letter';
        dayLetterRow.appendChild(th);
    }

    // Create Table Body (Habits and Marks)
    const tbody = table.createTBody();
    if (activities.length === 0) {
        const row = tbody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = daysInMonth + 1;
        cell.textContent = 'No habits defined. Add activities in the "Manage Activities" tab.';
        cell.className = 'no-data';
    } else {
        activities.forEach(habit => {
            const row = tbody.insertRow();
            const nameCell = row.insertCell();
            nameCell.textContent = habit.name;
            nameCell.className = 'habit-name-cell';

            for (let day = 1; day <= daysInMonth; day++) {
                const cell = row.insertCell();
                const dateString = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                
                // Check if this habit was done on this day
                const activitiesOnDay = dailyActivities[dateString] || [];
                if (activitiesOnDay.some(act => act.name === habit.name)) {
                    cell.className = 'marked';
                }
                // Optionally add tooltip or other info
                cell.title = `${habit.name} - ${dateString}`;
            }
        });
    }

    habitGridContainer.appendChild(table);
}

// Export ALL application data as JSON (Backup)
function exportToJson() {
    // const today = getLocalDateString(new Date()); // No longer needed for just today
    // const activitiesToExport = dailyActivities[today] || []; // No longer needed
    
    // Check if there's any data to export
    if (activities.length === 0 && Object.keys(dailyActivities).length === 0) {
        alert('No data available to export.');
        return;
    }
    
    // Prepare data structure for complete backup
    const exportData = {
        version: 1, // Add a version number for future compatibility
        exportedAt: new Date().toISOString(),
        activities: activities, // All defined activities/habits
        dailyActivities: dailyActivities // The entire history
        // totalPoints: activitiesToExport.reduce((sum, act) => sum + act.difficulty, 0) // No longer relevant for full export
    };
    
    const dataStr = JSON.stringify(exportData, null, 2); // Pretty print JSON
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const a = document.createElement('a');
    a.href = url;
    // Suggest filename including a timestamp
    const timestamp = getTimestampString();
    const filename = `productivity_backup_${timestamp}.json`;
    a.download = filename; 
    document.body.appendChild(a);
    a.click();
    
    // Clean up the temporary URL and link
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        // Inform the user after triggering the download
        alert(`Backup download started for ${filename}.\n\nPlease save this file in a safe place. You can manually save it to the 'raporty' folder if desired.`);
    }, 0);
}

// Add event listeners
function addEventListeners() {
    // Tab switching logic
    tabLinks.forEach(tab => {
        tab.addEventListener('click', () => {
            // Deactivate all tabs and content sections
            tabLinks.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Activate the clicked tab and corresponding content
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            
            // Generate grid when switching to the habits tab if needed
            // Or rely on the button click
            // if (tabId === 'habits') {
            //    generateHabitGrid(); // Option: generate immediately
            // }
        });
    });
    
    // Update difficulty badge when activity selection changes
    activitySelect.addEventListener('change', updateDifficultyBadge);
    
    // Add activity button
    addActivityBtn.addEventListener('click', addActivity);
    
    // Update difficulty display when slider changes
    newActivityDifficulty.addEventListener('input', () => {
        newDifficultyDisplay.textContent = newActivityDifficulty.value;
    });
    
    // Save new activity definition button
    saveActivityBtn.addEventListener('click', saveNewActivity);
    
    // Export today's data button
    exportJsonBtn.addEventListener('click', exportToJson);

    // Update Habit Grid Button
    updateGridBtn.addEventListener('click', generateHabitGrid);
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);