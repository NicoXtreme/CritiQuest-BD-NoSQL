
import { Request, Response } from "express";
import mongoose from "mongoose";
import Review from "../models/Review";
import Game from "../models/Game";

// Create a review
export const createReview = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { gameId, ratings, comment } = req.body;
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required"
            });
            return;
        }

        if (!gameId || !mongoose.isValidObjectId(gameId)) {
            res.status(400).json({
                success: false,
                message: "A valid game ID is required"
            });
            return;
        }

        if (!ratings || !comment) {
            res.status(400).json({
                success: false,
                message: "Ratings and comment are required"
            });
            return;
        }

        const requiredRatings = [
            "graphics",
            "gameplay",
            "story",
            "sound"
        ];

        for (const field of requiredRatings) {
            const value = ratings[field];

            if (
                typeof value !== "number" ||
                !Number.isInteger(value) ||
                value < 1 ||
                value > 10
            ) {
                res.status(400).json({
                    success: false,
                    message: `Rating '${field}' must be an integer between 1 and 10`
                });
                return;
            }
        }

        if (typeof comment !== "string" || !comment.trim()) {
            res.status(400).json({
                success: false,
                message: "Comment cannot be empty"
            });
            return;
        }

        if (comment.trim().length > 2000) {
            res.status(400).json({
                success: false,
                message: "Comment cannot exceed 2000 characters"
            });
            return;
        }

        // Check if the game exists
        const game = await Game.findById(gameId);

        if (!game) {
            res.status(404).json({
                success: false,
                message: "Game not found"
            });
            return;
        }

        // Check if the user already reviewed this game
        const existingReview = await Review.findOne({
            user: userId,
            game: gameId
        });

        if (existingReview) {
            res.status(409).json({
                success: false,
                message: "You have already reviewed this game"
            });
            return;
        }

        const review = await Review.create({
            user: userId,
            game: gameId,
            ratings,
            comment: comment.trim()
        });

        res.status(201).json({
            success: true,
            message: "Review created successfully",
            review
        });

    } catch (error) {
        // Handle duplicate review errors
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === 11000
        ) {
            res.status(409).json({
                success: false,
                message: "You have already reviewed this game"
            });
            return;
        }

        console.error("Create review error:", error);

        res.status(500).json({
            success: false,
            message: "An error occurred while creating the review"
        });
    }
};

// Get all reviews for a game
export const getGameReviews = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { gameId } = req.params;

        if (!mongoose.isValidObjectId(gameId)) {
            res.status(400).json({
                success: false,
                message: "Invalid game ID"
            });
            return;
        }

        const game = await Game.findById(gameId);

        if (!game) {
            res.status(404).json({
                success: false,
                message: "Game not found"
            });
            return;
        }

        const reviews = await Review.find({ game: gameId })
            .populate("user", "username")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            reviews
        });

    } catch (error) {
        console.error("Get game reviews error:", error);

        res.status(500).json({
            success: false,
            message: "An error occurred while retrieving reviews"
        });
    }
};

// Update an existing review
export const updateReview = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const { ratings, comment } = req.body;
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required"
            });
            return;
        }

        if (!mongoose.isValidObjectId(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid review ID"
            });
            return;
        }

        if (!ratings || !comment) {
            res.status(400).json({
                success: false,
                message: "Ratings and comment are required"
            });
            return;
        }

        const requiredRatings = [
            "graphics",
            "gameplay",
            "story",
            "sound"
        ];

        for (const field of requiredRatings) {
            const value = ratings[field];

            if (
                typeof value !== "number" ||
                !Number.isInteger(value) ||
                value < 1 ||
                value > 10
            ) {
                res.status(400).json({
                    success: false,
                    message: `Rating '${field}' must be an integer between 1 and 10`
                });
                return;
            }
        }

        if (typeof comment !== "string" || !comment.trim()) {
            res.status(400).json({
                success: false,
                message: "Comment cannot be empty"
            });
            return;
        }

        if (comment.trim().length > 2000) {
            res.status(400).json({
                success: false,
                message: "Comment cannot exceed 2000 characters"
            });
            return;
        }

        // Only the author can update the review
        const review = await Review.findOneAndUpdate(
            {
                _id: id,
                user: userId
            },
            {
                $set: {
                    ratings,
                    comment: comment.trim()
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!review) {
            const existingReview = await Review.exists({ _id: id });

            res.status(existingReview ? 403 : 404).json({
                success: false,
                message: existingReview
                    ? "You are not allowed to update this review"
                    : "Review not found"
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Review updated successfully",
            review
        });

    } catch (error) {
        console.error("Update review error:", error);

        res.status(500).json({
            success: false,
            message: "An error occurred while updating the review"
        });
    }
};

// Delete an existing review
export const deleteReview = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required"
            });
            return;
        }

        if (!mongoose.isValidObjectId(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid review ID"
            });
            return;
        }

        // Only the author can delete the review
        const review = await Review.findOneAndDelete({
            _id: id,
            user: userId
        });

        if (!review) {
            const existingReview = await Review.exists({ _id: id });

            res.status(existingReview ? 403 : 404).json({
                success: false,
                message: existingReview
                    ? "You are not allowed to delete this review"
                    : "Review not found"
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Review deleted successfully"
        });

    } catch (error) {
        console.error("Delete review error:", error);

        res.status(500).json({
            success: false,
            message: "An error occurred while deleting the review"
        });
    }
};

// Get the authenticated user's review count
export const getMyReviewCount = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required"
            });
            return;
        }

        const count = await Review.countDocuments({
            user: userId
        });

        res.status(200).json({
            success: true,
            count
        });
    } catch (error) {
        console.error("Get user review count error:", error);

        res.status(500).json({
            success: false,
            message: "An error occurred while retrieving review count"
        });
    }
};


// Get the authenticated user's recent reviews
export const getMyReviews = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required"
            });
            return;
        }

        const reviews = await Review.find({
            user: userId
        })
            .populate("user", "username")
            .populate("game", "name rawgId backgroundImage")
            .sort({ createdAt: -1 })
            .limit(2);

        res.status(200).json({
            success: true,
            count: reviews.length,
            reviews
        });

    } catch (error) {
        console.error("Get user reviews error:", error);

        res.status(500).json({
            success: false,
            message: "An error occurred while retrieving user reviews"
        });
    }
};