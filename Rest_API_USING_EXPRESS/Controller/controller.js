
import { User } from "../models/userModels.js";

const RegisterHandler = async (req, res) => {
  try {
    // Request body se username, email aur password read karo
    const { username, email, password } = req.body;

    // Username, email aur password check karo
    if (username !== "" && password !== "" && email !== "") {

      // Check karo ke user pehle se exist karta hai ya nahi
      const findUser = await User.findOne({ email });

      if (findUser) {
        return res.status(200).json({
          message: "User already exists",
        });
      }

      // Naya user create karo
      const CreateUser = await User.create({
        username,
        email,
        password,
      });

      if (CreateUser) {
        return res.status(201).json({
          message: "User created successfully",
        });
      }

    } else {
      return res.status(400).json({
        message: "All credentials are required",
      });
    }

  } catch (error) {
    console.error("Registration Error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// ES Module export
export { RegisterHandler };
