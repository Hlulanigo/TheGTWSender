---
name: ParcelGo Expo artifact registration
description: The mobile Expo app at artifacts/mobile has a legacy path-style id in artifact.toml; listArtifacts() returns empty but the app runs correctly.
---

The `artifacts/mobile/.replit-artifact/artifact.toml` has `id = "artifacts/mobile"` (a legacy path-style ID) rather than a UUID. Because of this, `listArtifacts()` always returns `[]` and `presentArtifact` cannot be called by the normal flow.

**Why:** The artifact was originally scaffolded in a prior session before the Replit registration system used UUID-based IDs. Attempts to re-register via `createArtifact` with `slug = "mobile"` fail because Replit cleans up the scaffold directory before files can be copied into it.

**How to apply:** The app still runs correctly — it is served at `http://localhost:18115` with the `Start application` workflow (`PORT=18115 pnpm --filter @workspace/mobile run dev`). The Expo packager reports `packager-status:running`. The preview is visible to the user via the Replit web preview at port 18115 (external port 3000). To properly re-register, the only reliable path is to delete `artifacts/mobile`, create a fresh artifact with `createArtifact({ slug: "mobile", ... })`, then immediately copy app files in before Replit can clean up — or wait for the scaffold to complete and then overwrite all files.
