
import { Router, Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import {
    register,
    login,
    getMe
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Return validation errors, if any
const validateRequest = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array()
        });
        return;
    }

    next();
};

// Registration validations
const registerValidation = [
    body("username")
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage("Username must have between 3 and 30 characters"),

    body("email")
        .trim()
        .isEmail()
        .withMessage("Please provide a valid email")
        .normalizeEmail(),

    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must have at least 8 characters")
];

// Login validations
const loginValidation = [
    body("email")
        .trim()
        .isEmail()
        .withMessage("Please provide a valid email")
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
];

// Routes
router.post("/register", registerValidation, validateRequest, register);
router.post("/login", loginValidation, validateRequest, login);
router.get("/me", authenticate, getMe);

export default router;
