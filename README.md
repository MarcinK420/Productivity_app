# Productivity & Habit Tracker

A simple web application for tracking daily productivity and visualizing habit consistency.

## Features

- Track daily activities with comments and difficulty points.
- View daily progress towards productivity goals.
- Manage custom activity types (habits) and their difficulty levels.
- Visualize monthly habit consistency with a grid view.
- Export all application data (activity definitions and history) as a JSON backup file.

## Usage

1. Open `index.html` in your web browser.
2. **Track Activities Tab:**
    - Select an activity, add an optional comment, and click "Add Activity".
    - View today's progress and activity list.
    - Click "Export All Data (Backup)" to save a complete backup of your habits and history. Save this file securely.
3. **Habit Tracking Tab:**
    - Select a month and year.
    - Click "Show Grid" to view your habit consistency for that period.
    - Marked cells indicate the habit was performed on that day.
4. **Manage Activities Tab:**
    - Add new activity types (habits) with their names and difficulty levels.
    - Delete existing activity types.

## Productivity Metrics

- An activity's difficulty level (1-5) determines its point value.
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

## Data Storage

The application uses browser `localStorage` to save your defined activities (habits) and the history of performed activities. Data persists between sessions on the same browser unless you clear your browser data.

**Backup:** Use the "Export All Data (Backup)" button to create a JSON file containing all your data. This file can be used for backup or potentially for migrating data (import functionality not yet implemented). 