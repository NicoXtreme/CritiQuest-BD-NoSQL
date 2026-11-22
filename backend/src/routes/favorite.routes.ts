
import { Router } from "express";
import {
    addFavorite,
    getFavorites,
    removeFavorite
} from "../controllers/favorite.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// All favorite routes require authentication
router.use(authenticate);

router.get("/", getFavorites);
router.post("/", addFavorite);
router.delete("/:gameId", removeFavorite);

export default router;
