
import { Router } from "express";
import {
    getRankings,
    getGameStatistics
} from "../controllers/statistics.controller";

const router = Router();

// General game rankings
router.get("/rankings", getRankings);

// Statistics for a specific game
router.get("/:gameId", getGameStatistics);

export default router;
