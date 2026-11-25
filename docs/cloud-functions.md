# Cloud Functions

Backend logic runs on Cloud Functions (Node.js) in the `asia-southeast1` region. Source lives in `functions/src/`.

## Folder layout

| Folder | Contents |
|---|---|
| `https/` | Callable and HTTP functions |
| `triggers/` | Firestore document triggers |
| `utils/` | Shared helpers (`sendEmail.js`, `emailShell.js`) |
| `config/` | Function configuration |
| `data/` | Static data used by functions |
| `script/` | One-off admin scripts |

## Functions

### Callable / HTTP

| Function | Purpose |
|---|---|
| `addCustodian` | Creates the Firebase Auth user and Firestore profile, then sends a welcome email with a password-reset link. Rolls back if any step fails. |
| `syncAssetPreview` | Keeps the public `assetPreviews` collection in sync with `asset` for the QR preview page. |
| `scanAcquisitionDoc` | Uses Gemini to read an uploaded acquisition document (PAR/ICS or Deed of Donation) and autofill registration fields. |

### Triggers

| Trigger | Fires on | Action |
|---|---|---|
| `onTransferRequestUpdated` | Transfer request update | Applies the transfer once all acknowledgments are in |
| `onTransferRequestNotify` | Transfer request create/update | Emails the parties involved |
| `onTransferRoomNotify` | Room transfer created | Emails affected custodians |
| `onReportNotify` | Incident report create/update | Emails administrators and custodians |

## Email

Notifications are sent with **Nodemailer over Gmail SMTP**. (Resend was tried first, but it required domain verification.)

- `utils/sendEmail.js` sends the message.
- `utils/emailShell.js` provides the shared HTML layout (maroon header, gold text).

Configure SMTP credentials as Firebase secrets or parameters. Never commit them.

## Deploy

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

Deploy a single function:

```bash
firebase deploy --only functions:addCustodian
```

## Local testing

```bash
firebase emulators:start --only functions,firestore,auth
```

## Cost control

The project runs on the Blaze plan. Keep a budget alert enabled, and consider App Check for the public `/asset/:assetId` route.

[← Back to README](../README.md)
