// central Firebase SDK initialization for client-side use
// this file can be imported anywhere in the app to get the
// configured Firebase app, Firestore instance, auth, etc.

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// configuration values are expected to be provided via environment
// variables or (when running inside Expo) via `Constants.manifest.extra`.
//
// Add your Firebase keys to `app.json` under the `expo.extra` object, for
// example:
// {
//   "expo": {
//     "extra": {
//       "firebaseApiKey": "ABC123...",
//       "firebaseAuthDomain": "your-app.firebaseapp.com",
//       "firebaseProjectId": "your-app",
//       "firebaseStorageBucket": "your-app.appspot.com",
//       "firebaseMessagingSenderId": "...",
//       "firebaseAppId": "1:...:web:..."
//     }
//   }
// }

import Constants from 'expo-constants';

// `process.env` on native builds (metro) contains whatever you set in
// the shell or via dotenv.  On web only variables prefixed with
// `EXPO_PUBLIC_` are inlined by Metro/webpack, so `process.env` will be
// dramatically smaller – that's why the earlier debugging output only
// showed `NODE_ENV` and `EXPO_PUBLIC_PROJECT_ROOT`.
//
// To support all platforms we merge three sources:
//   * normal env vars (`FIREBASE_*`), useful in dev/native builds
//   * public env vars (`EXPO_PUBLIC_FIREBASE_*`), for web builds
//   * extras from expo-config (`app.json`/`app.config.js`)
//
// The loader below makes that happen.
const env = process.env as Record<string, string | undefined>;
const publicEnv = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Expo Constants behave differently depending on platform and SDK version.
// `Constants.manifest` is populated in Expo Go / standalone native apps,
// whereas web (and newer SDKs) use `Constants.expoConfig` or may leave
// `manifest` undefined. We try both so the values are always available.
const extra = (
  (Constants.manifest?.extra as Record<string, string> | undefined) ||
  (Constants.expoConfig?.extra as Record<string, string> | undefined) ||
  {} as Record<string, string>
) as Record<string, string>;

// debug logs – these will show up in Metro or browser console when the
// module is imported. They'll help determine why extras/apiKey is
// missing during initialization.
console.log('[firebase] process.env keys:', Object.keys(env));
console.log('[firebase] Constants.manifest:', Constants.manifest);
console.log('[firebase] Constants.expoConfig:', Constants.expoConfig);
console.log('[firebase] loaded extras:', extra);

// build the config by checking sources in priority order;
// env (native), then publicEnv (web), then extras (app.json)
const firebaseConfig = {
  apiKey:
    env.FIREBASE_API_KEY ||
    publicEnv.apiKey ||
    extra.firebaseApiKey,
  authDomain:
    env.FIREBASE_AUTH_DOMAIN ||
    publicEnv.authDomain ||
    extra.firebaseAuthDomain,
  projectId:
    env.FIREBASE_PROJECT_ID ||
    publicEnv.projectId ||
    extra.firebaseProjectId,
  storageBucket:
    env.FIREBASE_STORAGE_BUCKET ||
    publicEnv.storageBucket ||
    extra.firebaseStorageBucket,
  messagingSenderId:
    env.FIREBASE_MESSAGING_SENDER_ID ||
    publicEnv.messagingSenderId ||
    extra.firebaseMessagingSenderId,
  appId:
    env.FIREBASE_APP_ID ||
    publicEnv.appId ||
    extra.firebaseAppId,
};

if (!firebaseConfig.apiKey) {
  // helper text with runtime state to aid debugging when the exception is
  // thrown before any logs are visible. The JSON is intentionally human-
  // readable and will show in the red screen / Metro error overlay.
  const debugState = {
    envKeys: Object.keys(env),
    extra,
    firebaseConfig,
  };
  throw new Error(
    `[firebase] apiKey is missing – ` +
      `no value found in env or extras
` +
      `state: ${JSON.stringify(debugState, null, 2)}`
  );
}

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// export commonly-used services for convenience
export const firebaseApp = app;
export const firestore: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);

export default firebaseApp;
