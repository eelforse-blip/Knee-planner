# Clinic database setup (Firebase, free tier)

1. Go to https://console.firebase.google.com → **Add project** → name it (e.g. `knee-shoulder-clinic`) → turn Google Analytics off → Create.
2. **Build → Authentication → Get started → Email/Password → Enable → Save.**
3. **Build → Firestore Database → Create database** → choose a location (e.g. `europe-west1`) → **Production mode** → Create.
4. **Firestore → Rules**: delete the text, paste the contents of `firestore.rules` (this folder) → **Publish**.
5. **Project settings (gear) → Your apps → Web `</>`** → nickname `Clinic` → Register → copy the `firebaseConfig = { … }` values.
6. Either send the config to Claude to build it into the app, or paste it on the app's first screen.
7. In the app: **Create account** with your email → open the verification email → **Continue** → **Create clinic**.
8. Add assistants under **More → Team**; they install the app, paste the **Clinic setup code**, and create an account with the email you added.

The web API key is an identifier, not a secret; access is controlled by the security rules and each person's account.
