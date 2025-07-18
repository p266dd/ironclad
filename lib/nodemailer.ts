import { createTransport } from "nodemailer";
import { Attachment } from "nodemailer/lib/mailer";

const transporter = createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    type: "OAuth2",
    user: process.env.NODEMAILER_FROM,
    clientId: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    refreshToken: process.env.OAUTH_REFRESH_TOKEN,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
  text,
  attachments,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: Attachment[];
}) {
  // Verify SMTP connection.
  const hasConnection = await transporter.verify();
  console.log("SMTP Connection Successful:", hasConnection ? "yes" : "no");

  try {
    const info = await transporter.sendMail({
      from: `'Ironclad' <${process.env.NODEMAILER_FROM}>`,
      to: to,
      subject: subject,
      text: text,
      html: html,
      attachments: attachments,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error: unknown) {
    console.error("Error while sending mail.", error);
  }
}
