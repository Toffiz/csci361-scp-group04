# SCP Mobile (React Native / Expo)

This is a minimal React Native (Expo) scaffold to provide a mobile view of the existing frontend.

Quick start

1. Install dependencies

```bash
cd mobile
npm install
```

2. Start the app

```bash
npx expo start
# or
npm start
```

3. Open on your device or simulator using the Expo Dev Tools (scan QR code or launch emulator).

Notes

- The app is intentionally minimal: screens are placeholders mirroring the web app's main areas (Login, Register, Dashboard, Catalog, Chat, Orders, Incidents).
- To call your backend API from the mobile app, update API base URLs in the code to point to your backend (e.g. `http://localhost:8080` for local emulators or use your machine IP for physical devices).
- Recommended additional installs:
  - `expo install` the native dependencies when prompted
  - `npm install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context axios`

Next steps

- Wire authentication to the backend (`/auth` routes) using `axios`.
- Add shared utilities or create a monorepo to share code with the web frontend.
- Implement product list, chat websocket integration, and styling components.

