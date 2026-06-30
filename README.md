# WeeklyPlanner
A weekly planner to block calendar

## Running

Data is persisted via a small local Node server, instead of localStorage — commit/push/pull these files to carry your data across devices:
- [data.json](data.json) — events, categories, to-dos
- [habits.json](habits.json) — habit tracker definitions and daily log
- completed.json — archived completed events (auto-pruned once it passes ~1MB)

```
npm start
```

Then open http://localhost:3000 (the server serves Planner.html and reads/writes data.json). Requires Node.js; no other dependencies.

Calendar

Week and Day views, with a live "now" line tracking current time
Click any time slot to instantly create an event there
Drag events between days and time slots (snaps to 15-min intervals)
Resize events by dragging the bottom handle

Events

Title, date, start/end time, category, notes
Per-event reminder (browser notification 10 min before)
Edit or delete from the block directly
Check the green tick on a block to mark it complete — it's archived to completed.json and cleared off the grid

Categories

Add your own with a custom color picker
Event counts shown per category
Delete categories anytime

To-do list

Add, check off, inline-edit, and delete tasks
Lives in the sidebar alongside your calendar

Overdue / Unscheduled

Any past events automatically surface in a sidebar section with a one-click "Reschedule →" button — drag them back onto the grid

Habit tracker

Open via the "Habits" button in the topbar — slides in as a side panel so it stays out of the way
Daily checkboxes per habit, navigate week-to-week (data persists for as long as you want, e.g. 6+ months)
Single progress chart showing each habit's completion % for the displayed week
Add/remove habits; "Reset history for new year" clears the log while keeping your habit list
