# Fashy Plastics

A responsive Angular Material manufacturing application backed by Firebase Authentication and Cloud Firestore. LocalStorage is retained as an unconfigured/offline fallback and same-device cache.

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:4200`.

## Production build

```bash
npm run build
```

The production files are written to `dist/fashy-plastics`.

## Launch

The production build is an installable Progressive Web App configured for Firebase Hosting. Follow `docs/FIREBASE_PART_10.md` to deploy the HTTPS website and install it on Android or iPhone.

## Pages

- Dashboard
- Work in Progress
- Raw Material Consumption
- Daily Production
- Incoming Material

With Firebase configured, operational records and the daily dashboard synchronize between authenticated devices. See `docs/FIREBASE_PART_1.md` through `docs/FIREBASE_PART_10.md` for setup, verification and launch.
