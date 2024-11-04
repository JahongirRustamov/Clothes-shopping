import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.MongoDB_URL);

    console.log("Successfully connected with DB:", connect.connection.host);
  } catch (error) {
    console.log("Error with connect DB:", error.message);
    process.exit(1);
  }
};
