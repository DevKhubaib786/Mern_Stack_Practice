import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mkhubaib.it@786",
    pass: "Jigger@786",
  },
});

export default transporter;
