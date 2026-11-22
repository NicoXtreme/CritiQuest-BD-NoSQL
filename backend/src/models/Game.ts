
import mongoose, { Document, Schema } from "mongoose";

export interface IGame extends Document {
    rawgId: number;
    name: string;
    backgroundImage?: string;
    released?: string;
    genres: string[];
    platforms: string[];
    createdAt: Date;
    updatedAt: Date;
}

const gameSchema = new Schema<IGame>(
    {
        rawgId: {
            type: Number,
            required: true,
            unique: true,
            index: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        backgroundImage: {
            type: String,
            default: null
        },

        released: {
            type: String,
            default: null
        },

        genres: {
            type: [String],
            default: []
        },

        platforms: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const Game = mongoose.model<IGame>("Game", gameSchema);

export default Game;
