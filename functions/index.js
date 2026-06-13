const { setGlobalOptions } = require("firebase-functions");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const nodemailer = require("nodemailer");

initializeApp();
setGlobalOptions({ maxInstances: 10 });

const GMAIL_USER = defineSecret("GMAIL_USER");
const GMAIL_PASS = defineSecret("GMAIL_PASS");

/**
 * Callable Cloud Function: addCustodian
 *
 * Creates a new custodian account in both Firebase Auth and Firestore.
 * Only authenticated admins can call this function.
 *
 * Expected request.data shape:
 * {
 *   email: string,
 *   password: string,
 *   user_name: string,
 *   first_name: string,
 *   middle_name: string,
 *   last_name: string,
 *   role: "fulltime" | "parttime"
 * }
 */
exports.addCustodian = onCall(
  { cors: true, secrets: [GMAIL_USER, GMAIL_PASS] },
  async (request) => {
    // ── Debug logging ─────────────────────────────────────────────────────────
    console.log("=== addCustodian called ===");
    console.log("request.auth:", JSON.stringify(request.auth, null, 2));
    console.log("request.data:", JSON.stringify(request.data, null, 2));

    // ── Guard: caller must be logged in ──────────────────────────────────────
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "You must be logged in to perform this action.",
      );
    }

    // ── Guard: caller must be an admin ───────────────────────────────────────
    console.log("token.role:", request.auth.token.role);
    if (request.auth.token.role !== "admin") {
      throw new HttpsError(
        "permission-denied",
        "Only admins can add custodians.",
      );
    }

    const {
      email,
      password,
      user_name,
      first_name,
      middle_name,
      last_name,
      role,
    } = request.data;

    // ── Guard: required fields ────────────────────────────────────────────────
    if (
      !email ||
      !password ||
      !user_name ||
      !first_name ||
      !last_name ||
      !role
    ) {
      throw new HttpsError(
        "invalid-argument",
        "Missing required fields: email, password, user_name, first_name, last_name, role.",
      );
    }

    // ── Guard: valid role value ───────────────────────────────────────────────
    if (!["fulltime", "parttime"].includes(role)) {
      throw new HttpsError(
        "invalid-argument",
        "Role must be either 'fulltime' or 'parttime'.",
      );
    }

    // ── Step 1: Create Firebase Auth account ─────────────────────────────────
    // Admin SDK creates the account server-side — no session side effects,
    // and no secondary app workaround needed.
    let userRecord;
    try {
      userRecord = await getAuth().createUser({
        email,
        password,
        displayName: `${first_name} ${last_name}`,
      });
    } catch (authError) {
      // Surface Firebase Auth error codes clearly to the client
      throw new HttpsError("already-exists", authError.message);
    }

    // ── Step 2: Write Firestore document ─────────────────────────────────────
    try {
      await getFirestore()
        .collection("users")
        .doc(userRecord.uid)
        .set({
          email,
          user_name,
          first_name,
          middle_name: middle_name || "",
          last_name,
          role,
          created_at: FieldValue.serverTimestamp(),
          created_by: request.auth.uid,
        });
    } catch (firestoreError) {
      // Auth account was created but Firestore failed.
      // Roll back the Auth account so we don't leave orphaned accounts.
      await getAuth().deleteUser(userRecord.uid);
      throw new HttpsError(
        "internal",
        "Failed to save custodian data. Auth account has been rolled back.",
      );
    }

    // Step 3: Send welcome email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_USER.value(),
        pass: GMAIL_PASS.value(),
      },
    });

    try {
      await transporter.sendMail({
        from: `"CICT Asset Management" <${GMAIL_USER.value()}>`,
        to: email,
        subject: "Welcome to CICT Asset Management System",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            
            <!-- Header -->
            <div style="background-color: #860100; padding: 24px; text-align: center;">
              <img src="https://firebasestorage.googleapis.com/v0/b/ams-cict.firebasestorage.app/o/images%2Fcictlogo.jfif?alt=media&token=5ce68321-b3ef-40a4-86b5-6bcc42d7735e"
               width="60" alt="CICT AMS Logo" style="margin-bottom: 8px;" />
              <h1 style="color: #f5aa2c; margin: 0; font-size: 20px; letter-spacing: 1px;">CICT Asset Management System</h1>
            </div>

            <!-- Body -->
            <div style="padding: 32px;">
              <p style="font-size: 16px; color: #333;">Dear <strong>${first_name} ${last_name}</strong>,</p>
              <p style="font-size: 15px; color: #555; line-height: 1.6;">
                Your custodian account has been successfully created. Below are your login credentials. 
                Please keep this information confidential.
              </p>

              <!-- Credentials Box -->
              <div style="background-color: #fff8ee; border-left: 4px solid #f5aa2c; padding: 16px; border-radius: 4px; margin: 24px 0;">
                <p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>Password:</strong> ${password}</p>
                <p style="margin: 0; font-size: 14px; color: #333;"><strong>Role:</strong> ${role}</p>
              </div>

              <p style="font-size: 14px; color: #860100;">
                ⚠ For security purposes, please change your password immediately upon first login.
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://ams-cict.web.app" 
                  style="background-color: #860100; color: #f5aa2c; padding: 12px 32px; text-decoration: none; border-radius: 4px; font-size: 15px; font-weight: bold;">
                  Go to Website
                </a>
              </div>

              <p style="font-size: 14px; color: #555; line-height: 1.6;">
                If you have any questions or concerns, please contact your system administrator.
              </p>

              <p style="font-size: 14px; color: #333;">
                Regards,<br/>
                <strong style="color: #860100;">CICT Asset Management Team</strong>
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #860100; padding: 16px; text-align: center;">
              <p style="font-size: 12px; color: #f5aa2c; margin: 0;">
                This is an automated message. Please do not reply to this email.
              </p>
              <p style="font-size: 12px; color: #f5aa2c; margin: 4px 0 0;">
                © ${new Date().getFullYear()} CICT Asset Management System. All rights reserved.
              </p>
            </div>

          </div>
        `,
      });
      console.log("Email sent to:", email);
    } catch (emailError) {
      console.error("Email delivery failed:", emailError);
    }

    return { uid: userRecord.uid };
  },
);
