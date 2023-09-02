import mongoose from "mongoose";

const Schema = mongoose.Schema;

const HighScoreSchema = new Schema({
  time: { type: Number, required: true },
  user: { type: Schema.Types.ObjectId, ref: "Users" },
});

export default mongoose.model("high_score", HighScoreSchema);
