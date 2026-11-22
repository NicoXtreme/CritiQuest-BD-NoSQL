
import { Router } from "express";
import {
    createReview,
    getGameReviews,
    updateReview,
    deleteReview
} from "../controllers/review.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Public route: get reviews for a game
router.get("/:gameId", getGameReviews);

// Protected routes
router.post("/", authenticate, createReview);
router.put("/:id", authenticate, updateReview);
router.delete("/:id", authenticate, deleteReview);

export default router;
