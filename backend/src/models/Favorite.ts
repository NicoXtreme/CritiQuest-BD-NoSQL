
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IFavorite extends Document {
    user: Types.ObjectId;
    game: Types.ObjectId;
    createdAt: Date;
}

const favoriteSchema = new Schema<IFavorite>(
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
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// A user can only favorite a game once
favoriteSchema.index(
    { user: 1, game: 1 },
    { unique: true }
);

const Favorite = mongoose.model<IFavorite>("Favorite", favoriteSchema);

export default Favorite;
