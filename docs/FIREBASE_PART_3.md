# Firebase Part 3: Shared master data

Part 3 moves dropdown lists from hardcoded-only data to Firestore while retaining the built-in Excel-derived lists as a safe offline fallback.

## Collections

The application uses collection `master_data` with these documents:

- `workers`
- `parts`
- `tasks`
- `powder_companies`
- `powder_types`
- `powder_grades`
- `products`
- `wip_units`
- `incoming_units`
- `galas`
- `incoming_materials`

Standard list documents contain a `values` array. `incoming_materials` contains a `byType` map so material names remain grouped by their material type.

## First upload

1. Complete Parts 1 and 2.
2. Publish the latest repository `firestore.rules` in Firebase Console.
3. Sign in as a Head account.
4. Open Settings → Backend Status.
5. Under **Shared master data**, select **Upload built-in lists**.
6. Confirm the status becomes `Shared master data loaded from Firebase.`
7. Sign in as a Worker and confirm all searchable dropdowns contain the shared lists.

The upload action replaces each master-data document with the app's current built-in list. Use it for initial seeding; after manually changing cloud lists, do not press it again unless you intend to restore the built-in defaults.

## Security

- An active Head can create, edit and delete `master_data` documents.
- An active Worker can read them.
- An unauthenticated user cannot read them.
- PINs are never stored in master data.

Operational schedules and results continue to use LocalStorage at this stage.
