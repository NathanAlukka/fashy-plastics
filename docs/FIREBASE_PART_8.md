# Firebase Part 8 — Incoming Material

Incoming Material schedules and worker results now synchronize through Cloud Firestore at:

`daily_records/{YYYY-MM-DD}/incoming_entries/{entryId}`

## Deploy the rules

From the project folder, run:

```bash
firebase deploy --only firestore:rules
```

## Verify the flow

1. Sign in as Head and create or select a Draft date.
2. Open Incoming, add the expected material type and name, then select **Save Schedule**.
3. Publish the day from Home.
4. On another phone or browser, sign in as a Worker and select the same date.
5. Open Incoming, edit the scheduled delivery, enter Quantity and Unit, and select **Save Work**.
6. Sign back in as Head and open Incoming → Result to confirm the delivery appears.

Workers may add unexpected deliveries on a published day. They can fully edit or delete only entries they created. For Head-scheduled entries, Workers can update only Quantity and Unit.

This completes the migration of Work, Raw Material, Daily Output, and Incoming Material to Firestore. LocalStorage remains a fallback when Firebase is not configured and a same-device cache after successful cloud operations.
