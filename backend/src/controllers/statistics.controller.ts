
import { Request, Response } from "express";
import mongoose from "mongoose";
import Review from "../models/Review";
import Game from "../models/Game";
import User from "../models/User";

// Get the top 10 games ranked by CritiQuest user reviews
export const getRankings = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const rankings = await Review.aggregate([
            // Calculate the overall score of each review
            {
                $project: {
                    game: 1,
                    graphics: "$ratings.graphics",
                    gameplay: "$ratings.gameplay",
                    story: "$ratings.story",
                    sound: "$ratings.sound",
                    overallScore: {
                        $avg: [
                            "$ratings.graphics",
                            "$ratings.gameplay",
                            "$ratings.story",
                            "$ratings.sound"
                        ]
                    }
                }
            },

            // Group reviews by game and calculate averages
            {
                $group: {
                    _id: "$game",
                    reviewCount: { $sum: 1 },
                    averageScore: { $avg: "$overallScore" },
                    averageGraphics: { $avg: "$graphics" },
                    averageGameplay: { $avg: "$gameplay" },
                    averageStory: { $avg: "$story" },
                    averageSound: { $avg: "$sound" }
                }
            },

            // Sort by score, then by number of reviews
            {
                $sort: {
                    averageScore: -1,
                    reviewCount: -1
                }
            },

            // Return only the top 10 games
            { $limit: 10 },

            // Retrieve game information
            {
                $lookup: {
                    from: "games",
                    localField: "_id",
                    foreignField: "_id",
                    as: "game"
                }
            },
            { $unwind: "$game" },

            // Format the response
            {
                $project: {
                    _id: 0,
                    game: 1,
                    reviewCount: 1,
                    averageScore: { $round: ["$averageScore", 2] },
                    averageGraphics: { $round: ["$averageGraphics", 2] },
                    averageGameplay: { $round: ["$averageGameplay", 2] },
                    averageStory: { $round: ["$averageStory", 2] },
                    averageSound: { $round: ["$averageSound", 2] }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            count: rankings.length,
            rankings
        });
    } catch (error) {
        console.error("Get rankings error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while retrieving rankings"
        });
    }
};

// Get statistics for a specific game
export const getGameStatistics = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { gameId } = req.params;

        if (
            typeof gameId !== "string" ||
            !mongoose.Types.ObjectId.isValid(gameId)
        ) {
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

        const results = await Review.aggregate([
            // Consider only reviews for the requested game
            {
                $match: {
                    game: new mongoose.Types.ObjectId(gameId)
                }
            },

            // Calculate the overall score of each review
            {
                $project: {
                    graphics: "$ratings.graphics",
                    gameplay: "$ratings.gameplay",
                    story: "$ratings.story",
                    sound: "$ratings.sound",
                    overallScore: {
                        $avg: [
                            "$ratings.graphics",
                            "$ratings.gameplay",
                            "$ratings.story",
                            "$ratings.sound"
                        ]
                    }
                }
            },

            // Calculate averages and review count
            {
                $group: {
                    _id: null,
                    reviewCount: { $sum: 1 },
                    averageScore: { $avg: "$overallScore" },
                    averageGraphics: { $avg: "$graphics" },
                    averageGameplay: { $avg: "$gameplay" },
                    averageStory: { $avg: "$story" },
                    averageSound: { $avg: "$sound" }
                }
            },

            // Round averages to two decimal places
            {
                $project: {
                    _id: 0,
                    reviewCount: 1,
                    averageScore: { $round: ["$averageScore", 2] },
                    averageGraphics: { $round: ["$averageGraphics", 2] },
                    averageGameplay: { $round: ["$averageGameplay", 2] },
                    averageStory: { $round: ["$averageStory", 2] },
                    averageSound: { $round: ["$averageSound", 2] }
                }
            }
        ]);

        const statistics = results[0] ?? {
            reviewCount: 0,
            averageScore: 0,
            averageGraphics: 0,
            averageGameplay: 0,
            averageStory: 0,
            averageSound: 0
        };

        res.status(200).json({
            success: true,
            game,
            statistics
        });
    } catch (error) {
        console.error("Get game statistics error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while retrieving game statistics"
        });
    }
};


// Get general information for the Home page
export const getHomeData = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const [gameCount, reviewCount, userCount, recentReviews] =
            await Promise.all([
                Game.countDocuments(),
                Review.countDocuments(),
                User.countDocuments(),
                Review.find()
                    .sort({ createdAt: -1 })
                    .limit(3)
                    .populate("user", "username")
                    .populate("game", "name rawgId")
                    .lean()
            ]);

        const formattedReviews = recentReviews.map((review) => {
            const user = review.user as unknown as {
                username: string;
            };

            const game = review.game as unknown as {
                name: string;
                rawgId: number;
            };

            const averageScore = (
                review.ratings.graphics +
                review.ratings.gameplay +
                review.ratings.story +
                review.ratings.sound
            ) / 4;

            return {
                _id: review._id,
                username: user?.username ?? "Usuario",
                gameName: game?.name ?? "Videojuego",
                rawgId: game?.rawgId ?? null,
                ratings: review.ratings,
                averageScore: Number(averageScore.toFixed(2)),
                comment: review.comment,
                createdAt: review.createdAt
            };
        });

        res.status(200).json({
            success: true,
            statistics: {
                gameCount,
                reviewCount,
                userCount
            },
            recentReviews: formattedReviews
        });
    } catch (error) {
        console.error("Get home data error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while retrieving home data"
        });
    }
};