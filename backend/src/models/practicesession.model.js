import mongoose, { Schema } from "mongoose";



const AttemptSchema = new Schema(
    {
        questionId: {
            type: Schema.Types.ObjectId,
            ref: "Question",
            required: true
        },
        attemptNumber: { type: Number, default: 1 },
        solutionImageUrl: { type: String },
        solutionText: { type: String },
        isCorrect: { type: Boolean },
        solutionViewed: { type: Boolean, default: false },
        timeTakenSeconds: { type: Number },
        errorType: {
            type: String,
            enum: ["conceptual", "formula", "calculation", "none", null],
            default: null
        },
        aiFeedback: { type: String },
        aiConfidenceScore: { type: Number, min: 0, max: 1 }
    },
    { _id: false, timestamps: true }
);

const PracticeSessionSchema = new Schema(
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
        difficulty: {
            type: String,
            enum: ["basic", "intermediate", "advanced"],
            required: true
        },


        prerequisitesAcknowledged: {
            type: Boolean,
            default: false
        },
        prerequisitesRevised: {
            type: Boolean,
            default: false
        },
        readinessConfirmed: {
            type: Boolean,
            default: false
        },


        attempts: [AttemptSchema],


        status: {
            type: String,
            enum: ["active", "completed", "abandoned"],
            default: "active"
        },
        startedAt: { type: Date, default: Date.now },
        completedAt: { type: Date },


        sessionSummary: {
            strengths: [{ type: String }],
            weaknesses: [{ type: String }],
            nextFocus: { type: String },
            totalQuestions: { type: Number, default: 0 },
            correctCount: { type: Number, default: 0 },
            averageAttempts: { type: Number, default: 0 }
        }
    },
    { timestamps: true }
);

PracticeSessionSchema.index({ userId: 1, topic: 1 });
PracticeSessionSchema.index({ userId: 1, status: 1 });

export const PracticeSession = mongoose.model("PracticeSession", PracticeSessionSchema);