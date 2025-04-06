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
let dailyActivities = {};

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

const statsDate = document.getElementById('stats-date');
const generateStatsBtn = document.getElementById('generate-stats');
const statsDateDisplay = document.getElementById('stats-date-display');
const productivityStatus = document.getElementById('productivity-status');
const activitiesSummary = document.getElementById('activities-summary');
const generatePdfBtn = document.getElementById('generate-pdf');

const newActivityName = document.getElementById('new-activity-name');
const newActivityDifficulty = document.getElementById('new-activity-difficulty');
const newDifficultyDisplay = document.getElementById('new-difficulty-display');
const saveActivityBtn = document.getElementById('save-activity');
const activitiesTableBody = document.getElementById('activities-table-body');

// Initialize the app
function init() {
    // Set today's date for the stats input
    const today = new Date().toISOString().split('T')[0];
    statsDate.value = today;
    
    // Load stored daily activities
    loadDailyActivities();
    
    // Update activities dropdown
    updateActivitySelect();
    
    // Update activities table
    updateActivitiesTable();
    
    // Add event listeners
    addEventListeners();
}

// Load daily activities from localStorage
function loadDailyActivities() {
    dailyActivities = JSON.parse(localStorage.getItem('dailyActivities')) || {};
    const today = new Date().toISOString().split('T')[0];
    
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

// Save activities to localStorage
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

// Update activities table
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

// Update difficulty badge
function updateDifficultyBadge() {
    const selectedActivity = activitySelect.value;
    const activity = activities.find(a => a.name === selectedActivity);
    
    if (activity) {
        difficultyBadge.textContent = activity.difficulty;
    } else {
        difficultyBadge.textContent = '-';
    }
}

// Add a new activity to today's list
function addActivity() {
    const selectedActivity = activitySelect.value;
    const comment = activityComment.value.trim();
    
    if (!selectedActivity) {
        alert('Please select an activity');
        return;
    }
    
    const activity = activities.find(a => a.name === selectedActivity);
    
    if (!activity) {
        alert('Activity not found');
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // Create activity entry
    const activityEntry = {
        name: activity.name,
        difficulty: activity.difficulty,
        comment: comment,
        timestamp: new Date().toISOString()
    };
    
    // Add to today's activities
    if (!dailyActivities[today]) {
        dailyActivities[today] = [];
    }
    
    dailyActivities[today].push(activityEntry);
    
    // Save and render
    saveDailyActivities();
    renderDailyActivities(today);
    
    // Clear comment field
    activityComment.value = '';
}

// Render daily activities for a specific date
function renderDailyActivities(date) {
    activityList.innerHTML = '';
    
    const activities = dailyActivities[date] || [];
    let totalPoints = 0;
    
    activities.forEach(activity => {
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
    
    // Update progress bar
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

// Save a new activity type
function saveNewActivity() {
    const name = newActivityName.value.trim();
    const difficulty = parseInt(newActivityDifficulty.value);
    
    if (!name) {
        alert('Please enter an activity name');
        return;
    }
    
    if (activities.some(a => a.name === name)) {
        alert('An activity with this name already exists');
        return;
    }
    
    // Add new activity
    activities.push({
        name: name,
        difficulty: difficulty
    });
    
    // Save and update UI
    saveActivities();
    updateActivitySelect();
    updateActivitiesTable();
    
    // Clear form
    newActivityName.value = '';
    newActivityDifficulty.value = 3;
    newDifficultyDisplay.textContent = 3;
}

// Delete an activity type
function deleteActivity(activityName) {
    const index = activities.findIndex(a => a.name === activityName);
    
    if (index !== -1) {
        activities.splice(index, 1);
        
        // Save and update UI
        saveActivities();
        updateActivitySelect();
        updateActivitiesTable();
    }
}

// Generate statistics for a specific date
function generateStatistics() {
    const date = statsDate.value;
    
    if (!date) {
        alert('Please select a date');
        return;
    }
    
    const dayActivities = dailyActivities[date] || [];
    let totalPoints = 0;
    
    // Update date display
    const displayDate = new Date(date).toLocaleDateString();
    statsDateDisplay.textContent = `Summary for ${displayDate}`;
    
    // Calculate total points
    dayActivities.forEach(activity => {
        totalPoints += activity.difficulty;
    });
    
    // Set productivity status
    if (totalPoints >= VERY_PRODUCTIVE_DAY) {
        productivityStatus.textContent = `Very productive day! (${totalPoints} points)`;
        productivityStatus.style.color = 'var(--success)';
    } else if (totalPoints >= PRODUCTIVE_DAY) {
        productivityStatus.textContent = `Productive day! (${totalPoints} points)`;
        productivityStatus.style.color = 'var(--secondary)';
    } else if (totalPoints > 0) {
        productivityStatus.textContent = `Making progress! (${totalPoints} points)`;
        productivityStatus.style.color = 'var(--primary)';
    } else {
        productivityStatus.textContent = 'No activities recorded for this day.';
        productivityStatus.style.color = 'var(--gray)';
    }
    
    // Create activities summary
    activitiesSummary.innerHTML = '';
    
    if (dayActivities.length > 0) {
        const ul = document.createElement('ul');
        ul.className = 'stats-activity-list';
        
        dayActivities.forEach(activity => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${activity.name}</strong> (${activity.difficulty} points): ${activity.comment || 'No comment'}`;
            ul.appendChild(li);
        });
        
        activitiesSummary.appendChild(ul);
    } else {
        activitiesSummary.textContent = 'No activities recorded for this day.';
    }
    
    // Create chart
    createActivityChart(dayActivities);
}

// Create activity chart
function createActivityChart(activities) {
    const ctx = document.getElementById('activity-chart').getContext('2d');
    
    // Group activities by type and sum their difficulties
    const activityData = {};
    
    activities.forEach(activity => {
        if (!activityData[activity.name]) {
            activityData[activity.name] = 0;
        }
        
        activityData[activity.name] += activity.difficulty;
    });
    
    // Prepare data for chart
    const labels = Object.keys(activityData);
    const data = Object.values(activityData);
    
    // Generate colors
    const colors = labels.map((_, index) => {
        const hue = (index * 137.5) % 360;
        return `hsl(${hue}, 70%, 60%)`;
    });
    
    // Destroy previous chart if it exists
    if (window.activityChart) {
        window.activityChart.destroy();
    }
    
    // Create new chart
    window.activityChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

// Generate PDF report
function generatePDF() {
    const date = statsDate.value;
    
    if (!date) {
        alert('Please select a date');
        return;
    }
    
    const statsContainer = document.getElementById('stats-container');
    const displayDate = new Date(date).toLocaleDateString();
    
    // Use html2canvas to capture the statistics container
    html2canvas(statsContainer).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF();
        
        // Add title
        pdf.setFontSize(20);
        pdf.text(`Productivity Report - ${displayDate}`, 20, 20);
        
        // Add image (statistics and chart)
        const imgWidth = 170;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 20, 30, imgWidth, imgHeight);
        
        // Save PDF
        pdf.save(`productivity-report-${date}.pdf`);
    });
}

// Add event listeners
function addEventListeners() {
    // Tab switching
    tabLinks.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            tabLinks.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Show corresponding content
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Activity select change
    activitySelect.addEventListener('change', updateDifficultyBadge);
    
    // Add activity button
    addActivityBtn.addEventListener('click', addActivity);
    
    // New activity difficulty slider
    newActivityDifficulty.addEventListener('input', () => {
        newDifficultyDisplay.textContent = newActivityDifficulty.value;
    });
    
    // Save new activity button
    saveActivityBtn.addEventListener('click', saveNewActivity);
    
    // Generate statistics button
    generateStatsBtn.addEventListener('click', generateStatistics);
    
    // Generate PDF button
    generatePdfBtn.addEventListener('click', generatePDF);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init); 