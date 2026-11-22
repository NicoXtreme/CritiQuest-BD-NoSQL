
import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            trim: true,
            minlength: [3, "Username must have at least 3 characters"],
            maxlength: [30, "Username cannot exceed 30 characters"]
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"]
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must have at least 8 characters"],
            select: false
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
