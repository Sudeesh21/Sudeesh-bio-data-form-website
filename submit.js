import { MongoClient } from "mongodb";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  const { name, dob, email, phone, address, education, skills, experience, salary, position } = req.body;

  if (!name || !email)
    return res.status(400).json({ message: "Name and email are required" });

  try {
    // 1️⃣ Connect to MongoDB Atlas
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db("biodataDB");
    await db.collection("submissions").insertOne({
      name, dob, email, phone, address, education, skills, experience, salary, position,
      date: new Date()
    });

    // 2️⃣ Send confirmation email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.sudeeshcoder@gmail.com,
        pass: process.env.sudeesh21
      }
    });

    await transporter.sendMail({
      from: `"Company HR" <${process.env.sudeeshcoder@gmail.com}>`,
      to: email,
      subject: "Bio-Data Form Registered",
      text: `Hello ${name},\n\nYour bio-data form has been successfully registered. We will get back to you soon.\n\nThank you!`
    });

    res.status(200).json({ message: "Form submitted and email sent" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error submitting form" });
  }
}
