# Firebase user PIN setup

The app never downloads or stores PINs in Angular, Firestore, LocalStorage, or a deployed public file. Firebase Authentication verifies each PIN as that person's password.

## PIN worksheet

The private local worksheet is:

`setup/firebase-users.local.csv`

It contains every employee name, role, and generated internal email. Enter one unique six-digit PIN in the final `pin` column for each person. The file is excluded by `.gitignore` and is not part of the Angular build.

Treat this worksheet as a temporary secret. Do not email it, upload it to Firebase Hosting, move it into `src` or `public`, or commit it to source control.

## Create the accounts

For each row:

1. Open Firebase Console → Authentication → Users.
2. Add a user with the row's `internal_email` and six-digit PIN as the password.
3. Copy the new Authentication UID.
4. Open Firestore → `users` and create a document whose ID is that UID.
5. Add these fields:

   - `uid`: the Authentication UID
   - `email`: the internal email
   - `displayName`: the employee name
   - `role`: `head` for Fashy, otherwise `worker`
   - `active`: `true`

Fashy must use `fashy@fashyplastics.app` and the `head` role. The opening Head Mode screen always signs in this account. Worker Mode excludes Fashy and provides the searchable employee selector.

After the accounts are provisioned and tested, delete the PIN values from the worksheet or store the completed file in an approved password manager.
