import { createClient } from "@supabase/supabase-js";
import Resend from "resend";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { name, business_name, email, phone, subject, service_required, message } = req.body;

  // Basic validation
  if (!name || !email || !message)
    return res.status(400).json({ error: "Missing required fields" });

  // Save to Supabase
  const { error } = await supabase.from("leads").insert([
    { name, business_name, email, phone, subject, service_required, message, source: "website" }
  ]);

  if (error) return res.status(500).json({ error: "Database insert failed" });

  try {
    // Email to Techgram
    await resend.emails.send({
      from: `Techgram <${process.env.NOTIFY_EMAIL}>`,
      to: process.env.NOTIFY_EMAIL,
      subject: `New Lead: ${name} (${service_required || "Service"})`,
      text: `
Name: ${name}
Business: ${business_name || "N/A"}
Email: ${email}
Phone: ${phone || "N/A"}
Subject: ${subject || "N/A"}
Service: ${service_required || "N/A"}
Message: ${message}
      `
    });

    // Confirmation email to user
    await resend.emails.send({
      from: `Techgram <${process.env.NOTIFY_EMAIL}>`,
      to: email,
      subject: "Thank you for contacting Techgram",
      text: `Hi ${name},\n\nThank you for reaching out! We have received your message and will contact you soon.\n\n- Techgram Team`
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Email send failed:", err);
    return res.status(500).json({ error: "Email send failed" });
  }
}
