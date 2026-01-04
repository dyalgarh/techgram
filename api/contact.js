import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    name,
    business_name,
    email,
    phone,
    subject,
    service_required,
    message
  } = req.body;

  // Basic validation (important)
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const { error } = await supabase.from("leads").insert([
    {
      name,
      business_name,
      email,
      phone,
      subject,
      service_required,
      message,
      source: "website"
    }
  ]);

  if (error) {
    return res.status(500).json({ error: "Database insert failed" });
  }

  return res.status(200).json({ success: true });
}
