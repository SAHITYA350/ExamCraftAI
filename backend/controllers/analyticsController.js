import { Analytics } from '../models/Analytics.js';
import { Submission } from '../models/Submission.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const calculateAndStoreAnalytics = async (userId) => {
    // Fetch all submissions with question details
    const submissions = await Submission.find({ user: userId }).populate('question');

    if (!submissions.length) {
        return {
            overallAccuracy: 0,
            totalAttempts: 0,
            topicBreakdown: [],
            difficultyBreakdown: { Easy: 0, Medium: 0, Hard: 0 },
            practiceHistory: [],
            readinessIndex: 0,
            strongTopics: [],
            weakTopics: [],
            streak: 0
        };
    }

    // Aggregate Data
    const totalAttempts = submissions.length;
    let totalScore = 0;
    let correctAnswers = 0;
    const topicStats = {};
    const difficultyStats = { Easy: { total: 0, correct: 0 }, Medium: { total: 0, correct: 0 }, Hard: { total: 0, correct: 0 } };
    const historyMap = {};

    submissions.forEach(sub => {
        totalScore += (sub.score || 0);
        
        // Topic Breakdown
        const topic = sub.question?.topic || 'Uncategorized';
        if (!topicStats[topic]) topicStats[topic] = { total: 0, correct: 0 };
        topicStats[topic].total += 1;
        if (sub.isCorrect) {
            topicStats[topic].correct += 1;
            correctAnswers += 1;
        }

        // Difficulty Breakdown
        const diff = sub.question?.difficulty || 'Easy';
        if (difficultyStats[diff]) {
            difficultyStats[diff].total += 1;
            if (sub.isCorrect) difficultyStats[diff].correct += 1;
        }

        // History
        const date = sub.createdAt.toISOString().split('T')[0];
        if (!historyMap[date]) historyMap[date] = 0;
        historyMap[date] += 1;
    });

    const overallAccuracy = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0;
    
    const topicBreakdown = Object.keys(topicStats).map(name => ({
        name,
        accuracy: topicStats[name].total > 0 ? Math.round((topicStats[name].correct / topicStats[name].total) * 100) : 0,
        count: topicStats[name].total
    }));

    const difficultyBreakdown = {};
    Object.keys(difficultyStats).forEach(key => {
        difficultyBreakdown[key] = difficultyStats[key].total > 0 
            ? Math.round((difficultyStats[key].correct / difficultyStats[key].total) * 100)
            : 0;
    });

    const practiceHistory = Object.keys(historyMap).sort().map(date => {
        const daySubmissions = submissions.filter(s => s.createdAt.toISOString().split('T')[0] === date);
        const dayCorrect = daySubmissions.filter(s => s.isCorrect).length;
        return {
            date,
            attempts: daySubmissions.length,
            accuracy: Math.round((dayCorrect / daySubmissions.length) * 100)
        };
    }).slice(-7);

    // Readiness Index: Combined metric of accuracy and participation
    const readinessIndex = Math.min(100, Math.round(overallAccuracy * 0.7 + Math.min(totalAttempts * 2, 30)));

    // RECENT-BIASED ANALYTICS for Weak Topics and Recommendations
    // We take either the last 20 submissions or all if less than 20
    const recentSubmissions = submissions.slice(-20);
    const recentTopicStats = {};
    recentSubmissions.forEach(sub => {
        const topic = sub.question?.topic || 'Uncategorized';
        if (!recentTopicStats[topic]) recentTopicStats[topic] = { total: 0, correct: 0 };
        recentTopicStats[topic].total += 1;
        if (sub.isCorrect) recentTopicStats[topic].correct += 1;
    });

    const recentTopicBreakdown = Object.keys(recentTopicStats).map(name => ({
        name,
        accuracy: Math.round((recentTopicStats[name].correct / recentTopicStats[name].total) * 100)
    }));

    const strongTopics = recentTopicBreakdown.filter(t => t.accuracy >= 75).map(t => t.name);
    const weakTopics = recentTopicBreakdown.filter(t => t.accuracy < 60).map(t => t.name);

    // If no recent weak topics, fall back to global ones
    const finalWeakTopics = weakTopics.length > 0 ? weakTopics : topicBreakdown.filter(t => t.accuracy < 60).map(t => t.name);

    const analyticsData = {
        overallAccuracy,
        totalAttempts,
        topicBreakdown,
        difficultyBreakdown,
        practiceHistory,
        readinessIndex,
        strongTopics,
        weakTopics: finalWeakTopics,
        streak: Object.keys(historyMap).length,
        recentActivity: submissions.slice(-6).reverse().map(s => ({
            title: s.question?.topic || 'Practice Session',
            date: s.createdAt,
            score: s.score,
            isCorrect: s.isCorrect
        }))
    };

    // PERSIST TO MONGODB
    try {
        await Analytics.findOneAndUpdate(
            { user: userId },
            {
                overallScore: overallAccuracy,
                totalQuestionsAttempted: totalAttempts,
                correctAnswers: correctAnswers,
                weakTopics: finalWeakTopics,
                strongTopics: strongTopics,
                readinessIndex: readinessIndex,
                topicBreakdown: topicBreakdown,
            },
            { upsert: true, returnDocument: 'after' }
        );
    } catch (dbErr) {
        console.error("Failed to persist analytics to MongoDB:", dbErr);
    }

    return analyticsData;
};

export const getUserAnalytics = asyncHandler(async (req, res) => {
    const analytics = await calculateAndStoreAnalytics(req.user._id);
    return res.status(200).json(new ApiResponse(200, analytics, "Analytics fetched and stored successfully"));
});


export const updateAnalytics = asyncHandler(async (req, res) => {
    // This now just points to the same logic for consistency
    return getUserAnalytics(req, res);
});

export const getRiskPrediction = asyncHandler(async (req, res) => {
    const submissions = await Submission.find({ user: req.user._id });
    const accuracy = submissions.length > 0 
        ? (submissions.filter(s => s.isCorrect).length / submissions.length) * 100 
        : 0;
    
    let riskLevel = "High";
    if (accuracy > 80) riskLevel = "Low";
    else if (accuracy > 50) riskLevel = "Medium";

    return res.status(200).json(
        new ApiResponse(200, { riskLevel, probability: Math.max(0, (100 - accuracy) / 100) }, "Risk prediction fetched successfully")
    );
});

export const getWeakTopics = asyncHandler(async (req, res) => {
    const submissions = await Submission.find({ user: req.user._id }).populate('question');
    const topicStats = {};
    submissions.forEach(sub => {
        const topic = sub.question?.topic || 'Uncategorized';
        if (!topicStats[topic]) topicStats[topic] = { total: 0, correct: 0 };
        topicStats[topic].total += 1;
        if (sub.isCorrect) topicStats[topic].correct += 1;
    });

    const weakTopics = Object.keys(topicStats)
        .filter(name => (topicStats[name].correct / topicStats[name].total) < 0.6)
        .map(name => ({ name, accuracy: Math.round((topicStats[name].correct / topicStats[name].total) * 100) }));

    return res.status(200).json(
        new ApiResponse(200, weakTopics, "Weak topics fetched successfully")
    );
});

export const getRecommendations = asyncHandler(async (req, res) => {
    const submissions = await Submission.find({ user: req.user._id }).populate('question');
    const topicStats = {};
    submissions.forEach(sub => {
        const topic = sub.question?.topic || 'Uncategorized';
        if (!topicStats[topic]) topicStats[topic] = { total: 0, correct: 0 };
        topicStats[topic].total += 1;
        if (sub.isCorrect) topicStats[topic].correct += 1;
    });

    const recommendations = Object.keys(topicStats)
        .filter(name => (topicStats[name].correct / topicStats[name].total) < 0.7)
        .sort((a, b) => (topicStats[a].correct / topicStats[a].total) - (topicStats[b].correct / topicStats[b].total))
        .slice(0, 3)
        .map(name => `Focus on improving your skills in ${name}`);

    if (recommendations.length === 0) {
        recommendations.push("Keep up the great work! Try tackling higher difficulty questions.");
    }

    return res.status(200).json(
        new ApiResponse(200, recommendations, "Recommendations fetched successfully")
    );
});
