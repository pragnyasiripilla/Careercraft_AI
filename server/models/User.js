const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema(
  {
    roles: { type: [String], default: [] },
    suggestions: { type: [String], default: [] },
    roadmap: { type: [String], default: [] },
    model: { type: String, default: "mistralai/mistral-7b-instruct" },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    password: { type: String, required: true },

    skills: { type: String, default: "" },
    interests: { type: String, default: "" },
    goals: { type: String, default: "" },

    recommendations: { type: recommendationSchema, default: () => ({}) },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

