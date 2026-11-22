
import { Request, Response } from "express";
import mongoose from "mongoose";
import Favorite from "../models/Favorite";
import Game from "../models/Game";

// Add a game to the user's favorites
export const addFavorite = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId = req.userId;
        const { gameId } = req.body;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required"
            });
            return;
        }

        if (!gameId || !mongoose.Types.ObjectId.isValid(gameId)) {
            res.status(400).json({
                success: false,
                message: "A valid gameId is required"
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

        const existingFavorite = await Favorite.findOne({
            user: userId,
            game: gameId
        });

        if (existingFavorite) {
            res.status(409).json({
                success: false,
                message: "This game is already in your favorites"
            });
            return;
        }

        const favorite = await Favorite.create({
            user: userId,
            game: gameId
        });

        res.status(201).json({
            success: true,
            message: "Game added to favorites successfully",
            favorite
        });
    } catch (error: any) {
        if (error.code === 11000) {
            res.status(409).json({
                success: false,
                message: "This game is already in your favorites"
            });
            return;
        }

        console.error("Add favorite error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while adding favorite"
        });
    }
};

// Get all favorites belonging to the authenticated user
export const getFavorites = async (
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

        const favorites = await Favorite.find({ user: userId })
            .populate("game")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: favorites.length,
            favorites
        });
    } catch (error) {
        console.error("Get favorites error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while retrieving favorites"
        });
    }
};

// Remove a game from the authenticated user's favorites
export const removeFavorite = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId = req.userId;
        const gameId = req.params.gameId;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required"
            });
            return;
        }

        if (typeof gameId !== "string" || !mongoose.Types.ObjectId.isValid(gameId)) {
            res.status(400).json({
                success: false,
                message: "Invalid game ID"
            });
            return;
        }

        const favorite = await Favorite.findOneAndDelete({
            user: userId,
            game: gameId
        });

        if (!favorite) {
            res.status(404).json({
                success: false,
                message: "Favorite not found"
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Game removed from favorites successfully"
        });
    } catch (error) {
        console.error("Remove favorite error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while removing favorite"
        });
    }
};
