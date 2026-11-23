import { Router } from "express";
import {
    createReview,
    getGameReviews,
    getMyReviewCount,
    getMyReviews,
    updateReview,
    deleteReview
} from "../controllers/review.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Reviews belonging to the authenticated user
router.get("/mine", authenticate, getMyReviews);
router.get("/mine/count", authenticate, getMyReviewCount);

// Reviews for a specific game
router.get("/:gameId", getGameReviews);

router.post("/", authenticate, createReview);
router.put("/:id", authenticate, updateReview);
router.delete("/:id", authenticate, deleteReview);

export default router;