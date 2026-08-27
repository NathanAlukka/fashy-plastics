# Firebase Part 7 — Daily Output

Daily Output schedules and worker results now synchronize through Cloud Firestore at:

`daily_records/{YYYY-MM-DD}/output_cycles/{cycleId}`

## Deploy the rules

From the project folder, run:

```bash
firebase deploy --only firestore:rules
```

## Verify the flow

1. Sign in as Head, create a Draft for a date, open Output, add the scheduled gala details, and select **Save Schedule**.
2. Publish the day from Home.
3. On another phone or browser, sign in as a Worker and choose the same date.
4. Open Output, enter Count and Actual, then select **Save Work**.
5. Sign back in as Head, open Output → Result, and confirm the submitted values appear.

Workers can also add their own unplanned cycles on a published day. They can edit or delete only the unplanned cycles they created. Scheduled assignment fields stay locked; workers update only Count and Actual.

Firestore is authoritative when Firebase is configured. LocalStorage is retained only as a same-device cache and as the fallback when Firebase configuration is absent.
