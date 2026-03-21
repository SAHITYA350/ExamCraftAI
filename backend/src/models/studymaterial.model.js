import mongoose, { Schema } from "mongoose";

/**
 * StudyMaterial Model
 * Stores uploaded content (PDFs, images of notes, etc.)
 * AI silently processes this to extract topics, concepts, and difficulty tags.
 */

const ConceptSchema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        difficulty: {
            type: String,
            enum: ["basic", "intermediate", "advanced"],
            default: "basic"
        },
        relatedConcepts: [{ type: String }]
    },
    { _id: false }
);

const TopicSchema = new Schema(
    {
        name: { type: String, required: true },
        subject: { type: String },
        prerequisites: [{ type: String }],
        concepts: [ConceptSchema],
        pageReferences: [{ type: Number }]
    },
    { _id: false }
);

const StudyMaterialSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        fileType: {
            type: String,
            enum: ["pdf", "image", "text"],
            required: true
        },
        fileUrl: {
            type: String,
            required: true
        },
        subject: {
            type: String,
            trim: true
        },


        processingStatus: {
            type: String,
            enum: ["pending", "processing", "done", "failed"],
            default: "pending"
        },
        aiExtractedTopics: [TopicSchema],
        rawExtractedText: { type: String, select: false }
    },
    { timestamps: true }
);

export const StudyMaterial = mongoose.model("StudyMaterial", StudyMaterialSchema);