
import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
    try {
        const mongoURI = process.env.MONGODB_URI;

        if (!mongoURI) {
            throw new Error("MONGODB_URI is not defined in the environment variables");
        }

        await mongoose.connect(mongoURI);

        console.log(`MongoDB connected successfully: ${mongoose.connection.host}`);
        console.log(`Database: ${mongoose.connection.name}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
};

export default connectDB;
