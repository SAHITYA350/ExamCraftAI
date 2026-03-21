import { Question } from '../models/Question.js';
import { StudyMaterial } from '../models/StudyMaterial.js';
import { Session } from '../models/Session.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { extractTextFromPDF, extractTextFromImage, generateQuestionsFromText, extractTopics, getPrerequisites } from '../ml-service/mlService.js';
import { uploadToImageKit } from '../services/imageKitService.js';
import pLimit from 'p-limit';
import fs from 'fs';

const MOCK_TOPICS = [
    'Integration','Differentiation','Trigonometry','Kinematics',
    'Thermodynamics','Organic Chemistry','Data Structures','Probability',
];

const PREREQUISITES = {
    Integration:       ['Basic Differentiation', 'Limits'],
    Differentiation:   ['Limits', 'Algebra'],
    Thermodynamics:    ['Laws of Motion', 'Heat Transfer Basics'],
    'Data Structures': ['Basic Programming', 'Arrays & Loops'],
};

export const getSubjects = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, ['Mathematics', 'Physics', 'Chemistry', 'Computer Science'], "Subjects fetched successfully")
    );
});

export const getTopics = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, MOCK_TOPICS, "Topics fetched successfully")
    );
});

export const getPrerequisitesForTopic = asyncHandler(async (req, res) => {
    const { topic } = req.params;
    
    try {
        const result = await getPrerequisites(topic);
        return res.status(200).json(
            new ApiResponse(200, result.prerequisites, "Prerequisites fetched successfully")
        );
    } catch (err) {
        // Fallback to mock if AI fails
        const prerequisites = PREREQUISITES[topic] || ["Basic concepts"];
        return res.status(200).json(
            new ApiResponse(200, prerequisites, "Prerequisites fetched successfully (Fallback)")
        );
    }
});

export const createQuestion = asyncHandler(async (req, res) => {
    const { topic, difficulty, questionText, correctAnswer, options, explanation } = req.body;

    if (!topic || !difficulty || !questionText || !correctAnswer) {
        throw new ApiError(400, "All fields are required");
    }

    const question = await Question.create({
        topic,
        difficulty,
        questionText,
        correctAnswer,
        options: options || [],
        explanation,
        createdBy: req.user?._id
    });

    return res.status(201).json(
        new ApiResponse(201, question, "Question created successfully")
    );
});

export const getQuestions = asyncHandler(async (req, res) => {
    const { topic, difficulty } = req.query;
    const query = {};
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;

    const questions = await Question.find(query);

    return res.status(200).json(
        new ApiResponse(200, questions, "Questions fetched successfully")
    );
});

export const getQuestionById = asyncHandler(async (req, res) => {
    const question = await Question.findById(req.params.id);
    if (!question) {
        throw new ApiError(404, "Question not found");
    }

    return res.status(200).json(
        new ApiResponse(200, question, "Question fetched successfully")
    );
});

export const uploadMaterial = asyncHandler(async (req, res) => {
    // Handle files, direct text, or syllabus input
    const uploadedFiles = req.files || (req.file ? [req.file] : []);
    const { title, text: bodyText } = req.body;
    
    if (uploadedFiles.length === 0 && !bodyText) {
        throw new ApiError(400, "No scientific documents or syllabus text provided.");
    }
    const limit = pLimit(3); // Optimized parallel processing

    // Core Processing Unit per File
    const processFile = async (file) => {
        const isPdf = file.mimetype?.includes('pdf') || file.originalname?.toLowerCase().endsWith('.pdf');
        const isDocx = file.mimetype?.includes('word') || file.originalname?.toLowerCase().endsWith('.docx');
        const isImage = file.mimetype?.includes('image') || /\.(jpg|jpeg|png|webp|gif)$/i.test(file.originalname);
        
        const fileType = isPdf ? 'pdf' : (isDocx ? 'docx' : (isImage ? 'image' : 'text'));
        
        let extractedText = "";
        try {
            console.log(`[Processor] Scanning ${file.originalname} as ${fileType}...`);
            if (fileType === 'pdf') {
                extractedText = await extractTextFromPDF(file.path);
            } else if (fileType === 'docx') {
                const { extractTextFromDocx } = await import('../ml-service/mlService.js');
                extractedText = await extractTextFromDocx(file.path);
            } else if (fileType === 'image') {
                extractedText = await extractTextFromImage(file.path);
            }
        } catch (err) {
            console.warn(`[Processor] Warning: ${file.originalname} extraction failed:`, err.message);
        }

        // Secure Cloud Storage
        const uploadResult = await uploadToImageKit(file.path, `${Date.now()}-${file.originalname}`, "scientific-materials");
        
        // Resource Cleanup is handled inside uploadToImageKit

        if (!uploadResult) {
            throw new Error(`Cloud sync failed for ${file.originalname}`);
        }

        return {
            url: uploadResult.url,
            fileId: uploadResult.fileId,
            name: file.originalname,
            size: file.size,
            fileType,
            extractedText: extractedText || ""
        };
    };

    // Parallel Execution with Limit
    const results = await Promise.all(uploadedFiles.map(file => limit(() => processFile(file))));
    
    // Unified Knowledge Aggregation
    let combinedText = results
        .map(r => r.extractedText)
        .filter(t => t && t.trim().length > 0)
        .join("\n\n---\n\n");

    const isFailure = combinedText.includes("GUIDED_FAILURE") || combinedText.includes("SCAN_ERROR");

    if (!combinedText || isFailure) {
        if (process.env.USE_MOCK_AI === 'true' || bodyText) {
            combinedText = bodyText || "# Mock Analysis Content\n\nNo text could be extracted, so this mock content is being used for your demonstration.";
        } else {
            // Safety Valve: Instead of 400, we provide a "Guided Fail" text so the user reaches Step 2
            combinedText = combinedText || "The AI scan was unable to detect clear text. This usually happens with blurry photos or low-contrast handwriting. \n\n**Action Required:** Please try a clearer photo, or manually type your topics in the next step to continue.";
        }
    }

    // Real-Time Scientific Concept Detection
    console.log("[AI] Analyzing combined knowledge for topics...");
    let detectedTopics = [];
    try {
        const topicResult = await extractTopics(combinedText);
        detectedTopics = topicResult.topics || [];
    } catch (err) {
        console.warn("[AI] Topic detection failed:", err.message);
    }

    // Ensure we always have at least some topics for visualization
    if (detectedTopics.length === 0) {
        detectedTopics = ["General Concepts", "Academic Workflow", "Course Material"];
    }

    // Persistent Storage
    const material = await StudyMaterial.create({
        user: req.user._id,
        title: title || (uploadedFiles.length > 1 ? `Study Pack: ${uploadedFiles[0].originalname} (+${uploadedFiles.length-1})` : (uploadedFiles[0]?.originalname || "Syllabus Analysis")),
        files: results,
        fileUrl: results[0]?.url || "", 
        fileType: uploadedFiles.length > 1 ? "multi" : (results[0]?.fileType || "text"),
        extractedText: combinedText,
        status: "completed"
    });

    return res.status(201).json(
        new ApiResponse(201, { material, detectedTopics }, "Your documents have been successfully scanned and analyzed.")
    );
});


export const processMaterial = asyncHandler(async (req, res) => {
    const { materialId, difficulty, questionCount, topic } = req.body;
    let material;

    if (materialId) {
        material = await StudyMaterial.findById(materialId);
        if (!material) {
            throw new ApiError(404, "Material not found");
        }
    } else if (topic) {
        // If no sessionId, check if we can reuse an existing session for this topic
        let { sessionId: incomingSessionId } = req.body;
        if (!incomingSessionId) {
            const existingSession = await Session.findOne({
                user: req.user._id,
                topic: topic,
                status: { $in: ["active", "completed"] }
            }).sort({ updatedAt: -1 }).populate('studyMaterial');

            if (existingSession) {
                console.log(`[AI] Found existing session to reuse for topic: ${topic}`);
                material = existingSession.studyMaterial;
                req.body.sessionId = existingSession._id; // Inject into request body for later use
            }
        }

        if (!material) {
            // Create a Virtual Material for topic-based practice
            console.log(`[AI] Creating virtual material for topic: ${topic}`);
            material = await StudyMaterial.create({
                user: req.user._id,
                title: `Practice: ${topic}`,
                fileType: "text",
                extractedText: `Topic Study: ${topic}`,
                status: "completed"
            });
        }
    } else {
        throw new ApiError(400, "Either materialId or topic is required for processing");
    }

    material.status = "processing";
    await material.save();

    try {
        let text = material.extractedText;
        
        const sessionCount = parseInt(questionCount) || 5;
        const questionsData = await generateQuestionsFromText(text || "No text available.", difficulty, sessionCount, topic);

        const createdQuestions = await Promise.all(questionsData.map(async (q) => {
            return await Question.create({
                ...q,
                materialId: material._id,
                createdBy: req.user._id
            });
        }));

        // Link to Session (Create or Append)
        let { sessionId } = req.body;
        let session;

        if (sessionId) {
            console.log(`[AI] Appending ${createdQuestions.length} questions to session: ${sessionId}`);
            session = await Session.findByIdAndUpdate(
                sessionId,
                {
                    $push: { questions: { $each: createdQuestions.map(q => q._id) } },
                    $inc: { totalQuestions: createdQuestions.length },
                    lastAccessedAt: Date.now()
                },
                { returnDocument: 'after' }
            );
        }

        // If no sessionId provided or findByIdAndUpdate failed, check for existing topic session
        if (!session) {
            const existingSession = await Session.findOne({
                user: req.user._id,
                topic: topic || material.title,
                status: { $in: ["active", "completed"] }
            }).sort({ updatedAt: -1 });

            if (existingSession) {
                console.log(`[AI] Reusing existing session for topic: ${existingSession.topic}`);
                // If session exists, append only NEW unique questions
                const existingQuestionIds = existingSession.questions.map(id => id.toString());
                const newUniqueQuestionIds = createdQuestions
                    .map(q => q._id)
                    .filter(id => !existingQuestionIds.includes(id.toString()));

                const updatedSession = await Session.findByIdAndUpdate(
                    existingSession._id,
                    {
                        $push: { questions: { $each: newUniqueQuestionIds } },
                        $inc: { totalQuestions: newUniqueQuestionIds.length },
                        status: "active", // Reactivate if it was completed
                        lastAccessedAt: Date.now()
                    },
                    { returnDocument: 'after' }
                );
                
                return res.status(200).json(
                    new ApiResponse(200, {
                        material,
                        questions: createdQuestions, // Return all newly generated for the UI
                        sessionId: updatedSession._id
                    }, "Questions appended to existing session")
                );
            }
        }

        if (!session) {
            console.log(`[AI] Creating new session for material: ${material._id}`);
            session = await Session.create({
                user: req.user._id,
                studyMaterial: material._id,
                topic: topic || material.title,
                difficulty: difficulty || "intermediate",
                questions: createdQuestions.map(q => q._id),
                totalQuestions: createdQuestions.length,
                status: "active"
            });
        }

        material.status = "completed";
        await material.save();

        return res.status(200).json(
            new ApiResponse(200, { material, questions: createdQuestions, sessionId: session._id }, "Material processed and session created successfully")
        );
    } catch (error) {
        material.status = "failed";
        await material.save();
        throw new ApiError(500, "Processing failed: " + error.message);
    }
});
