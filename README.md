# Productivity Tracker

A simple web application for tracking daily productivity by recording activities and their difficulty levels.

## Features

- Track daily activities with comments
- View progress towards daily productivity goals
- Generate statistics and charts for any day
- Export reports as PDF
- Add custom activity types with defined difficulty levels

## Usage

1. Open `index.html` in your web browser.
2. Select an activity type from the dropdown, add a comment (optional), and click "Add Activity".
3. View your progress on the progress bar at the top.
4. Switch to the "Statistics" tab to view charts and generate PDF reports.
5. Use the "Manage Activities" tab to add new types of activities or delete existing ones.

## Productivity Metrics

- An activity's difficulty level (1-5) determines its point value
- 10 points = Productive day
- 15 points = Very productive day

## Default Activities

| Activity | Difficulty Level |
|----------|-----------------|
| Trening fizyczny | 4 |
| Odkurzanie | 2 |
| Pomoc domowa | 3 |
| Nauka | 3 |
| Projekt | 5 |
| Książka | 1 |
| Duolingo | 1 |
| Film | 1 |
| Praca | 4 |
| Studia | 4 |
| Praca domowa | 2 |

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Chart.js for data visualization
- html2canvas and jsPDF for PDF generation

## Data Storage

The application uses browser localStorage to save your activities and daily records. Data persists between sessions unless you clear your browser data. 