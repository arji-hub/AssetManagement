<div align="center">

<img src="https://firebasestorage.googleapis.com/v0/b/ams-cict.firebasestorage.app/o/images%2Fcictlogo.jfif?alt=media&token=5ce68321-b3ef-40a4-86b5-6bcc42d7735e" width="90" alt="CICT Logo" />

# CICT Asset Management System

**Bulacan State University**
College of Information and Communications Technology
BSIT 4G — G2, Group 5

A web-based capstone project for tracking, registering, and monitoring institutional assets — built to replace manual, paper-based asset records with a fast, auditable digital system.

[![React](https://img.shields.io/badge/React-Vite-f5aa2c?style=flat-square&labelColor=860100)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%7C%20Auth%20%7C%20Storage-f5aa2c?style=flat-square&labelColor=860100)](https://firebase.google.com/)
[![Deployed](https://img.shields.io/badge/Live-ams--cict.web.app-f5aa2c?style=flat-square&labelColor=860100)](https://ams-cict.web.app)

</div>

---

## About the Project

The **CICT Asset Management System (CICT-AMS)** is designed to give the College of Information and Communications Technology a centralized, role-aware platform for managing physical assets — from registration and room assignment to custodian accountability and condition reporting. Every asset carries a traceable history, so administrators and custodians always know what exists, where it is, who's responsible for it, and what condition it's in.

> 📌 This repository is currently in its **testing phase**. Features are functional but actively being refined ahead of final deployment.

---

## ✨ Features

- **Asset Registration** — Multi-step registration wizard with image uploads, auto-generated asset IDs (`cict-XXXX`), and custodian assignment
- **QR-Based Asset Lookup** — Each asset gets a scannable QR code linking to a public info view, no login required for quick lookups
- **Custodian Management** — Admins can onboard custodians with automated welcome emails and secure password setup
- **Room Management** — Assets are organized by room with live asset counts per room
- **Condition Reporting** — Status logs track an asset's condition history over time, separate from the core asset record
- **Role-Based Access Control** — Tailored views and permissions for **Admin**, **Full-time**, and **Part-time** custodians
- **Smart Filtering & Search** — Filter assets by status, category, room, and custodian, with context-aware filter visibility based on role

---

## 🛠️ Tech Stack

| Layer                 | Technology                                   |
| --------------------- | -------------------------------------------- |
| Frontend              | React + Vite                                 |
| Styling               | Custom CSS                                   |
| Backend / Database    | Firebase Firestore                           |
| Authentication        | Firebase Authentication                      |
| Identity Providers    | Google OAuth 2.0, Microsoft Entra ID (Azure) |
| File Storage          | Firebase Storage                             |
| Serverless Functions  | Firebase Cloud Functions (v2)                |
| Email Delivery        | Nodemailer                                   |
| QR Code Processing    | jsQR                                         |
| Component Development | Storybook                                    |
| Hosting               | Firebase Hosting & Vercel                    |

---

## 🔗 Live Demo

🌐 **[ams-cict.web.app](https://ams-cict.web.app)**

The site is registered with Google Search Console, so you can also find it by searching for **CICT Asset Management System** on Google, or simply click the link above.

### Demo Login Credentials

| Role    | Email                                         | Password                                                    |
| ------- | --------------------------------------------- | ----------------------------------------------------------- |
| Admin   | `admin@bulsu.com`                             | `faculty123`                                                |
| Faculty | `faculty1@gmail.com` to `faculty30@gmail.com` | Same as the part before the `@` (`faculty1` to `faculty30`) |

Faculty accounts follow one pattern: the password is the name in front of the `@`. For example, `faculty1@gmail.com` uses the password `faculty1`, and `faculty2@gmail.com` uses `faculty2`. Thirty faculty accounts are available, up to `faculty30@gmail.com`.

> These are demo accounts for trying out the system. Please do not enter real institutional data.

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/arji-hub/AssetManagement.git
cd AssetManagement

# Install dependencies
npm install

# Run the development server
npm run dev
```

> The app needs a Firebase project to run with live data. Follow the setup guide below to create your own.

---

## ⚙️ Setup: Run It on Your Own Firebase Project

This section walks you through standing up your own backend (Auth, Firestore, Storage, Cloud Functions) and connecting this frontend to it. You do not need access to the original project, but some source files contain CICT-specific branding and URLs, which steps 3 and 7 explain how to replace.

### Contents

1. [Prerequisites](#1-prerequisites)
2. [Create the Firebase project](#2-create-the-firebase-project)
3. [Register the web app and set `.env`](#3-register-the-web-app-and-set-env)
4. [Enable Authentication](#4-enable-authentication)
5. [Create Firestore and Storage](#5-create-firestore-and-storage)
6. [Connect the Firebase CLI and deploy rules and indexes](#6-connect-the-firebase-cli-and-deploy-rules-and-indexes)
7. [Deploy Cloud Functions](#7-deploy-cloud-functions)
8. [Create the first admin user](#8-create-the-first-admin-user)
9. [Run locally](#9-run-locally)
10. [Build and deploy the frontend](#10-build-and-deploy-the-frontend)
11. [Backend overview](#11-backend-overview)
12. [Troubleshooting](#12-troubleshooting)

---

### 1. Prerequisites

- **Node.js** `v22.12.0` or higher (the Cloud Functions runtime is Node 22, and Vite 8 needs `v20.19+` or `v22.12+`)
- **npm** `v9` or higher (or yarn / pnpm)
- A **Google account** with access to the [Firebase Console](https://console.firebase.google.com/)
- **Firebase CLI** — installed locally by `npm install` (it is a dev dependency), so run it as `npx firebase ...`; no global install is needed
- **Microsoft Entra ID (Azure AD)** — optional, only if you want institutional Microsoft sign-in
- Build tools for the `canvas` package, if `npm install` fails to compile it on your OS (see the [node-canvas install notes](https://github.com/Automattic/node-canvas#compiling))

---

### 2. Create the Firebase project

1. Open the [Firebase Console](https://console.firebase.google.com/) and click **Add project**. Name it (for example `ams-yourdept`).
2. Upgrade the project to the **Blaze (pay-as-you-go)** plan. Cloud Functions require it, and Storage may require it to create the default bucket. Light usage typically stays within the free quota, but check current Firebase pricing, and create a budget alert in Google Cloud Billing so unexpected usage does not surprise you.

---

### 3. Register the web app and set `.env`

1. In **Project settings > General**, under **Your apps**, click the **Web** (`</>`) icon and register an app. You can skip Firebase Hosting setup in the wizard.
2. Copy the config values shown into a `.env` file in the repo root:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_MS_TENANT_ID=
VITE_APP_BASE_URL=
```

> **Note:** Vite only exposes variables that start with `VITE_`. Never commit `.env`; make sure it is listed in `.gitignore`. `VITE_MS_TENANT_ID` is only needed for Microsoft sign-in (step 4); leave it empty otherwise. `VITE_APP_BASE_URL` is the public URL of your deployed app with no trailing slash (for example `https://your-project.web.app`). It is written into asset QR codes, so set it before generating or printing any; if it is empty, the current browser address is used.

3. Check for any remaining values tied to the original deployment:

```bash
git grep -n "ams-cict" -- src functions
```

After you apply the settings in this guide (`VITE_APP_BASE_URL` here, and `functions/src/config/appConfig.js` in step 7), the only matches left should be in the optional maintenance scripts under `functions/src/admin/` and `functions/src/script/`, which are not deployed.

---

### 4. Enable Authentication

1. Go to **Build > Authentication > Get started > Sign-in method**.
2. Enable **Email/Password**.
3. Enable **Google** and/or **Microsoft**.
4. Go to **Authentication > Settings > Authorized domains** and add the domain you will deploy to (for example `ams-cict.web.app` or your custom domain). Also check that `localhost` is listed, and add it if it is missing, so sign-in works during local development. Without this, sign-in works locally but fails in production.

**Microsoft sign-in (optional)**

1. In the [Azure portal](https://portal.azure.com/), go to **Microsoft Entra ID > App registrations > New registration**.
2. Set the redirect URI (type **Web**) to:
   `https://<your-project-id>.firebaseapp.com/__/auth/handler`
3. Create a **client secret** under **Certificates & secrets**.
4. In Firebase, enable the **Microsoft** provider and paste the application (client) ID and the client secret.
5. Copy your **Directory (tenant) ID** into `VITE_MS_TENANT_ID` in `.env`.

---

### 5. Create Firestore and Storage

These must exist before you can deploy rules.

1. **Build > Firestore Database > Create database.** Choose **Production mode** and a location. Pick the location carefully: it cannot be changed later, and your Cloud Functions region should be close to it.
2. **Build > Storage > Get started.** Accept the default bucket.

**Storage CORS (needed for QR code export).** Downloading QR codes as a ZIP reads images from Storage in the browser, which requires CORS to be configured on your bucket. Without it, that export fails while everything else works. Create a `cors.json` file listing the addresses the app runs on:

```json
[
  {
    "origin": ["http://localhost:8080", "https://YOUR_APP_DOMAIN"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
```

Use the local address that `npm run dev` prints, and your real hosting domain. Then apply it with the [Google Cloud CLI](https://cloud.google.com/sdk/docs/install), using your exact bucket name from `VITE_FIREBASE_STORAGE_BUCKET`:

```bash
gcloud storage buckets update gs://YOUR_BUCKET_NAME --cors-file=cors.json
```

---

### 6. Connect the Firebase CLI and deploy rules and indexes

The repo already contains the backend definitions in the root folder:

| File                     | Purpose                                          |
| ------------------------ | ------------------------------------------------ |
| `firestore.rules`        | Firestore security rules (access model)          |
| `storage.rules`          | Storage security rules                           |
| `firestore.indexes.json` | Composite indexes required by the app's queries  |
| `firebase.json`          | Wires the files above plus Hosting and Functions |

Log in, point the CLI at your project, and deploy:

```bash
npx firebase login
npx firebase use --add          # select your project; creates your own .firebaserc
npm run deploy:backend          # deploys Firestore rules + indexes and Storage rules
```

> If a `.firebaserc` from the original project is present, delete it first so `firebase use --add` creates yours.

Notes:

- **Indexes take a few minutes to build.** Queries that need them fail until they finish. Track progress under **Firestore > Indexes**.
- When publishing Storage rules, the console or CLI may ask you to grant cross-service access because the rules read Firestore. Accept it.
- If the CLI asks about deleting indexes that exist in your project but not in the file, answer carefully. Use `--force` only if you are sure.

**Scripts used above** (already in `package.json`; listed here for reference):

```json
"deploy": "vite build && firebase deploy --only hosting",
"deploy:backend": "firebase deploy --only firestore,storage",
"deploy:functions": "firebase deploy --only functions"
```

---

### 7. Deploy Cloud Functions

The functions in `functions/` power custodian creation, transfer handling, document scanning, room updates, and all email notifications. Without them, those features will not work.

1. Install the functions' own dependencies:

```bash
cd functions
npm install
cd ..
```

2. Set the three secrets the functions read. They are stored in Google Secret Manager, so no `.env` file is needed inside `functions/`:

| Secret           | What it is                                                           | Where to get it                                                                                  |
| ---------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `GMAIL_USER`     | The Gmail address that sends all welcome and notification emails     | A Gmail or Google Workspace account you control                                                  |
| `GMAIL_PASS`     | A Google **App Password** for that account (not its normal password) | Google Account > Security > 2-Step Verification > App passwords (2-Step Verification must be on) |
| `GEMINI_API_KEY` | API key for the acquisition-document scanner                         | [Google AI Studio](https://aistudio.google.com/apikey)                                           |

```bash
npx firebase functions:secrets:set GMAIL_USER
npx firebase functions:secrets:set GMAIL_PASS
npx firebase functions:secrets:set GEMINI_API_KEY
```

Each command prompts for the value. Every function that declares a secret needs it to exist at deploy time, and the deploy command below prompts for any that are missing. If you do not plan to use email or document scanning yet, enter a placeholder value and replace it later (re-run the `secrets:set` command, then redeploy). Until real values are set, welcome and notification emails and document scanning will not work; the rest of the app is unaffected. Note that Gmail limits how many emails an account can send per day, so a dedicated sender account is recommended.

3. Set the deployment-specific values (all paths are inside `functions/src/`):

| What                                                   | Where                                                                        | Change it to                                                          |
| ------------------------------------------------------ | ---------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Hosting URL (email links) and logo URL (email headers) | `config/appConfig.js`                                                        | Your hosting URL, and a publicly reachable logo image of your own     |
| `region: "asia-southeast1"`                            | Every Firestore trigger in `triggers/`                                       | A region compatible with your Firestore location (see the note below) |
| `MODEL` (Gemini model id)                              | `https/scanAcquisitionDoc.js`                                                | A model id that is currently available in Google AI Studio            |
| Sender name, `FALLBACK_SUPPLIER`                       | `utils/sendEmail.js`, `https/addCustodian.js`, `https/scanAcquisitionDoc.js` | Your institution's name (optional branding)                           |

> **Region note:** the Firestore triggers are pinned to `asia-southeast1` (Singapore), while the two callable functions use the default region (`us-central1`). Triggers should run in the same region as your Firestore database, so either choose a Firestore location in Singapore in step 5, or change `region` in each trigger file to match yours. If you change a callable function's region, the frontend's `getFunctions(app, region)` call must use the same region.

4. Deploy:

```bash
npm run deploy:functions
```

> The first functions deployment enables several Google Cloud APIs and can fail once on a fresh project. If it does, wait a minute or two and run the command again.

Functions use default credentials when deployed, so **no service account key file is needed**. Never commit `*-adminsdk-*.json` files.

---

### 8. Create the first admin user

The security rules only let admins create users, so the first admin is created by hand:

1. In **Authentication > Users**, click **Add user** and create an account with the admin's email and a password (or sign in once with Google/Microsoft to create the account).
2. Copy the generated **User UID**.
3. In **Firestore Database**, create a document in the `user` collection:
   - **Collection:** `user`
   - **Document ID:** the UID you copied
   - **Fields:**

| Field            | Example                    | Firestore type |
| ---------------- | -------------------------- | -------------- |
| `email`          | `admin@yourdepartment.edu` | string         |
| `user_name`      | `admin`                    | string         |
| `first_name`     | `System`                   | string         |
| `middle_name`    | _(empty)_                  | string         |
| `last_name`      | `Admin`                    | string         |
| `role`           | `admin`                    | string         |
| `status`         | `active`                   | string         |
| `deactivated_at` | `null`                     | null           |
| `created_at`     | the current time           | timestamp      |

These are the same fields the `addCustodian` function writes for every user it creates. Use a real Firestore **timestamp** for `created_at`, not a text string.

> **Sign-in note:** the app matches a signed-in account to its `user` document by UID, not by email. Sign in first with the same method you used to create the account (Email/Password in the steps above). Signing in with Google or Microsoft using the same email may create a separate account with a different UID unless the providers are linked, and that account will not have the admin role.

Once signed in as admin, you can add custodians from inside the app. Valid roles are `admin`, `fulltime`, and `parttime`.

**Seed the fallback category.** The acquisition-document scanner assigns any item it cannot classify to a category with the ID `Others`. Create a document in the `category` collection with **Document ID** `Others` and a `name` of `Others` (add any other fields your category form normally writes). Without it, scanned items fall back to a category that does not exist.

---

### 9. Run locally

```bash
npm run dev
```

Open the local address that Vite prints in the terminal (this project configures its own dev-server port, so it may differ from Vite's default of 5173) and sign in with the admin account.

**Check that everything works end to end:**

1. Sign in as the admin.
2. Add a custodian (this calls `addCustodian` and sends a welcome email).
3. Register an asset with an image (tests Storage uploads).
4. Open the asset's QR link and confirm it points to your own app URL.
5. Scan an acquisition document (tests `GEMINI_API_KEY`).
6. File a report or transfer request and confirm the notification email arrives with working links.
7. Download the QR codes as a ZIP (tests the Storage CORS setup).

---

### 10. Build and deploy the frontend

```bash
npm run build      # outputs static files to dist/
npm run deploy     # builds and deploys to Firebase Hosting
```

`firebase.json` already includes the single-page-app rewrite, so deep links and page refreshes work. You can also deploy the `dist/` folder to Vercel or Netlify; if you do, add a rewrite of all routes to `/index.html` and add that domain to Firebase's **Authorized domains** (step 4).

---

### 11. Backend overview

**Firestore collections**

| Collection                                      | Purpose                                     |
| ----------------------------------------------- | ------------------------------------------- |
| `user`                                          | Accounts and roles (document ID = Auth UID) |
| `asset`                                         | Registered assets                           |
| `room`                                          | Rooms and their asset counts                |
| `category`                                      | Asset categories                            |
| `counters`                                      | Counters used for ID generation             |
| `report`                                        | Condition reports                           |
| `transfer_request`                              | Custodian transfer requests                 |
| `transfer_room`                                 | Room transfers                              |
| `audit_room` (`audit_item`, `discrepancy_item`) | Room audits                                 |
| `audit_report` (`audit_item`)                   | Audit reports                               |

**Storage paths:** `assets/`, `acquisitions/`, `reports/`, `config/pdf/` (PDF header/footer images; PNG or JPG, max 2 MB).

**Cloud Functions**

| Function                               | Type              | Purpose                                                                                                            |
| -------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| `addCustodian`                         | Callable          | Admin only. Creates the Auth account and `user` document, then emails a welcome message with a password-setup link |
| `scanAcquisitionDoc`                   | Callable          | Admin only. Sends a photo of a Deed of Donation, PAR, or ICS to Gemini and returns the extracted items             |
| `onTransferRequestCompleted`           | Firestore trigger | When a transfer request is completed, sets or clears `property_custodian` or `local_mr` on the assets              |
| `onRoomUpdated`                        | Firestore trigger | When a room is renamed, updates `room_name` on all assets in that room                                             |
| `onTransferRequestCreated` / `Updated` | Firestore trigger | Emails approvers when approval is pending, and participants when a request is completed or denied                  |
| `onReportCreated` / `Updated`          | Firestore trigger | Emails the custodian, local MR, and admins about new reports, and about status changes                             |
| `onTransferRoomCreated`                | Firestore trigger | Emails the custodian and local MR of an asset that an admin moved to another room                                  |

Users can switch the report, transfer request, and room transfer emails on or off in the app's notification settings. The choice is stored in `notification_prefs` on their `user` document; everything defaults to on.

**Legacy and maintenance files.** These are kept in the repo for reference and are not exported from `functions/src/index.js`, so they are never deployed:

- `onUpdateAssetCustodian.js` and `onUpdateAssetLocalMR.js` are older triggers, replaced by `onTransferRequestCompleted`.
- `admin/changeQR.js` and `script/backfill-qr-codes.js` are one-off scripts for regenerating QR codes. They contain their own hardcoded URLs and storage bucket name, so edit those before running them. They need `canvas`, `jsdom`, and `qr-code-styling`, which are installed in `functions/` as dev dependencies.

---

### 12. Troubleshooting

| Symptom                                       | Likely cause and fix                                                                         |
| --------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `Missing or insufficient permissions`         | Rules not deployed, or the signed-in user has no `user/{uid}` document with a role.          |
| Query error mentioning a required index       | Indexes still building, or not deployed. Run `npm run deploy:backend` and wait.              |
| Sign-in popup fails in production only        | Domain missing from **Authentication > Settings > Authorized domains**.                      |
| Microsoft sign-in redirect error              | Redirect URI in Azure does not match `https://<project-id>.firebaseapp.com/__/auth/handler`. |
| Blank page after deploy                       | `.env` values missing at build time, or the rewrite to `/index.html` is absent.              |
| Functions deploy fails on first run           | Project not on Blaze, or APIs still enabling. Wait and retry.                                |
| `npm install` fails on `canvas`               | Install the native build tools for your OS (see Prerequisites).                              |
| `npm run dev` fails with a Node version error | Upgrade Node (`v22.12.0` or higher recommended).                                             |

---

## 👥 Team

Developed by **Group #5 BSIT 3G — G2**
College of Information and Communications Technology
Bulacan State University

---

<div align="center">

<sub>© 2026 CICT Asset Management System. Capstone Project — Bulacan State University.</sub>

</div>
