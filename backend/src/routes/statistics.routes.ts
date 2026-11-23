
import { Router } from "express";
import {
    getRankings,
    getGameStatistics,
    getHomeData
} from "../controllers/statistics.controller";

const router = Router();

// General game rankings
router.get("/rankings", getRankings);

// General information for the Home page
router.get("/home", getHomeData);

// Statistics for a specific game
router.get("/:gameId", getGameStatistics);

export default router;
