import nodemailer from "nodemailer";

export type InquiryEmailPayload = {
  productId?: string;
  merchantId?: string;
  buyerName: string;
  buyerEmail: string;
  buyerWhatsapp: string;
  country: string;
  quantity: string;
  budget: string;
  message: string;
};

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function sendInquiryNotification(inquiry: InquiryEmailPayload) {
  const host = process.env.SMTP_HOST ?? "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT ?? 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const recipient = process.env.INQUIRY_NOTIFICATION_EMAIL ?? "hiaustin2026@gmail.com";

  if (!user || !pass) {
    throw new Error("Inquiry email service is not configured.");
  }

  const transport = nodemailer.createTransport({
    host,
    port,
    secure: String(process.env.SMTP_SECURE ?? port === 465).toLowerCase() === "true",
    auth: { user, pass },
    connectionTimeout: 10_000,
    socketTimeout: 15_000
  });

  const subjectName = inquiry.buyerName || "New buyer";
  await transport.sendMail({
    from: process.env.SMTP_FROM ?? `YiwuChristmas.ai <${user}>`,
    to: recipient,
    replyTo: inquiry.buyerEmail,
    subject: `[YiwuChristmas.ai Inquiry] ${subjectName} · ${inquiry.country || "Country not provided"}`,
    text: textBody(inquiry),
    html: htmlBody(inquiry)
  });
}

function textBody(inquiry: InquiryEmailPayload) {
  return [
    "New inquiry from YiwuChristmas.ai",
    "",
    `Name: ${inquiry.buyerName || "Buyer"}`,
    `Email: ${inquiry.buyerEmail}`,
    `WhatsApp: ${inquiry.buyerWhatsapp || "Not provided"}`,
    `Country: ${inquiry.country || "Not provided"}`,
    `Quantity: ${inquiry.quantity || "Not provided"}`,
    `Budget: ${inquiry.budget || "Not provided"}`,
    `Product ID: ${inquiry.productId || "General inquiry"}`,
    `Supplier ID: ${inquiry.merchantId || "General inquiry"}`,
    "",
    "Inquiry:",
    inquiry.message || "Please send quotation.",
    "",
    `Received: ${new Date().toISOString()}`
  ].join("\n");
}

function htmlBody(inquiry: InquiryEmailPayload) {
  const rows = [
    ["Name", inquiry.buyerName || "Buyer"],
    ["Email", inquiry.buyerEmail],
    ["WhatsApp", inquiry.buyerWhatsapp || "Not provided"],
    ["Country", inquiry.country || "Not provided"],
    ["Quantity", inquiry.quantity || "Not provided"],
    ["Budget", inquiry.budget || "Not provided"],
    ["Product ID", inquiry.productId || "General inquiry"],
    ["Supplier ID", inquiry.merchantId || "General inquiry"]
  ];

  return `
    <div style="font-family:Arial,sans-serif;max-width:680px;color:#18201d">
      <h1 style="font-size:24px">New YiwuChristmas.ai inquiry</h1>
      <table style="width:100%;border-collapse:collapse">
        ${rows.map(([label, value]) => `<tr><td style="padding:9px;border-bottom:1px solid #e5e7eb;font-weight:700">${escapeHtml(label)}</td><td style="padding:9px;border-bottom:1px solid #e5e7eb">${escapeHtml(value)}</td></tr>`).join("")}
      </table>
      <h2 style="font-size:18px;margin-top:24px">Inquiry details</h2>
      <div style="white-space:pre-wrap;background:#f5f7f6;padding:16px;border-radius:6px">${escapeHtml(inquiry.message || "Please send quotation.")}</div>
      <p style="margin-top:20px;color:#66716c">Reply directly to this email to contact ${escapeHtml(inquiry.buyerEmail)}.</p>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}
