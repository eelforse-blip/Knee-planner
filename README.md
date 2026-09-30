# Knee Osteotomy Planner

Mobile app for measuring lower-limb alignment on a standing long-leg scannogram
(HKA, WBL ratio, MAD, mLDFA, MPTA, JLCA, LDTA), deciding between single-level
(HTO or DFO) and double-level osteotomy, and sizing each wedge.

Decision logic (v1.1):
- Simulates HTO, DFO and double level with hinge-based rotation (Miniaci) to the target WBL.
- Localises the deformity: femur abnormal if mLDFA outside 85–90°, tibia if MPTA outside 85–90°.
- Both bones abnormal → double level. One bone abnormal → single level at that bone, unless the
  plan breaches a limit (default: planned MPTA > 95°, mLDFA < 85° or > 92°), then double level.
- Double level: femur corrected to mLDFA 87°, tibia takes the rest; tibia capped at the MPTA limit.
- JLCA over 3° on the convex side: (JLCA − 2°) ÷ 2 is subtracted from the bony correction.
- Wedge opening height at the entry cortex = 2·L·sin(θ/2), with L·tan θ shown for comparison.
- All limits are editable in the app.

- `www/` – the app itself (works offline, saves cases on the device)
- `android/` – native Android project (Capacitor)
- `.github/workflows/android.yml` – builds the Android APK on GitHub for free
- `.github/workflows/pages.yml` – publishes the app as an installable web app (iPhone and Android)

## Get it on your phone (no coding tools needed)

1. Create a free account at github.com and a new **public** repository named `knee-planner`.
2. Upload the contents of this folder (or let Claude push it for you).
3. In the repository: **Settings → Pages → Source: GitHub Actions**.
4. Open the **Actions** tab and wait for both builds to turn green (about 5 minutes).

**Android:** open the repository's **Releases → latest** on your phone, download
`OsteotomyPlanner.apk`, open it and allow installing from this source.

**iPhone:** open `https://<your-username>.github.io/knee-planner/` in Safari,
tap Share → **Add to Home Screen**. It opens full-screen and works offline.

## App stores (later)

- Google Play: one-time $25 developer account, then build a signed release (`./gradlew bundleRelease`).
- Apple App Store: $99/year developer account and a Mac with Xcode (`npx cap add ios`, then open in Xcode).

## Privacy

Images and cases are stored only on the device. Nothing is uploaded.
Use patient initials, not full names, when saving cases.

## Disclaimer

Planning aid only. Not a certified medical device. Confirm all measurements on
calibrated films and intra-operatively.
