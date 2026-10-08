const { emailShell } = require("../utils/emailShell");
const {
  onDocumentCreated,
  onDocumentUpdated,
} = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const { getFirestore } = require("firebase-admin/firestore");
const { sendEmail } = require("../utils/sendEmail");
const { isNotificationEnabled } = require("../utils/NotificationPrefs");

const GMAIL_USER = defineSecret("GMAIL_USER");
const GMAIL_PASS = defineSecret("GMAIL_PASS");

const NOTIFICATION_CATEGORY = "transfer_request";

const MAX_LISTED_ASSETS = 5;

const SLOT_LABELS = {
  admin: "Admin",
  from: "Current Custodian",
  to: "New Custodian",
};

function humanizeType(type) {
  if (!type) return "Transfer";
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Old docs have a single top-level asset_id/asset_description; new docs have
// an `items` array. Normalize both into one list.
function getRequestItems(data) {
  if (Array.isArray(data?.items) && data.items.length > 0) return data.items;
  if (data?.asset_id) {
    return [
      { asset_id: data.asset_id, asset_description: data.asset_description },
    ];
  }
  return [];
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function assetsHtml(transferData, marginBottom = "8px") {
  const items = getRequestItems(transferData);
  if (items.length === 0) return "";

  const nameOf = (item) =>
    escapeHtml(item.asset_description || item.asset_id || "Unknown asset");

  if (items.length === 1) {
    return `<p style="margin: 0 0 ${marginBottom}; font-size: 14px; color: #333;"><strong>Asset:</strong> ${nameOf(items[0])}</p>`;
  }

  const shown = items.slice(0, MAX_LISTED_ASSETS);
  const remaining = items.length - shown.length;

  return `
      <p style="margin: 0 0 4px; font-size: 14px; color: #333;"><strong>Assets (${items.length}):</strong></p>
      <ul style="margin: 0 0 ${marginBottom}; padding-left: 20px; font-size: 14px; color: #333; line-height: 1.6;">
        ${shown.map((item) => `<li>${nameOf(item)}</li>`).join("")}
        ${remaining > 0 ? `<li style="color: #777;">and ${remaining} more</li>` : ""}
      </ul>`;
}

function getPendingRecipients(acknowledgments, status) {
  const candidates = ["admin", "from", "to"]
    .map((slot) => ({ slot, ...acknowledgments?.[slot] }))
    .filter((a) => a.uid && !a.acknowledged);

  if (status === "for_approval") {
    return candidates.filter((a) => a.slot === "admin");
  }

  return candidates.filter((a) => a.slot !== "admin");
}

function getAllParticipants(acknowledgments) {
  return ["admin", "from", "to"]
    .map((slot) => ({ slot, ...acknowledgments?.[slot] }))
    .filter((a) => a.uid);
}

async function getUserData(uid) {
  const snap = await getFirestore().collection("user").doc(uid).get();
  if (!snap.exists) return null;
  const d = snap.data();
  return {
    email: d.email || null,
    firstName: d.first_name || "",
    notification_prefs: d.notification_prefs || null,
  };
}

function pendingApprovalHtml({
  slot,
  transferData,
  requestId,
  recipientFirstName,
}) {
  const label = SLOT_LABELS[slot] || "Approver";

  const bodyHtml = `
    <p style="font-size: 16px; color: #333;">Dear <strong>${recipientFirstName || "User"}</strong>,</p>
    <p style="font-size: 15px; color: #555; line-height: 1.6;">
      A transfer request has been submitted and requires your approval as the <strong>${label}</strong>.
    </p>
    <div style="background-color: #fff8ee; border-left: 4px solid #f5aa2c; padding: 16px; border-radius: 4px; margin: 24px 0;">
      <p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>Type:</strong> ${humanizeType(transferData.type)}</p>
      ${assetsHtml(transferData, "8px")}
      <p style="margin: 0; font-size: 14px; color: #333;"><strong>Requested by:</strong> ${transferData.requested_by_name}</p>
      ${transferData.notes ? `<p style="margin: 8px 0 0; font-size: 14px; color: #333;"><strong>Notes:</strong> ${transferData.notes}</p>` : ""}
    </div>
    <p style="font-size: 14px; color: #860100;">
      ⚠ Please review and respond to this request at your earliest convenience.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://ams-cict.web.app/transfer/${requestId}"
        style="background-color: #860100; color: #f5aa2c; padding: 12px 32px; text-decoration: none; border-radius: 4px; font-size: 15px; font-weight: bold;">
        Review Request
      </a>
    </div>
    <p style="font-size: 14px; color: #555; line-height: 1.6;">
      If you have any questions or concerns, please contact your system administrator.
    </p>
    <p style="font-size: 14px; color: #333;">
      Regards,<br/>
      <strong style="color: #860100;">CICT Asset Management Team</strong>
    </p>
  `;

  return emailShell({
    heading: "Transfer Request Awaiting Your Approval",
    bodyHtml,
  });
}

function resolvedHtml({ transferData, requestId, recipientFirstName }) {
  const resolved = transferData.status === "completed";

  const bodyHtml = `
    <p style="font-size: 16px; color: #333;">Dear <strong>${recipientFirstName || "User"}</strong>,</p>
    <p style="font-size: 15px; color: #555; line-height: 1.6;">
      The transfer request you were involved in has been
      <strong style="color: ${resolved ? "#2e7d32" : "#860100"};">${resolved ? "completed" : "denied"}</strong>.
    </p>
    <div style="background-color: #fff8ee; border-left: 4px solid #f5aa2c; padding: 16px; border-radius: 4px; margin: 24px 0;">
      <p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>Type:</strong> ${humanizeType(transferData.type)}</p>
      ${assetsHtml(transferData, "0")}
    </div>
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://ams-cict.web.app/transfer/${requestId}"
        style="background-color: #860100; color: #f5aa2c; padding: 12px 32px; text-decoration: none; border-radius: 4px; font-size: 15px; font-weight: bold;">
        View Request
      </a>
    </div>
    <p style="font-size: 14px; color: #555; line-height: 1.6;">
      If you have any questions or concerns, please contact your system administrator.
    </p>
    <p style="font-size: 14px; color: #333;">
      Regards,<br/>
      <strong style="color: #860100;">CICT Asset Management Team</strong>
    </p>
  `;

  return emailShell({
    heading: `Transfer Request ${resolved ? "Completed" : "Denied"}`,
    bodyHtml,
  });
}

async function notifyRecipients(
  recipients,
  requestId,
  transferData,
  htmlBuilder,
  subject,
  gmailUser,
  gmailPass,
) {
  await Promise.all(
    recipients.map(async (r) => {
      const userData = await getUserData(r.uid);
      if (!userData?.email) return;
      if (!isNotificationEnabled(userData, NOTIFICATION_CATEGORY)) return;
      try {
        await sendEmail({
          gmailUser,
          gmailPass,
          to: userData.email,
          subject,
          html: htmlBuilder({
            slot: r.slot,
            transferData,
            requestId,
            recipientFirstName: userData.firstName,
          }),
        });
      } catch (err) {
        console.error(
          `Failed to send transfer email to ${userData.email}:`,
          err,
        );
      }
    }),
  );
}

exports.onTransferRequestCreated = onDocumentCreated(
  {
    document: "transfer_request/{requestId}",
    region: "asia-southeast1",
    secrets: [GMAIL_USER, GMAIL_PASS],
  },
  async (event) => {
    const data = event.data.data();
    const requestId = event.params.requestId;
    const pending = getPendingRecipients(data.acknowledgments, data.status);
    if (pending.length === 0) return;

    await notifyRecipients(
      pending,
      requestId,
      data,
      pendingApprovalHtml,
      "New Transfer Request Awaiting Your Approval",
      GMAIL_USER.value(),
      GMAIL_PASS.value(),
    );
  },
);

exports.onTransferRequestUpdated = onDocumentUpdated(
  {
    document: "transfer_request/{requestId}",
    region: "asia-southeast1",
    secrets: [GMAIL_USER, GMAIL_PASS],
  },
  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();
    const requestId = event.params.requestId;
    const gmailUser = GMAIL_USER.value();
    const gmailPass = GMAIL_PASS.value();

    const justResolved =
      before.status !== after.status &&
      ["completed", "denied"].includes(after.status);

    if (justResolved) {
      const participants = getAllParticipants(after.acknowledgments);
      await notifyRecipients(
        participants,
        requestId,
        after,
        resolvedHtml,
        `Transfer Request ${after.status === "completed" ? "Completed" : "Denied"}`,
        gmailUser,
        gmailPass,
      );
      return;
    }

    const someoneJustAcknowledged = ["admin", "from", "to"].some((slot) => {
      const b = before.acknowledgments?.[slot];
      const a = after.acknowledgments?.[slot];
      return (
        b?.uid && a?.uid && b.acknowledged === false && a.acknowledged === true
      );
    });

    if (!someoneJustAcknowledged) return;

    const pending = getPendingRecipients(after.acknowledgments, after.status);
    if (pending.length === 0) return;

    await notifyRecipients(
      pending,
      requestId,
      after,
      pendingApprovalHtml,
      "Transfer Request Awaiting Your Approval",
      gmailUser,
      gmailPass,
    );
  },
);
