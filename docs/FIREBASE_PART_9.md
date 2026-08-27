# Firebase Part 9 — Shared dashboard and daily roster

The Home page now reads the selected day's operational totals directly from Firestore. It displays:

- total Raw Material consumed;
- total Incoming Material;
- total Actual Output;
- rejection percentage calculated from Counted versus Actual Output;
- detailed Raw Material and Incoming Material lists.

## Daily worker roster

**Manage + Drill + Post** is now stored as `managedWorkers` on the selected `daily_records/{YYYY-MM-DD}` document. Only a Head can change it. Workers can see the roster after the day is published.

The Work and Daily Output worker dropdowns use this daily roster. If no roster has been selected, they fall back to the complete company worker list.

## Verify the flow

1. Sign in as Head and create a Draft date.
2. Add workers under **Manage + Drill + Post**.
3. Open Work or Output and confirm the Worker dropdown shows the selected daily workers.
4. Save and publish schedules, then submit results from a Worker account.
5. Return to Home as Head and confirm the Raw, Incoming, Actual Output and Rejection values reflect the submitted records.
6. Sign in on another device and confirm the published daily roster is visible.

No additional Firestore collection is needed. The dashboard securely reads the operational collections introduced in Parts 5–8, and the roster uses the existing Head-only daily-record update permission.
