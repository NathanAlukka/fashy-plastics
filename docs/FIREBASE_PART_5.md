# Firebase Part 5: Work schedule and results

Part 5 is the first complete cross-device workflow. Work rows use the subcollection:

`daily_records/{YYYY-MM-DD}/work_entries/{entryId}`

## Head-to-Worker test

1. Publish the latest repository `firestore.rules` in Firebase Console.
2. Sign in as Head and choose a date.
3. Press **Create Draft** on Home.
4. Open Work → Schedule, add valid rows and press **Save Schedule**.
5. Return Home and press **Publish**.
6. In a separate browser/device, sign in as Worker and choose the same date.
7. Open Work. The Head assignments should load from Firestore.
8. Enter Quantity and Unit, then press **Save Work**.
9. Return to the Head browser, reopen Work and select **Result**.
10. Confirm the worker quantities and units are visible.

## Unplanned Work

While the daily record is Published, a Worker can add a row. The row is stored with `source: worker` and the authenticated user's UID. A Worker can edit or delete only their own unplanned rows. Head-created assignment fields remain protected.

## Security rules

- Head can create, read, update and delete Work assignments.
- Active Workers can read Work only while the parent daily record is Published or Completed.
- Workers can update only Quantity/Unit result fields on Head-created rows.
- Workers can create, edit and delete only their own unplanned rows while the day is Published.
- Worker submissions record `submittedBy`, `submittedByName` and a server-generated update time.
- A Completed day remains readable but no longer accepts Worker changes.

## Local fallback

If Firebase is not configured, the existing LocalStorage Work behavior remains available. With Firebase configured, Firestore is authoritative and LocalStorage receives only a same-device cache after a successful save.

Raw Material, Daily Output and Incoming remain LocalStorage-backed until Parts 6–8.
