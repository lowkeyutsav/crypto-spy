import nodemailer from "nodemailer";

export const mailSender = async ({
  email,
  subject,
  text,
  html,
}: {
  email: string;
  subject: string;
  text?: string;
  html?: string;
}) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: Deno.env.get("EMAIL_ADDRESS"),
      pass: Deno.env.get("EMAIL_PASSWORD"),
    },
  });

  const info = await transporter.sendMail({
    from: "crypto-spy organization <cryptospy@gmail.com>",
    to: email,
    subject,
    text,
  });

  console.log(
    `Message sent to ${email} about ${subject} successfully , ${info.messageId}`,
  );
};
