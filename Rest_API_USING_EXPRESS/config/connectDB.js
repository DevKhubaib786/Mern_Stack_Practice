import mongoose from "mongoose";

const uri =
  "mongodb+srv://devolperkhubaib_db_user:Jigger786@cluster0.rg4zhqf.mongodb.net/learning";

const ConnectDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log("Database Connected on Atlas");
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
};

export  {ConnectDB};