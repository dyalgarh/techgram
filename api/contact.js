import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

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
      html: `
        <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px; background:#f9f9f9; border-radius:8px;">
          <div style="text-align:center; background:#0d6efd; color:#fff; padding:20px; border-radius:8px 8px 0 0; font-size:24px;">Techgram</div>
          <div style="padding:20px; font-size:16px; line-height:1.5; color:#333;">
            <p>Hi ${name},</p>
            <p>Thank you for reaching out to us! We have received your message and our team will get back to you as soon as possible.</p>
            <p><strong>Your Submission:</strong></p>
            <ul>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Phone:</strong> ${phone}</li>
              <li><strong>Service Required:</strong> ${service_required}</li>
              <li><strong>Message:</strong> ${message}</li>
            </ul>
            <p>Thanks,<br>Techgram Team</p>
          </div>
          <div style="text-align:center; font-size:14px; color:#777; margin-top:20px;">&copy; 2026 Techgram. All rights reserved.</div>
        </div>
      `
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Email send failed:", err);
    return res.status(500).json({ error: "Email send failed" });
  }
}
