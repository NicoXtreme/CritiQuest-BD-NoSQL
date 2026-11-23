
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes";
import reviewRoutes from "./routes/review.routes";
import favoriteRoutes from "./routes/favorite.routes";
import statisticsRoutes from "./routes/statistics.routes";
import gameRoutes from "./routes/game.routes";

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Main route
app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Welcome to CritiQuest API",
        version: "1.0.0"
    });
});

// Health check
app.get("/api/health", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "CritiQuest backend is running",
        timestamp: new Date().toISOString()
    });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Game routes
app.use("/api/games", gameRoutes);

// Review routes
app.use("/api/reviews", reviewRoutes);

// Favorite routes
app.use("/api/favorites", favoriteRoutes);

// Statistics routes
app.use("/api/statistics", statisticsRoutes);

export default app;
