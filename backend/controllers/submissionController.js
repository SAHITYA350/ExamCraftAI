import { Submission } from '../models/Submission.js';
import { Question } from '../models/Question.js';
import { Session } from '../models/Session.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { evaluateAnswer, extractTextFromPDF, extractTextFromImage } from '../ml-service/mlService.js';
import { uploadToImageKit } from '../services/imageKitService.js';
import { calculateAndStoreAnalytics } from './analyticsController.js';

export const submitAnswer = asyncHandler(async (req, res) => {
    const { questionId, userAnswer, timeTaken, sessionId } = req.body;

    if (!questionId || userAnswer === undefined) {
        throw new ApiError(400, "Question ID and User Answer are required");
    }

    if (sessionId) {
        const session = await Session.findById(sessionId);
        if (session && session.viewedSolutions.includes(questionId)) {
            throw new ApiError(403, "You have already viewed the solution for this question. No further attempts are allowed.");
        }
    }

    const question = await Question.findById(questionId);
    if (!question) {
        throw new ApiError(404, "Question not found");
    }

    // Determine the actual text of the correct answer for AI context
    let correctAnswerText = question.correctAnswer;
    if (question.questionType === "MCQ" && question.options?.length > 0) {
        const option = question.options.find(opt => opt.startsWith(question.correctAnswer + ")") || opt.startsWith(question.correctAnswer + "."));
        if (option) correctAnswerText = option;
    }

    // AI Evaluation
    const evaluation = await evaluateAnswer(
        question.questionText,
        correctAnswerText,
        userAnswer,
        question.options
    );

    const submission = await Submission.create({
        user: req.user._id,
        question: questionId,
        userAnswer,
        isCorrect: evaluation.isCorrect,
        score: evaluation.score,
        feedback: evaluation.feedback,
        stepAnalysis: evaluation.stepAnalysis || [],
        timeTaken
    });

    if (sessionId) {
        const update = {
            $push: { submissions: submission._id },
            $inc: { currentScore: evaluation.score },
            $addToSet: { viewedSolutions: questionId },
            lastAccessedAt: Date.now()
        };

        if (evaluation.isCorrect) {
            update.$addToSet.solvedQuestions = questionId;
        }

        await Session.findByIdAndUpdate(sessionId, update);
    }

    // Trigger Analytics Update (async)
    calculateAndStoreAnalytics(req.user._id).catch(err => console.error("Auto-analytics update failed:", err));

    return res.status(201).json(
        new ApiResponse(201, submission, "Solution evaluated by AI and saved")
    );
});

export const getSubmissionHistory = asyncHandler(async (req, res) => {
    const submissions = await Submission.find({ user: req.user._id })
        .populate('question')
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, submissions, "Submission history fetched successfully")
    );
});

export const uploadAnswer = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "Solution file is required");
    }

    const { questionId, sessionId } = req.body;
    if (!questionId) {
        throw new ApiError(400, "Question ID is required");
    }

    if (sessionId) {
        const session = await Session.findById(sessionId);
        if (session && session.viewedSolutions.includes(questionId)) {
            throw new ApiError(403, "You have already viewed the solution for this question. No further attempts are allowed.");
        }
    }

    let extractedAnswer = "";
    try {
        const isPdf = req.file.mimetype?.includes('pdf') || req.file.originalname?.toLowerCase().endsWith('.pdf');
        const isDocx = req.file.mimetype?.includes('word') || req.file.originalname?.toLowerCase().endsWith('.docx');
        
        if (isPdf) {
            extractedAnswer = await extractTextFromPDF(req.file.path);
        } else if (isDocx) {
            const { extractTextFromDocx } = await import('../ml-service/mlService.js');
            extractedAnswer = await extractTextFromDocx(req.file.path);
        } else if (req.file.mimetype?.includes('image') || /\.(jpg|jpeg|png|webp|gif)$/i.test(req.file.originalname)) {
            extractedAnswer = await extractTextFromImage(req.file.path);
        } else {
            console.warn("[Submission] Unknown file type for OCR:", req.file.mimetype, req.file.originalname);
            extractedAnswer = "Non-standard document file submitted.";
        }
    } catch (err) {
        console.warn("Text extraction failed during answer upload:", err);
    }

    // Upload to ImageKit
    const uploadResult = await uploadToImageKit(req.file.path, `${Date.now()}-${req.file.originalname}`, "submissions");
    
    if (!uploadResult) {
        throw new ApiError(500, "Failed to upload answer to ImageKit");
    }

    const question = await Question.findById(questionId);
    if (!question) {
        throw new ApiError(404, "Question not found");
    }

    const evaluation = await evaluateAnswer(
        question.questionText,
        question.correctAnswer,
        extractedAnswer || "Visual submission",
        question.options
    );

    const submission = await Submission.create({
        user: req.user._id,
        question: questionId,
        userAnswer: extractedAnswer || "Image/PDF submission",
        attachmentUrl: uploadResult.url,
        attachmentId: uploadResult.fileId,
        isCorrect: evaluation.isCorrect,
        score: evaluation.score,
        feedback: evaluation.feedback,
        stepAnalysis: evaluation.stepAnalysis || [],
        timeTaken: req.body.timeTaken || 0
    });

    if (sessionId) {
        const update = {
            $push: { submissions: submission._id },
            $inc: { currentScore: evaluation.score },
            $addToSet: { viewedSolutions: questionId },
            lastAccessedAt: Date.now()
        };

        if (evaluation.isCorrect) {
            update.$addToSet.solvedQuestions = questionId;
        }

        await Session.findByIdAndUpdate(sessionId, update);
    }

    // Trigger Analytics Update (async)
    calculateAndStoreAnalytics(req.user._id).catch(err => console.error("Auto-analytics update failed:", err));

    return res.status(201).json(
        new ApiResponse(201, submission, "Solution evaluated by AI and saved")
    );
});


export const getSubmissionById = asyncHandler(async (req, res) => {
    const submission = await Submission.findById(req.params.id).populate('question');
    if (!submission) {
        throw new ApiError(404, "Submission not found");
    }

    return res.status(200).json(
        new ApiResponse(200, submission, "Submission fetched successfully")
    );
});
