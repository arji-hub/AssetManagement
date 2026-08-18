const {
  onDocumentCreated,
  onDocumentUpdated,
} = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const { getFirestore } = require("firebase-admin/firestore");
const { sendEmail } = require("../utils/sendEmail");

const GMAIL_USER = defineSecret("GMAIL_USER");
const GMAIL_PASS = defineSecret("GMAIL_PASS");

const LOGO_URL =
  "https://firebasestorage.googleapis.com/v0/b/ams-cict.firebasestorage.app/o/images%2Fcictlogo.jfif?alt=media&token=5ce68321-b3ef-40a4-86b5-6bcc42d7735e";

const SLOT_LABELS = {
  admin: "Admin",
  from: "Current Custodian",
  to: "New Custodian",
};

function humanizeType(type) {
  if (!type) return "Transfer";
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// slots that still need to acknowledge — filtered by whose turn it actually
// is, based on status, since admin only acts after from/to have both
// acknowledged (status === "for_approval"). Without this, admin.acknowledged
// starts false at creation and would look "pending" immediately, even
// though nothing is actually waiting on admin yet.
function getPendingRecipients(acknowledgments, status) {
  const candidates = ["admin", "from", "to"]
    .map((slot) => ({ slot, ...acknowledgments?.[slot] }))
    .filter((a) => a.uid && !a.acknowledged);

  if (status === "for_approval") {
    // only admin should be notified at this stage
    return candidates.filter((a) => a.slot === "admin");
  }

  // status is "pending" — from/to still need to acknowledge; admin isn't up yet
  return candidates.filter((a) => a.slot !== "admin");
}

// every slot that has a real participant, regardless of ack state
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
  };
}

// ── Shared email shell — matches the addCustodian welcome email branding ──
function emailShell({ heading, bodyHtml }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #860100; padding: 24px; text-align: center;">
        <img src="${LOGO_URL}"
         width="60" alt="CICT AMS Logo" style="margin-bottom: 8px;" />
        <h1 style="color: #f5aa2c; margin: 0; font-size: 20px; letter-spacing: 1px;">CICT Asset Management System</h1>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #860100; font-size: 17px; margin: 0 0 16px;">${heading}</h2>
        ${bodyHtml}
      </div>
      <div style="background-color: #860100; padding: 16px; text-align: center;">
        <p style="font-size: 12px; color: #f5aa2c; margin: 0;">
          This is an automated message. Please do not reply to this email.
        </p>
        <p style="font-size: 12px; color: #f5aa2c; margin: 4px 0 0;">
          © ${new Date().getFullYear()} CICT Asset Management System. All rights reserved.
        </p>
      </div>
    </div>
  `;
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
      <p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>Asset:</strong> ${transferData.asset_description || transferData.asset_id}</p>
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
      <p style="margin: 0; font-size: 14px; color: #333;"><strong>Asset:</strong> ${transferData.asset_description || transferData.asset_id}</p>
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
      if (!userData?.email) return; // no email on file — skip silently, don't fail the whole batch
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
        // one failed email shouldn't crash the trigger or block the others
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
      return; // skip the "next approver" email below — nothing left to approve
    }

    const someoneJustAcknowledged = ["admin", "from", "to"].some((slot) => {
      const b = before.acknowledgments?.[slot];
      const a = after.acknowledgments?.[slot];
      return (
        b?.uid && a?.uid && b.acknowledged === false && a.acknowledged === true
      );
    });

    if (!someoneJustAcknowledged) return; // unrelated field changed — don't spam email

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
