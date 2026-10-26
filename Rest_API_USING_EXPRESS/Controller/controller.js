import crypto from "node:crypto";
import { User } from "../models/userModels.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../utlis/nodemailer.js";

// REGISTER HANDLER
const RegisterHandler = async (req, res) => {
  try {
    // Request body se username, email aur password read karo
    const { username, email, password } = req.body;

    // Check karo ke credentials empty na hon
    if (!username?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        message: "All credentials are required",
      });
    }

    // Check karo ke user pehle se exist karta hai ya nahi
    const findUser = await User.findOne({ email });

    if (findUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    // Password ko hash karo
    const hashedPassword = await bcrypt.hash(password, 10);

    // Naya user create karo
    const CreateUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    if (CreateUser) {
      return res.status(201).json({
        message: "User created successfully",
        user: {
          id: CreateUser._id,
          username: CreateUser.username,
          email: CreateUser.email,
        },
      });
    }
  } catch (error) {
    console.error("Registration Error:", error);

    // Duplicate email error handle karo
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// LOGIN HANDLER
const LoginHandler = async (req, res) => {
  try {
    // Email aur password lo
    const { email, password } = req.body;

    // Check karo email aur password empty na hon
    if (!email?.trim() || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Email se user find karo
    const findUser = await User.findOne({ email });

    // User exist nahi karta
    if (!findUser) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Password ko hash ke saath compare karo
    const passverify = await bcrypt.compare(
      password,
      findUser.password
    );

    if (!passverify) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // JWT secret environment se lo
    const secretKey = process.env.JWT_SECRET || "mysecretkey123";

    // User ID aur secret se token generate karo
    const userId = findUser._id;

    const token = jwt.sign(
      { userId },
      secretKey,
      { expiresIn: "1h" }
    );

    // Login successful
    return res.status(200).json({
      message: "Logged in successfully",
      token,
      user: {
        id: findUser._id,
        username: findUser.username,
        email: findUser.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// 1. FORGET PASSWORD HANDLER (Email mangna aur Reset Link bhej dena)
const ForgetpassHandler = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Email check karo
    if (!email?.trim()) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // 2. User ko database me dhoondo
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Email not registered",
      });
    }

    // 3. Ek unique random token generate karo (32 characters)
    const resetToken = crypto.randomBytes(16).toString("hex");

    // 4. Token aur 15 minutes ka expiry time user document me save karo
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // 5. Reset link tayyar karo
    const resetLink = `http://localhost:4000/user/reset-password?token=${resetToken}`;

    // 6. Email ke options prepare karo
    const mailoptions = {
      from: "mkhubaib.it@gmail.com",
      to: user.email,
      subject: "Password Reset Link",
      text: `Apna password reset karne ke liye yeh link use karein:\n\n${resetLink}\n\nYeh link 15 minutes ke liye valid hai.`,
    };

    // 7. Nodemailer se email send karo
    try {
      await transporter.sendMail(mailoptions);

      return res.status(200).json({
        message: "Password reset link email par bhej diya gaya hai!",
        resetToken: resetToken, // Thunder Client me testing ke liye direct token bhi return kar rahe hain
      });
    } catch (mailError) {
      console.error("Nodemailer Error:", mailError.message);

      // Agar email send na ho saki (e.g. Gmail password issue), tab bhi Thunder Client se testing ke liye token return kar dete hain
      return res.status(200).json({
        message: "Email bhejne me masla aya (Gmail credentials check karein), lekin testing ke liye token mil gaya hai:",
        resetToken: resetToken,
        error: mailError.message,
      });
    }
  } catch (error) {
    console.error("Forgetpass Error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// 2. RESET PASSWORD HANDLER (Token aur naya password le kar update karna)
const ResetPasswordHandler = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validation
    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Token aur newPassword dono required hain",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password kam az kam 6 characters ka hona chahiye",
      });
    }

    // Token match karo aur check karo ke expire na hua ho ($gt = greater than current time)
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Token invalid hai ya expire ho chuka hai!",
      });
    }

    // Naye password ko hash karo
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Token ko clear kar do taake dubara use na ho sake
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return res.status(200).json({
      message: "Password kamyabi se reset ho gaya hai! Ab naye password se login karein.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ES Module export
export {
  RegisterHandler,
  LoginHandler,
  ForgetpassHandler,
  ResetPasswordHandler,
};
