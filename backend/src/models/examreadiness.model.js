import mongoose, { Schema } from "mongoose";

/**
 * ExamReadiness Model
 * The "Exam Readiness Index" — computed behind the scenes.
 * Based on: accuracy, attempts, difficulty progression, consistency.
 * Updated after each session. One document per user (upserted).
 */

const SubjectReadinessSchema = new Schema(
    {
        subject: { type: String },
        readinessScore: { type: Number, default: 0, min: 0, max: 100 },
        topicsCompleted: { type: Number, default: 0 },
        topicsTotal: { type: Number, default: 0 },
        riskLevel: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "high"
        }
    },
    { _id: false }
);

const ExamReadinessSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },


        overallReadinessScore: { type: Number, default: 0, min: 0, max: 100 },
        riskZone: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "high"
        },


        subjectBreakdown: [SubjectReadinessSchema],


        accuracyScore: { type: Number, default: 0 },
        attemptEfficiencyScore: { type: Number, default: 0 },
        difficultyProgressionScore: { type: Number, default: 0 },
        consistencyScore: { type: Number, default: 0 },


        weakTopics: [{ type: String }],
        strongTopics: [{ type: String }],


        lastCalculatedAt: { type: Date, default: Date.now },
        totalSessionsCompleted: { type: Number, default: 0 },
        currentStreak: { type: Number, default: 0 },
        longestStreak: { type: Number, default: 0 }
    },
    { timestamps: true }
);

export const ExamReadiness = mongoose.model("ExamReadiness", ExamReadinessSchema);