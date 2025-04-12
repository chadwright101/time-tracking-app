"use server";

import nodemailer from "nodemailer";
import * as XLSX from "xlsx";

export const exportData = async (timeEntries) => {
  try {
    if (!timeEntries || timeEntries.length === 0) {
      return { success: false, error: "No time entries found." };
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(timeEntries);
    XLSX.utils.book_append_sheet(wb, ws, "TimeEntries");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      requireTLS: true,
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.SMTP_SEND_TO,
      subject: "Daily Time Tracking Data",
      html: `<p>Attached is the time tracking data.</p>`,
      attachments: [
        {
          filename: "time_entries.xlsx",
          content: excelBuffer,
          contentType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message || "Failed to send email." };
  }
};
