
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IReview extends Document {
    user: Types.ObjectId;
    game: Types.ObjectId;
    ratings: {
        graphics: number;
        gameplay: number;
        story: number;
        sound: number;
    };
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        game: {
            type: Schema.Types.ObjectId,
            ref: "Game",
            required: true
        },

        ratings: {
            graphics: {
                type: Number,
                required: true,
                min: 1,
                max: 10
            },

            gameplay: {
                type: Number,
                required: true,
                min: 1,
                max: 10
            },

            story: {
                type: Number,
                required: true,
                min: 1,
                max: 10
            },

            sound: {
                type: Number,
                required: true,
                min: 1,
                max: 10
            }
        },

        comment: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 2000
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// A user can only review a game once
reviewSchema.index(
    { user: 1, game: 1 },
    { unique: true }
);

const Review = mongoose.model<IReview>("Review", reviewSchema);

export default Review;
