import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

const createVisitorPassPdf = async (passData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        let pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      const verifyUrl = `${process.env.CLIENT_ORIGIN || 'http://localhost:5174'}/verify/${passData.passNumber}`;
      
      doc.fontSize(24).fillColor('#1e293b').text('VISITOR PASS', { align: 'center' });
      doc.moveDown(2);
      
      doc.fontSize(14).fillColor('#333333');
      doc.text(`Pass Number: `, { continued: true }).fillColor('#1e293b').text(passData.passNumber);
      doc.moveDown(0.5);
      
      doc.fillColor('#333333').text(`Visitor Name: `, { continued: true }).fillColor('#1e293b').text(passData.visitorName);
      doc.moveDown(0.5);
      
      doc.fillColor('#333333').text(`Phone: `, { continued: true }).fillColor('#1e293b').text(passData.visitorPhone);
      doc.moveDown(0.5);
      
      doc.fillColor('#333333').text(`Purpose: `, { continued: true }).fillColor('#1e293b').text(passData.purposeOfVisit);
      doc.moveDown(0.5);
      
      doc.fillColor('#333333').text(`Visit Date: `, { continued: true }).fillColor('#1e293b').text(new Date(passData.visitDate).toLocaleDateString());
      doc.moveDown(2);
      
      const qrBuffer = await QRCode.toBuffer(verifyUrl, { type: 'png', width: 150 });
      doc.image(qrBuffer, (doc.page.width - 150) / 2, doc.y, { width: 150 });
      
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

export const sendStatusEmail = async (toEmail, visitorName, status, passData = null) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    let attachments = [];
    if (status === 'Approved' && passData && passData.passNumber) {
      const pdfBuffer = await createVisitorPassPdf(passData);
      attachments.push({
        filename: `${passData.passNumber}-VisitorPass.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: `Visitor Pass Status: ${status}`,
      text: `Hello ${visitorName}, your visitor pass has been ${status}.`,
      attachments: attachments
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email failed to send:", error);
  }
};