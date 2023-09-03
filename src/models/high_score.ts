import mongoose from "mongoose";
import User from "./user";

const Schema = mongoose.Schema;

const HighScoreSchema = new Schema({
  time: { type: Number, required: true },
  user: { type: String, required: true, default: "anonymous" },
});

export default mongoose.model("high_score", HighScoreSchema);
