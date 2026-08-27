# Firebase Part 6: Raw Material schedule and results

Raw Material rows use:

`daily_records/{YYYY-MM-DD}/raw_entries/{entryId}`

## Test sequence

1. Publish the latest `firestore.rules` in Firebase Console.
2. Sign in as Head and create a Draft date.
3. Open Raw → Schedule.
4. Add Company, Type and Grade rows, then press **Save Schedule**.
5. Return Home and publish the daily record.
6. Sign in as Worker on another browser/device.
7. Open Raw and enter consumption under 58, 113, 310, 306, 102 and 05. Individual gala values may remain blank.
8. Press **Save Work**.
9. Return to Head, reopen Raw and select **Result** to review the submitted gala values.

## Unplanned rows

Workers can add raw-material rows while a day is Published. Each unplanned row stores its authenticated creator. Workers can edit and delete only their own unplanned rows.

## Security

- Head manages scheduled Company/Type/Grade rows.
- Workers cannot change Head assignment fields.
- Workers update only the six `galas` values and submission metadata on Head rows.
- Gala data must be a six-value list containing only numbers or blanks.
- Completed days are readable but closed for Worker changes.
- Firestore server timestamps and authenticated IDs identify submissions.

With Firebase configured, Raw Material is Firestore-authoritative and LocalStorage is only a same-device cache. Output and Incoming remain LocalStorage-backed until Parts 7 and 8.
