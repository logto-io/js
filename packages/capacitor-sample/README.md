# Logto Capacitor React Sample

A minimal Capacitor + React + TypeScript app showing how to integrate `@logto/capacitor`.

## Setup

1. Install deps

```bash
pnpm install
```

2. Configure Logto

- Edit `src/logtoClient.ts` with your `endpoint`, `appId`, and `redirectUri` (default `logto.demo://callback`).
- Register the same redirect URI in Logto Console.

3. Deep links

- **Android:** Add an intent-filter to `android/app/src/main/AndroidManifest.xml`:

```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="logto.demo" android:host="callback" />
</intent-filter>
```

- **iOS:** Add a URL type with scheme `logto.demo` in `ios/App/App/Info.plist`.

4. Sync Capacitor

```bash
pnpm cap:sync
```

5. Run

- Web: `pnpm dev`
- Android Studio: `pnpm cap:android`
- Xcode: `pnpm cap:ios`

## Notes

- The Capacitor config sets `androidScheme: "https"` for dev servers; adjust if needed.
- The sample relies on the `@logto/capacitor` package from the workspace.
