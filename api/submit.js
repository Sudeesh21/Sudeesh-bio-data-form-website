import { MongoClient } from "mongodb";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  const { name, dob, email, phone, address, education, skills, experience, salary, position } = req.body;

  if (!name || !email)
    return res.status(400).json({ message: "Name and email are required" });

  // 1️⃣ Test MongoDB Connection
  let client;
  try {
    console.log("Connecting to MongoDB...");
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    console.log("✅ MongoDB connected!");

    const db = client.db("biodataDB");
    await db.collection("submissions").insertOne({
      name, dob, email, phone, address, education, skills, experience, salary, position,
      date: new Date()
    });
    console.log("✅ Data inserted into MongoDB!");
  } catch (err) {
    console.error("❌ MongoDB Error:", err);
    return res.status(500).json({ message: "MongoDB connection or insert failed", error: err.message });
  } finally {
    if (client) await client.close();
  }

  // 2️⃣ Test Email Sending
  try {
    console.log("Sending email...");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Company HR" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Bio-Data Form Registered",
      text: `Hello ${name},\n\nYour bio-data form has been successfully registered. We will get back to you soon.\n\nThank you!`
    });
    console.log("✅ Email sent!");
  } catch (err) {
    console.error("❌ Email Error:", err);
    return res.status(500).json({ message: "Email sending failed", error: err.message });
  }

  // 3️⃣ If everything works
  res.status(200).json({ message: "Form submitted and email sent" });
}
