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
let savedReports = JSON.parse(localStorage.getItem('savedReports')) || [];
let currentPdfDoc = null;
let currentPage = 1;
let totalPages = 0;

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

const reportsListContainer = document.getElementById('reports-list-container');
const noReportsMessage = document.getElementById('no-reports-message');
const pdfCanvas = document.getElementById('pdf-canvas');

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
    
    // Initialize PDF.js
    initPdfJs();
    
    // Update reports list
    updateReportsList();
    
    // Add event listeners
    addEventListeners();
}

// Initialize PDF.js
function initPdfJs() {
    // Set worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
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

// Save reports metadata to localStorage
function saveReportsMetadata() {
    localStorage.setItem('savedReports', JSON.stringify(savedReports));
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
    const formattedDate = date.replace(/-/g, '');
    const fileName = `productivity-report-${formattedDate}.pdf`;
    const filePath = `raporty/${fileName}`;
    
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
        
        // Generate PDF as blob
        const pdfBlob = pdf.output('blob');
        
        // Save report metadata
        const reportData = {
            id: Date.now().toString(),
            date: date,
            displayDate: displayDate,
            fileName: fileName,
            filePath: filePath,
            createdAt: new Date().toISOString(),
            totalPoints: calculateTotalPoints(date)
        };
        
        // Add to saved reports and update UI
        savedReports.push(reportData);
        saveReportsMetadata();
        
        // Save the file data to localStorage for viewing in the app
        saveReportBlobToLocalStorage(reportData.id, pdfBlob);
        
        // Update reports list
        updateReportsList();
        
        // Trigger download for the user
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
        
        alert(`Report saved to ${filePath} and can be viewed in the Reports tab.`);
    });
}

// Calculate total points for a date
function calculateTotalPoints(date) {
    const dayActivities = dailyActivities[date] || [];
    let totalPoints = 0;
    
    dayActivities.forEach(activity => {
        totalPoints += activity.difficulty;
    });
    
    return totalPoints;
}

// Save PDF blob to localStorage
function saveReportBlobToLocalStorage(id, blob) {
    // Convert blob to base64
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function() {
        const base64data = reader.result;
        localStorage.setItem(`report_${id}`, base64data);
    };
}

// Update the reports list in the UI
function updateReportsList() {
    // First sort reports by date (newest first)
    savedReports.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (savedReports.length === 0) {
        noReportsMessage.style.display = 'block';
        return;
    }
    
    noReportsMessage.style.display = 'none';
    
    // Clear the list
    const listItems = reportsListContainer.querySelectorAll('.report-item');
    listItems.forEach(item => item.remove());
    
    // Add each report to the list
    savedReports.forEach(report => {
        const reportItem = document.createElement('div');
        reportItem.className = 'report-item';
        reportItem.dataset.id = report.id;
        
        const dateElem = document.createElement('div');
        dateElem.className = 'report-date';
        dateElem.textContent = report.displayDate;
        
        const infoElem = document.createElement('div');
        infoElem.className = 'report-info';
        
        let productivityStatus = 'Low activity';
        if (report.totalPoints >= VERY_PRODUCTIVE_DAY) {
            productivityStatus = 'Very productive';
        } else if (report.totalPoints >= PRODUCTIVE_DAY) {
            productivityStatus = 'Productive';
        }
        
        infoElem.textContent = `${productivityStatus} (${report.totalPoints} points)`;
        
        reportItem.appendChild(dateElem);
        reportItem.appendChild(infoElem);
        
        // Add click event to load PDF
        reportItem.addEventListener('click', () => {
            // Deactivate all items
            document.querySelectorAll('.report-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Activate clicked item
            reportItem.classList.add('active');
            
            // Load the PDF
            loadPdf(report.id);
        });
        
        reportsListContainer.appendChild(reportItem);
    });
}

// Load a PDF from localStorage
function loadPdf(reportId) {
    const pdfData = localStorage.getItem(`report_${reportId}`);
    
    if (!pdfData) {
        alert('PDF data not found.');
        return;
    }
    
    // Reset page number
    currentPage = 1;
    
    // Show loading indicator
    pdfCanvas.style.display = 'none';
    const pdfViewer = document.getElementById('pdf-viewer');
    
    // Remove any existing pagination controls
    const existingControls = pdfViewer.querySelector('.pagination-controls');
    if (existingControls) {
        pdfViewer.removeChild(existingControls);
    }
    
    // Add loading indicator
    let loadingIndicator = pdfViewer.querySelector('.loading-indicator');
    if (!loadingIndicator) {
        loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.textContent = 'Loading PDF...';
        pdfViewer.appendChild(loadingIndicator);
    }
    
    // Convert base64 to array buffer
    const raw = window.atob(pdfData.split(',')[1]);
    const rawLength = raw.length;
    const array = new Uint8Array(new ArrayBuffer(rawLength));
    
    for (let i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i);
    }
    
    // Load the PDF document
    pdfjsLib.getDocument({ data: array }).promise.then(pdfDoc => {
        currentPdfDoc = pdfDoc;
        totalPages = pdfDoc.numPages;
        
        // Remove loading indicator
        if (loadingIndicator) {
            pdfViewer.removeChild(loadingIndicator);
        }
        
        // Display canvas
        pdfCanvas.style.display = 'block';
        
        // Render the first page
        renderPage(currentPage);
        
        // Add pagination controls if multiple pages
        if (totalPages > 1) {
            addPaginationControls();
        }
    }).catch(error => {
        console.error('Error loading PDF:', error);
        alert('Error loading PDF: ' + error.message);
        
        // Remove loading indicator
        if (loadingIndicator) {
            pdfViewer.removeChild(loadingIndicator);
        }
    });
}

// Render a specific page of the PDF
function renderPage(pageNumber) {
    if (!currentPdfDoc) return;
    
    currentPdfDoc.getPage(pageNumber).then(page => {
        const canvas = pdfCanvas;
        const ctx = canvas.getContext('2d');
        
        // Scale to fit within the container while preserving aspect ratio
        const viewport = page.getViewport({ scale: 1.0 });
        const containerWidth = pdfCanvas.parentElement.clientWidth - 40; // 40px for padding
        const containerHeight = pdfCanvas.parentElement.clientHeight - 40; // 40px for padding
        
        // Calculate scale based on both width and height constraints
        const scaleWidth = containerWidth / viewport.width;
        const scaleHeight = containerHeight / viewport.height;
        const scale = Math.min(scaleWidth, scaleHeight) * 0.95; // Add a small margin
        
        const scaledViewport = page.getViewport({ scale: scale });
        
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;
        
        // Clear previous content
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const renderContext = {
            canvasContext: ctx,
            viewport: scaledViewport
        };
        
        page.render(renderContext);
    }).catch(error => {
        console.error('Error rendering page:', error);
    });
}

// Add pagination controls if the PDF has multiple pages
function addPaginationControls() {
    // Remove existing pagination controls first
    const pdfViewer = document.getElementById('pdf-viewer');
    let paginationControls = document.querySelector('.pagination-controls');
    
    if (paginationControls) {
        pdfViewer.removeChild(paginationControls);
    }
    
    // Create pagination controls
    paginationControls = document.createElement('div');
    paginationControls.className = 'pagination-controls';
    
    const prevButton = document.createElement('button');
    prevButton.className = 'btn secondary';
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderPage(currentPage);
            updatePaginationControls();
        }
    });
    
    const pageInfo = document.createElement('span');
    pageInfo.className = 'page-info';
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    
    const nextButton = document.createElement('button');
    nextButton.className = 'btn secondary';
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderPage(currentPage);
            updatePaginationControls();
        }
    });
    
    paginationControls.appendChild(prevButton);
    paginationControls.appendChild(pageInfo);
    paginationControls.appendChild(nextButton);
    
    pdfViewer.appendChild(paginationControls);
}

// Update pagination controls
function updatePaginationControls() {
    const paginationControls = document.querySelector('.pagination-controls');
    if (!paginationControls) return;
    
    const prevButton = paginationControls.querySelector('button:first-child');
    const nextButton = paginationControls.querySelector('button:last-child');
    const pageInfo = paginationControls.querySelector('.page-info');
    
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

// Delete a saved report
function deleteReport(reportId) {
    const index = savedReports.findIndex(r => r.id === reportId);
    
    if (index !== -1) {
        // Remove from array
        savedReports.splice(index, 1);
        
        // Remove from localStorage
        localStorage.removeItem(`report_${reportId}`);
        
        // Update metadata
        saveReportsMetadata();
        
        // Update UI
        updateReportsList();
        
        // Clear PDF viewer if the deleted report was being displayed
        if (currentPdfDoc && document.querySelector('.report-item.active')?.dataset.id !== reportId) {
            pdfCanvas.getContext('2d').clearRect(0, 0, pdfCanvas.width, pdfCanvas.height);
            currentPdfDoc = null;
        }
    }
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