import nodemailer from 'nodemailer';

export const sendStatusEmail = async (toEmail, visitorName, status) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: `Visitor Pass Status: ${status}`,
      text: `Hello ${visitorName}, your visitor pass has been ${status}.`
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email failed to send:", error);
  }
};