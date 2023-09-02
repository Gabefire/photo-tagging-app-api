import mongoose from "mongoose";

const Schema = mongoose.Schema;

const TagSchema = new Schema({
  name: { type: String, required: true },
  maxX: { type: Number, required: true },
  maxY: { type: Number, required: true },
  minX: { type: Number, required: true },
  minY: { type: Number, required: true },
});

export default mongoose.model("tag", TagSchema);
