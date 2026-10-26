import express from "express";

// Controller se handlers import karo
import {
  RegisterHandler,
  LoginHandler,
  ForgetpassHandler,
  ResetPasswordHandler,
} from "./Controller/controller.js";
import { ConnectDB } from "./config/connectDB.js";

const app = express();

// Middleware: JSON request body ko parse karta hai
app.use(express.json());

ConnectDB();

// GET test route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello from Server",
  });
});

// User routes
app.post("/user/register", RegisterHandler);
app.post("/user/login", LoginHandler);

// 1. Forgot password request (email send karne ke liye)
app.post("/forget/forgetpass", ForgetpassHandler);

// 2. Reset password request (naya password set karne ke liye)
app.post("/user/reset-password", ResetPasswordHandler);

// Server start karo
app.listen(4000, () => {
  console.log("Server listening on port 4000");
});
