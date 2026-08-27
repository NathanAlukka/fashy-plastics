# Firebase Part 10 — Launch as a website and phone app

The application is now configured as a Progressive Web App (PWA) and for Firebase Hosting. One HTTPS deployment works as both:

- a normal website in a browser;
- an installable full-screen phone app from the same URL.

## What was added

- Angular's production service worker and app-shell caching;
- a phone-app manifest with 192px and 512px icons;
- an Apple touch icon;
- Firebase Hosting configuration;
- single-page routing rewrites, so refreshing any page works;
- safe cache headers for service-worker updates and versioned assets.

The cached app shell can open without a connection after it has loaded once. Firebase login and cloud record synchronization still require internet access.

## First deployment

1. Confirm `src/environments/environment.ts` contains the Firebase Web App configuration.
2. In Firebase Console, enable **Hosting** for the same Firebase project and remain on the Spark/free plan.
3. From the project folder, run:

```bash
npm run build
npx firebase-tools login
npx firebase-tools use --add
npx firebase-tools deploy --only firestore:rules,hosting
```

`firebase use --add` asks you to select the Firebase project and creates the local project alias. The deploy command prints the public HTTPS address.

For later frontend releases, run:

```bash
npm run build
npx firebase-tools deploy --only hosting
```

Deploy Firestore rules again whenever `firestore.rules` changes.

## Install on a phone

### Android / Chrome

1. Open the deployed HTTPS address in Chrome.
2. Open the Chrome menu.
3. Select **Install app** or **Add to Home screen**.

### iPhone / Safari

1. Open the deployed HTTPS address in Safari.
2. Tap **Share**.
3. Select **Add to Home Screen**, then **Add**.

The installed app uses the portrait phone layout, its own Fashy icon, and opens without the normal browser address bar.

## Release check

Before each deployment:

1. Run `npm run build`.
2. Test Head and Worker sign-in.
3. Test one published date across two browsers or phones.
4. Confirm Work, Raw, Output, Incoming and Dashboard data synchronize.
5. Complete the day and confirm Workers can read but no longer submit changes.
