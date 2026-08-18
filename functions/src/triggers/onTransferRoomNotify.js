const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const { getFirestore } = require("firebase-admin/firestore");
const { sendEmail } = require("../utils/sendEmail");
const { emailShell } = require("../utils/emailShell");

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

async function getRoomName(roomId) {
  if (!roomId) return null;
  const snap = await getFirestore().collection("room").doc(roomId).get();
  if (!snap.exists) return roomId; // fall back to the slug if the doc's gone
  return snap.data().name || roomId;
}

// dedupe by uid, remembering every role a person holds on this asset
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

function roomMovedHtml({
  recipient,
  transferRoomData,
  moverName,
  fromRoomName,
  toRoomName,
}) {
  const rolesLabel = recipient.roles.join(" / ");

  const bodyHtml = `
    <p style="font-size: 16px; color: #333;">Dear <strong>${recipient.firstName || "User"}</strong>,</p>
    <p style="font-size: 15px; color: #555; line-height: 1.6;">
      This is to inform you that an asset you're associated with as <strong>${rolesLabel}</strong> has been moved to a new room by an administrator.
    </p>
    <div style="background-color: #fff8ee; border-left: 4px solid #f5aa2c; padding: 16px; border-radius: 4px; margin: 24px 0;">
      <p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>Asset:</strong> ${transferRoomData.asset_name || transferRoomData.asset_id}</p>
      ${fromRoomName ? `<p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>From Room:</strong> ${fromRoomName}</p>` : ""}
      <p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>To Room:</strong> ${toRoomName}</p>
      <p style="margin: 0; font-size: 14px; color: #333;"><strong>Moved by:</strong> ${moverName || "Admin"}</p>
    </div>
    <p style="font-size: 14px; color: #555; line-height: 1.6;">
      No action is needed from you — this is for your records. If you have any questions, please contact your system administrator.
    </p>
    <p style="font-size: 14px; color: #333;">
      Regards,<br/>
      <strong style="color: #860100;">CICT Asset Management Team</strong>
    </p>
  `;

  return emailShell({ heading: "Asset Moved to a New Room", bodyHtml });
}

exports.onTransferRoomCreated = onDocumentCreated(
  {
    document: "transfer_room/{docId}",
    region: "asia-southeast1",
    secrets: [GMAIL_USER, GMAIL_PASS],
  },
  async (event) => {
    const data = event.data.data();

    const assetSnap = await getFirestore()
      .collection("asset")
      .doc(data.asset_id)
      .get();

    if (!assetSnap.exists) return; // asset was removed/condemned — nothing to notify

    const assetData = assetSnap.data();

    const [custodian, localMr, mover, fromRoomName, toRoomName] =
      await Promise.all([
        getUserData(assetData.property_custodian),
        getUserData(assetData.local_mr),
        getUserData(data.move_by),
        getRoomName(data.room_from),
        getRoomName(data.move_to),
      ]);

    const recipients = dedupeRecipients([
      ...(custodian ? [{ user: custodian, role: "Custodian" }] : []),
      ...(localMr ? [{ user: localMr, role: "Local MR" }] : []),
    ]);

    if (recipients.length === 0) return; // asset has no custodian/local MR on file

    const moverName = mover?.firstName || "Admin";

    await Promise.all(
      recipients.map(async (recipient) => {
        try {
          await sendEmail({
            gmailUser: GMAIL_USER.value(),
            gmailPass: GMAIL_PASS.value(),
            to: recipient.email,
            subject: `Asset Moved — ${data.asset_name || data.asset_id}`,
            html: roomMovedHtml({
              recipient,
              transferRoomData: data,
              moverName,
              fromRoomName,
              toRoomName,
            }),
          });
        } catch (err) {
          console.error(
            `Failed to send room-transfer email to ${recipient.email}:`,
            err,
          );
        }
      }),
    );
  },
);
