// Scheduled email reminders for study-planner.
// Reads mailQueue docs written by the website (sendAt <= now) and emails them.
//
// Deploy once with:
//   cd functions && npm i && cd ..
//   firebase functions:config:set smtp.host="..." smtp.user="..." smtp.pass="..." (or use secrets)
//   firebase deploy --only functions
// The SMTP creds come from any provider (e.g. Gmail app password, SendGrid).

const { onSchedule } = require("firebase-functions/v2/scheduler");
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");

admin.initializeApp();

exports.sendReminders = onSchedule("every 15 minutes", async () => {
  const db = admin.firestore();
  const now = Date.now();
  const snap = await db
    .collection("mailQueue")
    .where("sent", "==", false)
    .where("sendAt", "<=", now)
    .limit(50)
    .get();

  if (snap.empty) return;

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  for (const d of snap.docs) {
    const m = d.data();
    try {
      await transport.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: m.to,
        subject: m.subject,
        html: m.html || m.text || "",
      });
      await d.ref.update({ sent: true });
    } catch (e) {
      console.error("failed to send reminder", d.id, e);
    }
  }
});
