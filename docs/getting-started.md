# Getting Started

How to run CICT-AMS locally and deploy it.

## Prerequisites

- Node.js (current LTS) and npm
- A Firebase project on the **Blaze** plan (required for Cloud Functions)
- [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools`
- Authentication providers enabled in Firebase: Email/Password, Google, and Microsoft (Entra ID)

## 1. Clone and install

```bash
git clone https://github.com/arji-hub/AssetManagement.git
cd AssetManagement
npm install
cd functions && npm install && cd ..
```

## 2. Environment variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_MS_TENANT_ID=
```

`VITE_MS_TENANT_ID` is the Azure AD tenant used for single-tenant Microsoft sign-in. Do not commit `.env`.

## 3. Run locally

```bash
npm run dev
```

The app runs at `http://localhost:5173` by default.

## 4. Create the first admin

Roles are read from the Firestore `user` collection (not custom claims). After signing in for the first time, set that user's `role` field to `admin` in the Firebase console. Further users can be added from the Custodian tab. See [Architecture](architecture.md#roles) for the role model.

## 5. Deploy

### Manual

```bash
npm run build
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
```

### Automatic (GitHub Actions)

| Workflow | Trigger | Result |
|---|---|---|
| `firebase-hosting-merge.yml` | Push to `main` | Deploys to the live site |
| `firebase-hosting-pull-request.yml` | Pull request | Deploys to a preview channel |

Add every `VITE_FIREBASE_*` variable (and `VITE_MS_TENANT_ID`) as a **repository secret** so the build can read them.

> **Known quirk:** a deploy may log `400 FAILED_PRECONDITION "already active version"`. The deploy has actually succeeded, which is why the workflow uses `continue-on-error: true`.

## Troubleshooting

- **Microsoft/Google popup warning about `Cross-Origin-Opener-Policy`:** harmless when the popup is closed.
- **Role-based pages redirect unexpectedly:** check that the user's document is in the `user` collection (singular) with a valid `role`.

[← Back to README](../README.md)
