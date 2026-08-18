const {
  onDocumentCreated,
  onDocumentUpdated,
} = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const { getFirestore } = require("firebase-admin/firestore");
const { sendEmail } = require("../utils/sendEmail");
const { emailShell } = require("../utils/emailShell");
const { humanizeStatus } = require("../data/reportStatus");

const GMAIL_USER = defineSecret("GMAIL_USER");
const GMAIL_PASS = defineSecret("GMAIL_PASS");

async function getUserData(uid) {
  if (!uid) return null;
  const snap = await getFirestore().collection("user").doc(uid).get();
  if (!snap.exists) return null;
  const d = snap.data();
  if (!d.email) return null;
  return { uid, email: d.email, firstName: d.first_name || "" };
}

async function getAdmins() {
  const snap = await getFirestore()
    .collection("user")
    .where("role", "==", "admin")
    .get();

  return snap.docs
    .map((d) => {
      const data = d.data();
      if (!data.email) return null;
      return { uid: d.id, email: data.email, firstName: data.first_name || "" };
    })
    .filter(Boolean);
}

// dedupe by uid, and remember every role a person holds (e.g. reported it AND is the custodian)
function dedupeRecipients(entries) {
  const map = new Map();
  entries.forEach(({ user, role }) => {
    if (!user?.uid || !user.email) return;
    if (!map.has(user.uid)) {
      map.set(user.uid, { ...user, roles: [role] });
    } else {
      map.get(user.uid).roles.push(role);
    }
  });
  return Array.from(map.values());
}

function newReportHtml({ recipient, reportData, reportId }) {
  const latestLog = reportData.status_log?.[0];
  const rolesLabel = recipient.roles.join(" / ");

  const bodyHtml = `
    <p style="font-size: 16px; color: #333;">Dear <strong>${recipient.firstName || "User"}</strong>,</p>
    <p style="font-size: 15px; color: #555; line-height: 1.6;">
      A new report has been filed for an asset you're associated with as <strong>${rolesLabel}</strong>.
    </p>
    <div style="background-color: #fff8ee; border-left: 4px solid #f5aa2c; padding: 16px; border-radius: 4px; margin: 24px 0;">
      <p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>Report No:</strong> ${reportData.report_no}</p>
      <p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>Status:</strong> ${humanizeStatus(reportData.status)}</p>
      <p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>Asset:</strong> ${reportData.asset_description || reportData.asset_id}</p>
      <p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>Reported by:</strong> ${reportData.reported_by_name}</p>
      ${latestLog?.note ? `<p style="margin: 0; font-size: 14px; color: #333;"><strong>Details:</strong> ${latestLog.note}</p>` : ""}
    </div>
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://ams-cict.web.app/report/${reportId}"
        style="background-color: #860100; color: #f5aa2c; padding: 12px 32px; text-decoration: none; border-radius: 4px; font-size: 15px; font-weight: bold;">
        View Report
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

  return emailShell({ heading: "New Report Filed", bodyHtml });
}

function statusUpdateHtml({ recipient, reportData, reportId }) {
  const latestLog = reportData.status_log?.[reportData.status_log.length - 1];
  const rolesLabel = recipient.roles.join(" / ");
  const resolved = !!reportData.date_resolved;

  const bodyHtml = `
    <p style="font-size: 16px; color: #333;">Dear <strong>${recipient.firstName || "User"}</strong>,</p>
    <p style="font-size: 15px; color: #555; line-height: 1.6;">
      A report you're associated with as <strong>${rolesLabel}</strong> has been updated.
    </p>
    <div style="background-color: #fff8ee; border-left: 4px solid #f5aa2c; padding: 16px; border-radius: 4px; margin: 24px 0;">
      <p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>Report No:</strong> ${reportData.report_no}</p>
      <p style="margin: 0 0 8px; font-size: 14px; color: #333;">
        <strong>New Status:</strong>
        <span style="color: ${resolved ? "#2e7d32" : "#860100"};">${humanizeStatus(reportData.status)}</span>
      </p>
      <p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>Asset:</strong> ${reportData.asset_description || reportData.asset_id}</p>
      ${latestLog?.note ? `<p style="margin: 0; font-size: 14px; color: #333;"><strong>Note:</strong> ${latestLog.note}</p>` : ""}
    </div>
    ${resolved ? `<p style="font-size: 14px; color: #2e7d32;">✓ This report has been marked resolved.</p>` : ""}
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://ams-cict.web.app/report/${reportId}"
        style="background-color: #860100; color: #f5aa2c; padding: 12px 32px; text-decoration: none; border-radius: 4px; font-size: 15px; font-weight: bold;">
        View Report
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
    heading: `Report Status Updated${resolved ? " — Resolved" : ""}`,
    bodyHtml,
  });
}

async function sendToRecipients(
  recipients,
  reportId,
  reportData,
  htmlBuilder,
  subject,
  gmailUser,
  gmailPass,
) {
  await Promise.all(
    recipients.map(async (recipient) => {
      try {
        await sendEmail({
          gmailUser,
          gmailPass,
          to: recipient.email,
          subject,
          html: htmlBuilder({ recipient, reportData, reportId }),
        });
      } catch (err) {
        console.error(
          `Failed to send report email to ${recipient.email}:`,
          err,
        );
      }
    }),
  );
}

exports.onReportCreated = onDocumentCreated(
  {
    document: "report/{reportId}",
    region: "asia-southeast1",
    secrets: [GMAIL_USER, GMAIL_PASS],
  },
  async (event) => {
    const data = event.data.data();
    const reportId = event.params.reportId;

    const [custodian, localMr, admins] = await Promise.all([
      getUserData(data.current_custodian),
      getUserData(data.current_localmr),
      getAdmins(),
    ]);

    const recipients = dedupeRecipients([
      ...(custodian ? [{ user: custodian, role: "Custodian" }] : []),
      ...(localMr ? [{ user: localMr, role: "Local MR" }] : []),
      ...admins.map((a) => ({ user: a, role: "Admin" })),
    ]);

    if (recipients.length === 0) return;

    await sendToRecipients(
      recipients,
      reportId,
      data,
      newReportHtml,
      `New Report Filed — ${data.report_no}`,
      GMAIL_USER.value(),
      GMAIL_PASS.value(),
    );
  },
);

exports.onReportUpdated = onDocumentUpdated(
  {
    document: "report/{reportId}",
    region: "asia-southeast1",
    secrets: [GMAIL_USER, GMAIL_PASS],
  },
  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();
    const reportId = event.params.reportId;

    // only notify on an actual status change — avoids spamming on unrelated field edits
    if (before.status === after.status) return;

    const [reportedBy, custodian, localMr, admins] = await Promise.all([
      getUserData(after.reported_by),
      getUserData(after.current_custodian),
      getUserData(after.current_localmr),
      getAdmins(),
    ]);

    const recipients = dedupeRecipients([
      ...(reportedBy ? [{ user: reportedBy, role: "Reported By" }] : []),
      ...(custodian ? [{ user: custodian, role: "Custodian" }] : []),
      ...(localMr ? [{ user: localMr, role: "Local MR" }] : []),
      ...admins.map((a) => ({ user: a, role: "Admin" })),
    ]);

    if (recipients.length === 0) return;

    await sendToRecipients(
      recipients,
      reportId,
      after,
      statusUpdateHtml,
      `Report Status Updated — ${after.report_no}`,
      GMAIL_USER.value(),
      GMAIL_PASS.value(),
    );
  },
);
