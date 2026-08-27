# Firebase Part 2: Authentication and roles

Part 2 presents a worker-name selector and six-digit PIN. Internally, it uses Firebase Email/Password Authentication and a matching Firestore `users` profile document. Public sign-up is intentionally not included: accounts are provisioned by the project owner so nobody can assign themselves the Head role.

## Firebase Console setup

1. Complete `docs/FIREBASE_PART_1.md` first.
2. Open **Authentication → Sign-in method** and enable **Email/Password**.
3. Open **Authentication → Users** and create a Head account and a Worker account. Use the selected person's generated internal email and their six-digit PIN as the Firebase password.

Internal email format:

- `Fashy` → `fashy@fashyplastics.app`
- `Ganesh M` → `ganesh.m@fashyplastics.app`
- `Pankaj Yadav` → `pankaj.yadav@fashyplastics.app`

Use lowercase text, replace spaces with dots, and append `@fashyplastics.app`.
4. Copy each generated user UID.
5. In Firestore, create collection `users`. Create one document per account using the UID as the document ID.

Head profile fields:

- `uid` (string): the Authentication UID
- `email` (string): the generated internal email
- `displayName` (string): e.g. `Factory Head`
- `role` (string): `head`
- `active` (boolean): `true`

Worker profile fields:

- `uid` (string): the Authentication UID
- `email` (string): the generated internal email
- `displayName` (string): e.g. `Gala 58 Worker`
- `role` (string): `worker`
- `active` (boolean): `true`

6. Replace the Firestore rules in Firebase Console with the repository's `firestore.rules` and publish them.
7. Run `npm start`. With Firebase configured, protected routes redirect to `/login`.
8. Select each test person's name and enter their six-digit PIN. The profile role automatically selects Head Mode or Worker Mode.

PINs are reset by changing the user's password in Firebase Console. Do not store PINs in Firestore or LocalStorage.

## Current boundary

Authentication and role identity are live after setup, but operational pages still store their records in LocalStorage. Firestore rules deliberately deny operational data until the daily schedule collections and permissions are implemented in later parts.
