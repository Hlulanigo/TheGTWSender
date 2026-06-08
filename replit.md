# GTW — Go The Way

Peer-to-peer courier mobile app connecting package senders with travelers, built with Expo/React Native.

## Run & Operate

- `pnpm --filter @workspace/mobile run dev` — run the Expo dev server (port 18115)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo 54, React Native 0.81, expo-router 6
- Auth: Firebase Auth (email/password + Google Sign-In)
- API: Express 5 (external backend at `https://gtw-ui-createcontinue-5--alexandra051.replit.app`)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/mobile/` — Expo mobile app
- `artifacts/mobile/app/` — expo-router screens
- `artifacts/mobile/app/auth/` — login + register screens
- `artifacts/mobile/context/AuthContext.tsx` — Firebase auth state + signIn/signUp/signOut/signInWithGoogle
- `artifacts/mobile/lib/firebase.ts` — Firebase init (reads from .env)
- `artifacts/mobile/components/GoogleSignInButton.tsx` — native Google OAuth (expo-auth-session)
- `artifacts/mobile/components/GoogleSignInButton.web.tsx` — web Google OAuth (signInWithPopup)
- `artifacts/mobile/.env` — public env vars (Firebase config, API URL)

## Auth flow

1. Onboarding (one-time, stored in AsyncStorage key `pg_onboarded`)
2. Register or Login (email/password or Google)
3. Firebase auth → POST `/api/auth/sync` with Bearer token → tabs
4. Profile screen shows real name/email from Firebase auth

## Firebase setup checklist

- [x] Firebase project: `irgadgetsofficialweb`
- [x] Email/Password sign-in enabled
- [x] Replit dev domain added to Authorized Domains
- [ ] `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` — needed for native Google sign-in (get from Firebase Console → Authentication → Sign-in method → Google → Web client ID)

## Architecture decisions

- Firebase web SDK (not @react-native-firebase) for Expo Go compatibility
- Platform-split Google button: `.web.tsx` uses `signInWithPopup`, `.tsx` uses `expo-auth-session`
- 5-second fallback in AuthContext in case Firebase's `onAuthStateChanged` doesn't fire (network-restricted environments)
- `EXPO_PUBLIC_*` vars in `.env` file (not system env) because Metro bundler reads from `.env` at bundle time

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Metro reads `EXPO_PUBLIC_*` vars from `.env` file, NOT from system environment — changes to `.env` require workflow restart
- Firebase `onAuthStateChanged` may not fire in Replit web sandbox (domain restriction) — 5-second fallback prevents stuck loading screen
- `expo-auth-session` must match Expo SDK version: for Expo 54, use `~7.0.11`
