import mongoose from "mongoose";
import User from "./user";

const Schema = mongoose.Schema;

const HighScoreSchema = new Schema(
  {
    time: { type: Number, required: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
  },
  {
    virtuals: {
      display_name: {
        get() {
          return this.user;
        },
      },
    },
  }
);

export default mongoose.model("high_score", HighScoreSchema);
