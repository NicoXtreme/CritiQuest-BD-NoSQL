
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import User from "../models/User";

// Generate JWT
const generateToken = (userId: string): string => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not defined");
    }

    const expiresIn = (process.env.JWT_EXPIRES_IN || "1d") as SignOptions["expiresIn"];

    return jwt.sign(
        { userId },
        secret,
        { expiresIn }
    );
};

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password } = req.body;

        // Basic validation
        if (!username || !email || !password) {
            res.status(400).json({
                success: false,
                message: "Username, email and password are required"
            });
            return;
        }

        // Check if email is already registered
        const existingUser = await User.findOne({
            email: String(email).trim().toLowerCase()
        });

        if (existingUser) {
            res.status(409).json({
                success: false,
                message: "An account with this email already exists"
            });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await User.create({
            username: String(username).trim(),
            email: String(email).trim().toLowerCase(),
            password: hashedPassword
        });

        // Generate authentication token
        const token = generateToken(user._id.toString());

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        // Handle duplicate email errors
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === 11000
        ) {
            res.status(409).json({
                success: false,
                message: "An account with this email already exists"
            });
            return;
        }

        console.error("Registration error:", error);

        res.status(500).json({
            success: false,
            message: "An error occurred during registration"
        });
    }
};

// Login an existing user
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
            return;
        }

        // Find user and explicitly include password
        const user = await User.findOne({
            email: String(email).trim().toLowerCase()
        }).select("+password");

        if (!user) {
            res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
            return;
        }

        // Compare submitted password with stored hash
        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
            return;
        }

        // Generate authentication token
        const token = generateToken(user._id.toString());

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "An error occurred during login"
        });
    }
};


export const getMe = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found"
            });
            return;
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Get authenticated user error:", error);

        res.status(500).json({
            success: false,
            message: "An error occurred while retrieving user information"
        });
    }
};

