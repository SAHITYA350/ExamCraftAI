import mongoose, { Schema } from "mongoose";

/**
 * TopicProgress Model
 * Aggregated progress of a student per topic per difficulty.
 * Updated after every session. Used for the progress dashboard and Exam Readiness Index.
 */

const DifficultyProgressSchema = new Schema(
    {
        status: {
            type: String,
            enum: ["locked", "in_progress", "needs_improvement", "completed"],
            default: "locked"
        },
        questionsAttempted: { type: Number, default: 0 },
        questionsCorrect: { type: Number, default: 0 },
        totalAttempts: { type: Number, default: 0 },
        averageAttemptsPerQuestion: { type: Number, default: 0 },
        lastPracticedAt: { type: Date }
    },
    { _id: false }
);

const TopicProgressSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        studyMaterialId: {
            type: Schema.Types.ObjectId,
            ref: "StudyMaterial"
        },
        topic: {
            type: String,
            required: true,
            trim: true
        },
        subject: { type: String },


        basic: { type: DifficultyProgressSchema, default: () => ({}) },
        intermediate: { type: DifficultyProgressSchema, default: () => ({}) },
        advanced: { type: DifficultyProgressSchema, default: () => ({}) },


        commonErrors: {
            conceptual: { type: Number, default: 0 },
            formula: { type: Number, default: 0 },
            calculation: { type: Number, default: 0 }
        },


        sessionIds: [{ type: Schema.Types.ObjectId, ref: "PracticeSession" }],


        topicScore: { type: Number, default: 0, min: 0, max: 100 },
        consistencyScore: { type: Number, default: 0, min: 0, max: 100 }
    },
    { timestamps: true }
);

TopicProgressSchema.index({ userId: 1, topic: 1 }, { unique: true });

export const TopicProgress = mongoose.model("TopicProgress", TopicProgressSchema);