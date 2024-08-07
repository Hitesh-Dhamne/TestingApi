import mongoose from "mongoose";
const BlaklistSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
            ref: "User",
        },
    },
    { timestamps: true }
);
export default mongoose.model("blacklist", BlaklistSchema);