
import { Request, Response } from "express";
import Game from "../models/Game";
import {
    getRawgGames,
    getRawgGameById,
    mapRawgGame,
} from "../services/rawg.service";

// GET /api/games
export const getGames = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const pageSize = Math.min(
            40,
            Math.max(1, Number(req.query.page_size) || 20)
        );

        const search =
            typeof req.query.search === "string"
                ? req.query.search.trim()
                : undefined;

        const data = await getRawgGames(page, pageSize, search);

        res.status(200).json({
            success: true,
            count: data.count,
            page,
            pageSize,
            nextPage: data.next ? page + 1 : null,
            previousPage: data.previous ? page - 1 : null,
            results: data.results.map((game) => ({
                id: game.id,
                name: game.name,
                backgroundImage: game.background_image,
                released: game.released,
                genres: game.genres?.map((genre) => genre.name) ?? [],
                platforms:
                    game.platforms?.map(
                        (item) => item.platform.name
                    ) ?? [],
            })),
        });
    } catch (error) {
        console.error("Error fetching games:", error);

        res.status(502).json({
            success: false,
            message: "No fue posible obtener el catálogo de videojuegos.",
        });
    }
};

// GET /api/games/:id
export const getGameById = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const rawgId = Number(req.params.id);

        if (!Number.isInteger(rawgId) || rawgId <= 0) {
            res.status(400).json({
                success: false,
                message: "El ID del videojuego no es válido.",
            });
            return;
        }

        const rawgGame = await getRawgGameById(rawgId);
        const gameData = mapRawgGame(rawgGame);

        const game = await Game.findOneAndUpdate(
            { rawgId },
            { $set: gameData },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            }
        );

        res.status(200).json({
            success: true,
            game: {
                _id: game._id,
                rawgId: game.rawgId,
                name: game.name,
                backgroundImage: game.backgroundImage,
                released: game.released,
                genres: game.genres,
                platforms: game.platforms,
            },
        });
    } catch (error) {
        console.error("Error fetching game details:", error);

        res.status(502).json({
            success: false,
            message: "No fue posible obtener los detalles del videojuego.",
        });
    }
};
