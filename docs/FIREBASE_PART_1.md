# Firebase Part 1 setup

The application is Firebase-ready but continues to use LocalStorage for all operational data.

1. Open the Firebase Console and create a project on the Spark plan.
2. Add a Web app to the project. Firebase will display a `firebaseConfig` object.
3. Create a Cloud Firestore database. Choose the region closest to the factory and start in production mode.
4. Copy the six web configuration values into `src/environments/environment.ts`.
5. Publish the repository's `firestore.rules` using the Firebase Console Rules editor (or the Firebase CLI after login).
6. In Firestore, create collection `system_health` and document `angular-client` with:

   - `public` (boolean): `true`
   - `message` (string): `Firebase connection successful.`

7. Run `npm start`, open Settings → Backend Status, and select **Check connection**.

Do not create operational collections in test mode. The provided rules deny all reads and writes except the one public health document. Authentication and role-based access are Part 2.
