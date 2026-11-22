
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Express Request to include the authenticated user's ID
declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            res.status(500).json({
                success: false,
                message: "Authentication configuration error"
            });
            return;
        }

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                message: "Authentication token is required"
            });
            return;
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, secret);

        if (
            typeof decoded === "string" ||
            typeof decoded.userId !== "string"
        ) {
            res.status(401).json({
                success: false,
                message: "Invalid authentication token"
            });
            return;
        }

        // Attach authenticated user ID to the request
        req.userId = decoded.userId;

        next();

    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token"
        });
    }
};
