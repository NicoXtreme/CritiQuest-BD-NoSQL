
import dotenv from "dotenv";
import app from "./app";
import connectDB from "./config/database";

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async (): Promise<void> => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`CritiQuest API running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Unable to start CritiQuest server:", error);
        process.exit(1);
    }
};

startServer();
