
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Express application
const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Default route
app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Welcome to CritiQuest API",
        version: "1.0.0"
    });
});

// Health check route
app.get("/api/health", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "CritiQuest backend is running",
        timestamp: new Date().toISOString()
    });
});

// Server configuration
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
    console.log(`CritiQuest API running on http://localhost:${PORT}`);
});
