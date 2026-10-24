
import express from "express";

// Controller se handler import karo
import { RegisterHandler } from "./Controller/controller.js";
import {ConnectDB} from "./config/connectDB.js";

const app = express();

// Middleware: JSON request body ko parse karta hai
app.use(express.json());

ConnectDB();

// GET route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello from Server"
  });
});

// POST route
app.post("/user/register", RegisterHandler);

// Server start karo
app.listen(4000, () => {
  console.log("Server listening on port 4000");
});
